import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents, initMainnetUser, setMaxStaleCoreAssets } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vip258 } from "../../vips/vip-258/bscmainnet";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import VBEP20_ABI from "./abi/VBep20Abi.json";
import ACCESS_CONTROL_ABI from "./abi/accessControlmanager.json";
import CHAINLINK_ABI from "./abi/chainlinkOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import LIQUIDATOR_ABI from "./abi/liquidatorAbi.json";
import VAI_CONTROLLER_ABI from "./abi/vaiControllerAbi.json";

const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const LIQUIDATOR = "0x0870793286aada55d39ce7f82fb2766e8004cf43";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const VENUS_GUARDIAN = "0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B";

forking(35928235, async () => {
  let accessControlManager: Contract;
  let liquidator: Contract;
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

  testVip("VIP-Liquidator Update", await vip258(createInitializeData()), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [ACCESS_CONTROL_ABI, LIQUIDATOR_ABI],
        ["RoleGranted", "NewPendingRedeemChunkLength"],
        [27, 1],
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

      expect(
        await accessControlManager
          .connect(impersonatedLiquidator)
          .isAllowedToCall(VENUS_GUARDIAN, "restrictLiquidation(address)"),
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

      expect(
        await accessControlManager
          .connect(impersonatedLiquidator)
          .isAllowedToCall(VENUS_GUARDIAN, "addToAllowlist(address,address)"),
      ).equals(true);
    });

    it("Permissions unrestrictLiquidation", async () => {
      expect(
        await accessControlManager
          .connect(impersonatedLiquidator)
          .isAllowedToCall(NORMAL_TIMELOCK, "unrestrictLiquidation(address)"),
      ).equals(true);

      expect(
        await accessControlManager
          .connect(impersonatedLiquidator)
          .isAllowedToCall(FAST_TRACK_TIMELOCK, "unrestrictLiquidation(address)"),
      ).equals(true);

      expect(
        await accessControlManager
          .connect(impersonatedLiquidator)
          .isAllowedToCall(CRITICAL_TIMELOCK, "unrestrictLiquidation(address)"),
      ).equals(true);

      expect(
        await accessControlManager
          .connect(impersonatedLiquidator)
          .isAllowedToCall(VENUS_GUARDIAN, "unrestrictLiquidation(address)"),
      ).equals(true);
    });

    it("Permissions removeFromAllowlist", async () => {
      expect(
        await accessControlManager
          .connect(impersonatedLiquidator)
          .isAllowedToCall(NORMAL_TIMELOCK, "removeFromAllowlist(address,address)"),
      ).equals(true);

      expect(
        await accessControlManager
          .connect(impersonatedLiquidator)
          .isAllowedToCall(FAST_TRACK_TIMELOCK, "removeFromAllowlist(address,address)"),
      ).equals(true);

      expect(
        await accessControlManager
          .connect(impersonatedLiquidator)
          .isAllowedToCall(CRITICAL_TIMELOCK, "removeFromAllowlist(address,address)"),
      ).equals(true);

      expect(
        await accessControlManager
          .connect(impersonatedLiquidator)
          .isAllowedToCall(VENUS_GUARDIAN, "removeFromAllowlist(address,address)"),
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

      expect(
        await accessControlManager
          .connect(impersonatedLiquidator)
          .isAllowedToCall(VENUS_GUARDIAN, "pauseForceVAILiquidate()"),
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

      expect(
        await accessControlManager
          .connect(impersonatedLiquidator)
          .isAllowedToCall(VENUS_GUARDIAN, "resumeForceVAILiquidate()"),
      ).equals(true);
    });

    it("Permissions setPendingRedeemChunkLength(uint256)", async () => {
      expect(
        await accessControlManager
          .connect(impersonatedLiquidator)
          .isAllowedToCall(NORMAL_TIMELOCK, "setPendingRedeemChunkLength(uint256)"),
      ).equals(true);
    });

    it("Address Checks", async () => {
      expect(await liquidator.protocolShareReserve()).equals(TREASURY);
      expect(await liquidator.accessControlManager()).equals(ACM);
      expect(await liquidator.treasuryPercentMantissa()).equals(parseUnits("5", 16));
    });
  });

  describe("Reduce Reserves and Force VAI Debt Tests", async () => {
    let tusd: Contract;
    let liquidatorSigner: SignerWithAddress;
    let usdtHolderSigner: SignerWithAddress;
    let oracle: Contract;
    let impersonatedTimelock: any;
    let comptroller: Contract;
    let btc: Contract;
    let vaiController: Contract;
    let vai: Contract;
    let usdt: Contract;
    let vtusd: Contract;

    const USER = "0x8E3c1fe7c4B890e2Aa96A3F6a5813E6de8e12Fe9";
    const LIQUIDATOR_USER = "0xf977814e90da44bfa03b6295a0616a897441acec";
    const VTUSD = "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3";
    const TUSD = "0x14016E85a25aeb13065688cAFB43044C2ef86784";
    const BTC = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
    const VBTC = "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B";
    const CHAINLINK = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
    const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
    const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
    const VBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
    const BNB = "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB";
    const VAI_CONTROLLER = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE";
    const VAI = "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7";
    const VAI_HOLDER = "0xce74a760b754f7717e7a62e389d4b153aa753e0e";
    const USDT = "0x55d398326f99059fF775485246999027B3197955";
    const USER2 = "0x046cde42affac795ac0fe892750f0d956dd033f7";
    const USDT_HOLDER = "0x4B16c5dE96EB2117bBE5fd171E4d203624B014aa";
    const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";

    before(async () => {
      impersonatedTimelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("2"));
      liquidatorSigner = await initMainnetUser(LIQUIDATOR_USER, ethers.utils.parseEther("2"));
      usdtHolderSigner = await initMainnetUser(USDT_HOLDER, ethers.utils.parseEther("2"));
      oracle = new ethers.Contract(CHAINLINK, CHAINLINK_ABI, provider);
      comptroller = new ethers.Contract(UNITROLLER, COMPTROLLER_ABI, provider);
      tusd = new ethers.Contract(TUSD, IERC20_ABI, provider);
      vtusd = new ethers.Contract(VTUSD, VBEP20_ABI, provider);
      btc = new ethers.Contract(BTC, IERC20_ABI, provider);
      usdt = new ethers.Contract(USDT, IERC20_ABI, provider);
      vaiController = new ethers.Contract(VAI_CONTROLLER, VAI_CONTROLLER_ABI, provider);
      vai = new ethers.Contract(VAI, IERC20_ABI, provider);
      await setMaxStaleCoreAssets(CHAINLINK, NORMAL_TIMELOCK);
      await liquidator.connect(impersonatedTimelock).resumeForceVAILiquidate();
      await liquidator.connect(impersonatedTimelock).setMinLiquidatableVAI(parseUnits("100", 18));
    });

    it("Tusd Liquidation and reduce liquidation reserves", async () => {
      // Reserves reduced to treasury as redeem action is active
      const tusdHolder = "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3";
      const tusdHolderSigner = await initMainnetUser(tusdHolder, ethers.utils.parseEther("2"));
      const protocolBalBefore = await btc.balanceOf(TREASURY);
      await oracle.connect(impersonatedTimelock).setDirectPrice(BTC, 1000000);
      await tusd.connect(tusdHolderSigner).approve(liquidator.address, "100");
      await liquidator.connect(tusdHolderSigner).liquidateBorrow(VTUSD, USER, "100", VBTC);
      const protocolBalAfter = await btc.balanceOf(TREASURY);
      expect(protocolBalAfter).greaterThan(protocolBalBefore);
    });

    it("Tusd Liquidation and reduce reserves fails; action paused", async () => {
      // Reserves will not reduce to treasury as redeem action is paused
      await comptroller.connect(impersonatedTimelock)._setActionsPaused([VBTC], [1], true);
      const tusdHolder = "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3";
      const tusdHolderSigner = await initMainnetUser(tusdHolder, ethers.utils.parseEther("2"));
      const protocolBalBefore = await btc.balanceOf(TREASURY);
      await oracle.connect(impersonatedTimelock).setDirectPrice(BTC, 1000000);
      await tusd.connect(tusdHolderSigner).approve(liquidator.address, "100");
      await liquidator.connect(tusdHolderSigner).liquidateBorrow(VTUSD, USER, "100", VBTC);
      const protocolBalAfter = await btc.balanceOf(TREASURY);
      // As redeem was paused
      expect(protocolBalAfter).equals(protocolBalBefore);
      expect(await liquidator.pendingRedeem(0)).equals(VBTC);
    });

    it("Usdt Liquidation and reduce reserves fails not enough liquidity", async () => {
      const protocolBalBefore = await tusd.balanceOf(TREASURY);
      const liquidatorBalanceBefore = await vtusd.balanceOf(USDT_HOLDER);
      const protocolVTokenBalBefore = await vtusd.balanceOf(LIQUIDATOR);

      // Setting fake price and incentives to redeem more then available liquidity
      await oracle.connect(impersonatedTimelock).setDirectPrice(TUSD, parseUnits("1"));
      await oracle.connect(impersonatedTimelock).setDirectPrice(USDT, parseUnits("1", 28));
      await comptroller.connect(impersonatedTimelock)._setLiquidationIncentive(parseUnits("1", 19));
      await liquidator.connect(impersonatedTimelock).setTreasuryPercent(parseUnits("9", 18));

      await usdt.connect(usdtHolderSigner).approve(liquidator.address, "10000000000");
      await liquidator.connect(usdtHolderSigner).liquidateBorrow(VUSDT, USER2, "10000000000", VTUSD);

      const protocolBalAfter = await tusd.balanceOf(TREASURY);
      const liquidatorBalanceAfter = await vtusd.balanceOf(USDT_HOLDER);
      const protocolVTokenBalAfter = await vtusd.balanceOf(LIQUIDATOR);

      expect(liquidatorBalanceAfter).greaterThan(liquidatorBalanceBefore);
      // Due to redeem fails liquidator VToken balance should Increase
      expect(protocolVTokenBalAfter).greaterThan(protocolVTokenBalBefore);
      // As not enough liquidity
      expect(protocolBalAfter).equals(protocolBalBefore);
      expect(await liquidator.pendingRedeem(1)).equals(VTUSD);

      // reverting back for further test cases
      await comptroller.connect(impersonatedTimelock)._setLiquidationIncentive(parseUnits("1.1", 18));
      await liquidator.connect(impersonatedTimelock).setTreasuryPercent(parseUnits("5", 16));
    });

    it("Should not able to liquidate any token when VAI debt is greater than minLiquidatableVAI", async () => {
      const borowedToken = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8"; // VUSDC
      const borrower = "0x016699fb47d0816d71ebed2f24473d57c762af51";
      await expect(
        liquidator.connect(liquidatorSigner).liquidateBorrow(borowedToken, borrower, 10000, VUSDC),
      ).to.be.revertedWithCustomError(liquidator, "VAIDebtTooHigh");
    });

    it("Should be able to liquidate any token when VAI debt is less than minLiquidatableVAI", async () => {
      const borrower = "0x6B7a803BB85C7D1F67470C50358d11902d3169e0";
      await expect(
        liquidator.connect(liquidatorSigner).liquidateBorrow(VBNB, borrower, 1000, VBNB, { value: 1000 }),
      ).to.be.emit(liquidator, "LiquidateBorrowedTokens");
    });

    it("Should able to liquidate VAI if debt > minLiquidatableVAI", async () => {
      const borrower = "0x016699fb47d0816d71ebed2f24473d57c762af51";
      const vaiHolder = await initMainnetUser(VAI_HOLDER, ethers.utils.parseEther("2"));
      await vai.connect(vaiHolder).approve(LIQUIDATOR, parseUnits("60", 18));

      // Manipulate price to decrease liquidity and introduce shortfall
      await oracle.connect(impersonatedTimelock).setDirectPrice(BNB, 1);

      const minLiquidatableVAI = await liquidator.minLiquidatableVAI();
      const vaiDebt = await vaiController.getVAIRepayAmount(borrower);
      expect(vaiDebt).to.greaterThan(minLiquidatableVAI);
      await expect(liquidator.connect(vaiHolder).liquidateBorrow(VAI_CONTROLLER, borrower, 100, VBNB)).to.be.emit(
        liquidator,
        "LiquidateBorrowedTokens",
      );
    });
  });
});
