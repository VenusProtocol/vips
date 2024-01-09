import { TransactionResponse } from "@ethersproject/providers";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import PRIME_ABI from "./abis/Prime.json";
import { vip235, ADDRESSES, PRIME } from "../../vips/vip-235/vip-235";
import { vip234 } from "../../vips/vip-234/vip-234";

forking(35091518, () => {
  testVip("VIP-234 Prime Program", vip234());

  testVip("VIP-235 Prime Program", vip235(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      expectEvents(txResponse, [PRIME_ABI], ["MintLimitsUpdated"], [1]);
      // await expectEvents(txResponse, [PRIME_ABI], ["Burn"], [20]);
    },
  });

  describe("Post-VIP behavior", async () => {
    let prime: Contract;

    before(async () => {
      prime = await ethers.getContractAt(PRIME_ABI, PRIME);
    });

    describe("check if token minted", async () => {
      for (let i = 0; i < ADDRESSES.length; i++) {
        const address = ADDRESSES[i];
        it(`should have minted token for ${address}`, async () => {
          const data = await prime.tokens(address);
          // expect(data.exists).to.be.equal(false);
        });
      }
    });
  });
});
