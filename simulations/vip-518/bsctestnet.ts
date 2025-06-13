import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip518, {
  BINANCE_ORACLE_IMPLEMENTATION,
  BNBx,
  BOUND_VALIDATOR,
  BOUND_VALIDATOR_IMPLEMENTATION,
  CHAINLINK_ORACLE_IMPLEMENTATION,
  DEFAULT_PROXY_ADMIN,
  PTsUSDE26JUN2025,
  REDSTONE_ORACLE_IMPLEMENTATION,
  RESILIENT_ORACLE_IMPLEMENTATION,
  ankrBNB,
  asBNB,
  sUSDe,
  slisBNB,
  xSolvBTC,
} from "../../vips/vip-518/bsctestnet";
import ACM_ABI from "./abi/ACM.json";
import PROXY_ABI from "./abi/Proxy.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { bsctestnet } = NETWORK_ADDRESSES;

const prices = [
  {
    symbol: "PT-sUSDE-26JUN2025",
    address: PTsUSDE26JUN2025,
    expectedPrice: parseUnits("0.935", 18),
  },
  {
    symbol: "sUSDe",
    address: sUSDe,
    expectedPrice: parseUnits("1.1", 18),
  },
  {
    symbol: "xSolvBTC",
    address: xSolvBTC,
    expectedPrice: parseUnits("60000", 18),
  },
  {
    symbol: "asBNB",
    address: asBNB,
    expectedPrice: parseUnits("2774.736676365473559991", 18),
  },
  {
    symbol: "BNBx",
    address: BNBx,
    expectedPrice: parseUnits("1229.504731780162934966", 18),
  },
  {
    symbol: "slisBNB",
    address: slisBNB,
    expectedPrice: parseUnits("2774.736676365473559991", 18),
  },
  {
    symbol: "ankrBNB",
    address: ankrBNB,
    expectedPrice: parseUnits("715.14186752308578353", 18),
  },
];

forking(54543355, async () => {
  const provider = ethers.provider;
  const proxyAdmin = new ethers.Contract(DEFAULT_PROXY_ADMIN, PROXY_ADMIN_ABI, provider);

  await impersonateAccount(bsctestnet.NORMAL_TIMELOCK);
  await setBalance(bsctestnet.NORMAL_TIMELOCK, ethers.utils.parseEther("1000000"));
  const resilientOracle = new ethers.Contract(bsctestnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);

  testVip("VIP-518", await vip518(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PROXY_ABI], ["Upgraded"], [5]);
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [7]);
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
        expect(await proxyAdmin.getProxyImplementation(bsctestnet.RESILIENT_ORACLE)).to.equal(
          RESILIENT_ORACLE_IMPLEMENTATION,
        );
      });
      it("Chainlink oracle", async () => {
        expect(await proxyAdmin.getProxyImplementation(bsctestnet.CHAINLINK_ORACLE)).to.equal(
          CHAINLINK_ORACLE_IMPLEMENTATION,
        );
      });
      it("RedStone oracle", async () => {
        expect(await proxyAdmin.getProxyImplementation(bsctestnet.REDSTONE_ORACLE)).to.equal(
          REDSTONE_ORACLE_IMPLEMENTATION,
        );
      });
      it("Binance oracle", async () => {
        expect(await proxyAdmin.getProxyImplementation(bsctestnet.BINANCE_ORACLE)).to.equal(
          BINANCE_ORACLE_IMPLEMENTATION,
        );
      });
      it("Bound validator", async () => {
        expect(await proxyAdmin.getProxyImplementation(BOUND_VALIDATOR)).to.equal(BOUND_VALIDATOR_IMPLEMENTATION);
      });
    });
  });
});
