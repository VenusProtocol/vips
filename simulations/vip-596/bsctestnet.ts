import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip596Testnet, { CORE_MARKETS, NEW_VBEP20_DELEGATE_IMPL } from "../../vips/vip-596/bsctestnet";
import VBEP20_DELEGATOR_ABI from "./abi/VBep20Delegator.json";

// TODO: Set the correct block number
const BLOCK_NUMBER = 92753245;

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

  testVip("VIP-596 testnet", await vip596Testnet(), {
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
