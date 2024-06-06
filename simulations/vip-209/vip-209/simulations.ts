import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { checkCorePoolComptroller } from "../../../src/vip-framework/checks/checkCorePoolComptroller";
import { vip209 } from "../../../vips/vip-209/vip-209";
import COMPTROLLER_ABI from "../abi/comptroller.json";
import UNITROLLER_ABI from "../abi/unitroller.json";

const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";

const SOME_USER = "0x489A8756C18C0b8B24EC2a2b9FF3D4d447F79BEc";
const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";

const UNITROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const NEW_DIAMOND_IMPLEMENTATION = "0xD93bFED40466c9A9c3E7381ab335a08807318a1b";

forking(33715200, async () => {
  let unitroller: Contract;
  let comptroller: Contract;

  before(async () => {
    unitroller = await ethers.getContractAt(UNITROLLER_ABI, UNITROLLER);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, UNITROLLER);
  });

  testVip("VIP-209 Forced liquidations for user", await vip209(), {
    proposer: "0x97a32d4506f6a35de68e0680859cdf41d077a9a9",
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [UNITROLLER_ABI], ["NewImplementation"], [1]);
    },
  });

  describe("Generic tests", () => {
    checkCorePoolComptroller();
  });

  describe("Post-VIP behavior", () => {
    it("should have an updated comptroller implementation", async () => {
      expect(await unitroller.comptrollerImplementation()).to.equal(NEW_DIAMOND_IMPLEMENTATION);
    });

    it("should enable forced liquidation via normal timelock", async () => {
      const timelock = await initMainnetUser(NORMAL_TIMELOCK, parseEther("1"));
      await comptroller.connect(timelock)._setForcedLiquidationForUser(SOME_USER, VUSDT, true);
      expect(await comptroller.isForcedLiquidationEnabledForUser(SOME_USER, VUSDT)).to.be.true;
    });

    it("should enable forced liquidation via fast-track timelock", async () => {
      const timelock = await initMainnetUser(FAST_TRACK_TIMELOCK, parseEther("1"));
      await comptroller.connect(timelock)._setForcedLiquidationForUser(SOME_USER, VUSDT, true);
      expect(await comptroller.isForcedLiquidationEnabledForUser(SOME_USER, VUSDT)).to.be.true;
    });

    it("should enable forced liquidation via critical timelock", async () => {
      const timelock = await initMainnetUser(CRITICAL_TIMELOCK, parseEther("1"));
      await comptroller.connect(timelock)._setForcedLiquidationForUser(SOME_USER, VUSDT, true);
      expect(await comptroller.isForcedLiquidationEnabledForUser(SOME_USER, VUSDT)).to.be.true;
    });
  });
});
