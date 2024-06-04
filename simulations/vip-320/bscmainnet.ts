import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, setMaxStaleCoreAssets } from "../../src/utils";
import { forking, pretendExecutingVip, testVip } from "../../src/vip-framework";
import { checkInterestRate } from "../../src/vip-framework/checks/interestRateModel";
import vip320, {
  vBNBAdmin,
  NEW_IR,
} from "../../vips/vip-320/bscmainnet";
import vip319 from "../../vips/vip-319/bscmainnet";
import VTOKEN_ABI from "./abi/vToken.json";
import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";

const OLD_IR = "0xF558Be24F2CACb65a4BB41A155631C83B15388F1";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

forking(39313449, async () => {
  const provider = ethers.provider;
  let vBNBContract: Contract;

  before(async () => {
    pretendExecutingVip(vip319());
    await impersonateAccount(NORMAL_TIMELOCK);
    vBNBContract = new ethers.Contract(vBNBAdmin, VTOKEN_ABI, await ethers.getSigner(NORMAL_TIMELOCK));
  });

  describe("Pre-VIP behavior", async () => {
    it("check IR address", async () => {
      const ir = await vBNBContract.interestRateModel();
      expect(ir).to.be.equal(OLD_IR);
    });

    it("IR parameters checks", async () => {
      checkInterestRate(OLD_IR, "vBNB", {
        base: "0",
        multiplier: "0.225",
        jump: "6.8",
        kink: "0.8",
      });
    });
  });

  testVip("VIP-320", vip320(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTOKEN_ABI], ["NewMarketInterestRateModel"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check IR address", async () => {
      const ir = await vBNBContract.interestRateModel();
      expect(ir).to.be.equal(NEW_IR);
    });

    it("IR parameters checks", async () => {
      checkInterestRate(NEW_IR, "vBNB", {
        base: "0",
        multiplier: "0.625",
        jump: "6.8",
        kink: "0.8",
      });
    });
  });
});
