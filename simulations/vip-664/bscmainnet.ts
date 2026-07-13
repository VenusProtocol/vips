import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip664, { BORROW, DAI, DEVIATION_SENTINEL, EBRAKE, vDAI } from "../../vips/vip-664/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import DEVIATION_SENTINEL_ABI from "./abi/DeviationSentinel.json";
import EBRAKE_ABI from "./abi/EBrake.json";
import ERC20_ABI from "./abi/ERC20.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import VTOKEN_ABI from "./abi/VToken.json";

const { bscmainnet } = NETWORK_ADDRESSES;

// A trusted keeper on the DeviationSentinel (verified on-chain) — used to call handleDeviation.
const GUARDIAN = "0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B";

// Collateral asset used to prove borrowing DAI works again (vUSDT has a non-zero collateral factor).
const USDT = "0x55d398326f99059ff775485246999027b3197955";
const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const USDT_WHALE = "0xF977814e90dA44bFA03b6295A0616a897441aceC";

// Core Pool id for the CF snapshot read on EBrake.
const CORE_POOL_ID = 0;

// Block shortly before the proposal — vDAI borrowing is paused, the sentinel still monitors DAI,
// and the EBrake snapshots for vDAI are empty (the weekend incident only paused borrowing).
const FORK_BLOCK = 109660000;

forking(FORK_BLOCK, async () => {
  const comptroller = new ethers.Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, ethers.provider);
  const deviationSentinel = new ethers.Contract(DEVIATION_SENTINEL, DEVIATION_SENTINEL_ABI, ethers.provider);
  const ebrake = new ethers.Contract(EBRAKE, EBRAKE_ABI, ethers.provider);
  const resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);

  // DAI and USDT prices captured at the fork block (before the governance lifecycle warps time and
  // makes the RedStone pivot feed stale) so the behavioral borrow can pin them via the Chainlink feed.
  let daiPrice: BigNumber;
  let usdtPrice: BigNumber;

  before(async () => {
    daiPrice = await resilientOracle.getPrice(DAI);
    usdtPrice = await resilientOracle.getPrice(USDT);
  });

  // Repoint an asset to the Chainlink feed as the sole ResilientOracle source and pin an exact price.
  const pinPriceViaChainlink = async (asset: string, price: BigNumber) => {
    const timelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("10"));
    await resilientOracle.connect(timelock).setTokenConfig({
      asset,
      oracles: [bscmainnet.CHAINLINK_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
      enableFlagsForOracles: [true, false, false],
      cachingEnabled: false,
    });
    const chainlinkOracle = new ethers.Contract(
      bscmainnet.CHAINLINK_ORACLE,
      ["function setDirectPrice(address,uint256)"],
      timelock,
    );
    await chainlinkOracle.setDirectPrice(asset, price);
  };

  describe("Pre-VIP behavior", () => {
    it("borrowing is paused on the vDAI market", async () => {
      expect(await comptroller.actionPaused(vDAI, BORROW)).to.equal(true);
    });

    it("vDAI collateral factor is 0", async () => {
      const market = await comptroller.markets(vDAI);
      expect(market.collateralFactorMantissa).to.equal(0);
    });

    it("DeviationSentinel monitors DAI (enabled, deviation 10%)", async () => {
      const config = await deviationSentinel.tokenConfigs(DAI);
      expect(config.enabled).to.equal(true);
      expect(config.deviation).to.equal(10);
    });

    it("EBrake holds no collateral-factor snapshot for vDAI", async () => {
      const [cf, lt] = await ebrake.getMarketCFSnapshot(vDAI, CORE_POOL_ID);
      expect(cf).to.equal(0);
      expect(lt).to.equal(0);
    });

    it("EBrake holds no cap snapshots for vDAI", async () => {
      const state = await ebrake.marketStates(vDAI);
      expect(state.borrowCapSnapshotted).to.equal(false);
      expect(state.supplyCapSnapshotted).to.equal(false);
    });
  });

  testVip("VIP-664", await vip664(), {
    callbackAfterExecution: async txResponse => {
      // Monitoring toggled off for DAI on the DeviationSentinel.
      await expectEvents(txResponse, [DEVIATION_SENTINEL_ABI], ["TokenMonitoringStatusChanged"], [1]);
      // Borrow action unpaused on the Core Pool Comptroller for vDAI.
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["ActionPausedMarket"], [1]);
      // Three EBrake snapshots reset for vDAI.
      await expectEvents(
        txResponse,
        [EBRAKE_ABI],
        ["CFSnapshotReset", "BorrowCapSnapshotReset", "SupplyCapSnapshotReset"],
        [1, 1, 1],
      );
    },
  });

  describe("Post-VIP behavior", () => {
    it("borrowing is resumed on the vDAI market", async () => {
      expect(await comptroller.actionPaused(vDAI, BORROW)).to.equal(false);
    });

    it("vDAI collateral factor is unchanged (0)", async () => {
      const market = await comptroller.markets(vDAI);
      expect(market.collateralFactorMantissa).to.equal(0);
    });

    it("DeviationSentinel no longer monitors DAI (deviation config preserved)", async () => {
      const config = await deviationSentinel.tokenConfigs(DAI);
      expect(config.enabled).to.equal(false);
      expect(config.deviation).to.equal(10);
    });

    it("EBrake snapshots for vDAI remain empty", async () => {
      const [cf, lt] = await ebrake.getMarketCFSnapshot(vDAI, CORE_POOL_ID);
      expect(cf).to.equal(0);
      expect(lt).to.equal(0);
      const state = await ebrake.marketStates(vDAI);
      expect(state.borrowCapSnapshotted).to.equal(false);
      expect(state.supplyCapSnapshotted).to.equal(false);
    });
  });

  describe("Post-VIP behavioral proof", () => {
    it("a user with collateral can borrow DAI, and the sentinel can no longer act on vDAI", async () => {
      const dai = new ethers.Contract(DAI, ERC20_ABI, ethers.provider);
      const usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);
      const vUsdt = new ethers.Contract(vUSDT, VTOKEN_ABI, ethers.provider);
      const vDai = new ethers.Contract(vDAI, VTOKEN_ABI, ethers.provider);

      // The mined governance lifecycle advances time, staling DAI/USDT's RedStone pivot feed (its
      // internal guard cannot be widened). Repoint both to the Chainlink feed as the single source and
      // pin the price captured at the fork block, so the borrow path prices don't revert.
      await pinPriceViaChainlink(DAI, daiPrice);
      await pinPriceViaChainlink(USDT, usdtPrice);

      const user = await initMainnetUser("0x000000000000000000000000000000000000dEaD", ethers.utils.parseEther("10"));
      const whale = await initMainnetUser(USDT_WHALE, ethers.utils.parseEther("10"));

      // Fund the user with USDT collateral and supply it.
      const collateral = parseUnits("1000", 18);
      await usdt.connect(whale).transfer(user.address, collateral);
      await usdt.connect(user).approve(vUSDT, collateral);
      await vUsdt.connect(user).mint(collateral);
      await comptroller.connect(user).enterMarkets([vUSDT]);

      // Borrow a small amount of DAI — previously reverted on the borrow-paused guard.
      const borrowAmount = parseUnits("100", 18);
      const daiBefore = await dai.balanceOf(user.address);
      await expect(vDai.connect(user).borrow(borrowAmount)).to.not.be.reverted;
      expect(await dai.balanceOf(user.address)).to.equal(daiBefore.add(borrowAmount));
      expect(await vDai.callStatic.borrowBalanceCurrent(user.address)).to.be.gte(borrowAmount);

      // With monitoring disabled, a trusted keeper can no longer act on the vDAI market.
      const keeper = await initMainnetUser(GUARDIAN, ethers.utils.parseEther("10"));
      await expect(deviationSentinel.connect(keeper).handleDeviation(vDAI)).to.be.revertedWithCustomError(
        deviationSentinel,
        "TokenMonitoringDisabled",
      );
    });
  });
});
