import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriod, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip491, {
  BOUND_VALIDATOR_ARBITRUM,
  BOUND_VALIDATOR_IMPLEMENTATION_ARBITRUM,
  CHAINLINK_ORACLE_ARBITRUM,
  CHAINLINK_ORACLE_IMPLEMENTATION_ARBITRUM,
  DEFAULT_PROXY_ADMIN_ARBITRUM,
  REDSTONE_ORACLE_ARBITRUM,
  REDSTONE_ORACLE_IMPLEMENTATION_ARBITRUM,
  RESILIENT_ORACLE_ARBITRUM,
  RESILIENT_ORACLE_IMPLEMENTATION_ARBITRUM,
} from "../../vips/vip-499/bscmainnet";
import ACM_ABI from "./abi/ACM.json";
import ERC20_ABI from "./abi/ERC20.json";
import PROXY_ABI from "./abi/Proxy.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { arbitrumone } = NETWORK_ADDRESSES;

const prices = [
  {
    symbol: "ARB",
    address: "0x912ce59144191c1204e64559fe8253a0e49e6548",
    expectedPrice: parseUnits("0.39625248", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      const token = new ethers.Contract(address, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "gmBTC",
    address: "0x47c031236e19d024b42f8AE6780E44A573170703",
    expectedPrice: parseUnits("2.47630006", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      const token = new ethers.Contract(address, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "gmETH",
    address: "0x70d95587d40A2caf56bd97485aB3Eec10Bee6336",
    expectedPrice: parseUnits("1.59316565", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      const token = new ethers.Contract(address, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "USDC",
    address: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    expectedPrice: parseUnits("0.99986994", 30),
    postVIP: async function (resilientOracle: any, address: string) {
      const token = new ethers.Contract(address, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "USDT",
    address: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
    expectedPrice: parseUnits("1.000166", 30),
    postVIP: async function (resilientOracle: any, address: string) {
      const token = new ethers.Contract(address, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "WBTC",
    address: "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
    expectedPrice: parseUnits("105630.64", 28),
    postVIP: async function (resilientOracle: any, address: string) {
      const token = new ethers.Contract(address, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "WETH",
    address: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
    expectedPrice: parseUnits("2548.13", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      const token = new ethers.Contract(address, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "weETH",
    address: "0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe",
    expectedPrice: parseUnits("2721.059411835291415425", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      const token = new ethers.Contract(address, ERC20_ABI, ethers.provider);
      await setMaxStalePeriodInChainlinkOracle(
        CHAINLINK_ORACLE_ARBITRUM,
        token.address,
        "0x20bAe7e1De9c596f5F7615aeaa1342Ba99294e12",
        arbitrumone.NORMAL_TIMELOCK,
      );
    },
  },
  {
    symbol: "wstETH",
    address: "0x5979D7b546E38E414F7E9822514be443A4800529",
    expectedPrice: parseUnits("3065.587592941959238031", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      const token = new ethers.Contract(address, ERC20_ABI, ethers.provider);
      await setMaxStalePeriodInChainlinkOracle(
        CHAINLINK_ORACLE_ARBITRUM,
        token.address,
        "0xB1552C5e96B312d0Bf8b554186F846C40614a540",
        arbitrumone.NORMAL_TIMELOCK,
      );
    },
  },
];

forking(338573922, async () => {
  const provider = ethers.provider;

  await impersonateAccount(arbitrumone.NORMAL_TIMELOCK);
  await setBalance(arbitrumone.NORMAL_TIMELOCK, ethers.utils.parseEther("1000000"));
  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE_ARBITRUM, RESILIENT_ORACLE_ABI, provider);
  const proxyAdmin = new ethers.Contract(DEFAULT_PROXY_ADMIN_ARBITRUM, PROXY_ADMIN_ABI, provider);

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
    for (const { symbol, address, postVIP, expectedPrice } of prices) {
      it(`check ${symbol} price`, async () => {
        const token = new ethers.Contract(address, ERC20_ABI, provider);
        await postVIP(resilientOracle, token.address);
        expect(await resilientOracle.getPrice(token.address)).to.equal(expectedPrice);
      });
    }

    describe("New implementations", () => {
      it("Resilient oracle", async () => {
        expect(await proxyAdmin.getProxyImplementation(RESILIENT_ORACLE_ARBITRUM)).to.equal(
          RESILIENT_ORACLE_IMPLEMENTATION_ARBITRUM,
        );
      });
      it("Chainlink oracle", async () => {
        expect(await proxyAdmin.getProxyImplementation(CHAINLINK_ORACLE_ARBITRUM)).to.equal(
          CHAINLINK_ORACLE_IMPLEMENTATION_ARBITRUM,
        );
      });
      it("RedStone oracle", async () => {
        expect(await proxyAdmin.getProxyImplementation(REDSTONE_ORACLE_ARBITRUM)).to.equal(
          REDSTONE_ORACLE_IMPLEMENTATION_ARBITRUM,
        );
      });
      it("Bound validator", async () => {
        expect(await proxyAdmin.getProxyImplementation(BOUND_VALIDATOR_ARBITRUM)).to.equal(
          BOUND_VALIDATOR_IMPLEMENTATION_ARBITRUM,
        );
      });
    });
  });
});
