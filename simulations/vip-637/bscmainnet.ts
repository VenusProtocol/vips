import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
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
import DELEGATE_ABI from "./abi/governorBravodelegate.json";

const OLD_PROPOSAL_THRESHOLD = parseUnits("300000", 18);

const EXPECTED_CONFIGS = [
  { votingDelay: NT_VOTING_DELAY, votingPeriod: NT_VOTING_PERIOD },
  { votingDelay: FT_VOTING_DELAY, votingPeriod: FT_VOTING_PERIOD },
  { votingDelay: CT_VOTING_DELAY, votingPeriod: CT_VOTING_PERIOD },
];

forking(106052221, async () => {
  let bravo: Contract;

  before(async () => {
    bravo = await ethers.getContractAt(DELEGATE_ABI, GOVERNANCE_BRAVO);
  });

  describe("Pre-VIP behaviour", async () => {
    it("does not yet point to the new implementation", async () => {
      expect(await bravo.implementation()).to.not.equal(NEW_BRAVO_IMPL);
    });

    it("has a proposal threshold of 300,000 XVS on every route", async () => {
      for (let i = 0; i < EXPECTED_CONFIGS.length; i++) {
        const config = await bravo.proposalConfigs(i);
        expect(config.proposalThreshold).to.equal(OLD_PROPOSAL_THRESHOLD);
      }
    });
  });

  testVip("VIP-637 Raise proposal threshold to 1,000,000 XVS", await vip637());

  describe("Post-VIP behaviour", async () => {
    it("points to the new implementation", async () => {
      expect(await bravo.implementation()).to.equal(NEW_BRAVO_IMPL);
    });

    it("raises the proposal threshold to 1,000,000 XVS on every route", async () => {
      for (let i = 0; i < EXPECTED_CONFIGS.length; i++) {
        const config = await bravo.proposalConfigs(i);
        expect(config.proposalThreshold).to.equal(PROPOSAL_THRESHOLD);
      }
    });

    it("leaves voting delays and voting periods unchanged", async () => {
      for (let i = 0; i < EXPECTED_CONFIGS.length; i++) {
        const config = await bravo.proposalConfigs(i);
        expect(config.votingDelay).to.equal(EXPECTED_CONFIGS[i].votingDelay);
        expect(config.votingPeriod).to.equal(EXPECTED_CONFIGS[i].votingPeriod);
      }
    });
  });
});
