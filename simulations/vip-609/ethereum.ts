import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import {
  ETHEREUM_CURVE_COMPTROLLER,
  ETHEREUM_CURVE_VTOKENS,
  ETHEREUM_ETHENA_COMPTROLLER,
  ETHEREUM_ETHENA_VTOKENS,
  ETHEREUM_ISOLATED_VTOKENS,
  ETHEREUM_LST_COMPTROLLER,
  ETHEREUM_LST_VTOKENS,
} from "../../vips/vip-609/addresses/ethereum";
import vip609 from "../../vips/vip-609/bscmainnet";
import COMPTROLLER_ABI from "./abi/ILComptroller.json";
import VTOKEN_ABI from "./abi/ILVToken.json";

const BLOCK_NUMBER = 24818762;

const ERC20_ABI = ["function balanceOf(address) view returns (uint256)"];

forking(BLOCK_NUMBER, async () => {
  const provider = ethers.provider;

  describe("Pre-VIP behaviour", () => {
    it("Curve pool should have the expected isolated vtokens", async () => {
      const comptroller = new ethers.Contract(ETHEREUM_CURVE_COMPTROLLER, COMPTROLLER_ABI, provider);
      const allMarkets: string[] = (await comptroller.getAllMarkets()).map((m: string) => m.toLowerCase());
      for (const vToken of ETHEREUM_CURVE_VTOKENS) {
        expect(allMarkets).to.include(vToken.toLowerCase());
      }
    });

    it("LST pool should have the expected isolated vtokens", async () => {
      const comptroller = new ethers.Contract(ETHEREUM_LST_COMPTROLLER, COMPTROLLER_ABI, provider);
      const allMarkets: string[] = (await comptroller.getAllMarkets()).map((m: string) => m.toLowerCase());
      for (const vToken of ETHEREUM_LST_VTOKENS) {
        expect(allMarkets).to.include(vToken.toLowerCase());
      }
    });

    it("Ethena pool should have the expected isolated vtokens", async () => {
      const comptroller = new ethers.Contract(ETHEREUM_ETHENA_COMPTROLLER, COMPTROLLER_ABI, provider);
      const allMarkets: string[] = (await comptroller.getAllMarkets()).map((m: string) => m.toLowerCase());
      for (const vToken of ETHEREUM_ETHENA_VTOKENS) {
        expect(allMarkets).to.include(vToken.toLowerCase());
      }
    });
  });

  testForkedNetworkVipCommands(
    "VIP-609 Grant syncCash permissions and call syncCash on isolated pools",
    await vip609(),
  );

  describe("Post-VIP behaviour", () => {
    for (const vTokenAddress of ETHEREUM_ISOLATED_VTOKENS) {
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
