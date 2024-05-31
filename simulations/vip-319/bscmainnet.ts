import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, setMaxStaleCoreAssets } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { checkInterestRate } from "../../src/vip-framework/checks/interestRateModel";
import vip319, {
  vBNB,
  NEW_IR,
} from "../../vips/vip-319/bscmainnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vToken.json";

const OLD_IR = "0xF558Be24F2CACb65a4BB41A155631C83B15388F1";

forking(39174234, async () => {
  const provider = ethers.provider;
  let vBNBContract: Contract;
  let comptrollerContract: Contract;

  before(async () => {
    vBNBContract = new ethers.Contract(vBNB, VTOKEN_ABI, provider);
    // comptrollerContract = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, await ethers.getSigner(NORMAL_TIMELOCK));

    // await setMaxStaleCoreAssets(CHAINLINK, NORMAL_TIMELOCK);
  });

  describe("Pre-VIP behavior", async () => {
    it("check IR address", async () => {
      const ir = await vBNBContract.interestRateModel();
      expect(ir).to.be.equal(OLD_IR);
    });

    // it("IR parameters checks", async () => {
    //   checkInterestRate(OLD_IR, "vWBNB_LiquidStakedBNB", {
    //     base: "0.01",
    //     multiplier: "0.035",
    //     jump: "3",
    //     kink: "0.8",
    //   });
    // });
  });

  testVip("VIP-319", vip319(), {
    callbackAfterExecution: async txResponse => {
      // await expectEvents(txResponse, [VTOKEN_ABI], ["NewMarketInterestRateModel"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check IR address", async () => {
      const ir = await vBNBContract.interestRateModel();
      expect(ir).to.be.equal(NEW_IR);
    });

    // it("IR parameters checks", async () => {
    //   checkInterestRate(vWBNB_IR, "vWBNB_LiquidStakedBNB", {
    //     base: "0",
    //     multiplier: "0.009",
    //     jump: "3",
    //     kink: "0.9",
    //   });
    // });
  });
});
