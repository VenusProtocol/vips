import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriod, setMaxStalePeriodInChainlinkOracle, setRedstonePrice } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip518, {
  BINANCE_ORACLE_IMPLEMENTATION,
  BOUND_VALIDATOR,
  BOUND_VALIDATOR_IMPLEMENTATION,
  CHAINLINK_ORACLE_IMPLEMENTATION,
  DEFAULT_PROXY_ADMIN,
  REDSTONE_ORACLE_IMPLEMENTATION,
  RESILIENT_ORACLE_IMPLEMENTATION,
} from "../../vips/vip-518/bscmainnet";
import ACM_ABI from "./abi/ACM.json";
import ERC20_ABI from "./abi/ERC20.json";
import PROXY_ABI from "./abi/Proxy.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { bscmainnet } = NETWORK_ADDRESSES;
const REDSTONE_BNB_FEED = "0x8dd2D85C7c28F43F965AE4d9545189C7D022ED0e";
const SolvBTC = "0x4aae823a6a0b376De6A78e74eCC5b079d38cBCf7";
export const xSolvBTC_RedStone_Feed = "0x24c8964338Deb5204B096039147B8e8C3AEa42Cc"; // RedStone Price Feed for SolvBTC.BBN_FUNDAMENTAL
export const xSolvBTC = "0x1346b618dC92810EC74163e4c27004c921D446a5";

const prices = [
  {
    symbol: "vslisBNB_LiquidStakedBNB",
    address: "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A",
    expectedPrice: parseUnits("679.232458680906975761", 18),
    preVIP: async function () {
      await setRedstonePrice(
        bscmainnet.REDSTONE_ORACLE,
        "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
        REDSTONE_BNB_FEED,
        bscmainnet.NORMAL_TIMELOCK,
      );
    },
    postVIP: async function (resilientOracle: any) {
      const token = new ethers.Contract("0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB", ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "vBNBx_LiquidStakedBNB",
    address: "0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791",
    expectedPrice: parseUnits("728.119713523375363029", 18),
  },
  {
    symbol: "vasBNB_LiquidStakedBNB",
    address: "0x4A50a0a1c832190362e1491D5bB464b1bc2Bd288",
    expectedPrice: parseUnits("697.048129566730189937", 18),
  },
  {
    symbol: "vankrBNB_LiquidStakedBNB",
    address: "0xBfe25459BA784e70E2D7a718Be99a1f3521cA17f",
    expectedPrice: parseUnits("723.810113538611356903", 18),
  },
  {
    symbol: "vxSolvBTC",
    address: "0xd804dE60aFD05EE6B89aab5D152258fD461B07D5",
    expectedPrice: parseUnits("105398.219535200000000000", 18),
    preVIP: async function () {
      await setMaxStalePeriodInChainlinkOracle(
        bscmainnet.CHAINLINK_ORACLE,
        SolvBTC,
        "0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf", // BTC/USD
        bscmainnet.NORMAL_TIMELOCK,
      );
      await setRedstonePrice(
        bscmainnet.REDSTONE_ORACLE,
        SolvBTC,
        "0xa51738d1937FFc553d5070f43300B385AA2D9F55", // Red stone for solvBTC
        bscmainnet.NORMAL_TIMELOCK,
      );
      await setRedstonePrice(bscmainnet.REDSTONE_ORACLE, xSolvBTC, xSolvBTC_RedStone_Feed, bscmainnet.NORMAL_TIMELOCK);
    },
    postVIP: async function (resilientOracle: any) {
      const token = new ethers.Contract(xSolvBTC, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },

  {
    symbol: "vsUSDe",
    address: "0x699658323d58eE25c69F1a29d476946ab011bD18",
    expectedPrice: parseUnits("1.178344469589636600", 18),
    preVIP: async function () {
      await setRedstonePrice(
        bscmainnet.REDSTONE_ORACLE,
        "0x211cc4dd073734da055fbf44a2b4667d5e5fe5d2",
        "0x5ED849a45B4608952161f45483F4B95BCEa7f8f0",
        bscmainnet.NORMAL_TIMELOCK,
      );
      await setMaxStalePeriodInChainlinkOracle(
        bscmainnet.CHAINLINK_ORACLE,
        "0x211cc4dd073734da055fbf44a2b4667d5e5fe5d2", // sUSDe
        "0x1a269eA1b209DA2c12bDCDab22635C9e6C5028B2", // SUSDE / USDE Exchange Rate
        bscmainnet.NORMAL_TIMELOCK,
      );
      await setRedstonePrice(
        bscmainnet.REDSTONE_ORACLE,
        "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34",
        "0x0d9b42a2a73Ec528759701D0B70Ccf974a327EBb",
        bscmainnet.NORMAL_TIMELOCK,
      ); // RedStone Price Feed for USDe
      await setMaxStalePeriodInChainlinkOracle(
        bscmainnet.CHAINLINK_ORACLE,
        "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34", // USDe
        "0x10402B01cD2E6A9ed6DBe683CbC68f78Ff02f8FC", // USDE / USD  Exchange Rate
        bscmainnet.NORMAL_TIMELOCK,
      );
    },

    postVIP: async function (resilientOracle: any) {
      const token = new ethers.Contract("0x211cc4dd073734da055fbf44a2b4667d5e5fe5d2", ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  // {
  //   symbol: "vPT-sUSDE-26JUN2025",
  //   address: "0x9e4E5fed5Ac5B9F732d0D850A615206330Bf1866",
  //   expectedPrice: parseUnits("0.997740027134182571", 18),
  // }
];

forking(51372289, async () => {
  const provider = ethers.provider;
  const resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  const proxyAdmin = new ethers.Contract(DEFAULT_PROXY_ADMIN, PROXY_ADMIN_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    for (const price of prices) {
      it(`check ${price.symbol} price`, async () => {
        if (price.preVIP) {
          await price.preVIP();
        }
        expect(await resilientOracle.getUnderlyingPrice(price.address)).to.equal(price.expectedPrice);
      });
    }
  });

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
          await price.postVIP(resilientOracle);
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
