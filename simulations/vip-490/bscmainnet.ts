import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  BNB_EXPLOITER,
  POLICY_FACET,
  RISK_FUND_CONVERTER,
  TEMP_POLICY_FACET,
  TEN_PERCENT_UNDERLYING,
  TOKEN_REDEEMER,
  VBNB,
  WBNB,
  vip490,
} from "../../vips/vip-490/bscmainnet";
import RISK_FUND_CONVERTER_ABI from "./abi/RiskFundConverter.json";
import COMPTROLLER_ABI from "./abi/comptrollerAbi.json";
import ERC20_ABI from "./abi/erc20.json";
import VBNB_ABI from "./abi/vBNB.json";

const RISK_FUND = "0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42";

forking(48663751, async () => {
  let vBNB: Contract;
  let prevRFBalance: BigNumber;
  let wbnb: Contract;
  let unitroller: Contract;
  let rfConverter: Contract;

  before(async () => {
    vBNB = await ethers.getContractAt(VBNB_ABI, VBNB);
    wbnb = await ethers.getContractAt(ERC20_ABI, WBNB);
    unitroller = await ethers.getContractAt(COMPTROLLER_ABI, NETWORK_ADDRESSES.bscmainnet.UNITROLLER);
    rfConverter = await ethers.getContractAt(RISK_FUND_CONVERTER_ABI, RISK_FUND_CONVERTER);

    prevRFBalance = await wbnb.balanceOf(RISK_FUND);
  });

  describe("Pre-VIP state", async () => {
    it("Exploiter VBNB balance should be 1104498890317941", async () => {
      expect(await vBNB.balanceOf(BNB_EXPLOITER)).equals("1104498890317941");
    });
  });

  testVip("VIP-490", await vip490(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["DiamondCut"], [2]);
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

    it("poolsAssetsDirectTransfer should have initial value i.e. false", async () => {
      expect(await rfConverter.poolsAssetsDirectTransfer(NETWORK_ADDRESSES.bscmainnet.UNITROLLER, WBNB)).to.equals(
        false,
      );
    });
  });
});
