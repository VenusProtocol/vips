import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriod } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  ACM,
  CF,
  COMPTROLLER,
  EBRAKE,
  KEEPER_ADDRESS,
  LT,
  VETH_CORE,
  vip661TestnetAddendum,
} from "../../vips/vip-610/bsctestnet-addendum";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import EBRAKE_ABI from "./abi/EBrake.json";
import ERC20_ABI from "./abi/ERC20.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const Action = {
  MINT: 0,
};

const ETH = "0x98f7A83361F7Ac8765CcEBAB1425da6b341958a7";

forking(100083240, async () => {
  let comptroller: Contract;
  let eBrake: Contract;
  let accessControlManager: Contract;
  let resilientOracle: Contract;
  let eth: Contract;

  before(async () => {
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER);
    eBrake = await ethers.getContractAt(EBRAKE_ABI, EBRAKE);
    accessControlManager = await ethers.getContractAt(ACCESS_CONTROL_MANAGER_ABI, ACM);
    resilientOracle = await ethers.getContractAt(
      RESILIENT_ORACLE_ABI,
      NETWORK_ADDRESSES["bsctestnet"].RESILIENT_ORACLE,
    );
    eth = await ethers.getContractAt(ERC20_ABI, ETH);

    await setMaxStalePeriod(resilientOracle, eth, 7 * 24 * 60 * 60);
  });

  describe("Pre-VIP behavior", () => {
    it("vETH_Core should have collateral factor of 0", async () => {
      const market = await comptroller.markets(VETH_CORE);
      expect(market.collateralFactorMantissa).to.equal(0);
    });

    it("vETH_Core mint should be paused", async () => {
      const paused = await comptroller.actionPaused(VETH_CORE, Action.MINT);
      expect(paused).to.equal(true);
    });

    it("EBrake should have non-zero snapshot for vETH_Core", async () => {
      const snapshot = await eBrake.getMarketCFSnapshot(VETH_CORE, 0);
      expect(snapshot.cf).to.equal(CF);
      expect(snapshot.lt).to.equal(LT);
    });

    it("Normal Timelock should not have resetMarketState permission on EBrake", async () => {
      expect(
        await accessControlManager.hasPermission(
          NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK,
          EBRAKE,
          "resetMarketState(address)",
        ),
      ).to.equal(false);
    });

    it("Keeper should not have _setActionsPaused permission on comptrollers", async () => {
      expect(
        await accessControlManager.hasPermission(
          KEEPER_ADDRESS,
          ethers.constants.AddressZero,
          "_setActionsPaused(address[],uint8[],bool)",
        ),
      ).to.equal(false);
    });

    it("Keeper should not have setCollateralFactor permission on comptrollers", async () => {
      expect(
        await accessControlManager.hasPermission(
          KEEPER_ADDRESS,
          ethers.constants.AddressZero,
          "setCollateralFactor(address,uint256,uint256)",
        ),
      ).to.equal(false);
    });

    it("Keeper should not have resetMarketState permission on EBrake", async () => {
      expect(await accessControlManager.hasPermission(KEEPER_ADDRESS, EBRAKE, "resetMarketState(address)")).to.equal(
        false,
      );
    });
  });

  testVip("VIP-661 Addendum: Recover vETH_Core after EBrake Incident", await vip661TestnetAddendum(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["ActionPausedMarket", "NewCollateralFactor"], [1, 1]);
      await expectEvents(txResponse, [EBRAKE_ABI], ["MarketStateReset"], [1]);
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [4]);
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

    it("Normal Timelock should have resetMarketState permission on EBrake", async () => {
      expect(
        await accessControlManager.hasPermission(
          NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK,
          EBRAKE,
          "resetMarketState(address)",
        ),
      ).to.equal(true);
    });

    it("Keeper should have _setActionsPaused permission on comptrollers", async () => {
      expect(
        await accessControlManager.hasPermission(
          KEEPER_ADDRESS,
          ethers.constants.AddressZero,
          "_setActionsPaused(address[],uint8[],bool)",
        ),
      ).to.equal(true);
    });

    it("Keeper should have setCollateralFactor permission on comptrollers", async () => {
      expect(
        await accessControlManager.hasPermission(
          KEEPER_ADDRESS,
          ethers.constants.AddressZero,
          "setCollateralFactor(address,uint256,uint256)",
        ),
      ).to.equal(true);
    });

    it("Keeper should have resetMarketState permission on EBrake", async () => {
      expect(await accessControlManager.hasPermission(KEEPER_ADDRESS, EBRAKE, "resetMarketState(address)")).to.equal(
        true,
      );
    });
  });
});
