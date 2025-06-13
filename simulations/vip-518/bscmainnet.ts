import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriod } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip518, {
  BINANCE_ORACLE_IMPLEMENTATION,
  BOUND_VALIDATOR,
  BOUND_VALIDATOR_IMPLEMENTATION,
  CHAINLINK_ORACLE_IMPLEMENTATION,
  DEFAULT_PROXY_ADMIN,
  PTsUSDE_26JUN2025,
  REDSTONE_ORACLE_IMPLEMENTATION,
  RESILIENT_ORACLE_IMPLEMENTATION,
  SUSDE,
  XSOLVBTC,
} from "../../vips/vip-518/bscmainnet";
import ACM_ABI from "./abi/ACM.json";
import ERC20_ABI from "./abi/ERC20.json";
import PROXY_ABI from "./abi/Proxy.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import VTOKEN_ABI from "./abi/VToken.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const prices = [
  {
    symbol: "vslisBNB_LiquidStakedBNB",
    address: "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A",
    expectedPrice: parseUnits("1.12284689", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      const vtoken = new ethers.Contract(address, VTOKEN_ABI, ethers.provider);
      const underlying = await vtoken.underlying();
      console.log("Underlying token address:", underlying);
      const token = new ethers.Contract(underlying, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "vBNBx_LiquidStakedBNB",
    address: "0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791",
    expectedPrice: parseUnits("0.74698", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      const vtoken = new ethers.Contract(address, VTOKEN_ABI, ethers.provider);
      const underlying = await vtoken.underlying();
      console.log("Underlying token address:", underlying);
      const token = new ethers.Contract(underlying, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "vasBNB_LiquidStakedBNB",
    address: "0x4A50a0a1c832190362e1491D5bB464b1bc2Bd288",
    expectedPrice: parseUnits("0.99960456", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      const vtoken = new ethers.Contract(address, VTOKEN_ABI, ethers.provider);
      const underlying = await vtoken.underlying();
      const token = new ethers.Contract(underlying, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "vankrBNB_LiquidStakedBNB",
    address: "0xBfe25459BA784e70E2D7a718Be99a1f3521cA17f",
    expectedPrice: parseUnits("0.99995684", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      const vtoken = new ethers.Contract(address, VTOKEN_ABI, ethers.provider);
      const underlying = await vtoken.underlying();
      const token = new ethers.Contract(underlying, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "xSolvBTC",
    address: XSOLVBTC,
    expectedPrice: parseUnits("2844.085421477404790808", 18),
  },
  {
    symbol: "sUSDe",
    address: SUSDE,
    expectedPrice: parseUnits("3204.385384786432008563", 18),
  },
  {
    symbol: "PT-sUSDE-26JUN2025",
    address: PTsUSDE_26JUN2025,
    expectedPrice: parseUnits("3204.385384786432008563", 18),
  },
];

forking(51372289, async () => {
  const provider = ethers.provider;
  const resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  const proxyAdmin = new ethers.Contract(DEFAULT_PROXY_ADMIN, PROXY_ADMIN_ABI, provider);

  testVip("VIP-518", await vip518(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PROXY_ABI], ["Upgraded"], [5]);
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [7]);
      await expectEvents(txResponse, [ACM_ABI], ["RoleGranted"], [9]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    for (const price of prices) {
      it(`check ${price.symbol} price`, async () => {
        if (price.postVIP) {
          await price.postVIP(resilientOracle, price.address);
        }
        expect(await resilientOracle.getUnderlyingPrice(price.address)).to.equal(price.expectedPrice);
      });
    }

    describe("New implementations", () => {
      it("Resilient oracle", async () => {
        expect(await proxyAdmin.getProxyImplementation(bscmainnet.RESILIENT_ORACLE)).to.equal(
          RESILIENT_ORACLE_IMPLEMENTATION,
        );
      });
      it("Chainlink oracle", async () => {
        expect(await proxyAdmin.getProxyImplementation(bscmainnet.CHAINLINK_ORACLE)).to.equal(
          CHAINLINK_ORACLE_IMPLEMENTATION,
        );
      });
      it("RedStone oracle", async () => {
        expect(await proxyAdmin.getProxyImplementation(bscmainnet.REDSTONE_ORACLE)).to.equal(
          REDSTONE_ORACLE_IMPLEMENTATION,
        );
      });
      it("Binance oracle", async () => {
        expect(await proxyAdmin.getProxyImplementation(bscmainnet.BINANCE_ORACLE)).to.equal(
          BINANCE_ORACLE_IMPLEMENTATION,
        );
      });
      it("Bound validator", async () => {
        expect(await proxyAdmin.getProxyImplementation(BOUND_VALIDATOR)).to.equal(BOUND_VALIDATOR_IMPLEMENTATION);
      });
    });
  });
});
