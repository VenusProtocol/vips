import { expect } from "chai";
import { BigNumberish, Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, testVip } from "../../src/vip-framework";
import { VTOKEN_SNAPSHOT, vip188 } from "../../vips/vip-188";
import IERC20 from "./abi/IERC20UpgradableAbi.json";

const VTREASURY = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";

forking(32735916, () => {
  let underlying: Contract;
  let prevBnbBal: BigNumberish;
  const provider = ethers.provider;
  const prevBal = [];
  before(async () => {
    VTOKEN_SNAPSHOT.forEach(async object => {
      if (object.symbol == "vBNB") {
        prevBnbBal = await provider.getBalance(VTREASURY);
      } else {
        underlying = new ethers.Contract(object.underlyingAddress, IERC20, provider);
        prevBal.push(await underlying.balanceOf(VTREASURY));
      }
    });
  });

  testVip("VIP-188 Redeem VTokens in the Treasury", vip188());

  describe("Post-VIP", async () => {
    let index = 0;
    VTOKEN_SNAPSHOT.forEach(async object => {
      it(`should match ${object.symbol} underlying balance of vTreasury`, async () => {
        if (object.symbol == "vBNB") {
          const balNow = await provider.getBalance(VTREASURY);
          const delta = balNow.sub(prevBnbBal);
          expect(delta).equals(object.underlyingAmount);
        } else {
          underlying = new ethers.Contract(object.underlyingAddress, IERC20, provider);
          const balNow = await underlying.balanceOf(VTREASURY);
          const delta = balNow.sub(prevBal[index]);
          expect(delta).equals(object.underlyingAmount);
          index++;
        }
      });
    });
  });
});
