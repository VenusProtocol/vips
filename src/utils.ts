import { JsonFragment, defaultAbiCoder } from "@ethersproject/abi";
import { JsonRpcProvider, TransactionResponse } from "@ethersproject/providers";
import { NumberLike } from "@nomicfoundation/hardhat-network-helpers/dist/src/types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract, utils } from "ethers";
import { FORKED_NETWORK, config, ethers, network } from "hardhat";
import { EthereumProvider } from "hardhat/types";

import { buildCommandsWithBatches, isBatch } from "./auxiliaryCommandsAggregator";
import { NETWORK_ADDRESSES, ORACLE_BNB } from "./networkAddresses";
import { PER_TX_GAS_CAP_BY_NETWORK } from "./networkConfig";
import {
  Batch,
  Command,
  LzChainId,
  Proposal,
  ProposalMeta,
  ProposalType,
  REMOTE_MAINNET_NETWORKS,
  REMOTE_NETWORKS,
  REMOTE_TESTNET_NETWORKS,
  SUPPORTED_NETWORKS,
  TokenConfig,
} from "./types";
import OmnichainProposalSender_ABI from "./vip-framework/abi/OmnichainProposalSender_ABI.json";
import BINANCE_ORACLE_ABI from "./vip-framework/abi/binanceOracle.json";
import CHAINLINK_ORACLE_ABI from "./vip-framework/abi/chainlinkOracle.json";

const BSCTESTNET_OMNICHAIN_SENDER = "0xCfD34AEB46b1CB4779c945854d405E91D27A1899";
const BSCMAINNET_OMNICHAIN_SENDER = "0x36a69dE601381be7b0DcAc5D5dD058825505F8f6";

// LayerZero payload size cap. Verified on-chain across every destination
// OmnichainGovernanceExecutor Venus supports (ethereum, arbitrumone, opmainnet, basemainnet,
// zksyncmainnet, opbnbmainnet, unichainmainnet, plus the matching testnets):
// DEFAULT_PAYLOAD_SIZE_LIMIT = 10000 and payloadSizeLimitLookup(bsc src) = 0 (no override)
// on every executor. The LZ Relayer enforces the same 10000-byte cap on the sender side,
// so this single constant is the binding limit for every cross-chain VIP. If any executor
// later sets a per-source override, switch to a runtime lookup.
const LZ_PAYLOAD_SIZE_LIMIT = 10_000;

export const getOmnichainProposalSenderAddress = () => {
  if (FORKED_NETWORK === "bscmainnet" || REMOTE_MAINNET_NETWORKS.includes(FORKED_NETWORK as REMOTE_NETWORKS)) {
    return BSCMAINNET_OMNICHAIN_SENDER;
  } else return BSCTESTNET_OMNICHAIN_SENDER;
};

export const getPayload = (proposal: Proposal) => {
  for (let j = proposal.targets.length - 1; j >= 0; j--) {
    if (
      proposal.params[j][0] === LzChainId[FORKED_NETWORK as REMOTE_NETWORKS] &&
      proposal.signatures[j] === "execute(uint16,bytes,bytes,address)"
    ) {
      return proposal.params[j][1];
    }
  }
};

const gasUsedPerCommand = 300000;
export async function setForkBlock(_blockNumber: number) {
  if (network.name === "zksynctestnode") {
    console.log("zksynctestnode network does not support forking, skipping fork");
    return;
  }

  const blockNumber = config.networks.hardhat.zksync ? _blockNumber.toString(16) : _blockNumber;
  await network.provider.request({
    method: "hardhat_reset",
    params: [
      {
        forking: {
          jsonRpcUrl: config.networks.hardhat.forking?.url,
          blockNumber,
        },
      },
    ],
  });
}

// Resolved per-tx gas cap, cached per FORKED_NETWORK for the lifetime of the
// hardhat process. The fork doesn't change within a sim, so a single resolve
// per network is enough.
const _perTxGasCapCache = new Map<string, number>();

/// Resolve the per-tx gas cap that the simulation should mirror.
///
/// Resolution order:
///   1. EIP-7825 `eth_txGasLimitCap` RPC (auto picks up future hardforks the
///      day a client ships it). Errors and null/undefined responses fall
///      through to step 2.
///   2. Static `PER_TX_GAS_CAP_BY_NETWORK` map in `src/networkConfig.ts`
///      (current authoritative source — no client implements EIP-7825 yet).
///   3. `Number.POSITIVE_INFINITY` — no enforcement (L2s today).
///
/// Logged once per network when first resolved, so CI output records which
/// branch fired.
export const resolvePerTxGasCap = async (forkedNetwork: string | undefined): Promise<number> => {
  const key = forkedNetwork ?? "<unknown>";
  const cached = _perTxGasCapCache.get(key);
  if (cached !== undefined) return cached;

  let cap: number = Number.POSITIVE_INFINITY;
  let source = "no enforcement";

  try {
    const raw = await ethers.provider.send("eth_txGasLimitCap", []);
    if (raw !== null && raw !== undefined) {
      const parsed = BigNumber.from(raw).toNumber();
      if (parsed > 0) {
        cap = parsed;
        source = "eth_txGasLimitCap (EIP-7825)";
      }
    }
  } catch {
    // RPC method not supported (today's reality on every client). Drop to map.
  }

  if (!Number.isFinite(cap)) {
    const fromMap = PER_TX_GAS_CAP_BY_NETWORK[forkedNetwork as SUPPORTED_NETWORKS];
    if (fromMap !== undefined) {
      cap = fromMap;
      source = "PER_TX_GAS_CAP_BY_NETWORK (static)";
    }
  }

  console.log(`[gas] per-tx cap for ${key}: ${Number.isFinite(cap) ? cap : "unbounded"} (source: ${source})`);
  _perTxGasCapCache.set(key, cap);
  return cap;
};

export const getSourceChainId = (network: REMOTE_NETWORKS) => {
  if (REMOTE_MAINNET_NETWORKS.includes(network as string)) {
    return LzChainId.bscmainnet;
  } else if (REMOTE_TESTNET_NETWORKS.includes(network as string)) {
    return LzChainId.bsctestnet;
  } else {
    throw new Error("Network is not registered. Please register it.");
  }
};

export const makePayload = (targets: any, values: any, signatures: any, calldatas: any, proposalType: ProposalType) => {
  const payload = ethers.utils.defaultAbiCoder.encode(
    ["address[]", "uint256[]", "string[]", "bytes[]", "uint8"],
    [targets, values, signatures, calldatas, proposalType],
  );
  return payload;
};

export function getCalldatas({ signatures, params }: { signatures: string[]; params: any[][] }) {
  return params.map((args: any[], i: number) => {
    if (signatures[i] === "") {
      return "0x";
    }
    const fragment = ethers.utils.FunctionFragment.from(signatures[i]);
    return defaultAbiCoder.encode(fragment.inputs, args);
  });
}
export const initMainnetUser = async (user: string, balance: NumberLike) => {
  let provider: EthereumProvider | JsonRpcProvider = network.provider;
  let signer = await ethers.getSigner(user);

  // zksync test node provider does not support default impersonation
  if (network.name === "zksynctestnode" && config.networks.hardhat.forking?.url) {
    provider = new ethers.providers.JsonRpcProvider({ url: config.networks.hardhat.forking.url, timeout: 1200000 });

    signer = provider.getSigner(user) as unknown as SignerWithAddress;
  }

  await provider.send("hardhat_impersonateAccount", [user]);
  const balanceHex = toRpcQuantity(balance);
  await provider.send("hardhat_setBalance", [user, balanceHex]);

  return signer;
};

const toRpcQuantity = (x: NumberLike): string => {
  let hex: string;
  if (typeof x === "number" || typeof x === "bigint") {
    // TODO: check that number is safe
    hex = `0x${x.toString(16)}`;
  } else if (typeof x === "string") {
    if (!x.startsWith("0x")) {
      throw new Error("Only 0x-prefixed hex-encoded strings are accepted");
    }
    hex = x;
  } else if ("toHexString" in x) {
    hex = x.toHexString();
  } else if ("toString" in x) {
    hex = x.toString(16);
  } else {
    throw new Error(`${x as any} cannot be converted to an RPC quantity`);
  }

  if (hex === "0x0") return hex;

  return hex.startsWith("0x") ? hex.replace(/0x0+/, "0x") : `0x${hex}`;
};

export async function mineBlocks(blocks: NumberLike = 1, options: { interval?: NumberLike } = {}): Promise<void> {
  const interval = options.interval ?? 1;
  const blocksHex = toRpcQuantity(blocks);
  const intervalHex = toRpcQuantity(interval);

  await network.provider.request({
    method: "hardhat_mine",
    params: [blocksHex, intervalHex],
  });
}
export const mineOnZksync = async (blocks: number) => {
  const blockTimestamp = (await ethers.provider.getBlock("latest")).timestamp;
  // Actual timestamp on which block will get mine (assuming 1 sec/block)
  const timestampOfBlocks = blocks * 1;
  const targetTimestamp = blockTimestamp + timestampOfBlocks;
  await ethers.provider.send("evm_setNextBlockTimestamp", [targetTimestamp.toString(16)]);
  await mineBlocks();
};

const getAdapterParam = (noOfCommands: number): string => {
  const requiredGas = calculateGasForAdapterParam(noOfCommands);
  const adapterParam = ethers.utils.solidityPack(["uint16", "uint256"], [1, requiredGas]);
  return adapterParam;
};

export const calculateGasForAdapterParam = (noOfCommands: number): number => {
  const requiredGas = (500000 + gasUsedPerCommand * noOfCommands) * 1.5;
  return requiredGas;
};

const getEstimateFeesForBridge = async (dstChainId: number, payload: string, adapterParams: string) => {
  const provider = ethers.provider;
  const OmnichainProposalSender = new ethers.Contract(
    getOmnichainProposalSenderAddress(),
    OmnichainProposalSender_ABI,
    provider,
  );

  let fee;
  if (FORKED_NETWORK === "bsctestnet" || FORKED_NETWORK === "bscmainnet") {
    const proposalId = await OmnichainProposalSender.proposalCount();
    const payloadWithId = ethers.utils.defaultAbiCoder.encode(["bytes", "uint256"], [payload, proposalId]);
    fee = (await OmnichainProposalSender.estimateFees(dstChainId, payloadWithId, false, adapterParams))[0].add(
      ethers.utils.parseEther("1"),
    );
  } else {
    fee = ethers.BigNumber.from("0");
  }
  return fee;
};

export const makeProposal = async (
  entries: (Command | Batch)[],
  meta?: ProposalMeta,
  type?: ProposalType,
): Promise<Proposal> => {
  const proposal: Proposal = {
    signatures: [],
    targets: [],
    params: [],
    values: [],
    gasFeeMultiplicationFactor: [],
    gasLimitMultiplicationFactor: [],
    meta,
    type,
  };
  let commands: Command[];
  if (entries.every((entry): entry is Command => !isBatch(entry))) {
    commands = entries;
  } else {
    const { commands: proposalCommands, batches } = await buildCommandsWithBatches(entries, type);
    commands = proposalCommands;
    proposal.aggregatorBatches = batches;
  }

  const map = new Map<number, Command[]>();
  const _commands = [];
  for (const command of commands) {
    const { dstChainId } = command;
    if (dstChainId) {
      const currentChainCommands = map.get(dstChainId) || [];
      currentChainCommands.push(command);
      map.set(dstChainId, currentChainCommands);
    } else {
      _commands.push(command);
    }
  }
  if (_commands.length != 0) {
    proposal.targets.push(..._commands.map(cmd => cmd.target));
    proposal.values.push(..._commands.map(cmd => cmd.value ?? "0"));
    proposal.signatures.push(..._commands.map(cmd => cmd.signature));
    proposal.params.push(..._commands.map(cmd => cmd.params));
    proposal.gasFeeMultiplicationFactor?.push(
      ..._commands.map(cmd => (cmd.gasFeeMultiplicationFactor ?? network.zksync ? 2 : 1)),
    );
    proposal.gasLimitMultiplicationFactor?.push(..._commands.map(cmd => cmd.gasLimitMultiplicationFactor ?? 1));
  }
  for (const key of map.keys()) {
    const chainCommands = map.get(key);
    if (chainCommands) {
      const remoteParam = makePayload(
        chainCommands.map(cmd => cmd.target),
        chainCommands.map(cmd => cmd.value ?? "0"),
        chainCommands.map(cmd => cmd.signature),
        getCalldatas({
          signatures: chainCommands.map(cmd => cmd.signature),
          params: chainCommands.map(cmd => cmd.params),
        }),
        type as ProposalType,
      );
      const remoteAdapterParam = getAdapterParam(chainCommands.map(cmd => cmd.target).length);

      // LZ Relayer sizes the payloadWithId envelope (the same shape estimateFees receives),
      // not just the raw makePayload output. Reproduce that wrapping here so the byte count
      // matches what the on-chain Relayer would check, then fail before propose is attempted.
      const payloadWithIdSize =
        ethers.utils.defaultAbiCoder.encode(["bytes", "uint256"], [remoteParam, 0]).length / 2 - 1;
      if (payloadWithIdSize > LZ_PAYLOAD_SIZE_LIMIT) {
        throw new Error(
          `LayerZero payload size ${payloadWithIdSize} bytes exceeds limit of ${LZ_PAYLOAD_SIZE_LIMIT} ` +
            `for dstChainId=${key} (${chainCommands.length} commands). ` +
            `Split the proposal into multiple VIPs so each cross-chain message fits within the LZ Relayer cap.`,
        );
      }

      proposal.targets.push(getOmnichainProposalSenderAddress());
      const value = await getEstimateFeesForBridge(key, remoteParam, remoteAdapterParam);
      proposal.values.push(value.toString());
      proposal.signatures.push("execute(uint16,bytes,bytes,address)");
      proposal.params.push([key, remoteParam, remoteAdapterParam, ethers.constants.AddressZero]);
    } else {
      throw "Chain Id is not supported";
    }
  }
  return proposal;
};

export const validateTargetAddresses = async (contractAddresses: string[], signatures: string[]) => {
  for (let i = 0; i < contractAddresses.length; i++) {
    // If there is no contract currently deployed, the result is "0x"
    const bytecode = await ethers.provider.getCode(contractAddresses[i]);
    if (bytecode.length === 2 && signatures[i].length !== 0) {
      throw new Error(`Invalid address ${contractAddresses[i]}`);
    }
  }
};

export const setMaxStalePeriodInBinanceOracle = async (
  binanceOracleAddress: string,
  assetSymbol: string,
  maxStalePeriodInSeconds: number = 31536000 /* 1 year */,
) => {
  const oracle = await ethers.getContractAt(BINANCE_ORACLE_ABI, binanceOracleAddress);
  const oracleAdmin = await initMainnetUser(await oracle.owner(), ethers.utils.parseEther("1.0"));
  const overrideSymbol = await oracle.symbols(assetSymbol);

  if (overrideSymbol.length > 0) {
    assetSymbol = overrideSymbol;
  }

  const tx = await oracle.connect(oracleAdmin).setMaxStalePeriod(assetSymbol, maxStalePeriodInSeconds);
  await tx.wait();
};

const ONE_YEAR = 31536000;

export const setMaxStalePeriodInChainlinkOracle = async (
  chainlinkOracleAddress: string,
  asset: string,
  feed: string,
  admin: string,
  maxStalePeriodInSeconds: number = ONE_YEAR,
) => {
  const provider = ethers.provider;

  const oracle = new ethers.Contract(chainlinkOracleAddress, CHAINLINK_ORACLE_ABI, provider);
  const oracleAdmin = await initMainnetUser(admin, ethers.utils.parseEther("1.0"));

  if (feed === ethers.constants.AddressZero) {
    feed = (await oracle.tokenConfigs(asset)).feed;

    if (feed === ethers.constants.AddressZero) {
      return;
    }
  }

  await oracle.connect(oracleAdmin).setTokenConfig({
    asset,
    feed,
    maxStalePeriod: maxStalePeriodInSeconds,
  });
};

export const getForkedNetworkAddress = (contractName: string) => {
  const FORKED_NETWORK_ADDRESSES = FORKED_NETWORK && NETWORK_ADDRESSES[FORKED_NETWORK];
  if (FORKED_NETWORK_ADDRESSES && Object.prototype.hasOwnProperty.call(FORKED_NETWORK_ADDRESSES, contractName)) {
    return FORKED_NETWORK_ADDRESSES[contractName as keyof typeof FORKED_NETWORK_ADDRESSES];
  }
  throw new Error(`${contractName} address not found on forked ${FORKED_NETWORK}`);
};

export const NORMAL_TIMELOCK_NETWORKS = [
  "bscmainnet",
  "bsctestnet",
  "arbitrumone",
  "arbitrumsepolia",
  "ethereum",
  "sepolia",
  "opbnbmainnet",
  "opbnbtestnet",
  "opmainnet",
  "opsepolia",
  "zksyncmainnet",
  "zksyncsepolia",
  "basemainnet",
  "basesepolia",
];

const tryGetForkedNetworkAddress = (name: string): string => {
  try {
    return getForkedNetworkAddress(name);
  } catch {
    return ethers.constants.AddressZero;
  }
};

export const setMaxStalePeriod = async (
  resilientOracle: Contract,
  underlyingAsset: Contract,
  maxStalePeriodInSeconds: number = 31536000 /* 1 year */,
) => {
  const knownOracles = {
    binance: tryGetForkedNetworkAddress("BINANCE_ORACLE"),
    chainlink: tryGetForkedNetworkAddress("CHAINLINK_ORACLE"),
    redstone: tryGetForkedNetworkAddress("REDSTONE_ORACLE"),
    // same interface as the Chainlink oracle, different address
    atlas: tryGetForkedNetworkAddress("ATLAS_ORACLE"),
  };

  const adminKey = NORMAL_TIMELOCK_NETWORKS.includes(FORKED_NETWORK ?? "") ? "NORMAL_TIMELOCK" : "GUARDIAN";
  const admin = getForkedNetworkAddress(adminKey);

  const tokenConfig: TokenConfig = await resilientOracle.getTokenConfig(underlyingAsset.address);
  if (tokenConfig.asset === ethers.constants.AddressZero) return;

  for (let i = 0; i < tokenConfig.oracles.length; i++) {
    const oracle = tokenConfig.oracles[i];
    const enabled = tokenConfig.enableFlagsForOracles[i];
    if (!enabled || oracle === ethers.constants.AddressZero) continue;

    if (oracle === knownOracles.binance) {
      const symbol =
        underlyingAsset.address.toLowerCase() === ORACLE_BNB.toLowerCase() ? "BNB" : await underlyingAsset.symbol();
      await setMaxStalePeriodInBinanceOracle(oracle, symbol, maxStalePeriodInSeconds);
    } else if (oracle === knownOracles.chainlink || oracle === knownOracles.redstone || oracle === knownOracles.atlas) {
      await setMaxStalePeriodInChainlinkOracle(
        oracle,
        underlyingAsset.address,
        ethers.constants.AddressZero,
        admin,
        maxStalePeriodInSeconds,
      );
    }
  }
};

export const expectEvents = async (
  txResponse: TransactionResponse,
  abis: (string | JsonFragment[])[],
  expectedEvents: string[],
  expectedCounts: number[],
) => {
  const receipt = await txResponse.wait();
  const getNamedEvents = (abi: string | JsonFragment[]) => {
    const iface = new ethers.utils.Interface(abi);
    // @ts-expect-error @TODO type is wrong
    return (receipt.events || receipt.logs)
      .map((it: { topics: string[]; data: string }) => {
        try {
          return iface.parseLog(it).name;
        } catch (error) {
          error; // shhh
        }
      })
      .filter(Boolean);
  };

  const namedEvents = abis.flatMap(getNamedEvents);

  for (let i = 0; i < expectedEvents.length; ++i) {
    expect(
      namedEvents.filter(it => it === expectedEvents[i]),
      `expected a different number of ${expectedEvents[i]} events`,
    ).to.have.lengthOf(expectedCounts[i]);
  }
};

export const expectEventWithParams = async (
  txResponse: TransactionResponse,
  abi: string | JsonFragment[],
  expectedEvent: string,
  expectedParams: any[], // Array of expected parameters
) => {
  const receipt = await txResponse.wait();
  const iface = new ethers.utils.Interface(abi);

  // Extract the events that match the expected event name
  // @ts-expect-error @TODO type is wrong
  const matchingEvents = receipt.events
    .map((event: { topics: string[]; data: string }) => {
      try {
        return iface.parseLog(event);
      } catch (error) {
        return null; // Ignore events that do not match the ABI
      }
    })
    .filter(
      (parsedEvent: { topics: string[]; data: string; name: string }) =>
        parsedEvent && parsedEvent.name === expectedEvent,
    );

  // Check each event's parameters
  matchingEvents.forEach(
    (
      event: {
        topics: string[];
        data: string;
        args: [];
      },
      index: number,
    ) => {
      expect(
        event.args[index],
        `Parameters of event ${expectedEvent} did not match at instance ${index + 1}`,
      ).to.deep.equal(expectedParams[index]);
    },
  );
};

export const getEventArgs = async (
  txResponse: TransactionResponse,
  abi: string | JsonFragment[],
  expectedEvent: string,
) => {
  const receipt = await txResponse.wait();
  const iface = new ethers.utils.Interface(abi);

  // Extract the events that match the expected event name
  // @ts-expect-error @TODO type is wrong
  const matchingEvents = receipt.events
    .map((event: { topics: string[]; data: string }) => {
      try {
        return iface.parseLog(event);
      } catch (error) {
        return null; // Ignore events that do not match the ABI
      }
    })
    .filter(
      (parsedEvent: { topics: string[]; data: string; name: string }) =>
        parsedEvent && parsedEvent.name === expectedEvent,
    );

  // Check each event's parameters
  return matchingEvents.map((event: { topics: string[]; data: string; args: [] }) => {
    return event.args;
  });
};

export const proposalSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    signatures: {
      type: "array",
      items: {
        type: "string",
      },
    },
    targets: {
      type: "array",
      items: {
        type: "string",
      },
    },
    params: {
      type: "array",
      items: {
        type: "array",
      },
    },
    values: {
      type: "array",
      items: {
        type: ["string", "number"],
      },
    },
    meta: {
      type: "object",
    },
    type: {
      type: "number",
    },
  },
  required: ["signatures", "targets", "params", "values", "meta", "type"],
};

// Calculates the storage slot of a mapping(address => mapping(uint256=>uint256))
// mapping slot = p
// data[x][y]
// Storage slot calculation (. denotes concatenation):
// keccak256(uint256(y) . keccak256(uint256(x) . uint256(p)))

export const calculateMappingStorageSlot = (key1: string, key2: number, mappingStorageSlot: number): string => {
  // The pre-image used to compute the Storage location
  const newKeyPreimageHalf = utils.concat([
    // Mappings' keys in Solidity must all be word-aligned (32 bytes)
    utils.hexZeroPad(key1, 32),

    // Similarly with the slot-index into the Solidity variable layout
    utils.hexZeroPad(BigNumber.from(mappingStorageSlot).toHexString(), 32),
  ]);

  const newKeyHalf = utils.keccak256(newKeyPreimageHalf);

  const newKeyPreimage = utils.concat([utils.hexZeroPad(BigNumber.from(key2).toHexString(), 32), newKeyHalf]);

  const newKey = utils.keccak256(newKeyPreimage);
  return newKey;
};

// Legacy stale-price helpers, re-exported so older sims keep importing them from here.
// Keep at the bottom: legacyOracleStaleness.ts imports from this file.
export {
  pinResilientOraclePriceViaRedstone,
  setMaxStaleCoreAssets,
  setMaxStalePeriodForAllAssets,
  setMaxStalePeriodInOracle,
  setRedstonePrice,
} from "./legacyOracleStaleness";
