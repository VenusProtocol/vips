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
  setForkBlock,
  validateTargetAddresses,
} from "../utils";
import ENDPOINT_ABI from "./abi/LzEndpoint.json";
import OMNICHAIN_EXECUTOR_ABI from "./abi/OmnichainGovernanceExecutor.json";
import GOVERNOR_BRAVO_DELEGATE_ABI from "./abi/governorBravoDelegateAbi.json";

const DEFAULT_SUPPORTER_ADDRESS = "0xc444949e0054a23c44fc45789738bdf64aed2391";
const OMNICHAIN_PROPOSAL_SENDER = getOmnichainProposalSenderAddress();
const OMNICHAIN_GOVERNANCE_EXECUTOR =
  NETWORK_ADDRESSES[FORKED_NETWORK as REMOTE_NETWORKS].OMNICHAIN_GOVERNANCE_EXECUTOR;

const VOTING_PERIOD = 115200;

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

  for (let i = 0; i < proposal.signatures.length; ++i) {
    const txResponse = await executeCommand(impersonatedTimelock, proposal, i);
    txResponses.push(txResponse);
    bar.update(i + 1);
  }

  bar.stop();
  return txResponses;
};

export const testVip = (description: string, proposal: Proposal, options: TestingOptions = {}) => {
  let impersonatedTimelock: SignerWithAddress;
  let governorProxy: Contract;
  let proposer: SignerWithAddress;
  let supporter: SignerWithAddress;

  const governanceFixture = async (): Promise<void> => {
    const proposerAddress = options.proposer ?? DEFAULT_PROPOSER_ADDRESS;

    const supporterAddress = options.supporter ?? DEFAULT_SUPPORTER_ADDRESS;
    const timelockAddress = {
      [ProposalType.REGULAR]: NORMAL_TIMELOCK,
      [ProposalType.FAST_TRACK]: FAST_TRACK_TIMELOCK,
      [ProposalType.CRITICAL]: CRITICAL_TIMELOCK,
    }[proposal.type || ProposalType.REGULAR];
    proposer = await initMainnetUser(proposerAddress, ethers.utils.parseEther("1.0"));
    supporter = await initMainnetUser(supporterAddress, ethers.utils.parseEther("1.0"));
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
      let tx;

      // Validates target address
      await validateTargetAddresses(targets, signatures);

      if (proposal.type === undefined || proposal.type === null) {
        tx = await governorProxy
          .connect(proposer)
          .propose(targets, values, signatures, getCalldatas(proposal), JSON.stringify(meta));
      } else {
        tx = await governorProxy
          .connect(proposer)
          .propose(targets, values, signatures, getCalldatas(proposal), JSON.stringify(meta), proposal.type);
      }
      await tx.wait();
      proposalId = await governorProxy.callStatic.proposalCount();
      expect(proposalIdBefore.add(1)).to.equal(proposalId);
    });

    it("should be voteable", async () => {
      const proposalConfig = await governorProxy.proposalConfigs(proposal.type);
      const votingDelay = await proposalConfig.votingDelay;
      await mine(votingDelay);
      await expect(governorProxy.connect(proposer).castVote(proposalId, 1)).to.emit(governorProxy, "VoteCast");
      await expect(governorProxy.connect(supporter).castVote(proposalId, 1)).to.emit(governorProxy, "VoteCast");
    });

    it("should be queued successfully", async () => {
      await mineUpTo((await ethers.provider.getBlockNumber()) + VOTING_PERIOD + 1);
      const tx = await governorProxy.connect(proposer).queue(proposalId);
      await tx.wait();
    });

    it("should be executed successfully", async () => {
      await mineUpTo((await ethers.provider.getBlockNumber()) + DELAY_BLOCKS[proposal.type || 0]);
      const blockchainProposal = await governorProxy.proposals(proposalId);
      await time.increaseTo(blockchainProposal.eta.toNumber());
      const tx = await governorProxy.connect(proposer).execute(proposalId);

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
      const txnParams: { maxFeePerGas?: BigNumber } = {};

      if (feeData.maxFeePerGas) {
        // Sometimes the gas estimation is wrong with some networks like zksync
        txnParams.maxFeePerGas = feeData.maxFeePerGas.mul(15).div(10);
      }

      const tx = await executor.execute(proposalId, txnParams);

      if (options.callbackAfterExecution) {
        await options.callbackAfterExecution(tx);
      }
    });
  });
};
