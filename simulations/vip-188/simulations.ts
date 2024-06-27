import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vip188 } from "../../vips/vip-188";
import ACM_ABI from "./abi/IAccessControlManager_ABI.json";
import XVS_VAULT_ABI from "./abi/xvsVault.json";

const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
const XVS_VAULT_PROXY = "0x051100480289e704d20e9DB4804837068f3f9204";
const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";

forking(32715679, async () => {
  const provider = ethers.provider;
  let xvsVault: Contract;
  let xvsVaultSigner: Signer;
  let accessControlManager: Contract;

  before(async () => {
    xvsVault = new ethers.Contract(XVS_VAULT_PROXY, XVS_VAULT_ABI, provider);
    xvsVaultSigner = await initMainnetUser(XVS_VAULT_PROXY, ethers.utils.parseEther("1"));
    accessControlManager = new ethers.Contract(ACM, ACM_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("has reward amount set to 1780 XVS/day", async () => {
      const rewardAmount = await xvsVault.rewardTokenAmountsPerBlock(XVS);
      expect(rewardAmount).to.equal("61805555555555555"); // 1780 XVS per day
    });
  });

  testVip("VIP-188", await vip188(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [XVS_VAULT_ABI], ["RewardAmountUpdated"], [1]);
      await expectEvents(txResponse, [ACM_ABI], ["RoleGranted"], [2]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("should have updated the reward amount to 1440 XVS/day", async () => {
      const rewardAmount = await xvsVault.rewardTokenAmountsPerBlock(XVS);
      const blocksPerDay = ethers.BigNumber.from("28800");
      const expectedXvsPerDay = ethers.utils.parseUnits("1440", 18);
      const expectedXvsPerBlock = expectedXvsPerDay.div(blocksPerDay);
      expect(rewardAmount).to.equal(expectedXvsPerBlock); // 1440 XVS per day
    });

    it("XVS VAULT Permissions", async () => {
      expect(
        await accessControlManager
          .connect(xvsVaultSigner)
          .isAllowedToCall(CRITICAL_TIMELOCK, "setRewardAmountPerBlock(address,uint256)"),
      ).equals(true);
      expect(
        await accessControlManager
          .connect(xvsVaultSigner)
          .isAllowedToCall(FAST_TRACK_TIMELOCK, "setRewardAmountPerBlock(address,uint256)"),
      ).equals(true);
    });
  });
});
