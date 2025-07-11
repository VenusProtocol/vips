import { JsonFragment, defaultAbiCoder } from "@ethersproject/abi";
import { JsonRpcProvider, TransactionResponse } from "@ethersproject/providers";
import { mine } from "@nomicfoundation/hardhat-network-helpers";
import { NumberLike } from "@nomicfoundation/hardhat-network-helpers/dist/src/types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract, utils } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { FORKED_NETWORK, config, ethers, network } from "hardhat";
import { EthereumProvider } from "hardhat/types";

import { NETWORK_ADDRESSES, ORACLE_BNB } from "./networkAddresses";
import {
  Command,
  LzChainId,
  Proposal,
  ProposalMeta,
  ProposalType,
  REMOTE_MAINNET_NETWORKS,
  REMOTE_NETWORKS,
  REMOTE_TESTNET_NETWORKS,
  TokenConfig,
} from "./types";
import OmnichainProposalSender_ABI from "./vip-framework/abi/OmnichainProposalSender_ABI.json";
import VENUS_CHAINLINK_ORACLE_ABI from "./vip-framework/abi/VenusChainlinkOracle.json";
import BINANCE_ORACLE_ABI from "./vip-framework/abi/binanceOracle.json";
import CHAINLINK_ORACLE_ABI from "./vip-framework/abi/chainlinkOracle.json";
import COMPTROLLER_ABI from "./vip-framework/abi/comptroller.json";

const BSCTESTNET_OMNICHAIN_SENDER = "0xCfD34AEB46b1CB4779c945854d405E91D27A1899";
const BSCMAINNET_OMNICHAIN_SENDER = "0x36a69dE601381be7b0DcAc5D5dD058825505F8f6";

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
  commands: Command[],
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

export const setMaxStalePeriodInOracle = async (
  comptrollerAddress: string,
  maxStalePeriodInSeconds: number = 31536000 /* 1 year */,
) => {
  const provider = ethers.provider;
  const comptroller = new ethers.Contract(comptrollerAddress, COMPTROLLER_ABI, provider);

  const oracle = new ethers.Contract(await comptroller.oracle(), VENUS_CHAINLINK_ORACLE_ABI, provider);
  const oracleAdmin = await initMainnetUser(await oracle.admin(), ethers.utils.parseEther("1.0"));

  const tx = await oracle.connect(oracleAdmin).setMaxStalePeriod(maxStalePeriodInSeconds);
  await tx.wait();
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

export const setRedstonePrice = async (
  redstoneOracleAddress: string,
  asset: string,
  feed: string,
  admin: string,
  maxStalePeriodInSeconds: number = ONE_YEAR,
  { tokenDecimals }: { tokenDecimals?: number } = {},
) => {
  const rsOracle = new ethers.Contract(redstoneOracleAddress, CHAINLINK_ORACLE_ABI, ethers.provider);
  const oracleAdmin = await initMainnetUser(admin, ethers.utils.parseEther("1.0"));

  if (feed === ethers.constants.AddressZero) {
    feed = (await rsOracle.tokenConfigs(asset)).feed;

    if (feed === ethers.constants.AddressZero) {
      return;
    }
  }

  await rsOracle.connect(oracleAdmin).setTokenConfig({
    asset,
    feed,
    maxStalePeriod: maxStalePeriodInSeconds,
  });
  const price = await rsOracle.getPrice(asset);

  // Since our oracle adjusts the configured price for token decimals internally,
  // we need to do the reverse operation here so that the result of the getPrice()
  // call before setting the direct value is equal to the result of the same call
  // after we set the price
  const decimalDelta = 18 - (tokenDecimals ?? 18);
  const adjustedPrice = price.div(parseUnits("1", decimalDelta));
  await rsOracle.connect(oracleAdmin).setDirectPrice(asset, adjustedPrice);
  const priceAfter = await rsOracle.getPrice(asset);

  if (!price.eq(priceAfter)) {
    throw new Error("Price is not correctly configured, try setting token decimals");
  }
};

export const getForkedNetworkAddress = (contractName: string) => {
  const FORKED_NETWORK_ADDRESSES = FORKED_NETWORK && NETWORK_ADDRESSES[FORKED_NETWORK];
  if (FORKED_NETWORK_ADDRESSES && Object.prototype.hasOwnProperty.call(FORKED_NETWORK_ADDRESSES, contractName)) {
    return FORKED_NETWORK_ADDRESSES[contractName as keyof typeof FORKED_NETWORK_ADDRESSES];
  }
  throw new Error(`${contractName} address not found on forked ${FORKED_NETWORK}`);
};

export const setMaxStalePeriod = async (
  resilientOracle: Contract,
  underlyingAsset: Contract,
  maxStalePeriodInSeconds: number = 31536000 /* 1 year */,
) => {
  let binanceOracle: string = ethers.constants.AddressZero;
  let chainlinkOracle: string = ethers.constants.AddressZero;
  let redstoneOracle: string = ethers.constants.AddressZero;

  try {
    binanceOracle = getForkedNetworkAddress("BINANCE_ORACLE");
  } catch {
    console.log(`Binance Oracle is not available on ${FORKED_NETWORK}`);
  }

  try {
    chainlinkOracle = getForkedNetworkAddress("CHAINLINK_ORACLE");
  } catch {
    console.log(`Chainlink Oracle is not available on ${FORKED_NETWORK}`);
  }

  try {
    redstoneOracle = getForkedNetworkAddress("REDSTONE_ORACLE");
  } catch {
    console.log(`Redstone Oracle is not available on ${FORKED_NETWORK}`);
  }

  const normalTimelock =
    FORKED_NETWORK == "bscmainnet" ||
    FORKED_NETWORK == "bsctestnet" ||
    FORKED_NETWORK == "arbitrumone" ||
    FORKED_NETWORK == "arbitrumsepolia" ||
    FORKED_NETWORK == "ethereum" ||
    FORKED_NETWORK == "sepolia" ||
    FORKED_NETWORK == "opbnbmainnet" ||
    FORKED_NETWORK == "opbnbtestnet" ||
    FORKED_NETWORK == "opmainnet" ||
    FORKED_NETWORK == "opsepolia" ||
    FORKED_NETWORK == "zksyncmainnet" ||
    FORKED_NETWORK == "zksyncsepolia" ||
    FORKED_NETWORK == "basemainnet" ||
    FORKED_NETWORK == "basesepolia"
      ? getForkedNetworkAddress("NORMAL_TIMELOCK")
      : getForkedNetworkAddress("GUARDIAN");
  const tokenConfig: TokenConfig = await resilientOracle.getTokenConfig(underlyingAsset.address);
  if (tokenConfig.asset !== ethers.constants.AddressZero) {
    const mainOracle = tokenConfig.oracles[0];
    if (mainOracle === binanceOracle) {
      const symbol = await underlyingAsset.symbol();
      await setMaxStalePeriodInBinanceOracle(binanceOracle, symbol, maxStalePeriodInSeconds);
    } else if (mainOracle === chainlinkOracle || mainOracle === redstoneOracle) {
      await setMaxStalePeriodInChainlinkOracle(
        mainOracle,
        underlyingAsset.address,
        ethers.constants.AddressZero,
        normalTimelock,
        maxStalePeriodInSeconds,
      );

      if (underlyingAsset.address === ORACLE_BNB) {
        await setMaxStalePeriodInChainlinkOracle(
          tokenConfig.oracles[1],
          underlyingAsset.address,
          ethers.constants.AddressZero,
          normalTimelock,
          maxStalePeriodInSeconds,
        );
      }
    }
  }
  await mine(100);
};

export const setMaxStalePeriodForAllAssets = async (resilientOracle: Contract, assets: Contract[]): Promise<void> => {
  for (const asset of assets) {
    await setMaxStalePeriod(resilientOracle, asset);
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
interface AssetConfig {
  name: string;
  address: string;
  feed: string;
}

const BNB_MAINNET_ASSETS: AssetConfig[] = [
  {
    name: "USDC",
    address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    feed: "0x51597f405303C4377E36123cBc172b13269EA163",
  },
  {
    name: "USDT",
    address: "0x55d398326f99059fF775485246999027B3197955",
    feed: "0xb97ad0e74fa7d920791e90258a6e2085088b4320",
  },
  {
    name: "BUSD",
    address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    feed: "0xcbb98864ef56e9042e7d2efef76141f15731b82f",
  },
  {
    name: "SXP",
    address: "0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A",
    feed: "0xe188a9875af525d25334d75f3327863b2b8cd0f1",
  },
  {
    name: "XVS",
    address: "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63",
    feed: "0xbf63f430a79d4036a5900c19818aff1fa710f206",
  },
  {
    name: "BTCB",
    address: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    feed: "0x264990fbd0a4796a3e3d8e37c4d5f87a3aca5ebf",
  },
  {
    name: "ETH",
    address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    feed: "0x9ef1b8c0e4f7dc8bf5719ea496883dc6401d5b2e",
  },
  {
    name: "LTC",
    address: "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94",
    feed: "0x74e72f37a8c415c8f1a98ed42e78ff997435791d",
  },
  {
    name: "XRP",
    address: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
    feed: "0x93a67d414896a280bf8ffb3b389fe3686e014fda",
  },
  {
    name: "BCH",
    address: "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf",
    feed: "0x43d80f616daf0b0b42a928eed32147dc59027d41",
  },
  {
    name: "DOT",
    address: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
    feed: "0xc333eb0086309a16aa7c8308dfd32c8bba0a2592",
  },
  {
    name: "LINK",
    address: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
    feed: "0xca236e327f629f9fc2c30a4e95775ebf0b89fac8",
  },
  {
    name: "DAI",
    address: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
    feed: "0x132d3C0B1D2cEa0BC552588063bdBb210FDeecfA",
  },
  {
    name: "FIL",
    address: "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153",
    feed: "0xe5dbfd9003bff9df5feb2f4f445ca00fb121fb83",
  },
  {
    name: "BETH",
    address: "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B",
    feed: "0x2a3796273d47c4ed363b361d3aefb7f7e2a13782",
  },
  {
    name: "ADA",
    address: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
    feed: "0xa767f745331D267c7751297D982b050c93985627",
  },
  {
    name: "DOGE",
    address: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
    feed: "0x3ab0a0d137d4f946fbb19eecc6e92e64660231c8",
  },
  {
    name: "MATIC",
    address: "0xCC42724C6683B7E57334c4E856f4c9965ED682bD",
    feed: "0x7ca57b0ca6367191c94c8914d7df09a57655905f",
  },
  {
    name: "CAKE",
    address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    feed: "0xb6064ed41d4f67e353768aa239ca86f4f73665a1",
  },
  {
    name: "AAVE",
    address: "0xfb6115445Bff7b52FeB98650C87f44907E58f802",
    feed: "0xa8357bf572460fc40f4b0acacbb2a6a61c89f475",
  },
  {
    name: "TUSD",
    address: "0x14016E85a25aeb13065688cAFB43044C2ef86784",
    feed: "0xa3334a9762090e827413a7495afece76f41dfc06",
  },
  {
    name: "TRX",
    address: "0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B",
    feed: "0xf4c5e535756d11994fcbb12ba8add0192d9b88be",
  },
  {
    name: "TRX",
    address: "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3",
    feed: "0xf4c5e535756d11994fcbb12ba8add0192d9b88be",
  },
  {
    name: "BNB",
    address: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
    feed: "0x0567f2323251f0aab15c8dfb1967e4e8a7d42aee",
  },
  {
    name: "VAI",
    address: "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7",
    feed: "0x058316f8Bb13aCD442ee7A216C7b60CFB4Ea1B53",
  },

  {
    name: "USDT",
    address: "0x55d398326f99059ff775485246999027b3197955",
    feed: "0xB97Ad0E74fa7d920791E90258A6E2085088b4320",
  },

  {
    name: "USDC",
    address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    feed: "0x51597f405303C4377E36123cBc172b13269EA163",
  },
  {
    name: "TUSD_NEW",
    address: "0x40af3827f39d0eacbf4a168f8d4ee67c121d11c9",
    feed: "0xa3334A9762090E827413A7495AfeCE76F41dFc06",
  },
  {
    name: "FDUSD",
    address: "0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409",
    feed: "0x390180e80058A8499930F0c13963AD3E0d86Bfc9",
  },
];

export const setMaxStaleCoreAssets = async (chainlinkAddress: string, admin: string) => {
  for (const asset of BNB_MAINNET_ASSETS) {
    await setMaxStalePeriodInChainlinkOracle(chainlinkAddress, asset.address, asset.feed, admin);
  }
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
