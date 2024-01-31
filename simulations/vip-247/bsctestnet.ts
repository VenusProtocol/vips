import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { forking, testVip } from "../../src/vip-framework";
import { UNITROLLER, vip247 } from "../../vips/vip-247/bsctestnet";
import VTOKEN_ABI from "./abi/VBep20DelegateAbi.json";
import COMPTROLLER_FACET_ABI from "./abi/comptroller.json";

const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const USER = "0x6f057A858171e187124ddEDF034dAc63De5dE5dB";
const vETH = "0x162D005F0Fff510E54958Cfc5CF32A3180A84aab";

forking(37327091, () => {
  let comptroller: ethers.Contract;
  let vETHContract: ethers.Contract;

  before(async () => {
    impersonateAccount(NORMAL_TIMELOCK);
    impersonateAccount(USER);

    comptroller = new ethers.Contract(UNITROLLER, COMPTROLLER_FACET_ABI, await ethers.getSigner(NORMAL_TIMELOCK));
    vETHContract = new ethers.Contract(vETH, VTOKEN_ABI, await ethers.getSigner(USER));
  });

  describe("Pre-VIP", () => {
    it("Verify borrow cap 0", async () => {
      await comptroller._setMarketBorrowCaps([vETH], [0]);
      expect(vETHContract.borrow(10)).to.not.be.reverted;
    });
  });

  testVip("VIP-244 Unlist Market", vip247(), {});

  describe("Post-VIP", () => {
    it("Verify borrow cap 0", async () => {
      await comptroller._setMarketBorrowCaps([vETH], [0]);
      expect(vETHContract.borrow(10)).to.not.be.revertedWith("market borrow cap is 0");
    });
  });
});
