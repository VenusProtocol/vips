import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, testVip } from "../../src/vip-framework";
import { UNITROLLER, vip308 } from "../../vips/vip-308/bsctestnet";
import VTOKEN_ABI from "./abi/VBep20DelegateAbi.json";
import COMPTROLLER_FACET_ABI from "./abi/comptroller.json";

const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const USER = "0x6f057A858171e187124ddEDF034dAc63De5dE5dB";
const vETH = "0x162D005F0Fff510E54958Cfc5CF32A3180A84aab";

forking(39001701, () => {
  let comptroller: Contract;
  let vETHContract: Contract;

  before(async () => {
    await impersonateAccount(NORMAL_TIMELOCK);
    await impersonateAccount(USER);

    comptroller = new ethers.Contract(UNITROLLER, COMPTROLLER_FACET_ABI, await ethers.getSigner(NORMAL_TIMELOCK));
    vETHContract = new ethers.Contract(vETH, VTOKEN_ABI, await ethers.getSigner(USER));
  });

  describe("Pre-VIP", () => {
    it("Verify borrow cap 0", async () => {
      await comptroller._setMarketBorrowCaps([vETH], [0]);
      await expect(vETHContract.borrow(10)).to.not.be.reverted;
    });
  });

  testVip("VIP-244 Unlist Market", vip308(), {});

  describe("Post-VIP", () => {
    it("Verify borrow cap 0", async () => {
      await comptroller._setMarketBorrowCaps([vETH], [0]);
      await expect(vETHContract.borrow(10)).to.be.revertedWith("market borrow cap is 0");
    });
  });
});
