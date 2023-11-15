import { loadFixture, mine, mineUpTo, time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract, ContractInterface } from "ethers";
import { ethers } from "hardhat";

import { Proposal, ProposalType } from "../types";
import { getCalldatas, getPayload, initMainnetUser, setForkBlock } from "../utils";
import ENDPOINT_ABI from "./abi/LzEndpoint.json";
import OMNICHAIN_EXECUTOR_ABI from "./abi/OmnichainExecutor.json";
import GOVERNOR_BRAVO_DELEGATE_ABI from "./abi/governorBravoDelegateAbi.json";

let DELAY_BLOCKS: any;
const VOTING_PERIOD = 28800;
let DEFAULT_PROPOSER_ADDRESS: string;
let GOVERNOR_PROXY: string;
export let NORMAL_TIMELOCK: string;
let ENDPOINT: string;
let OMNICHAIN_PROPOSAL_SENDER: string;
let OMNICHAIN_GOVERNANCE_EXECUTOR: string;
let LZ_LIBRARY: string;
let OMNICHAIN_EXECUTOR_OWNER: string;
let DEFAULT_SUPPORTER_ADDRESS: string;

if (process.env.FORK_MAINNET === "true" && process.env.NETWORK === "bscmainnet") {
  DEFAULT_SUPPORTER_ADDRESS = "0xc444949e0054a23c44fc45789738bdf64aed2391";
  DELAY_BLOCKS = {
    [ProposalType.REGULAR]: 57600,
    [ProposalType.FAST_TRACK]: 7200,
    [ProposalType.CRITICAL]: 1200,
  };

  DEFAULT_PROPOSER_ADDRESS = "0x55A9f5374Af30E3045FB491f1da3C2E8a74d168D";
  GOVERNOR_PROXY = "0x2d56dC077072B53571b8252008C60e945108c75a";
  NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
}

if (process.env.FORK_TESTNET === "true" && process.env.NETWORK === "bsctestnet") {
  DEFAULT_PROPOSER_ADDRESS = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";
  GOVERNOR_PROXY = "0x5573422a1a59385c247ec3a66b93b7c08ec2f8f2";
  NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
  OMNICHAIN_EXECUTOR_OWNER = "0x21Faad4b28256E5C56f54fbAaceda919E707549f";

  DELAY_BLOCKS = {
    [ProposalType.REGULAR]: 200,
    [ProposalType.FAST_TRACK]: 100,
    [ProposalType.CRITICAL]: 34,
  };
}

if (process.env.FORK_TESTNET === "true" && process.env.NETWORK === "sepolia") {
  NORMAL_TIMELOCK = "0x3961EDAfe1d1d3AB446f1b2fc10bde476058448B";
  ENDPOINT = "0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1";
  OMNICHAIN_PROPOSAL_SENDER = "0x0852b6D4C4745A8bFEB54476A2A167DF68866c00";
  OMNICHAIN_GOVERNANCE_EXECUTOR = "0x9B0786cD8F841D1C7B8A08a5aE6a246aEd556a42";
  LZ_LIBRARY = "0x3acaaf60502791d199a5a5f0b173d78229ebfe32";
  DELAY_BLOCKS = {
    [ProposalType.REGULAR]: 200,
    [ProposalType.FAST_TRACK]: 100,
    [ProposalType.CRITICAL]: 34,
  };
}

if (process.env.FORK_TESTNET === "true" && process.env.NETWORK === "arbitrum_goerli") {
  NORMAL_TIMELOCK = "0x54E8C036A5f63Ad5e3B28Fa610cdBdbC00613446";
  ENDPOINT = "0x6aB5Ae6822647046626e83ee6dB8187151E1d5ab";
  OMNICHAIN_PROPOSAL_SENDER = "0x0852b6D4C4745A8bFEB54476A2A167DF68866c00";
  OMNICHAIN_GOVERNANCE_EXECUTOR = "0xDC267eac30C9f73E6779554F89119e975a5D4F18";
  LZ_LIBRARY = "0x3acaaf60502791d199a5a5f0b173d78229ebfe32";
  DELAY_BLOCKS = {
    [ProposalType.REGULAR]: 200,
    [ProposalType.FAST_TRACK]: 100,
    [ProposalType.CRITICAL]: 34,
  };
}

export const forking = (blockNumber: number, fn: () => void) => {
  describe(`At block #${blockNumber}`, async () => {
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
    const canonicalSignature = iface.fragments[0].format();
    if (signature !== canonicalSignature) {
      throw new Error(`Signature "${signature}" should be in the canonical form: "${canonicalSignature}"`);
    }
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
    console.log(`Executing ${proposal.signatures[i]}`);
    await executeCommand(impersonatedTimelock, proposal, i);
  }
};

export const testVipV2 = (description: string, proposal: Proposal, options: TestingOptions = {}) => {
  let executor: Contract;
  const payload = getPayload(proposal);

  const governanceFixture = async (): Promise<void> => {
    // Iniitalize impl via Proxy
    executor = await ethers.getContractAt(options.governorAbi ?? OMNICHAIN_EXECUTOR_ABI, OMNICHAIN_GOVERNANCE_EXECUTOR);
  };

  describe(`${description} execution`, () => {
    let proposalId: number;

    const [, , , , proposalType] = ethers.utils.defaultAbiCoder.decode(
      ["address[]", "uint256[]", "string[]", "bytes[]", "uint8"],
      payload,
    );

    before(async () => {
      await loadFixture(governanceFixture);
      proposalId = await executor.lastProposalReceived();
      proposalId++;
    });

    it("should be queued succesfully", async () => {
      const impersonatedLibrary = await initMainnetUser(LZ_LIBRARY, ethers.utils.parseEther("100"));
      const impersonatedEndpoint = await initMainnetUser(ENDPOINT, ethers.utils.parseEther("100"));
      const provider = ethers.provider;
      const endpoint = new ethers.Contract(ENDPOINT, ENDPOINT_ABI, provider);

      const srcAddress = OMNICHAIN_PROPOSAL_SENDER + OMNICHAIN_GOVERNANCE_EXECUTOR.slice(2);
      const inboundNonce = await endpoint.connect(impersonatedLibrary).getInboundNonce(10102, srcAddress);

      const tx = await executor
        .connect(impersonatedEndpoint)
        .lzReceive(
          10102,
          srcAddress,
          inboundNonce.add(1),
          ethers.utils.defaultAbiCoder.encode(["bytes", "uint256"], [payload, proposalId]),
        );
      await tx.wait();
    });

    it("should be executed successfully", async () => {
      await mineUpTo((await ethers.provider.getBlockNumber()) + DELAY_BLOCKS[proposalType]);
      const blockchainProposal = await executor.proposals(proposalId);
      await time.increaseTo(blockchainProposal.eta.toNumber());
      const tx = await executor.execute(proposalId);

      if (options.callbackAfterExecution) {
        await options.callbackAfterExecution(tx);
      }
    });
  });
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

      if (options.callbackAfterExecution) {
        await options.callbackAfterExecution(tx);
      }
    });
  });
};
