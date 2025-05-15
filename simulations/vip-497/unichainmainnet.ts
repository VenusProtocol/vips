import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setRedstonePrice } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip497, {
  BOUND_VALIDATOR_IMPLEMENTATION_UNICHAIN,
  BOUND_VALIDATOR_UNICHAIN,
  DEFAULT_PROXY_ADMIN_UNICHAIN,
  REDSTONE_ORACLE_IMPLEMENTATION_UNICHAIN,
  REDSTONE_ORACLE_UNICHAIN,
  RESILIENT_ORACLE_IMPLEMENTATION_UNICHAIN,
  RESILIENT_ORACLE_UNICHAIN,
} from "../../vips/vip-497/bscmainnet";
import ACM_ABI from "./abi/ACM.json";
import ERC20_ABI from "./abi/ERC20.json";
import PROXY_ABI from "./abi/Proxy.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";
import REDSTONE_ORACLE_ABI from "./abi/RedstoneOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { unichainmainnet } = NETWORK_ADDRESSES;
const ONE_YEAR = 31536000;

const prices = [
  {
    symbol: "USDC",
    address: "0x078D782b760474a361dDA0AF3839290b0EF57AD6",
    expectedPrice: parseUnits("1.00004999", 30),
    preVIP: async function (resilientOracle: any, address: string, redstoneOracle: any) {
      const token = new ethers.Contract(address, ERC20_ABI, ethers.provider);
      const data = await redstoneOracle.tokenConfigs(token.address);
      await setRedstonePrice(REDSTONE_ORACLE_UNICHAIN, address, data.feed, unichainmainnet.NORMAL_TIMELOCK, ONE_YEAR, {
        tokenDecimals: 6,
      });
    },
  },
  {
    symbol: "WETH",
    address: "0x4200000000000000000000000000000000000006",
    expectedPrice: parseUnits("1829.21017888", 18),
    preVIP: async function (resilientOracle: any, address: string, redstoneOracle: any) {
      const token = new ethers.Contract(address, ERC20_ABI, ethers.provider);
      const data = await redstoneOracle.tokenConfigs(token.address);
      await setRedstonePrice(REDSTONE_ORACLE_UNICHAIN, address, data.feed, unichainmainnet.NORMAL_TIMELOCK);
    },
  },
  {
    symbol: "UNI",
    address: "0x8f187aA05619a017077f5308904739877ce9eA21",
    expectedPrice: parseUnits("4.902", 18),
    preVIP: async function (resilientOracle: any, address: string, redstoneOracle: any) {
      const token = new ethers.Contract(address, ERC20_ABI, ethers.provider);
      const data = await redstoneOracle.tokenConfigs(token.address);
      await setRedstonePrice(REDSTONE_ORACLE_UNICHAIN, address, data.feed, unichainmainnet.NORMAL_TIMELOCK);
    },
  },
];

forking(15854623, async () => {
  const provider = ethers.provider;

  await impersonateAccount(unichainmainnet.NORMAL_TIMELOCK);
  await setBalance(unichainmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("1000000"));
  const signer = await ethers.getSigner(unichainmainnet.NORMAL_TIMELOCK);

  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE_UNICHAIN, RESILIENT_ORACLE_ABI, provider);
  const redstoneOracle = new ethers.Contract(REDSTONE_ORACLE_UNICHAIN, REDSTONE_ORACLE_ABI, signer);
  const proxyAdmin = new ethers.Contract(DEFAULT_PROXY_ADMIN_UNICHAIN, PROXY_ADMIN_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    for (const price of prices) {
      it(`check ${price.symbol} price`, async () => {
        if (price.preVIP) {
          await price.preVIP(resilientOracle, price.address, redstoneOracle);
        }
        expect(await resilientOracle.getPrice(price.address)).to.equal(price.expectedPrice);
      });
    }
  });

  testForkedNetworkVipCommands("vip497", await vip497(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PROXY_ABI], ["Upgraded"], [3]);
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
        expect(await proxyAdmin.getProxyImplementation(RESILIENT_ORACLE_UNICHAIN)).to.equal(
          RESILIENT_ORACLE_IMPLEMENTATION_UNICHAIN,
        );
      });
      it("RedStone oracle", async () => {
        expect(await proxyAdmin.getProxyImplementation(REDSTONE_ORACLE_UNICHAIN)).to.equal(
          REDSTONE_ORACLE_IMPLEMENTATION_UNICHAIN,
        );
      });
      it("Bound validator", async () => {
        expect(await proxyAdmin.getProxyImplementation(BOUND_VALIDATOR_UNICHAIN)).to.equal(
          BOUND_VALIDATOR_IMPLEMENTATION_UNICHAIN,
        );
      });
    });
  });
});
