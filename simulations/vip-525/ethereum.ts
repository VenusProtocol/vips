import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { setMaxStalePeriod } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip525, { wstETH } from "../../vips/vip-525/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { ethereum } = NETWORK_ADDRESSES;

const prices = [
  {
    symbol: "wstETH",
    address: wstETH,
    expectedPrice: parseUnits("2957.471395275213546772", 18),
    postVIP: async function (resilientOracle: any) {
      const token = new ethers.Contract("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
];

forking(22816596, async () => {
  const provider = ethers.provider;
  const resilientOracle = new ethers.Contract(ethereum.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  describe("Pre-VIP behaviour", async () => {
    for (const price of prices) {
      it(`check ${price.symbol} price`, async () => {
        expect(await resilientOracle.getPrice(price.address)).to.equal(price.expectedPrice);
      });
    }
  });

  testForkedNetworkVipCommands("vip525", await vip525());

  describe("Post-VIP behaviour", async () => {
    for (const price of prices) {
      it(`check ${price.symbol} price`, async () => {
        if (price.postVIP) {
          await price.postVIP(resilientOracle);
        }
        expect(await resilientOracle.getPrice(price.address)).to.equal(price.expectedPrice);
      });
    }
  });
});
