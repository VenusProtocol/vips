import { TransactionRequest, TransactionResponse } from "@ethersproject/providers";
import { loadFixture, mine, mineUpTo, time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import cliProgress from "cli-progress";
import { BigNumber, Contract, ContractInterface } from "ethers";
import { FORKED_NETWORK, ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../networkAddresses";
import { NETWORK_CONFIG } from "../networkConfig";
import { Proposal, ProposalType, REMOTE_NETWORKS, SUPPORTED_NETWORKS } from "../types";
import {
  calculateGasForAdapterParam,
  getCalldatas,
  getOmnichainProposalSenderAddress,
  getPayload,
  getSourceChainId,
  initMainnetUser,
  mineBlocks,
  mineOnZksync,
  resolvePerTxGasCap,
  setForkBlock,
  validateTargetAddresses,
} from "../utils";
import ENDPOINT_ABI from "./abi/LzEndpoint.json";
import OMNICHAIN_EXECUTOR_ABI from "./abi/OmnichainGovernanceExecutor.json";
import GOVERNOR_BRAVO_DELEGATE_ABI from "./abi/governorBravoDelegateAbi.json";

// XVS Vault stakes erode over time, so a single default supporter no longer reliably
// clears quorum (600,000 XVS) when combined with the proposer at recent fork blocks.
// Two supporters give the framework headroom across blocks. Override per-test by passing
// `supporter` (single, legacy) or `supporters` (array) to `testVip`.
const DEFAULT_SUPPORTER_ADDRESSES = [
  "0xc444949e0054a23c44fc45789738bdf64aed2391",
  "0xeBA4b3c462B9C16f7CCaF4BE6f4D3c17c377411E",
];
const OMNICHAIN_PROPOSAL_SENDER = getOmnichainProposalSenderAddress();
const OMNICHAIN_GOVERNANCE_EXECUTOR =
  NETWORK_ADDRESSES[FORKED_NETWORK as REMOTE_NETWORKS].OMNICHAIN_GOVERNANCE_EXECUTOR;

// VOTING_PERIOD is updated for the Fermi upgrade.
// Previous blocks/year: 42,048,000
// After Fermi: 70,080,000
// Ratio: 70,080,000 / 42,048,000 = 1.67
// Previous voting period: 115,200
// New voting period: 115,200 * 1.67 = 192,384
const VOTING_PERIOD = 192384;

export const {
  DEFAULT_PROPOSER_ADDRESS,
  GOVERNOR_PROXY,
  NORMAL_TIMELOCK,
  FAST_TRACK_TIMELOCK,
  CRITICAL_TIMELOCK,
  GUARDIAN,
} = NETWORK_ADDRESSES[(FORKED_NETWORK as "bscmainnet") || "bsctestnet"] || {};
export const { DELAY_BLOCKS } = NETWORK_CONFIG[FORKED_NETWORK as SUPPORTED_NETWORKS];

export const forking = (blockNumber: number, fn: () => Promise<void>) => {
  (async () => {
    try {
      console.log(`At block #${blockNumber}`);
      await setForkBlock(blockNumber);
      await fn();
      run();
    } catch (e) {
      console.error(e);
    }
  })();
};

export interface TestingOptions {
  governorAbi?: ContractInterface;
  proposer?: string;
  supporter?: string;
  // Optional list of additional supporters. Used when proposer + single supporter no longer
  // clears quorum at the chosen fork block (XVS Vault stakes shift over time). If both
  // `supporter` and `supporters` are set, `supporters` wins.
  supporters?: string[];
  callbackAfterExecution?: (trx: TransactionResponse) => void;
}

const executeCommand = async (
  timelock: SignerWithAddress,
  proposal: Proposal,
  commandIdx: number,
): Promise<TransactionResponse> => {
  const encodeMethodCall = (signature: string, params: any[]): string => {
    if (signature === "") {
      return "0x";
    }
    const iface = new ethers.utils.Interface([`function ${signature}`]);
    const canonicalSignature = iface.fragments[0].format();
    if (signature !== canonicalSignature) {
      throw new Error(`Signature "${signature}" should be in the canonical form: "${canonicalSignature}"`);
    }
    return iface.encodeFunctionData(signature, params);
  };

  const txnParams: TransactionRequest = {
    to: proposal.targets[commandIdx],
    value: proposal.values[commandIdx],
    data: encodeMethodCall(proposal.signatures[commandIdx], proposal.params[commandIdx]),
  };

  if (proposal.gasFeeMultiplicationFactor && proposal.gasFeeMultiplicationFactor[commandIdx]) {
    const feeData = await ethers.provider.getFeeData();
    if (feeData.maxFeePerGas) {
      txnParams.maxFeePerGas = feeData.maxFeePerGas.mul(proposal.gasFeeMultiplicationFactor[commandIdx]);
    }
  }

  if (proposal.gasLimitMultiplicationFactor && proposal.gasLimitMultiplicationFactor[commandIdx]) {
    const gas = await timelock.estimateGas(txnParams);
    txnParams.gasLimit = gas.mul(proposal.gasLimitMultiplicationFactor[commandIdx]);
  }

  const tx = await timelock.sendTransaction(txnParams);
  return tx;
};

export const pretendExecutingVip = async (proposal: Proposal, sender: string = GUARDIAN) => {
  const impersonatedTimelock = await initMainnetUser(sender, ethers.utils.parseEther("4.0"));
  console.log("===== Simulating vip =====");
  const txResponses = [];
  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar.start(proposal.signatures.length, 0);

  // Each command runs as its own tx here (not bundled like `governorBravo.execute`),
  // so the per-tx cap applies per command, not to the sum. Track per-cmd max and
  // flag any individual command that exceeds the cap.
  const cap = await resolvePerTxGasCap(FORKED_NETWORK);
  let totalGas = BigNumber.from(0);
  let maxCmdGas = BigNumber.from(0);
  let maxCmdIdx = -1;
  for (let i = 0; i < proposal.signatures.length; ++i) {
    const txResponse = await executeCommand(impersonatedTimelock, proposal, i);
    const receipt = await txResponse.wait();
    totalGas = totalGas.add(receipt.gasUsed);
    if (receipt.gasUsed.gt(maxCmdGas)) {
      maxCmdGas = receipt.gasUsed;
      maxCmdIdx = i;
    }
    if (Number.isFinite(cap) && receipt.gasUsed.gt(cap)) {
      console.warn(
        `[gas] WARNING cmd[${i}] (${proposal.signatures[i]}) gasUsed=${receipt.gasUsed.toString()} ` +
          `exceeds ${FORKED_NETWORK} per-tx cap ${cap}`,
      );
    }
    txResponses.push(txResponse);
    bar.update(i + 1);
  }

  bar.stop();
  const maxSuffix = Number.isFinite(cap)
    ? ` (${maxCmdGas.mul(10000).div(cap).toNumber() / 100}% of ${FORKED_NETWORK} per-tx cap ${cap})`
    : ` (${FORKED_NETWORK} has no enforced per-tx cap)`;
  console.log(
    `[gas] pretendExecutingVip ${proposal.signatures.length} commands, ` +
      `maxCmdGasUsed=${maxCmdGas.toString()} (cmd[${maxCmdIdx}])${maxSuffix}, ` +
      `totalGasUsed=${totalGas.toString()}`,
  );
  return txResponses;
};

// Minimal Gnosis Safe ABI — the proposer is a Safe and the real propose() ships through
// its execTransaction(), so we measure the cap against that path (see estimateProposeViaMultisig).
const SAFE_ABI = [
  "function getOwners() view returns (address[])",
  "function getThreshold() view returns (uint256)",
  "function execTransaction(address to,uint256 value,bytes data,uint8 operation,uint256 safeTxGas,uint256 baseGas,uint256 gasPrice,address gasToken,address refundReceiver,bytes signatures) payable returns (bool)",
];

// Gnosis Safe storage layout: slot 4 holds `threshold`.
const SAFE_THRESHOLD_SLOT = "0x4";

// Warn when a tx is this close to the cap: it fits today but mainnet state drift
// (cold/warm SLOADs, proposalCount, etc.) can tip it over between sim and execution.
const NEAR_CAP_WARN_BPS = 9700; // 97%

// Logs a single governance transaction's gas in a consistent format:
//   [gas] <description> <label> <metric>=<n> (<pct>% of <network> per-tx cap <cap>)
// Each governance step (propose / queue / execute) runs as one on-chain tx and must fit
// the chain's per-tx gas cap. When `enforce` is set, also asserts the figure fits the cap.
// NOTE for propose: the binding figure is the REQUIRED GAS LIMIT of the real submission
// (proposer Safe -> execTransaction -> propose), NOT the gas a direct EOA propose consumes.
// Because of EIP-150's 63/64 forwarding reserve compounding across the Safe-proxy/singleton
// and Governor-proxy call layers, the required limit exceeds consumption — a tx can consume
// under the cap yet be unprovisionable (its required limit is over the cap, so propose OOGs).
const reportTxGas = async (
  description: string,
  label: string,
  gas: BigNumber,
  options: { enforce?: boolean; metric?: string } = {},
): Promise<void> => {
  const metric = options.metric ?? "gasUsed";
  const cap = await resolvePerTxGasCap(FORKED_NETWORK);
  const suffix = Number.isFinite(cap)
    ? ` (${gas.mul(10000).div(cap).toNumber() / 100}% of ${FORKED_NETWORK} per-tx cap ${cap})`
    : ` (${FORKED_NETWORK} has no enforced per-tx cap)`;
  console.log(`[gas] ${description} ${label} ${metric}=${gas.toString()}${suffix}`);
  if (Number.isFinite(cap)) {
    if (gas.lte(cap) && gas.mul(10000).gte(BigNumber.from(cap).mul(NEAR_CAP_WARN_BPS))) {
      console.warn(
        `[gas] WARNING: ${label} is within ${(10000 - NEAR_CAP_WARN_BPS) / 100}% of the per-tx cap ${cap}; ` +
          `consider splitting before mainnet state drift tips it over`,
      );
    }
    if (options.enforce) {
      expect(
        gas.lte(cap),
        `${label} ${metric} ${gas.toString()} exceeds the ${FORKED_NETWORK} per-tx gas cap ${cap}; ` +
          `split or trim the VIP so it fits a single on-chain transaction`,
      ).to.equal(true);
    }
  }
};

// Returns the gas LIMIT the real propose() submission needs. The proposer is a Gnosis Safe,
// so on-chain the proposal is created by Safe.execTransaction(GOVERNOR_PROXY, propose calldata),
// not a direct EOA call. estimateGas on that execTransaction folds in everything the cap binds:
// EIP-150 63/64 reserves across SafeProxy -> SafeSingleton -> GovernorProxy -> impl, the
// SafeMultiSigTransaction log of the full calldata, signature verification, intrinsic + calldata.
//
// To satisfy checkSignatures without private keys, we lower the Safe's threshold to 1 on the
// fork and use a single "pre-validated" (v=1) signature from an owner acting as msg.sender. We
// estimate the SAME execTransaction body (same propose calldata, same 63/64 forwarding, same
// SafeMultiSigTransaction log); only signature verification differs, by at most a few thousand
// gas — immaterial against propose's ~16M and well inside the near-cap warning band. (We avoid
// approveHash/getTransactionHash because getTransactionHash drifts across mined blocks on a
// hardhat fork, breaking hash pre-approval.)
const estimateProposeViaMultisig = async (proposeCalldata: string): Promise<BigNumber> => {
  const safe = new ethers.Contract(DEFAULT_PROPOSER_ADDRESS, SAFE_ABI, ethers.provider);
  const owners: string[] = await safe.getOwners();
  const owner = owners[0];
  const zero = ethers.constants.AddressZero;

  await ethers.provider.send("hardhat_setStorageAt", [
    DEFAULT_PROPOSER_ADDRESS,
    SAFE_THRESHOLD_SLOT,
    ethers.utils.hexZeroPad("0x1", 32),
  ]);

  // v=1 signature: r=owner, s=0, v=1. With msg.sender == owner the Safe accepts it as valid.
  const signatures = "0x" + owner.toLowerCase().slice(2).padStart(64, "0") + "0".repeat(64) + "01";

  const executor = await initMainnetUser(owner, ethers.utils.parseEther("1"));
  return safe
    .connect(executor)
    .estimateGas.execTransaction(GOVERNOR_PROXY, 0, proposeCalldata, 0, 0, 0, 0, zero, zero, signatures);
};

// True if `addr` is a Gnosis Safe (used to decide whether to enforce the cap against the
// real execTransaction path; non-Safe proposers fall back to direct-propose consumption).
const isSafe = async (addr: string): Promise<boolean> => {
  try {
    await new ethers.Contract(addr, SAFE_ABI, ethers.provider).getThreshold();
    return true;
  } catch {
    return false;
  }
};

export const testVip = (description: string, proposal: Proposal, options: TestingOptions = {}) => {
  let impersonatedTimelock: SignerWithAddress;
  let governorProxy: Contract;
  let proposer: SignerWithAddress;
  let supporters: SignerWithAddress[];

  const governanceFixture = async (): Promise<void> => {
    const proposerAddress = options.proposer ?? DEFAULT_PROPOSER_ADDRESS;

    const supporterAddresses =
      options.supporters ?? (options.supporter ? [options.supporter] : DEFAULT_SUPPORTER_ADDRESSES);
    const timelockAddress = {
      [ProposalType.REGULAR]: NORMAL_TIMELOCK,
      [ProposalType.FAST_TRACK]: FAST_TRACK_TIMELOCK,
      [ProposalType.CRITICAL]: CRITICAL_TIMELOCK,
    }[proposal.type || ProposalType.REGULAR];
    proposer = await initMainnetUser(proposerAddress, ethers.utils.parseEther("1.0"));
    supporters = await Promise.all(
      supporterAddresses.map(addr => initMainnetUser(addr, ethers.utils.parseEther("1.0"))),
    );
    impersonatedTimelock = await initMainnetUser(timelockAddress, ethers.utils.parseEther("40"));

    // Iniitalize impl via Proxy
    governorProxy = await ethers.getContractAt(
      (options.governorAbi ?? GOVERNOR_BRAVO_DELEGATE_ABI) as string,
      GOVERNOR_PROXY,
    );
  };

  describe(`${description} commands`, () => {
    before(async () => {
      await loadFixture(governanceFixture);
    });
    proposal.signatures.map((signature, i) => {
      it(`executes ${signature} successfully`, async () => {
        await executeCommand(impersonatedTimelock, proposal, i);
      });
    });
  });

  describe(`${description} execution`, () => {
    before(async () => {
      await loadFixture(governanceFixture);
    });

    let proposalId: number;

    it("can be proposed", async () => {
      const { targets, signatures, values, meta } = proposal;
      const proposalIdBefore = await governorProxy.callStatic.proposalCount();

      // Validates target address
      await validateTargetAddresses(targets, signatures);

      const proposeArgs =
        proposal.type === undefined || proposal.type === null
          ? [targets, values, signatures, getCalldatas(proposal), JSON.stringify(meta)]
          : [targets, values, signatures, getCalldatas(proposal), JSON.stringify(meta), proposal.type];

      // propose() stores the whole proposal in one tx — the heaviest governance tx and the
      // binding per-tx-cap constraint. The real submission is the proposer Safe's
      // execTransaction -> propose, so enforce the cap against THAT tx's required gas limit
      // (which folds in the 63/64 forwarding reserves + Safe overhead). Must run before the
      // direct propose below, while the proposer still has no live proposal. Falls back to
      // direct-propose consumption when the proposer isn't a Safe (e.g. non-governance forks).
      if (await isSafe(DEFAULT_PROPOSER_ADDRESS)) {
        const proposeCalldata = (await governorProxy.populateTransaction.propose(...proposeArgs)).data as string;
        const requiredLimit = await estimateProposeViaMultisig(proposeCalldata);
        await reportTxGas(description, "propose() via proposer-Safe execTransaction", requiredLimit, {
          enforce: true,
          metric: "requiredGasLimit",
        });
      }

      // Create the proposal for the rest of the lifecycle tests.
      const tx = await governorProxy.connect(proposer).propose(...proposeArgs);
      const receipt = await tx.wait();
      await reportTxGas(description, "propose() direct call", receipt.gasUsed, {
        enforce: !(await isSafe(DEFAULT_PROPOSER_ADDRESS)),
      });

      proposalId = await governorProxy.callStatic.proposalCount();
      expect(proposalIdBefore.add(1)).to.equal(proposalId);
    });

    it("should be voteable", async () => {
      const proposalConfig = await governorProxy.proposalConfigs(proposal.type);
      const votingDelay = await proposalConfig.votingDelay;
      await mine(votingDelay);
      await expect(governorProxy.connect(proposer).castVote(proposalId, 1)).to.emit(governorProxy, "VoteCast");
      for (const s of supporters) {
        await expect(governorProxy.connect(s).castVote(proposalId, 1)).to.emit(governorProxy, "VoteCast");
      }
    });

    it("should be queued successfully", async () => {
      await mineUpTo((await ethers.provider.getBlockNumber()) + VOTING_PERIOD + 1);
      const tx = await governorProxy.connect(proposer).queue(proposalId);
      const receipt = await tx.wait();
      await reportTxGas(description, "queue(proposalId)", receipt.gasUsed);
    });

    it("should be executed successfully", async () => {
      await mineUpTo((await ethers.provider.getBlockNumber()) + DELAY_BLOCKS[proposal.type || 0]);
      const blockchainProposal = await governorProxy.proposals(proposalId);
      await time.increaseTo(blockchainProposal.eta.toNumber());

      // Mirror the chain's protocol per-tx cap by capping tx.gasLimit. Hardhat
      // fork does not enforce protocol per-tx caps (those are consensus rules,
      // not tx fields), so without this an over-cap proposal passes simulation
      // but OOGs on chain. Setting gasLimit = cap forces hardhat to revert
      // out-of-gas exactly as mainnet would. Build the tx via
      // `populateTransaction` so the override is applied at the raw-tx layer
      // (passing it as a second arg to the contract method gets misinterpreted
      // as a positional fn arg by ethers v5).
      const cap = await resolvePerTxGasCap(FORKED_NETWORK);
      const populated = await governorProxy.connect(proposer).populateTransaction.execute(proposalId);
      if (Number.isFinite(cap)) {
        populated.gasLimit = BigNumber.from(cap);
      }
      const tx = await proposer.sendTransaction(populated);
      const receipt = await tx.wait();
      await reportTxGas(description, "execute(proposalId)", receipt.gasUsed);

      if (options.callbackAfterExecution) {
        await options.callbackAfterExecution(tx);
      }
    });
  });
};

export const testForkedNetworkVipCommands = (description: string, proposal: Proposal, options: TestingOptions = {}) => {
  let executor: Contract;
  let payload: string;
  let proposalId: number;
  let targets: string[];
  let signatures: string[];
  let proposalType: ProposalType;
  const provider = ethers.provider;

  describe(`${description} execution`, () => {
    before(async () => {
      executor = await ethers.getContractAt(OMNICHAIN_EXECUTOR_ABI, OMNICHAIN_GOVERNANCE_EXECUTOR);
      payload = getPayload(proposal);
      proposalId = await executor.lastProposalReceived();

      // there could be proposals recevied before the last proposal, with a greater id (i.e. if the last proposal was a retry)
      while ((await executor.proposals(++proposalId)).id.gt(0));

      [targets, , signatures, , proposalType] = ethers.utils.defaultAbiCoder.decode(
        ["address[]", "uint256[]", "string[]", "bytes[]", "uint8"],
        payload,
      );
    });

    it("should be queued succesfully", async () => {
      await validateTargetAddresses(targets, signatures);
      const impersonatedLibrary = await initMainnetUser(
        NETWORK_ADDRESSES[FORKED_NETWORK as REMOTE_NETWORKS].LZ_LIBRARY,
        ethers.utils.parseEther("100"),
      );
      const endpoint = new ethers.Contract(
        NETWORK_ADDRESSES[FORKED_NETWORK as REMOTE_NETWORKS].ENDPOINT,
        ENDPOINT_ABI,
        provider,
      );

      const srcAddress = ethers.utils.solidityPack(
        ["address", "address"],
        [OMNICHAIN_PROPOSAL_SENDER, OMNICHAIN_GOVERNANCE_EXECUTOR],
      );
      const srcChainId = getSourceChainId(FORKED_NETWORK as REMOTE_NETWORKS);
      const inboundNonce = await endpoint.connect(impersonatedLibrary).getInboundNonce(srcChainId, srcAddress);
      const gasLimit = calculateGasForAdapterParam(targets.length);

      const feeData = await ethers.provider.getFeeData();
      const txnParams: { maxFeePerGas?: BigNumber; gasLimit: number } = { gasLimit: gasLimit };

      if (feeData.maxFeePerGas) {
        // Sometimes the gas estimation is wrong with some networks like zksync
        txnParams.maxFeePerGas = feeData.maxFeePerGas.mul(15).div(10);
      }
      await endpoint
        .connect(impersonatedLibrary)
        .receivePayload(
          srcChainId,
          srcAddress,
          OMNICHAIN_GOVERNANCE_EXECUTOR,
          inboundNonce.add(1),
          gasLimit,
          ethers.utils.defaultAbiCoder.encode(["bytes", "uint256"], [payload, proposalId]),
          txnParams,
        );

      expect(await executor.queued(proposalId)).to.be.true;
    });

    it("should be executed successfully", async () => {
      if (FORKED_NETWORK == "zksyncsepolia" || FORKED_NETWORK == "zksyncmainnet") {
        await mineOnZksync(DELAY_BLOCKS[proposalType]);
        const [signer] = await ethers.getSigners();
        await initMainnetUser(signer.address, ethers.utils.parseEther("2"));
      } else {
        await mine(DELAY_BLOCKS[proposalType]);
      }
      const blockchainProposal = await executor.proposals(proposalId);
      await ethers.provider.send("evm_setNextBlockTimestamp", [blockchainProposal.eta.toHexString()]);
      await mineBlocks();

      const feeData = await ethers.provider.getFeeData();
      const txnParams: { maxFeePerGas?: BigNumber; gasLimit?: number } = {};

      if (feeData.maxFeePerGas) {
        // Sometimes the gas estimation is wrong with some networks like zksync
        txnParams.maxFeePerGas = feeData.maxFeePerGas.mul(15).div(10);
      }

      // Mirror the chain's protocol per-tx cap by capping tx.gasLimit. Hardhat
      // fork does not enforce protocol per-tx caps, so without this an over-cap
      // remote payload passes simulation but OOGs on chain.
      const cap = await resolvePerTxGasCap(FORKED_NETWORK);
      if (Number.isFinite(cap)) {
        txnParams.gasLimit = cap;
      }

      const tx = await executor.execute(proposalId, txnParams);
      const receipt = await tx.wait();

      const gasUsed = receipt.gasUsed.toString();
      const capSuffix = Number.isFinite(cap)
        ? ` (${receipt.gasUsed.mul(10000).div(cap).toNumber() / 100}% of ${FORKED_NETWORK} per-tx cap ${cap})`
        : ` (${FORKED_NETWORK} has no enforced per-tx cap)`;
      console.log(`[gas] ${description} executor.execute(proposalId) gasUsed=${gasUsed}${capSuffix}`);

      if (options.callbackAfterExecution) {
        await options.callbackAfterExecution(tx);
      }
    });
  });
};
