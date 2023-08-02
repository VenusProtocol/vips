import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip151 } from "../../../vips/vip-151/vip-151";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import ACCESS_CONTROL_ABI from "./abi/accessControlmanager.json";
import CHAINLINK_ABI from "./abi/chainlinkOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import LIQUIDATOR_ABI from "./abi/liquidatorAbi.json";

const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const LIQUIDATOR = "0x0870793286aada55d39ce7f82fb2766e8004cf43";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";

forking(30488755, () => {
  let accessControlManager: ethers.Contract;
  let liquidator: ethers.Contract;
  const provider = ethers.provider;
  let impersonatedLiquidator: any;

  function createInitializeData() {
    const iface = new ethers.utils.Interface(LIQUIDATOR_ABI);
    return iface.encodeFunctionData("initialize", [parseUnits("5", 16), ACM, TREASURY]);
  }

  before(async () => {
    accessControlManager = new ethers.Contract(ACM, ACCESS_CONTROL_ABI, provider);
    impersonatedLiquidator = await initMainnetUser(LIQUIDATOR, ethers.utils.parseEther("1"));
    liquidator = new ethers.Contract(LIQUIDATOR, LIQUIDATOR_ABI, provider);
  });

  testVip("VIP-Liquidator Liquidator Update", vip151(createInitializeData()), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [ACCESS_CONTROL_ABI, LIQUIDATOR_ABI],
        ["PermissionGranted", "NewPendingRedeemChunkLength", "ForceVAILiquidationResumed"],
        [17, 1, 1],
      );
    },
  });

  describe("Checks", async () => {
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

    it("Address Checks", async () => {
      expect(await liquidator.protocolShareReserve()).equals(TREASURY);
      expect(await liquidator.accessControlManager()).equals(ACM);
      expect(await liquidator.treasuryPercentMantissa()).equals(parseUnits("5", 16));
    });
  });

  describe("Liquidations of TUSD", async () => {
    let tusd: ethers.Contract;
    let liquidatorSigner: SignerWithAddress;
    let oracle: ethers.Contract;
    let impersonatedTimelock: any;
    let comptroller: ethers.Contract;
    let usdc: ethers.Contract;

    const USER = "0xbdc8f6ad3a729d8c1abe908939668ce3f92886a0";
    const LIQUIDATOR_USER = "0xf977814e90da44bfa03b6295a0616a897441acec";
    const VTUSD = "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3";
    const TUSD = "0x14016E85a25aeb13065688cAFB43044C2ef86784";
    const BTCB = "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c";
    const CHAINLINK = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
    const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
    const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
    const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";

    before(async () => {
      impersonatedTimelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("2"));
      liquidatorSigner = await initMainnetUser(LIQUIDATOR_USER, ethers.utils.parseEther("2"));
      oracle = new ethers.Contract(CHAINLINK, CHAINLINK_ABI, provider);
      comptroller = new ethers.Contract(UNITROLLER, COMPTROLLER_ABI, provider);
      tusd = new ethers.Contract(TUSD, IERC20_ABI, provider);
      usdc = new ethers.Contract(USDC, IERC20_ABI, provider);
    });

    it("Tusd Liquidation and reduce liquidation reserves", async () => {
      // Reserves reduced to treasury as redeem action is ative
      const protocolBalBefore = await usdc.balanceOf(TREASURY);
      await oracle.connect(impersonatedTimelock).setDirectPrice(BTCB, parseUnits("1", 5));
      await tusd.connect(liquidatorSigner).approve(liquidator.address, "6156967120");
      await liquidator.connect(liquidatorSigner).liquidateBorrow(VTUSD, USER, "6156967120", VUSDC);
      const protocolBalAfter = await usdc.balanceOf(TREASURY);
      expect(protocolBalAfter).greaterThan(protocolBalBefore);
    });

    it("Tusd Liquidation and reduce reserves fails; action paused", async () => {
      // Reserves reduced to treasury as redeem action is ative
      await comptroller.connect(impersonatedTimelock)._setActionsPaused([VUSDC], [1], true);
      const protocolBalBefore = await usdc.balanceOf(TREASURY);
      await oracle.connect(impersonatedTimelock).setDirectPrice(BTCB, parseUnits("1", 5));
      await tusd.connect(liquidatorSigner).approve(liquidator.address, "6156967120");
      await liquidator.connect(liquidatorSigner).liquidateBorrow(VTUSD, USER, "6156967120", VUSDC);
      const protocolBalAfter = await usdc.balanceOf(TREASURY);
      // As redeem was paused
      expect(protocolBalAfter).equals(protocolBalBefore);
      expect(await liquidator.pendingRedeem(0)).equals(VUSDC);
    });
  });
});
