import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import {
  ZKSYNCMAINNET_CORE_COMPTROLLER,
  ZKSYNCMAINNET_CORE_VTOKENS,
  ZKSYNCMAINNET_NEW_VTOKEN_IMPLEMENTATION,
  ZKSYNCMAINNET_VTOKEN_BEACON,
} from "../../vips/vip-600/addresses/zksyncmainnet";
import vip601 from "../../vips/vip-600/bscmainnet-2";
import vip602 from "../../vips/vip-600/bscmainnet-3";
import COMPTROLLER_ABI from "./abi/ILComptroller.json";
import VTOKEN_ABI from "./abi/ILVToken.json";
import VTOKEN_BEACON_ABI from "./abi/vtokenBeacon.json";

const BLOCK_NUMBER = 69170974;

const ERC20_ABI = ["function balanceOf(address) view returns (uint256)"];

forking(BLOCK_NUMBER, async () => {
  const provider = ethers.provider;
  const vTokenBeacon = new ethers.Contract(ZKSYNCMAINNET_VTOKEN_BEACON, VTOKEN_BEACON_ABI, provider);

  describe("Pre-VIP behaviour", () => {
    it("CORE_VTOKENS should cover all on-chain markets", async () => {
      const comptroller = new ethers.Contract(ZKSYNCMAINNET_CORE_COMPTROLLER, COMPTROLLER_ABI, provider);
      const allMarkets: string[] = await comptroller.getAllMarkets();
      expect(ZKSYNCMAINNET_CORE_VTOKENS.length).to.equal(allMarkets.length, "CORE_VTOKENS does not cover all markets");
    });

    it("VToken beacon should not point to new implementation", async () => {
      const currentImplementation = await vTokenBeacon.implementation();
      expect(currentImplementation).to.not.equal(ZKSYNCMAINNET_NEW_VTOKEN_IMPLEMENTATION);
    });
  });

  testForkedNetworkVipCommands("VIP-601 Grant syncCash permissions", await vip601());

  testForkedNetworkVipCommands("VIP-602 Upgrade VToken beacon and syncCash", await vip602(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTOKEN_BEACON_ABI], ["Upgraded"], [1]);
    },
  });

  describe("Post-VIP behaviour", () => {
    it("VToken beacon should point to new implementation", async () => {
      const currentImplementation = await vTokenBeacon.implementation();
      expect(currentImplementation).to.equal(ZKSYNCMAINNET_NEW_VTOKEN_IMPLEMENTATION);
    });

    for (const vTokenAddress of ZKSYNCMAINNET_CORE_VTOKENS) {
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
