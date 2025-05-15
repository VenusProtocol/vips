import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip497, { RESILIENT_ORACLE_BASE_SEPOLIA } from "../../vips/vip-497/bsctestnet";
import ACM_ABI from "./abi/ACM.json";
import PROXY_ABI from "./abi/Proxy.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { basesepolia } = NETWORK_ADDRESSES;

const prices = [
  {
    symbol: "USDC",
    address: "0xFa264c13d657180e65245a9C3ac8d08b9F5Fc54D",
    expectedPrice: parseUnits("0.9999794", 30),
  },
  {
    symbol: "cbBTC",
    address: "0x0948001047A07e38F685f9a11ea1ddB16B234af9",
    expectedPrice: parseUnits("94238.40963306", 28),
  },
  {
    symbol: "WETH",
    address: "0x4200000000000000000000000000000000000006",
    expectedPrice: parseUnits("1806.453953", 18),
  },
  {
    symbol: "wsuperOETHb",
    address: "0x02B1136d9E223333E0083aeAB76bC441f230a033",
    expectedPrice: parseUnits("1806.453953", 18),
  },
  {
    symbol: "wstETH",
    address: "0xAd69AA3811fE0EE7dBd4e25C4bae40e6422c76C8",
    expectedPrice: parseUnits("1987.0993483", 18),
  },
];

forking(25337385, async () => {
  const provider = ethers.provider;

  await impersonateAccount(basesepolia.NORMAL_TIMELOCK);
  await setBalance(basesepolia.NORMAL_TIMELOCK, ethers.utils.parseEther("1000000"));

  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE_BASE_SEPOLIA, RESILIENT_ORACLE_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    for (const price of prices) {
      it(`check ${price.symbol} price`, async () => {
        expect(await resilientOracle.getPrice(price.address)).to.equal(price.expectedPrice);
      });
    }
  });

  testForkedNetworkVipCommands("vip497", await vip497(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PROXY_ABI], ["Upgraded"], [4]);
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [2]);
      await expectEvents(txResponse, [ACM_ABI], ["PermissionGranted"], [9]);
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
