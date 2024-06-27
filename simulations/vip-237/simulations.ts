import { expect } from "chai";
import { BigNumber } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vip237 } from "../../vips/vip-237";
import ERC20_ABI from "./abi/ERC20.json";
import VTreasurer_ABI from "./abi/VTreasury.json";

const BNB_TREASURY = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";
const BINANCE_WALLET = "0x6657911F7411765979Da0794840D671Be55bA273";

const DAI = "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3";

const DAI_AMOUNT = parseUnits("296719.647459765628937553", 18);

forking(35215431, async () => {
  let dai: Contract;
  let oldDAIBal: BigNumber;
  let oldDAIBalTreasury: BigNumber;

  before(async () => {
    dai = new ethers.Contract(DAI, ERC20_ABI, ethers.provider);
    oldDAIBal = await dai.balanceOf(BINANCE_WALLET);
    oldDAIBalTreasury = await dai.balanceOf(BNB_TREASURY);
  });

  testVip("VIP-237", await vip237(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTreasurer_ABI], ["WithdrawTreasuryBEP20"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Should transfer DAI", async () => {
      const currDAIBal = await dai.balanceOf(BINANCE_WALLET);

      expect(currDAIBal.sub(oldDAIBal)).equals(DAI_AMOUNT);

      const currDAIBalTreasury = await dai.balanceOf(BNB_TREASURY);

      expect(currDAIBalTreasury.add(DAI_AMOUNT)).equals(oldDAIBalTreasury);
    });
  });
});
