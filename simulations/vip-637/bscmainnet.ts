import { mine } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  CT_VOTING_DELAY,
  CT_VOTING_PERIOD,
  FT_VOTING_DELAY,
  FT_VOTING_PERIOD,
  GOVERNANCE_BRAVO,
  NEW_BRAVO_IMPL,
  NT_VOTING_DELAY,
  NT_VOTING_PERIOD,
  PROPOSAL_THRESHOLD,
  vip637,
} from "../../vips/vip-637/bscmainnet";
import ERC20_ABI from "./abi/erc20.json";
import DELEGATE_ABI from "./abi/governorBravodelegate.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";

const { XVS, XVS_VAULT_PROXY, DEFAULT_PROPOSER_ADDRESS } = NETWORK_ADDRESSES.bscmainnet;

const ROUTES = 3;
const XVS_PID = 0;
const OLD_PROPOSAL_THRESHOLD = parseUnits("300000", 18);

// Liquid XVS holder used to fund a proposer above the new 1,000,000 XVS threshold.
const XVS_WHALE = "0xF977814e90dA44bFA03b6295A0616a897441aceC";
// Fresh accounts with no pre-existing governance state.
const ATTACKER = "0x0000000000000000000000000000000000000A11";
const FUNDED_PROPOSER = "0x0000000000000000000000000000000000000B22";
const STAKE_AMOUNT = parseUnits("1100000", 18); // > 1,000,000 XVS threshold

// Documented baseline (asserted against chain pre-VIP). Order: [Normal, FastTrack, Critical].
const EXPECTED_CONFIGS = [
  { votingDelay: NT_VOTING_DELAY, votingPeriod: NT_VOTING_PERIOD },
  { votingDelay: FT_VOTING_DELAY, votingPeriod: FT_VOTING_PERIOD },
  { votingDelay: CT_VOTING_DELAY, votingPeriod: CT_VOTING_PERIOD },
];

// A well-formed, harmless proposal payload. Only used to exercise the proposal-threshold
// gate, never queued or executed.
const dummyProposal = (): [string[], BigNumber[], string[], string[]] => [
  [GOVERNANCE_BRAVO],
  [BigNumber.from(0)],
  ["proposalMaxOperations()"],
  ["0x"],
];

forking(106052221, async () => {
  let bravo: Contract;
  let xvs: Contract;
  let xvsVault: Contract;
  // Actual pre-VIP config read from chain, used to prove the VIP leaves them untouched.
  const preConfigs: { votingDelay: BigNumber; votingPeriod: BigNumber }[] = [];

  before(async () => {
    bravo = await ethers.getContractAt(DELEGATE_ABI, GOVERNANCE_BRAVO);
    xvs = await ethers.getContractAt(ERC20_ABI, XVS);
    xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, XVS_VAULT_PROXY);

    for (let i = 0; i < ROUTES; i++) {
      const config = await bravo.proposalConfigs(i);
      preConfigs.push({ votingDelay: config.votingDelay, votingPeriod: config.votingPeriod });
    }
  });

  describe("Pre-VIP behaviour", async () => {
    it("does not yet point to the new implementation", async () => {
      expect(await bravo.implementation()).to.not.equal(NEW_BRAVO_IMPL);
    });

    it("has a proposal threshold of 300,000 XVS on every route", async () => {
      for (let i = 0; i < ROUTES; i++) {
        const config = await bravo.proposalConfigs(i);
        expect(config.proposalThreshold).to.equal(OLD_PROPOSAL_THRESHOLD);
      }
    });

    it("matches the documented voting delay and period baseline", async () => {
      for (let i = 0; i < ROUTES; i++) {
        const config = await bravo.proposalConfigs(i);
        expect(config.votingDelay).to.equal(EXPECTED_CONFIGS[i].votingDelay);
        expect(config.votingPeriod).to.equal(EXPECTED_CONFIGS[i].votingPeriod);
      }
    });

    it("blocks a proposer below the 300,000 XVS threshold", async () => {
      const attacker = await initMainnetUser(ATTACKER, parseUnits("1", 18));
      expect(await xvsVault.getPriorVotes(ATTACKER, (await ethers.provider.getBlockNumber()) - 1)).to.equal(0);
      await expect(
        bravo.connect(attacker).propose(...dummyProposal(), "below threshold", ProposalType.REGULAR),
      ).to.be.revertedWith("GovernorBravo::propose: proposer votes below proposal threshold");
    });

    it("allows a proposer at/above the 300,000 XVS threshold", async () => {
      const proposer = await initMainnetUser(DEFAULT_PROPOSER_ADDRESS, parseUnits("1", 18));
      const votes = await xvsVault.getPriorVotes(DEFAULT_PROPOSER_ADDRESS, (await ethers.provider.getBlockNumber()) - 1);
      expect(votes).to.be.gte(OLD_PROPOSAL_THRESHOLD);
      // callStatic verifies the threshold gate passes without creating a live proposal.
      await expect(bravo.connect(proposer).callStatic.propose(...dummyProposal(), "ok", ProposalType.REGULAR)).to.not.be
        .reverted;
    });
  });

  testVip("VIP-637 Raise proposal threshold to 1,000,000 XVS", await vip637());

  describe("Post-VIP behaviour", async () => {
    it("points to the new implementation", async () => {
      expect(await bravo.implementation()).to.equal(NEW_BRAVO_IMPL);
    });

    it("raises the proposal threshold to 1,000,000 XVS on every route", async () => {
      for (let i = 0; i < ROUTES; i++) {
        const config = await bravo.proposalConfigs(i);
        expect(config.proposalThreshold).to.equal(PROPOSAL_THRESHOLD);
      }
    });

    it("leaves voting delays and periods exactly as they were pre-VIP", async () => {
      for (let i = 0; i < ROUTES; i++) {
        const config = await bravo.proposalConfigs(i);
        expect(config.votingDelay).to.equal(preConfigs[i].votingDelay);
        expect(config.votingPeriod).to.equal(preConfigs[i].votingPeriod);
      }
    });

    it("now blocks a proposer that cleared the old 300,000 XVS bar but is below 1,000,000 XVS", async () => {
      const proposer = await initMainnetUser(DEFAULT_PROPOSER_ADDRESS, parseUnits("1", 18));
      const votes = await xvsVault.getPriorVotes(DEFAULT_PROPOSER_ADDRESS, (await ethers.provider.getBlockNumber()) - 1);
      expect(votes).to.be.gte(OLD_PROPOSAL_THRESHOLD).and.lt(PROPOSAL_THRESHOLD);
      await expect(
        bravo.connect(proposer).propose(...dummyProposal(), "below new threshold", ProposalType.REGULAR),
      ).to.be.revertedWith("GovernorBravo::propose: proposer votes below proposal threshold");
    });

    it("allows a proposer at/above the new 1,000,000 XVS threshold", async () => {
      const whale = await initMainnetUser(XVS_WHALE, parseUnits("1", 18));
      const proposer: SignerWithAddress = await initMainnetUser(FUNDED_PROPOSER, parseUnits("1", 18));

      await xvs.connect(whale).transfer(FUNDED_PROPOSER, STAKE_AMOUNT);
      await xvs.connect(proposer).approve(XVS_VAULT_PROXY, STAKE_AMOUNT);
      await xvsVault.connect(proposer).deposit(XVS, XVS_PID, STAKE_AMOUNT);
      await xvsVault.connect(proposer).delegate(FUNDED_PROPOSER);
      await mine();

      const votes = await xvsVault.getPriorVotes(FUNDED_PROPOSER, (await ethers.provider.getBlockNumber()) - 1);
      expect(votes).to.be.gte(PROPOSAL_THRESHOLD);
      await expect(bravo.connect(proposer).callStatic.propose(...dummyProposal(), "ok", ProposalType.REGULAR)).to.not.be
        .reverted;
    });
  });
});
