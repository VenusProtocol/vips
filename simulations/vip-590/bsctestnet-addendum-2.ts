import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriod } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  COMPTROLLER,
  LT,
  NEW_CF,
  VETH_CORE,
  VWBNB_CORE,
  vip590TestnetAddendum2,
} from "../../vips/vip-590/bsctestnet-addendum-2";
import ERC20_ABI from "./abi/ERC20.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const Action = {
  MINT: 0,
  BORROW: 2,
};

const ETH = "0x98f7A83361F7Ac8765CcEBAB1425da6b341958a7";
const WBNB = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";

forking(84038082, async () => {
  let comptroller: Contract;
  let resilientOracle: Contract;
  let eth: Contract;
  let wbnb: Contract;

  before(async () => {
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER);
    resilientOracle = await ethers.getContractAt(
      RESILIENT_ORACLE_ABI,
      NETWORK_ADDRESSES["bsctestnet"].RESILIENT_ORACLE,
    );

    eth = await ethers.getContractAt(ERC20_ABI, ETH);
    wbnb = await ethers.getContractAt(ERC20_ABI, WBNB);

    await setMaxStalePeriod(
      resilientOracle,
      eth,
      7 * 24 * 60 * 60, // 7 days in seconds
    );

    await setMaxStalePeriod(
      resilientOracle,
      wbnb,
      7 * 24 * 60 * 60, // 7 days in seconds
    );
  });

  describe("Pre-VIP behavior", () => {
    it("vETH_Core mint should not be paused", async () => {
      const paused = await comptroller.actionPaused(VETH_CORE, Action.MINT);
      expect(paused).to.equal(false);
    });

    it("vWBNB_Core mint should be paused", async () => {
      const paused = await comptroller.actionPaused(VWBNB_CORE, Action.MINT);
      expect(paused).to.equal(true);
    });

    it("vETH_Core borrow should be paused", async () => {
      const paused = await comptroller.actionPaused(VETH_CORE, Action.BORROW);
      expect(paused).to.equal(true);
    });

    it("vWBNB_Core borrow should not be paused", async () => {
      const paused = await comptroller.actionPaused(VWBNB_CORE, Action.BORROW);
      expect(paused).to.equal(false);
    });

    it("vETH_Core should have collateral factor of 0", async () => {
      const market = await comptroller.markets(VETH_CORE);
      expect(market.collateralFactorMantissa).to.equal(0);
      expect(market.liquidationThresholdMantissa).to.equal(LT);
    });

    it("vWBNB_Core should have collateral factor of 0", async () => {
      const market = await comptroller.markets(VWBNB_CORE);
      expect(market.collateralFactorMantissa).to.equal(0);
      expect(market.liquidationThresholdMantissa).to.equal(LT);
    });
  });

  testVip("VIP-590 Addendum 2: Unpause Mint and Update CF", await vip590TestnetAddendum2(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["ActionPausedMarket", "NewCollateralFactor"], [8, 2]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("vETH_Core mint should be unpaused", async () => {
      const paused = await comptroller.actionPaused(VETH_CORE, Action.MINT);
      expect(paused).to.equal(false);
    });

    it("vWBNB_Core mint should be unpaused", async () => {
      const paused = await comptroller.actionPaused(VWBNB_CORE, Action.MINT);
      expect(paused).to.equal(false);
    });

    it("vETH_Core borrow should be unpaused", async () => {
      const paused = await comptroller.actionPaused(VETH_CORE, Action.BORROW);
      expect(paused).to.equal(false);
    });

    it("vWBNB_Core borrow should be unpaused", async () => {
      const paused = await comptroller.actionPaused(VWBNB_CORE, Action.BORROW);
      expect(paused).to.equal(false);
    });

    it("vETH_Core should have new collateral factor", async () => {
      const market = await comptroller.markets(VETH_CORE);
      expect(market.collateralFactorMantissa).to.equal(NEW_CF);
      expect(market.liquidationThresholdMantissa).to.equal(LT);
    });

    it("vWBNB_Core should have new collateral factor", async () => {
      const market = await comptroller.markets(VWBNB_CORE);
      expect(market.collateralFactorMantissa).to.equal(NEW_CF);
      expect(market.liquidationThresholdMantissa).to.equal(LT);
    });
  });
});
