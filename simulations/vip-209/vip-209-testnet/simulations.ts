import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip209 } from "../../../vips/vip-209/vip-209-testnet";
import COMPTROLLER_ABI from "../abi/comptroller.json";
import UNITROLLER_ABI from "../abi/unitroller.json";

const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const FAST_TRACK_TIMELOCK = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";
const CRITICAL_TIMELOCK = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";

const SOME_USER = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";
const VUSDT = "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A";

const UNITROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const NEW_DIAMOND_IMPLEMENTATION = "0x795F7238514DE51d04a3550089a62F59ef6992Ad";

forking(35118000, async () => {
  let unitroller: Contract;
  let comptroller: Contract;

  before(async () => {
    unitroller = await ethers.getContractAt(UNITROLLER_ABI, UNITROLLER);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, UNITROLLER);
  });

  testVip("VIP-209 Forced liquidations for user", await vip209(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [UNITROLLER_ABI], ["NewImplementation"], [1]);
    },
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
