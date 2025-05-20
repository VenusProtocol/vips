import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriod } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip491, { 
  CHAINLINK_ORACLE_ARBITRUM_SEPOLIA, 
  RESILIENT_ORACLE_ARBITRUM_SEPOLIA, 
  DEFAULT_PROXY_ADMIN_ARBITRUM_SEPOLIA,
  RESILIENT_ORACLE_IMPLEMENTATION_ARBITRUM_SEPOLIA,
  CHAINLINK_ORACLE_IMPLEMENTATION_ARBITRUM_SEPOLIA,
  REDSTONE_ORACLE_IMPLEMENTATION_ARBITRUM_SEPOLIA,
  BOUND_VALIDATOR_IMPLEMENTATION_ARBITRUM_SEPOLIA,
  BOUND_VALIDATOR_ARBITRUM_SEPOLIA,
  REDSTONE_ORACLE_ARBITRUM_SEPOLIA
} from "../../vips/vip-499/bsctestnet";
import ERC20_ABI from "./abi/ERC20.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import ACM_ABI from "./abi/ACM.json";
import PROXY_ABI from "./abi/Proxy.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

const prices = [
  {
    symbol: "ARB",
    address: "0x4371bb358aB5cC192E481543417D2F67b8781731",
    expectedPrice: parseUnits("0.39084773", 18),
    preVIP: async function (resilientOracle: any, address: string) {
      const token = new ethers.Contract(address, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    }
  },
  {
    symbol: "gmBTC",
    address: "0xbd3AAd064295dcA0f45fab4C6A5adFb0D23a19D2",
    expectedPrice: parseUnits("2.32639502", 18),
  },
  {
    symbol: "gmETH",
    address: "0x0012875a7395a293Adfc9b5cDC2Cfa352C4cDcD3",
    expectedPrice: parseUnits("1.75254694", 18),
  },
  {
    symbol: "USDC",
    address: "0x86f096B1D970990091319835faF3Ee011708eAe8",
    expectedPrice: parseUnits("0.999911", 30),
  },
  {
    symbol: "USDT",
    address: "0xf3118a17863996B9F2A073c9A66Faaa664355cf8",
    expectedPrice: parseUnits("1.0002295", 30),
  },
  {
    symbol: "WBTC",
    address: "0xFb8d93FD3Cf18386a5564bb5619cD1FdB130dF7D",
    expectedPrice: parseUnits("105607.687254", 28),
    preVIP: async function (resilientOracle: any, address: string) {
      const token = new ethers.Contract(address, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    }
  },
  {
    symbol: "WETH",
    address: "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73",
    expectedPrice: parseUnits("2517.25424563", 18),
    preVIP: async function (resilientOracle: any, address: string) {
      const token = new ethers.Contract(address, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    }
  },
  {
    symbol: "weETH",
    address: "0x243141DBff86BbB0a082d790fdC21A6ff615Fa34",
    expectedPrice: parseUnits("2768.979670193", 18),
  },
  {
    symbol: "wstETH",
    address: "0x4A9dc15aA6094eF2c7eb9d9390Ac1d71f9406fAE",
    expectedPrice: parseUnits("2768.979670193", 18),
  }
]

forking(154837898, async () => {
  const provider = ethers.provider;

  await impersonateAccount(arbitrumsepolia.NORMAL_TIMELOCK);
  await setBalance(arbitrumsepolia.NORMAL_TIMELOCK, ethers.utils.parseEther("1000000"));
  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE_ARBITRUM_SEPOLIA, RESILIENT_ORACLE_ABI, provider);
  const proxyAdmin = new ethers.Contract(DEFAULT_PROXY_ADMIN_ARBITRUM_SEPOLIA, PROXY_ADMIN_ABI, provider);
  describe("Pre-VIP behaviour", async () => {
    for (const price of prices) {
      it(`check ${price.symbol} price`, async () => {
        if (price.preVIP) {
          await price.preVIP(resilientOracle, price.address);
        }
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
        expect(await resilientOracle.getPrice(price.address)).to.equal(price.expectedPrice);
      });
    }

    describe("New implementations", () => {
          it("Resilient oracle", async () => {
            expect(await proxyAdmin.getProxyImplementation(RESILIENT_ORACLE_ARBITRUM_SEPOLIA)).to.equal(
              RESILIENT_ORACLE_IMPLEMENTATION_ARBITRUM_SEPOLIA,
            );
          });
          it("Chainlink oracle", async () => {
            expect(await proxyAdmin.getProxyImplementation(CHAINLINK_ORACLE_ARBITRUM_SEPOLIA)).to.equal(
              CHAINLINK_ORACLE_IMPLEMENTATION_ARBITRUM_SEPOLIA,
            );
          });
          it("RedStone oracle", async () => {
            expect(await proxyAdmin.getProxyImplementation(REDSTONE_ORACLE_ARBITRUM_SEPOLIA)).to.equal(
              REDSTONE_ORACLE_IMPLEMENTATION_ARBITRUM_SEPOLIA,
            );
          });
          it("Bound validator", async () => {
            expect(await proxyAdmin.getProxyImplementation(BOUND_VALIDATOR_ARBITRUM_SEPOLIA)).to.equal(
              BOUND_VALIDATOR_IMPLEMENTATION_ARBITRUM_SEPOLIA,
            );
          });
        });
  });
});
