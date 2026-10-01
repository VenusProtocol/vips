import { TransactionResponse } from "@ethersproject/providers";
import { mine } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { OLD_RATE_MODEL, ZERO_RATE_MODEL, vTUSDOLD, vip667 } from "../../vips/vip-667/bscmainnet";
import VTOKEN_ABI from "./abi/VToken.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const FORK_BLOCK = 125068900;
const BLOCKS_PER_DAY = 192000;

const ACM_ABI = ["function isAllowedToCall(address account, string functionSig) view returns (bool)"];
const RATE_MODEL_ABI = [
  "function isInterestRateModel() view returns (bool)",
  "function getBorrowRate(uint256 cash, uint256 borrows, uint256 reserves) view returns (uint256)",
];

forking(FORK_BLOCK, async () => {
  let vToken: Contract;

  before(async () => {
    vToken = await ethers.getContractAt(VTOKEN_ABI, vTUSDOLD);
  });

  describe("Pre-VIP state", () => {
    it("vTUSDOLD uses the old rate model and its borrow rate is nonzero", async () => {
      expect(await vToken.interestRateModel()).to.equal(OLD_RATE_MODEL);
      expect(await vToken.borrowRatePerBlock()).to.be.gt(0);
    });

    it("vTUSDOLD has no cash and a 100% reserve factor", async () => {
      expect(await vToken.getCash()).to.equal(0);
      expect(await vToken.reserveFactorMantissa()).to.equal(ethers.utils.parseUnits("1", 18));
    });

    it("the Fast Track timelock may call _setInterestRateModel on vTUSDOLD", async () => {
      // isAllowedToCall checks the permission of the contract that calls it, so the call is made from vTUSDOLD.
      const acm = new ethers.utils.Interface(ACM_ABI);
      const result = await ethers.provider.call({
        to: bscmainnet.ACCESS_CONTROL_MANAGER,
        from: vTUSDOLD,
        data: acm.encodeFunctionData("isAllowedToCall", [
          bscmainnet.FAST_TRACK_TIMELOCK,
          "_setInterestRateModel(address)",
        ]),
      });
      expect(acm.decodeFunctionResult("isAllowedToCall", result)[0]).to.equal(true);
    });

    it("the zero rate model returns 0 at the current utilization", async () => {
      const model = await ethers.getContractAt(RATE_MODEL_ABI, ZERO_RATE_MODEL);
      expect(await model.isInterestRateModel()).to.equal(true);
      expect(await model.getBorrowRate(0, await vToken.totalBorrows(), await vToken.totalReserves())).to.equal(0);
    });
  });

  testVip("VIP-667 Stop Interest Accrual on the Deprecated TUSDOLD Market", await vip667(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [VTOKEN_ABI], ["NewMarketInterestRateModel"], [1]);
    },
  });

  describe("Post-VIP state", () => {
    it("vTUSDOLD uses the zero rate model and its borrow rate is 0", async () => {
      expect(await vToken.interestRateModel()).to.equal(ZERO_RATE_MODEL);
      expect(await vToken.borrowRatePerBlock()).to.equal(0);
    });

    it("borrows and reserves do not change after 30 more days", async () => {
      const borrows: BigNumber = await vToken.totalBorrows();
      const reserves: BigNumber = await vToken.totalReserves();

      await mine(30 * BLOCKS_PER_DAY);
      await vToken.accrueInterest();

      expect(await vToken.totalBorrows()).to.equal(borrows);
      expect(await vToken.totalReserves()).to.equal(reserves);
    });
  });
});
