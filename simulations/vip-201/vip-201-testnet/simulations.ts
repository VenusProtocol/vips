import { expect } from "chai";
import { ethers } from "hardhat";

import { adapterParams, expectEvents, initMainnetUser, makePayload } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip201Testnet } from "../../../vips/vip-201/vip-201-testnet";
import AccessControlManager_ABI from "./abi/AccessControlManager.json";
import OmnichainProposalSender_ABI from "./abi/OmnichainProposalSender.json";

const OmnichainProposalSender = "0xa11d68cde7bb1add75af209580e99b2e0566cb74";
const OmnichainGovernanceExecutor = "0xbaaddb276acc9d1b5e1b09254b45cb0ccdddf748";
const remoteChainId = 10161;
const NormalTimelock = "0xce10739590001705F7FF231611ba4A48B2820327";

forking(35311999, async () => {
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
  testVip("vip201Testnet give permissions to timelock", vip201Testnet(), {
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
    it("Valid chain Id should contain remote chain id", async () => {
      expect(await omnichainProposalSender.validChainIds(remoteChainId)).to.be.true;
    });
    it("Trusted remote should be set", async () => {
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
            makePayload([NormalTimelock], [1], ["setDelay(uint256)"], ["0x"], 0),
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
            makePayload([NormalTimelock], [1], ["setDelay(uint256)"], ["0x"], 0),
            adapterParams(1, 500000),
          ),
      ).to.be.revertedWith("OmnichainProposalSender: Multiple bridging in a proposal");
    });
    it("Reverts when chainId is not valid ", async () => {
      await omnichainProposalSender.connect(impersonatedTimelock).updateValidChainId(10161, false);
      await expect(
        omnichainProposalSender
          .connect(impersonatedTimelock)
          .execute(
            remoteChainId,
            makePayload([NormalTimelock], [1], ["setDelay(uint256)"], ["0x"], 0),
            adapterParams(1, 500000),
          ),
      ).to.be.revertedWith("OmnichainProposalSender: Invalid chainId");
    });
  });
});
