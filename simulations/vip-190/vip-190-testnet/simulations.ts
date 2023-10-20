import { expect } from "chai";
import { ethers } from "hardhat";

import { adapterParams, expectEvents, initMainnetUser, makePayload } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip190 } from "../../../vips/vip-190/vip-190-testnet";
import AccessControlManager_ABI from "./abi/AccessControlManager.json";
import OmnichainProposalSender_ABI from "./abi/OmnichainProposalSender.json";

const OmnichainProposalSender = "0x07ac4365fb887d3c7829f0a5424bccec4a33e13a";
const OmnichainGovernanceExecutor = "0x4fed114b31b1033707eeccd8367ee6095453e0d9";
const remoteChainId = 10161;
const NormalTimelock = "0xce10739590001705F7FF231611ba4A48B2820327";

forking(34358570, async () => {
  let omnichainProposalSender: ethers.Contract;
  const provider = ethers.provider;
  let impersonatedTimelock: any;
  before(async () => {
    omnichainProposalSender = new ethers.Contract(OmnichainProposalSender, OmnichainProposalSender_ABI, provider);
    impersonatedTimelock = await initMainnetUser(NormalTimelock, ethers.utils.parseEther("1.0"));
  });
  describe("Pre-VIP behaviour", async () => {
    it("Daily limit should be 0", async () => {
      expect(await omnichainProposalSender.chainIdToMaxDailyLimit(remoteChainId)).to.equals(0);
    });
    it("Valid chain Id should not contain remote chain id", async () => {
      expect(await omnichainProposalSender.validChainIds(remoteChainId)).to.be.false;
    });
    it("Trusted remote should not be set", async () => {
      expect(await omnichainProposalSender.trustedRemoteLookup(remoteChainId)).to.be.equals("0x");
    });
  });
  testVip("VIP-190 give permissions to timelock", vip190(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [AccessControlManager_ABI, OmnichainProposalSender_ABI],
        ["PermissionGranted", "SetMaxDailyLimit", "UpdatedValidChainId", "SetTrustedRemoteAddress", "Failure"],
        [27, 1, 1, 1, 0],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Daily limit should be 100", async () => {
      expect(await omnichainProposalSender.chainIdToMaxDailyLimit(remoteChainId)).to.equals(100);
    });
    it("Valid chain Id should not contain remote chain id", async () => {
      expect(await omnichainProposalSender.validChainIds(remoteChainId)).to.be.true;
    });
    it("Trusted remote should not be set", async () => {
      expect(await omnichainProposalSender.trustedRemoteLookup(remoteChainId)).to.be.equals(
        `${OmnichainGovernanceExecutor}${OmnichainProposalSender.slice(2)}`,
      );
    });
    it("Emit ExecuteRemoteProposal event", async () => {
      expect(
        await omnichainProposalSender
          .connect(impersonatedTimelock)
          .execute(
            remoteChainId,
            makePayload([NormalTimelock], [1], ["setDelay(uint256)"], ["0x"], 1, 0),
            adapterParams(1, 500000),
          ),
      ).to.emit(omnichainProposalSender, "ExecuteRemoteProposal");
    });
    it("Reverts when same proposal come twice ", async () => {
      await expect(
        omnichainProposalSender
          .connect(impersonatedTimelock)
          .execute(
            remoteChainId,
            makePayload([NormalTimelock], [1], ["setDelay(uint256)"], ["0x"], 1, 0),
            adapterParams(1, 500000),
          ),
      ).to.be.revertedWith("OmnichainProposalSender: Invalid proposal");
    });
    it("Reverts when same proposal come twice ", async () => {
      await omnichainProposalSender.connect(impersonatedTimelock).setMaxDailyLimit(remoteChainId, 0);
      await expect(
        omnichainProposalSender
          .connect(impersonatedTimelock)
          .execute(
            remoteChainId,
            makePayload([NormalTimelock], [1], ["setDelay(uint256)"], ["0x"], 2, 0),
            adapterParams(1, 500000),
          ),
      ).to.be.revertedWith("Daily Transaction Limit Exceeded");
    });
    it("Reverts when not chainId is not valid ", async () => {
      await omnichainProposalSender.connect(impersonatedTimelock).updateValidChainId(10161, false);
      await expect(
        omnichainProposalSender
          .connect(impersonatedTimelock)
          .execute(
            remoteChainId,
            makePayload([NormalTimelock], [1], ["setDelay(uint256)"], ["0x"], 2, 0),
            adapterParams(1, 500000),
          ),
      ).to.be.revertedWith("OmnichainProposalSender: Invalid chainId");
    });
  });
});
