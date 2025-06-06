import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip509 from "../../vips/vip-509/bsctestnet";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { sepolia } = NETWORK_ADDRESSES;

const prices = [
  {
    symbol: "vweETHs",
    address: "0x81aab41B868f8b5632E8eE6a98AdA7a7fDBc8823",
    expectedPrice: parseUnits("2482.678646927923418144", 18),
  },
  {
    symbol: "vPT-sUSDE",
    address: "0x6c87587b1813eAf5571318E2139048b04eAaFf97",
    expectedPrice: parseUnits("1.1", 18),
  },
  {
    symbol: "vPT-USDe",
    address: "0xf2C00a9C3314f7997721253c49276c8531a30803",
    expectedPrice: parseUnits("1.1", 18),
  },
  {
    symbol: "vsUSDe",
    address: "0x643a2BE96e7675Ca34bcceCB33F4f0fECA1ba9fC",
    expectedPrice: parseUnits("1", 18),
  },
  {
    symbol: "vezETH",
    address: "0xF4C1B7528f8B266D8ADf1a85c91d93114FeDbA2A",
    expectedPrice: parseUnits("2472.13887781", 18),
  },
  {
    symbol: "vPT-weETH",
    address: "0x3AF2bE7AbEF0f840b196D99d79F4B803a5dB14a1",
    expectedPrice: parseUnits("2356.568380863411717079", 18),
  },
  {
    symbol: "vpufETH",
    address: "0x1E4d64B7c6f1F71969E5137B5Ee8cBa9Ab9c9356",
    expectedPrice: parseUnits("2472.13887781", 18),
  },
  {
    symbol: "vweETH",
    address: "0x30c31bA6f4652B548fe7a142A949987c3f3Bf80b",
    expectedPrice: parseUnits("2559.646956294238095379", 18),
  },
];

forking(8488820, async () => {
  const provider = ethers.provider;
  const resilientOracle = new ethers.Contract(sepolia.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  describe("Pre-VIP behaviour", async () => {
    for (const price of prices) {
      it(`check ${price.symbol} price`, async () => {
        expect(await resilientOracle.getUnderlyingPrice(price.address)).to.equal(price.expectedPrice);
      });
    }
  });

  testForkedNetworkVipCommands("vip509", await vip509());

  describe("Post-VIP behaviour", async () => {
    for (const price of prices) {
      it(`check ${price.symbol} price`, async () => {
        expect(await resilientOracle.getUnderlyingPrice(price.address)).to.equal(price.expectedPrice);
      });
    }
  });
});
