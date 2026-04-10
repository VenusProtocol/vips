import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import { ARBITRUMONE_ISOLATED_VTOKENS, ARBITRUMONE_LST_COMPTROLLER } from "../../vips/vip-609/addresses/arbitrumone";
import vip609 from "../../vips/vip-609/bscmainnet";
import COMPTROLLER_ABI from "./abi/ILComptroller.json";
import VTOKEN_ABI from "./abi/ILVToken.json";

const BLOCK_NUMBER = 449553978;

const ERC20_ABI = ["function balanceOf(address) view returns (uint256)"];

forking(BLOCK_NUMBER, async () => {
  const provider = ethers.provider;

  describe("Pre-VIP behaviour", () => {
    it("LST pool should have the expected isolated vtokens", async () => {
      const comptroller = new ethers.Contract(ARBITRUMONE_LST_COMPTROLLER, COMPTROLLER_ABI, provider);
      const allMarkets: string[] = (await comptroller.getAllMarkets()).map((m: string) => m.toLowerCase());
      for (const vToken of ARBITRUMONE_ISOLATED_VTOKENS) {
        expect(allMarkets).to.include(vToken.toLowerCase());
      }
    });
  });

  testForkedNetworkVipCommands(
    "VIP-609 Grant syncCash permissions and call syncCash on isolated pools",
    await vip609(),
  );

  describe("Post-VIP behaviour", () => {
    for (const vTokenAddress of ARBITRUMONE_ISOLATED_VTOKENS) {
      describe(`VToken ${vTokenAddress}`, () => {
        let vToken: Contract;

        before(async () => {
          vToken = new ethers.Contract(vTokenAddress, VTOKEN_ABI, provider);
        });

        it("should have internalCash equal to underlying token balance", async () => {
          const internalCash = await vToken.internalCash();
          const underlyingAddress = await vToken.underlying();
          const underlyingToken = new ethers.Contract(underlyingAddress, ERC20_ABI, provider);
          const underlyingBalance = await underlyingToken.balanceOf(vTokenAddress);
          expect(internalCash).to.equal(underlyingBalance);
        });

        it("should allow accrueInterest to succeed", async () => {
          await expect(vToken.callStatic.accrueInterest()).to.not.be.reverted;
        });
      });
    }
  });
});
