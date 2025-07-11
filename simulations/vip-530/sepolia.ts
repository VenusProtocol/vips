import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip530, { wstETH } from "../../vips/vip-530/bsctestnet";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { sepolia } = NETWORK_ADDRESSES;

const prices = [
  {
    symbol: "wstETH",
    address: wstETH,
    expectedPrice: parseUnits("2480.52", 18),
  },
];

forking(8660631, async () => {
  const provider = ethers.provider;
  const resilientOracle = new ethers.Contract(sepolia.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  describe("Pre-VIP behaviour", async () => {
    for (const price of prices) {
      it(`check ${price.symbol} price`, async () => {
        expect(await resilientOracle.getPrice(price.address)).to.equal(price.expectedPrice);
      });
    }
  });

  testForkedNetworkVipCommands("vip530", await vip530(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [1]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    for (const price of prices) {
      it(`check ${price.symbol} price`, async () => {
        expect(await resilientOracle.getPrice(price.address)).to.equal(price.expectedPrice);
      });
    }
  });
});
