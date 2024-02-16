import { expect } from "chai";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip258Testnet } from "../../vips/vip-258/bsctestnet";
import ACCESS_CONTROL_ABI from "./abi/accessControlmanager.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import LIQUIDATOR_ABI from "./abi/liquidatorAbi.json";

const LIQUIDATOR = "0x55AEABa76ecf144031Ef64E222166eb28Cb4865F";
const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const FAST_TRACK_TIMELOCK = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";
const CRITICAL_TIMELOCK = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";
const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";

forking(31942719, () => {
  let accessControlManager: ethers.Contract;
  let comptroller: ethers.Contract;
  let liquidator: ethers.Contract;
  const provider = ethers.provider;
  let impersonatedLiquidator: any;

  before(async () => {
    accessControlManager = new ethers.Contract(ACM, ACCESS_CONTROL_ABI, provider);
    impersonatedLiquidator = await initMainnetUser(LIQUIDATOR, ethers.utils.parseEther("1"));
    liquidator = new ethers.Contract(LIQUIDATOR, LIQUIDATOR_ABI, provider);
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
  });

  testVip("VIP-Liquidator Liquidator Update", vip258Testnet(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [ACCESS_CONTROL_ABI, LIQUIDATOR_ABI, COMPTROLLER_ABI],
        [
          "PermissionGranted",
          "OwnershipTransferred",
          "NewPendingRedeemChunkLength",
          "ForceVAILiquidationResumed",
          "NewLiquidatorContract",
        ],
        [17, 1, 1, 1, 1],
      );
    },
  });

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

    it("Should set forceVAILiquidate = true", async () => {
      expect(await liquidator.forceVAILiquidate()).equals(true);
    });

    it("Should set liquidator contract", async () => {
      expect(await comptroller.liquidatorContract()).equals(LIQUIDATOR);
    });
  });
});
