import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip497, { RESILIENT_ORACLE_UNICHAIN_SEPOLIA } from "../../vips/vip-497/bsctestnet";
import ACM_ABI from "./abi/ACM.json";
import PROXY_ABI from "./abi/Proxy.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { unichainsepolia } = NETWORK_ADDRESSES;

const prices = [
  {
    symbol: "cbBTC",
    address: "0x2979ef1676bb28192ac304173C717D7322b3b586",
    expectedPrice: parseUnits("65000", 28),
  },
  {
    symbol: "USDC",
    address: "0xf16d4774893eB578130a645d5c69E9c4d183F3A5",
    expectedPrice: parseUnits("0.99995", 30),
  },
  {
    symbol: "USDT",
    address: "0x7bc1b67fde923fd3667Fde59684c6c354C8EbFdA",
    expectedPrice: parseUnits("1", 30),
  },
  {
    symbol: "WETH",
    address: "0x4200000000000000000000000000000000000006",
    expectedPrice: parseUnits("1807.1", 18),
  },
  {
    symbol: "UNI",
    address: "0x873A6C4B1e3D883920541a0C61Dc4dcb772140b3",
    expectedPrice: parseUnits("10", 18),
  },
];

forking(19591682, async () => {
  const provider = ethers.provider;

  await impersonateAccount(unichainsepolia.NORMAL_TIMELOCK);
  await setBalance(unichainsepolia.NORMAL_TIMELOCK, ethers.utils.parseEther("1000000"));
  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE_UNICHAIN_SEPOLIA, RESILIENT_ORACLE_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    for (const price of prices) {
      it(`check ${price.symbol} price`, async () => {
        expect(await resilientOracle.getPrice(price.address)).to.equal(price.expectedPrice);
      });
    }
  });

  testForkedNetworkVipCommands("vip497", await vip497(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PROXY_ABI], ["Upgraded"], [3]);
      await expectEvents(txResponse, [ACM_ABI], ["PermissionGranted"], [9]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    for (const { symbol, address, expectedPrice } of prices) {
      it(`check ${symbol} price`, async () => {
        expect(await resilientOracle.getPrice(address)).to.equal(expectedPrice);
      });
    }
  });
});
