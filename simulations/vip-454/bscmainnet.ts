import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip454, {
  CORE_COMPTROLLER,
  USDT,
  VANGUARD_VANTAGE_AMOUNT_USDT,
  VANGUARD_VANTAGE_AMOUNT_WBNB,
  VANGUARD_VANTAGE_AMOUNT_XVS,
  VANGUARD_VANTAGE_TREASURY,
  WBNB,
  XVS,
  XVS_RECEIVER,
  XVS_RECEIVER_AMOUNT,
} from "../../vips/vip-454/bscmainnet";
import CORE_COMPTROLLER_ABI from "./abi/CoreComptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import VTREASURY_ABI from "./abi/VTreasury.json";

forking(46738959, async () => {
  let usdt: Contract;
  let wbnb: Contract;
  let xvs: Contract;

  let prevUSDTBalanceOfVanguard: BigNumber;
  let prevXVSBalanceOfVanguard: BigNumber;
  let prevWBNBBalanceOfVanguard: BigNumber;
  let preXVSBalanceOfComptroller: BigNumber;
  let preXVSBalanceOfReceiver: BigNumber;

  before(async () => {
    usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);
    wbnb = new ethers.Contract(WBNB, ERC20_ABI, ethers.provider);
    xvs = new ethers.Contract(XVS, ERC20_ABI, ethers.provider);

    prevUSDTBalanceOfVanguard = await usdt.balanceOf(VANGUARD_VANTAGE_TREASURY);
    prevWBNBBalanceOfVanguard = await wbnb.balanceOf(VANGUARD_VANTAGE_TREASURY);
    prevXVSBalanceOfVanguard = await xvs.balanceOf(VANGUARD_VANTAGE_TREASURY);
    preXVSBalanceOfComptroller = await xvs.balanceOf(CORE_COMPTROLLER);
    preXVSBalanceOfReceiver = await xvs.balanceOf(XVS_RECEIVER);
  });

  testVip("VIP-454", await vip454(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [3]);
      await expectEvents(txResponse, [CORE_COMPTROLLER_ABI], ["VenusGranted"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check Vanguard Treasury balances", async () => {
      const usdtBalanceOfVanguard = await usdt.balanceOf(VANGUARD_VANTAGE_TREASURY);
      const wbnbBalanceOfVanguard = await wbnb.balanceOf(VANGUARD_VANTAGE_TREASURY);
      const xvsBalanceOfVanguard = await xvs.balanceOf(VANGUARD_VANTAGE_TREASURY);

      expect(usdtBalanceOfVanguard.sub(prevUSDTBalanceOfVanguard)).to.equal(VANGUARD_VANTAGE_AMOUNT_USDT);
      expect(wbnbBalanceOfVanguard.sub(prevWBNBBalanceOfVanguard)).to.equal(VANGUARD_VANTAGE_AMOUNT_WBNB);
      expect(xvsBalanceOfVanguard.sub(prevXVSBalanceOfVanguard)).to.equal(VANGUARD_VANTAGE_AMOUNT_XVS);
    });

    it("check xvs balance of XVS Receiver", async () => {
      const newBalance = await xvs.balanceOf(XVS_RECEIVER);
      expect(newBalance).to.equals(preXVSBalanceOfReceiver.add(XVS_RECEIVER_AMOUNT));
    });

    it("should transfer XVS from the Comptroller", async () => {
      const newBalance = await xvs.balanceOf(CORE_COMPTROLLER);
      expect(newBalance).to.equal(preXVSBalanceOfComptroller.sub(XVS_RECEIVER_AMOUNT));
    });
  });
});
