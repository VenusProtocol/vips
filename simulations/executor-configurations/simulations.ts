import { expect } from "chai";
import { ethers } from "hardhat";

import { forking, testVipV2 } from "../../src/vip-framework";
import { executor_configuration } from "../../vips/executor-configuration";
import OMNICHAIN_GOVERNANCE_EXECUTOR_ABI from "./abi/OmnichainGovernanceExecutor_ABI.json";

const REMOTE_NORMAL_TIMELOCK = "0x3961EDAfe1d1d3AB446f1b2fc10bde476058448B";
const REMOTE_FASTTRACK_TIMELOCK = "0x02A66bfB5De5c6b969cB81F00AC433bC8EeeDd4c";
const REMOTE_CRITICAL_TIMELOCK = "0xa82173F08CDFCD6fDB5505dcd37E5c6403a26DE6";
const OMNICHAIN_PROPOSAL_SENDER = "0x0852b6d4c4745a8bfeb54476a2a167df68866c00";
const OMNICHAIN_GOVERNANCE_EXECUTOR = "0x9b0786cd8f841d1c7b8a08a5ae6a246aed556a42";

forking(4658671, async () => {
  const provider = ethers.provider;
  let lastProposalReceived: number;
  let executor: ethers.Contract;
  const result = await executor_configuration();
  const payloads = result.payloads;
  before(async () => {
    executor = new ethers.Contract(OMNICHAIN_GOVERNANCE_EXECUTOR, OMNICHAIN_GOVERNANCE_EXECUTOR_ABI, provider);
    lastProposalReceived = await executor.lastProposalReceived();
  });

  testVipV2("executor_configuration give permissions to timelock", payloads.get(10161));

  describe("Post-VIP behaviour", async () => {
    it("Proposal id should be incremented", async () => {
      expect(await executor.lastProposalReceived()).to.be.equals(lastProposalReceived.add(1));
    });
    it("Set normal timelock ", async () => {
      expect(await executor.proposalTimelocks(0)).to.equals(REMOTE_NORMAL_TIMELOCK);
    });

    it("Set fasttrack timelock", async () => {
      expect(await executor.proposalTimelocks(1)).to.equals(REMOTE_FASTTRACK_TIMELOCK);
    });
    it("Set critical timelock", async () => {
      expect(await executor.proposalTimelocks(2)).to.equals(REMOTE_CRITICAL_TIMELOCK);
    });
    it("Set trusted remote", async () => {
      expect(await executor.trustedRemoteLookup(10102)).to.equals(
        OMNICHAIN_PROPOSAL_SENDER + OMNICHAIN_GOVERNANCE_EXECUTOR.slice(2),
      );
    });
  });
});
