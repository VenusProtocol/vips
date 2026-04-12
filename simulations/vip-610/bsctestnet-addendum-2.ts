import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriod } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  CF,
  COMPTROLLER,
  EBRAKE,
  LT,
  VETH_CORE,
  vip661TestnetAddendum2,
} from "../../vips/vip-610/bsctestnet-addendum-2";
import EBRAKE_ABI from "./abi/EBrake.json";
import ERC20_ABI from "./abi/ERC20.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const Action = {
  MINT: 0,
};

const ETH = "0x98f7A83361F7Ac8765CcEBAB1425da6b341958a7";

// Fork from block 100233050 — after VIP-661 Addendum 1 was executed on BSC Testnet and all
// guardian(keeper)/timelock permissions were established. A Tenderly web action subsequently re-triggered
// the DeviationSentinel, causing EBrake to zero vETH_Core's CF and pause MINT again. This
// simulation validates that addendum-2 (the three minimal recovery actions) fully restores
// the market from that second incident.
forking(100233050, async () => {
  let comptroller: Contract;
  let eBrake: Contract;
  let resilientOracle: Contract;
  let eth: Contract;

  before(async () => {
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER);
    eBrake = await ethers.getContractAt(EBRAKE_ABI, EBRAKE);
    resilientOracle = await ethers.getContractAt(
      RESILIENT_ORACLE_ABI,
      NETWORK_ADDRESSES["bsctestnet"].RESILIENT_ORACLE,
    );
    eth = await ethers.getContractAt(ERC20_ABI, ETH);

    await setMaxStalePeriod(resilientOracle, eth, 7 * 24 * 60 * 60);
  });

  describe("Pre-VIP behavior", () => {
    it("vETH_Core should have collateral factor of 0 (tightened by EBrake)", async () => {
      const market = await comptroller.markets(VETH_CORE);
      expect(market.collateralFactorMantissa).to.equal(0);
    });

    it("vETH_Core mint should be paused (tightened by EBrake)", async () => {
      const paused = await comptroller.actionPaused(VETH_CORE, Action.MINT);
      expect(paused).to.equal(true);
    });

    it("EBrake should have non-zero snapshot for vETH_Core", async () => {
      const snapshot = await eBrake.getMarketCFSnapshot(VETH_CORE, 0);
      expect(snapshot.cf).to.equal(CF);
      expect(snapshot.lt).to.equal(LT);
    });
  });

  testVip("VIP-661 Addendum 2: Minimal Recovery of vETH_Core", await vip661TestnetAddendum2(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["ActionPausedMarket", "NewCollateralFactor"], [1, 1]);
      await expectEvents(txResponse, [EBRAKE_ABI], ["MarketStateReset"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("vETH_Core should have restored collateral factor", async () => {
      const market = await comptroller.markets(VETH_CORE);
      expect(market.collateralFactorMantissa).to.equal(CF);
      expect(market.liquidationThresholdMantissa).to.equal(LT);
    });

    it("vETH_Core mint should be unpaused", async () => {
      const paused = await comptroller.actionPaused(VETH_CORE, Action.MINT);
      expect(paused).to.equal(false);
    });

    it("EBrake snapshot for vETH_Core should be cleared", async () => {
      const snapshot = await eBrake.getMarketCFSnapshot(VETH_CORE, 0);
      expect(snapshot.cf).to.equal(0);
      expect(snapshot.lt).to.equal(0);
    });
  });
});
