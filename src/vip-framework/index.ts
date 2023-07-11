import { loadFixture, mine, mineUpTo, time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract, ContractInterface } from "ethers";
import { ethers } from "hardhat";

import { Proposal, ProposalType } from "../types";
import { getCalldatas, initMainnetUser, setForkBlock } from "../utils";
import GOVERNOR_BRAVO_DELEGATE_ABI from "./abi/governorBravoDelegateAbi.json";

const DEFAULT_SUPPORTER_ADDRESS = "0xc444949e0054a23c44fc45789738bdf64aed2391";
const DELAY_BLOCKS = {
  [ProposalType.REGULAR]: 57600,
  [ProposalType.FAST_TRACK]: 7200,
  [ProposalType.CRITICAL]: 1200,
};
const VOTING_PERIOD = 28800;

let DEFAULT_PROPOSER_ADDRESS = "0x55A9f5374Af30E3045FB491f1da3C2E8a74d168D";
let GOVERNOR_PROXY = "0x2d56dC077072B53571b8252008C60e945108c75a";
let NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

if (process.env.FORK_TESTNET === "true") {
  DEFAULT_PROPOSER_ADDRESS = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";
  GOVERNOR_PROXY = "0x5573422a1a59385c247ec3a66b93b7c08ec2f8f2";
  NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
  const DELAY_BLOCKS = {
    [ProposalType.REGULAR]: 200,
    [ProposalType.FAST_TRACK]: 100,
    [ProposalType.CRITICAL]: 34,
  };
}

export const forking = (blockNumber: number, fn: () => void) => {
  describe(`At block #${blockNumber}`, () => {
    before(async () => {
      await setForkBlock(blockNumber);
    });
    fn();
  });
};

export interface TestingOptions {
  governorAbi?: ContractInterface;
  proposer?: string;
  supporter?: string;
  callbackAfterExecution?: Func;
}

const executeCommand = async (timelock: SignerWithAddress, proposal: Proposal, commandIdx: number): Promise<void> => {
  const encodeMethodCall = (signature: string, params: any[]): string => {
    if (signature === "") {
      return "0x";
    }
    const iface = new ethers.utils.Interface([`function ${signature}`]);
    return iface.encodeFunctionData(signature, params);
  };

  await timelock.sendTransaction({
    to: proposal.targets[commandIdx],
    value: proposal.values[commandIdx],
    data: encodeMethodCall(proposal.signatures[commandIdx], proposal.params[commandIdx]),
    gasLimit: 8000000,
  });
};

export const pretendExecutingVip = async (proposal: Proposal) => {
  const impersonatedTimelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("1.0"));
  for (let i = 0; i < proposal.signatures.length; ++i) {
    await executeCommand(impersonatedTimelock, proposal, i);
  }
};

export const testVip = (description: string, proposal: Proposal, options: TestingOptions = {}) => {
  let impersonatedTimelock: SignerWithAddress;
  let governorProxy: Contract;
  let proposer: SignerWithAddress;
  let supporter: SignerWithAddress;

  const governanceFixture = async (): Promise<void> => {
    const proposerAddress = options.proposer ?? DEFAULT_PROPOSER_ADDRESS;
    const supporterAddress = options.supporter ?? DEFAULT_SUPPORTER_ADDRESS;
    proposer = await initMainnetUser(proposerAddress, ethers.utils.parseEther("1.0"));
    supporter = await initMainnetUser(supporterAddress, ethers.utils.parseEther("1.0"));
    impersonatedTimelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("1.0"));

    // Iniitalize impl via Proxy
    governorProxy = await ethers.getContractAt(options.governorAbi ?? GOVERNOR_BRAVO_DELEGATE_ABI, GOVERNOR_PROXY);
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
      await mine(150);
      await expect(governorProxy.connect(proposer).castVote(proposalId, 1)).to.emit(governorProxy, "VoteCast");
      await expect(governorProxy.connect(supporter).castVote(proposalId, 1)).to.emit(governorProxy, "VoteCast");
    });

    it("should be queued successfully", async () => {
      await mineUpTo((await ethers.provider.getBlockNumber()) + VOTING_PERIOD + 1);
      const tx = await governorProxy.connect(proposer).queue(proposalId);
      await tx.wait();
    });

    it("should be executed successfully", async () => {
      await mineUpTo((await ethers.provider.getBlockNumber()) + DELAY_BLOCKS[proposal.type]);
      const blockchainProposal = await governorProxy.proposals(proposalId);
      await time.increaseTo(blockchainProposal.eta.toNumber());
      const tx = await governorProxy.connect(proposer).execute(proposalId);
      const txResponse = await tx.wait();

      if (options.callbackAfterExecution) {
        await options.callbackAfterExecution(txResponse);
      }
    });
  });
};
