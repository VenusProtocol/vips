import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriod, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip491, { 
  CHAINLINK_ORACLE_ZKSYNC, 
  RESILIENT_ORACLE_ZKSYNC, 
  DEFAULT_PROXY_ADMIN_ZKSYNC,
  RESILIENT_ORACLE_IMPLEMENTATION_ZKSYNC,
  CHAINLINK_ORACLE_IMPLEMENTATION_ZKSYNC,
  REDSTONE_ORACLE_IMPLEMENTATION_ZKSYNC,
  BOUND_VALIDATOR_IMPLEMENTATION_ZKSYNC,
  BOUND_VALIDATOR_ZKSYNC,
  REDSTONE_ORACLE_ZKSYNC 
} from "../../vips/vip-499/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import ACM_ABI from "./abi/ACM.json";
import PROXY_ABI from "./abi/Proxy.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";

const { zksyncmainnet } = NETWORK_ADDRESSES;

const prices = [
  {
    symbol: "USDC",
    address: "0x1d17CBcF0D6D143135aE902365D2E5e2A16538D4",
    expectedPrice: parseUnits("1.00001", 30),
    postVIP: async function (resilientOracle: any, address: string) {
      const token = new ethers.Contract(address, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "USDC.e",
    address: "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4",
    expectedPrice: parseUnits("1.00001", 30),
    postVIP: async function (resilientOracle: any, address: string) {
      const token = new ethers.Contract(address, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "USDT",
    address: "0x499257fD37EDB34451f62EDf8D2a0C418852bA4C",
    expectedPrice: parseUnits("0.99980003", 30),
    postVIP: async function (resilientOracle: any, address: string) {
      const token = new ethers.Contract(address, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "WBTC",
    address: "0xBBeB516fb02a01611cBBE0453Fe3c580D7281011",
    expectedPrice: parseUnits("102953.39604417", 28),
    postVIP: async function (resilientOracle: any, address: string) {
      const token = new ethers.Contract(address, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "WETH",
    address: "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91",
    expectedPrice: parseUnits("2349.721224", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      const token = new ethers.Contract(address, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "wstETH",
    address: "0x703b52F2b28fEbcB60E1372858AF5b18849FE867",
    expectedPrice: parseUnits("2824.373206537034846170",
      18,
    ),
    postVIP: async function (resilientOracle: any, address: string) {
      const token = new ethers.Contract(address, ERC20_ABI, ethers.provider);
      await setMaxStalePeriodInChainlinkOracle(
        CHAINLINK_ORACLE_ZKSYNC,
        token.address,
        "0x24a0C9404101A8d7497676BE12F10aEa356bAC28",
        zksyncmainnet.NORMAL_TIMELOCK,
      );
    },
  },
  {
    symbol: "wUSDM",
    address: "0xA900cbE7739c96D2B153a273953620A701d5442b",
    expectedPrice: parseUnits("1.077968786387565675", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      const token = new ethers.Contract(address, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "ZK",
    address: "0x5A7d6b2F92C77FAD6CCaBd7EE0624E64907Eaf3E",
    expectedPrice: parseUnits("0.06927599", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      await setMaxStalePeriodInChainlinkOracle(
        CHAINLINK_ORACLE_ZKSYNC,
        "0x5A7d6b2F92C77FAD6CCaBd7EE0624E64907Eaf3E",
        "0xD1ce60dc8AE060DDD17cA8716C96f193bC88DD13",
        zksyncmainnet.NORMAL_TIMELOCK,
      );
    },
  },
  {
    symbol: "ZKETH",
    address: "0xb72207E1FB50f341415999732A20B6D25d8127aa",
    expectedPrice: parseUnits("2377.483532024740812381", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      const token = new ethers.Contract(address, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
]

forking(151083977, async () => {
  const provider = ethers.provider;

  await impersonateAccount(zksyncmainnet.NORMAL_TIMELOCK);
  await setBalance(zksyncmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("1000000"));
  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE_ZKSYNC, RESILIENT_ORACLE_ABI, provider);
  const proxyAdmin = new ethers.Contract(DEFAULT_PROXY_ADMIN_ZKSYNC, PROXY_ADMIN_ABI, provider);

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
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [2]);
      await expectEvents(txResponse, [ACM_ABI], ["PermissionGranted"], [9]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    for (const price of prices) {
      it(`check ${price.symbol} price`, async () => {
        const token = new ethers.Contract(price.address, ERC20_ABI, provider);
        await price.postVIP(resilientOracle, token.address);
        expect(await resilientOracle.getPrice(token.address)).to.equal(price.expectedPrice);
      });
    }

    describe("New implementations", () => {
      it("Resilient oracle", async () => {
        expect(await proxyAdmin.getProxyImplementation(RESILIENT_ORACLE_ZKSYNC)).to.equal(
          RESILIENT_ORACLE_IMPLEMENTATION_ZKSYNC,
        );
      });
      it("Chainlink oracle", async () => {
        expect(await proxyAdmin.getProxyImplementation(CHAINLINK_ORACLE_ZKSYNC)).to.equal(
          CHAINLINK_ORACLE_IMPLEMENTATION_ZKSYNC,
        );
      });
      it("RedStone oracle", async () => {
        expect(await proxyAdmin.getProxyImplementation(REDSTONE_ORACLE_ZKSYNC)).to.equal(
          REDSTONE_ORACLE_IMPLEMENTATION_ZKSYNC,
        );
      });
      it("Bound validator", async () => {
        expect(await proxyAdmin.getProxyImplementation(BOUND_VALIDATOR_ZKSYNC)).to.equal(
          BOUND_VALIDATOR_IMPLEMENTATION_ZKSYNC,
        );
      });
    });
  });
});
