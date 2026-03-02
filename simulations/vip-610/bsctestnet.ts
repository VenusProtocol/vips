import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip610Testnet, { CORE_MARKETS, NEW_VBEP20_DELEGATE_IMPL } from "../../vips/vip-610/bsctestnet";
import VBEP20_DELEGATOR_ABI from "./abi/VBep20Delegator.json";

const BLOCK_NUMBER = 93334375;

forking(BLOCK_NUMBER, async () => {
  describe("Pre-VIP state", async () => {
    it("markets should have old implementation", async () => {
      for (const market of CORE_MARKETS) {
        const marketContract = await ethers.getContractAt(VBEP20_DELEGATOR_ABI, market.address);
        const currentImpl = await marketContract.implementation();
        expect(currentImpl).to.not.equal(NEW_VBEP20_DELEGATE_IMPL);
      }
    });
  });

  testVip("VIP-610 testnet", await vip610Testnet(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      const totalMarkets = CORE_MARKETS.length;
      await expectEvents(txResponse, [VBEP20_DELEGATOR_ABI], ["NewImplementation"], [totalMarkets]);
    },
  });

  describe("Post-VIP state", async () => {
    it("markets should have new implementation", async () => {
      for (const market of CORE_MARKETS) {
        const marketContract = await ethers.getContractAt(VBEP20_DELEGATOR_ABI, market.address);
        expect(await marketContract.implementation()).to.equal(NEW_VBEP20_DELEGATE_IMPL);
      }
    });
  });
});
