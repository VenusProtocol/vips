import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriod } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip491, { RESILIENT_ORACLE_OP } from "../../vips/vip-492/bscmainnet";
import ACM_ABI from "./abi/ACM.json";
import ERC20_ABI from "./abi/ERC20.json";
import PROXY_ABI from "./abi/Proxy.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { opmainnet } = NETWORK_ADDRESSES;

const prices = [
  {
    symbol: "OP",
    address: "0x4200000000000000000000000000000000000042",
    expectedPrice: parseUnits("0.6154", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      const token = new ethers.Contract(address, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "USDC",
    address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
    expectedPrice: parseUnits("1.0000557", 30),
    postVIP: async function (resilientOracle: any, address: string) {
      const token = new ethers.Contract(address, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "USDT",
    address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
    expectedPrice: parseUnits("0.999816", 30),
    postVIP: async function (resilientOracle: any, address: string) {
      const token = new ethers.Contract(address, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "WBTC",
    address: "0x68f180fcCe6836688e9084f035309E29Bf0A2095",
    expectedPrice: parseUnits("93782.188", 28),
    postVIP: async function (resilientOracle: any, address: string) {
      const token = new ethers.Contract(address, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "WETH",
    address: "0x4200000000000000000000000000000000000006",
    expectedPrice: parseUnits("1771.37077164", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      const token = new ethers.Contract(address, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
];

forking(135467436, async () => {
  const provider = ethers.provider;

  await impersonateAccount(opmainnet.NORMAL_TIMELOCK);
  await setBalance(opmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("1000000"));

  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE_OP, RESILIENT_ORACLE_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    for (const price of prices) {
      it(`check ${price.symbol} price`, async () => {
        expect(await resilientOracle.getPrice(price.address)).to.equal(price.expectedPrice);
      });
    }
  });

  testForkedNetworkVipCommands("vip491", await vip491(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PROXY_ABI], ["Upgraded"], [4]);
      await expectEvents(txResponse, [ACM_ABI], ["PermissionGranted"], [9]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    for (const { symbol, address, expectedPrice, postVIP } of prices) {
      it(`check ${symbol} price`, async () => {
        await postVIP(resilientOracle, address);
        expect(await resilientOracle.getPrice(address)).to.equal(expectedPrice);
      });
    }
  });
});
