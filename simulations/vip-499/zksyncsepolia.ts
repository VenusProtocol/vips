import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip491, { 
  CHAINLINK_ORACLE_ZKSYNC_SEPOLIA, 
  RESILIENT_ORACLE_ZKSYNC_SEPOLIA, 
  DEFAULT_PROXY_ADMIN_ZKSYNC_SEPOLIA,
  RESILIENT_ORACLE_IMPLEMENTATION_ZKSYNC_SEPOLIA,
  CHAINLINK_ORACLE_IMPLEMENTATION_ZKSYNC_SEPOLIA,
  REDSTONE_ORACLE_IMPLEMENTATION_ZKSYNC_SEPOLIA,
  BOUND_VALIDATOR_IMPLEMENTATION_ZKSYNC_SEPOLIA,
  BOUND_VALIDATOR_ZKSYNC_SEPOLIA,
  REDSTONE_ORACLE_ZKSYNC_SEPOLIA 
 } from "../../vips/vip-499/bsctestnet";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import ERC20_ABI from "./abi/ERC20.json";
import ACM_ABI from "./abi/ACM.json";
import PROXY_ABI from "./abi/Proxy.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";
import { expectEvents } from "src/utils";

const { zksyncsepolia } = NETWORK_ADDRESSES;

const prices = [
  {
    symbol: "USDC",
    address: "0x512F8b4a3c466a30e8c9BAC9c64638dd710968c2",
    expectedPrice: parseUnits("1.00007109", 30),
  },
  {
    symbol: "USDC.e",
    address: "0xF98780C8a0843829f98e624d83C3FfDDf43BE984",
    expectedPrice: parseUnits("1.00007109", 30),
  },
  {
    symbol: "USDT",
    address: "0x9Bf62C9C6AaB7AB8e01271f0d7A401306579709B",
    expectedPrice: parseUnits("1.00011", 30),
  },
  {
    symbol: "WBTC",
    address: "0xeF891B3FA37FfD83Ce8cC7b682E4CADBD8fFc6F0",
    expectedPrice: parseUnits("102900.2031", 28),
  },
  {
    symbol: "WETH",
    address: "0x53F7e72C7ac55b44c7cd73cC13D4EF4b121678e6",
    expectedPrice: parseUnits("2340.22575314", 18),
  },
  {
    symbol: "wstETH",
    address: "0x8507bb4F4f0915D05432011E384850B65a7FCcD1",
    expectedPrice: parseUnits("2574.248328454", 18),
  },
  {
    symbol: "wUSDM",
    address: "0x0b3C8fB109f144f6296bF4Ac52F191181bEa003a",
    expectedPrice: parseUnits("1.1", 18),
  },
  {
    symbol: "ZK",
    address: "0x8A2E9048F5d658E88D6eD89DdD1F3B5cA0250B9F",
    expectedPrice: parseUnits("0.2", 18),
  },
  {
    symbol: "ZKETH",
    address: "0x13231E8B60BE0900fB3a3E9dc52C2b39FA4794df",
    expectedPrice: parseUnits("2351.9268819057", 18),
  },
]

forking(151083977, async () => {
  const provider = ethers.provider;

  await impersonateAccount(zksyncsepolia.NORMAL_TIMELOCK);
  await setBalance(zksyncsepolia.NORMAL_TIMELOCK, ethers.utils.parseEther("1000000"));
  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE_ZKSYNC_SEPOLIA, RESILIENT_ORACLE_ABI, provider);
  const proxyAdmin = new ethers.Contract(DEFAULT_PROXY_ADMIN_ZKSYNC_SEPOLIA, PROXY_ADMIN_ABI, provider);

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
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [3]);
      await expectEvents(txResponse, [ACM_ABI], ["PermissionGranted"], [9]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    for (const { symbol, address, expectedPrice } of prices) {
      it(`check ${symbol} price`, async () => {
        expect(await resilientOracle.getPrice(address)).to.equal(expectedPrice);
      });
    }

    describe("New implementations", () => {
      it("Resilient oracle", async () => {
        expect(await proxyAdmin.getProxyImplementation(RESILIENT_ORACLE_ZKSYNC_SEPOLIA)).to.equal(
          RESILIENT_ORACLE_IMPLEMENTATION_ZKSYNC_SEPOLIA,
        );
      });
      it("Chainlink oracle", async () => {
        expect(await proxyAdmin.getProxyImplementation(CHAINLINK_ORACLE_ZKSYNC_SEPOLIA)).to.equal(
          CHAINLINK_ORACLE_IMPLEMENTATION_ZKSYNC_SEPOLIA,
        );
      });
      it("RedStone oracle", async () => {
        expect(await proxyAdmin.getProxyImplementation(REDSTONE_ORACLE_ZKSYNC_SEPOLIA)).to.equal(
          REDSTONE_ORACLE_IMPLEMENTATION_ZKSYNC_SEPOLIA,
        );
      });
      it("Bound validator", async () => {
        expect(await proxyAdmin.getProxyImplementation(BOUND_VALIDATOR_ZKSYNC_SEPOLIA)).to.equal(
          BOUND_VALIDATOR_IMPLEMENTATION_ZKSYNC_SEPOLIA,
        );
      });
    });
  });
});
