import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import {
  ARBITRUMONE_CORE_VTOKENS,
  ARBITRUMONE_NEW_VTOKEN_IMPLEMENTATION,
  ARBITRUMONE_VTOKEN_BEACON,
} from "../../vips/vip-608/addresses/arbitrumone";
import vip608_2 from "../../vips/vip-608/bscmainnet-2";
import vip608_3 from "../../vips/vip-608/bscmainnet-3";
import VTOKEN_ABI from "./abi/ILVToken.json";
import VTOKEN_BEACON_ABI from "./abi/vtokenBeacon.json";

const BLOCK_NUMBER = 443758428;

const ERC20_ABI = ["function balanceOf(address) view returns (uint256)"];

forking(BLOCK_NUMBER, async () => {
  const provider = ethers.provider;
  const vTokenBeacon = new ethers.Contract(ARBITRUMONE_VTOKEN_BEACON, VTOKEN_BEACON_ABI, provider);

  describe("Pre-VIP behaviour", () => {
    it("VToken beacon should not point to new implementation", async () => {
      const currentImplementation = await vTokenBeacon.implementation();
      expect(currentImplementation).to.not.equal(ARBITRUMONE_NEW_VTOKEN_IMPLEMENTATION);
    });
  });

  testForkedNetworkVipCommands("VIP-608 Grant syncCash permissions", await vip608_2());

  testForkedNetworkVipCommands("VIP-608 Upgrade VToken beacon and syncCash", await vip608_3(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTOKEN_BEACON_ABI], ["Upgraded"], [1]);
    },
  });

  describe("Post-VIP behaviour", () => {
    it("VToken beacon should point to new implementation", async () => {
      const currentImplementation = await vTokenBeacon.implementation();
      expect(currentImplementation).to.equal(ARBITRUMONE_NEW_VTOKEN_IMPLEMENTATION);
    });

    for (const vTokenAddress of ARBITRUMONE_CORE_VTOKENS) {
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
