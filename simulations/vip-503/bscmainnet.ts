import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, getEventArgs } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  BNB_EXPLOITER,
  POLICY_FACET,
  RISK_FUND_CONVERTER,
  TEMP_POLICY_FACET,
  TEN_PERCENT_UNDERLYING,
  TOKEN_REDEEMER,
  TRANSFER_ALL_CONTRACT,
  VBNB,
  WBNB,
  vip503,
} from "../../vips/vip-503/bscmainnet";
import RISK_FUND_CONVERTER_ABI from "./abi/RiskFundConverter.json";
import COMPTROLLER_ABI from "./abi/comptrollerAbi.json";
import ERC20_ABI from "./abi/erc20.json";
import VBNB_ABI from "./abi/vBNB.json";

const RISK_FUND = "0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42";

forking(50408291, async () => {
  let vBNB: Contract;
  let prevRFBalance: BigNumber;
  let wbnb: Contract;
  let unitroller: Contract;
  let rfConverter: Contract;
  let prevZROAddBalance: BigNumber;
  let burnedBNBAmount: BigNumber;

  before(async () => {
    vBNB = await ethers.getContractAt(VBNB_ABI, VBNB);
    wbnb = await ethers.getContractAt(ERC20_ABI, WBNB);
    unitroller = await ethers.getContractAt(COMPTROLLER_ABI, NETWORK_ADDRESSES.bscmainnet.UNITROLLER);
    rfConverter = await ethers.getContractAt(RISK_FUND_CONVERTER_ABI, RISK_FUND_CONVERTER);

    prevRFBalance = await wbnb.balanceOf(RISK_FUND);
    prevZROAddBalance = await ethers.provider.getBalance(ethers.constants.AddressZero);
  });

  describe("Pre-VIP state", async () => {
    it("Exploiter VBNB balance should be 434904265070245", async () => {
      expect(await vBNB.balanceOf(BNB_EXPLOITER)).equals("434904265070245");
    });
  });

  testVip("VIP-503", await vip503(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["DiamondCut"], [2]);
      const events = await getEventArgs(txResponse, VBNB_ABI, "Redeem");
      burnedBNBAmount = events[0].redeemAmount;
    },
  });

  describe("Post-VIP state", async () => {
    it("should seize the exploiter's vBNB", async () => {
      const balance = await vBNB.balanceOf(BNB_EXPLOITER);
      expect(balance).to.equal("0");
    });

    it("should transfer the 10% of seized and converted WBNB to RiskFund", async () => {
      const currRFbalance = await wbnb.balanceOf(RISK_FUND);
      expect(prevRFBalance.add(TEN_PERCENT_UNDERLYING)).to.equal(currRFbalance);
    });

    it("should restore the original Comptroller Policy facet", async () => {
      expect(await unitroller.facetAddresses()).to.include(POLICY_FACET);
      expect(await unitroller.facetAddresses()).to.not.include(TEMP_POLICY_FACET);
    });

    it("Token Redeemer should have no left vBNB", async () => {
      expect(await vBNB.balanceOf(TOKEN_REDEEMER)).to.equal(0);
    });

    it("Timelock should have no left vBNB", async () => {
      expect(await vBNB.balanceOf(NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK)).to.equal(0);
    });

    it("poolsAssetsDirectTransfer should have initial value i.e. false", async () => {
      expect(await rfConverter.poolsAssetsDirectTransfer(NETWORK_ADDRESSES.bscmainnet.UNITROLLER, WBNB)).to.equals(
        false,
      );
    });

    it("vBNB approval is 0 for transfer all contract", async () => {
      expect(await vBNB.allowance(NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK, TRANSFER_ALL_CONTRACT)).to.equals(0);
    });

    it("should burn expected BNB tokens", async () => {
      const newZROAddalance = await ethers.provider.getBalance(ethers.constants.AddressZero);
      expect(newZROAddalance).to.equal(prevZROAddBalance.add(burnedBNBAmount));
    });
  });
});
