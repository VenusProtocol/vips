import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriod, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip491, { CHAINLINK_ORACLE_ORACLE_BASE, RESILIENT_ORACLE_BASE } from "../../vips/vip-492/bscmainnet";
import ACM_ABI from "./abi/ACM.json";
import ERC20_ABI from "./abi/ERC20.json";
import PROXY_ABI from "./abi/Proxy.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { basemainnet } = NETWORK_ADDRESSES;

const prices = [
  {
    symbol: "USDC",
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    expectedPrice: parseUnits("1.00002", 30),
    postVIP: async function (resilientOracle: any, address: string) {
      const token = new ethers.Contract(address, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "cbBTC",
    address: "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
    expectedPrice: parseUnits("93989.71529793", 28),
    postVIP: async function (resilientOracle: any, address: string) {
      const token = new ethers.Contract(address, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "WETH",
    address: "0x4200000000000000000000000000000000000006",
    expectedPrice: parseUnits("1786.86721796", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      const token = new ethers.Contract(address, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "wsuperOETHb",
    address: "0x7FcD174E80f264448ebeE8c88a7C4476AAF58Ea6",
    expectedPrice: parseUnits("1891.922198331724989323", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      const token = new ethers.Contract(address, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "wstETH",
    address: "0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452",
    expectedPrice: parseUnits("2147.343457226248364033", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      const token = new ethers.Contract(address, ERC20_ABI, ethers.provider);
      await setMaxStalePeriodInChainlinkOracle(
        CHAINLINK_ORACLE_ORACLE_BASE,
        token.address,
        "0xB88BAc61a4Ca37C43a3725912B1f472c9A5bc061",
        basemainnet.NORMAL_TIMELOCK,
      );
    },
  },
];

forking(29870085, async () => {
  const provider = ethers.provider;

  await impersonateAccount(basemainnet.NORMAL_TIMELOCK);
  await setBalance(basemainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("1000000"));

  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE_BASE, RESILIENT_ORACLE_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    for (const { symbol, address, expectedPrice } of prices) {
      it(`check ${symbol} price`, async () => {
        expect(await resilientOracle.getPrice(address)).to.equal(expectedPrice);
      });
    }
  });

  testForkedNetworkVipCommands("vip491", await vip491(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PROXY_ABI], ["Upgraded"], [4]);
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [2]);
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
