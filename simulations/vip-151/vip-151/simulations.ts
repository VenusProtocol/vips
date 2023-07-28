import { expect } from "chai";
import { ethers } from "hardhat";

import { initMainnetUser } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip151 } from "../../../vips/vip-151/vip-151";
import ACCESS_CONTROL_ABI from "./abi/accessControlmanager.json";

const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const LIQUIDATOR = "0x0870793286aada55d39ce7f82fb2766e8004cf43";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";

forking(30349950, () => {
  let accessControlManager: ethers.Contract;
  const provider = ethers.provider;
  let impersonatedLiquidator: any;

  before(async () => {
    accessControlManager = new ethers.Contract(ACM, ACCESS_CONTROL_ABI, provider);
    impersonatedLiquidator = await initMainnetUser(LIQUIDATOR, ethers.utils.parseEther("1"));
  });

  testVip("VIP-Liquidator Liquidator Update", vip151());

  describe("Post-VIP behavior", async () => {
    it("Permissions restrictLiquidation", async () => {
      expect(
        await accessControlManager
          .connect(impersonatedLiquidator)
          .isAllowedToCall(NORMAL_TIMELOCK, "restrictLiquidation(address)"),
      ).equals(true);

      expect(
        await accessControlManager
          .connect(impersonatedLiquidator)
          .isAllowedToCall(FAST_TRACK_TIMELOCK, "restrictLiquidation(address)"),
      ).equals(true);

      expect(
        await accessControlManager
          .connect(impersonatedLiquidator)
          .isAllowedToCall(CRITICAL_TIMELOCK, "restrictLiquidation(address)"),
      ).equals(true);
    });

    it("Permissions addToAllowlist", async () => {
      expect(
        await accessControlManager
          .connect(impersonatedLiquidator)
          .isAllowedToCall(NORMAL_TIMELOCK, "addToAllowlist(address,address)"),
      ).equals(true);

      expect(
        await accessControlManager
          .connect(impersonatedLiquidator)
          .isAllowedToCall(FAST_TRACK_TIMELOCK, "addToAllowlist(address,address)"),
      ).equals(true);

      expect(
        await accessControlManager
          .connect(impersonatedLiquidator)
          .isAllowedToCall(CRITICAL_TIMELOCK, "addToAllowlist(address,address)"),
      ).equals(true);
    });

    it("Permissions unrestrictLiquidation", async () => {
      expect(
        await accessControlManager
          .connect(impersonatedLiquidator)
          .isAllowedToCall(NORMAL_TIMELOCK, "unrestrictLiquidation(address)"),
      ).equals(true);
    });

    it("Permissions addToAllowlist", async () => {
      expect(
        await accessControlManager
          .connect(impersonatedLiquidator)
          .isAllowedToCall(NORMAL_TIMELOCK, "addToAllowlist(address,address)"),
      ).equals(true);
    });

    it("Permissions removeFromAllowlist", async () => {
      expect(
        await accessControlManager
          .connect(impersonatedLiquidator)
          .isAllowedToCall(NORMAL_TIMELOCK, "removeFromAllowlist(address,address)"),
      ).equals(true);
    });

    it("Permissions setTreasuryPercent(uint256)", async () => {
      expect(
        await accessControlManager
          .connect(impersonatedLiquidator)
          .isAllowedToCall(NORMAL_TIMELOCK, "setTreasuryPercent(uint256)"),
      ).equals(true);
    });

    it("Permissions pauseForceVAILiquidate()", async () => {
      expect(
        await accessControlManager
          .connect(impersonatedLiquidator)
          .isAllowedToCall(NORMAL_TIMELOCK, "pauseForceVAILiquidate()"),
      ).equals(true);

      expect(
        await accessControlManager
          .connect(impersonatedLiquidator)
          .isAllowedToCall(FAST_TRACK_TIMELOCK, "pauseForceVAILiquidate()"),
      ).equals(true);

      expect(
        await accessControlManager
          .connect(impersonatedLiquidator)
          .isAllowedToCall(CRITICAL_TIMELOCK, "pauseForceVAILiquidate()"),
      ).equals(true);
    });

    it("Permissions resumeForceVAILiquidate()", async () => {
      expect(
        await accessControlManager
          .connect(impersonatedLiquidator)
          .isAllowedToCall(NORMAL_TIMELOCK, "resumeForceVAILiquidate()"),
      ).equals(true);

      expect(
        await accessControlManager
          .connect(impersonatedLiquidator)
          .isAllowedToCall(FAST_TRACK_TIMELOCK, "resumeForceVAILiquidate()"),
      ).equals(true);

      expect(
        await accessControlManager
          .connect(impersonatedLiquidator)
          .isAllowedToCall(CRITICAL_TIMELOCK, "resumeForceVAILiquidate()"),
      ).equals(true);
    });

    it("Permissions setPendingRedeemChunkLength(uint256)", async () => {
      expect(
        await accessControlManager
          .connect(impersonatedLiquidator)
          .isAllowedToCall(NORMAL_TIMELOCK, "setPendingRedeemChunkLength(uint256)"),
      ).equals(true);
    });
  });
});
