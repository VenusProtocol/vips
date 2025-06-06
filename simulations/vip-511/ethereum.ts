import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { setMaxStalePeriod, setMaxStalePeriodInChainlinkOracle, setRedstonePrice } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip511 from "../../vips/vip-511/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import VTOKEN_ABI from "./abi/VToken.json";

const { ethereum } = NETWORK_ADDRESSES;

const prices = [
  {
    symbol: "vWETH",
    address: "0x7c8ff7d2A1372433726f879BD945fFb250B94c65",
    expectedPrice: parseUnits("2475.79", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      const vtoken = new ethers.Contract(address, VTOKEN_ABI, ethers.provider);
      const underlying = await vtoken.underlying();
      const token = new ethers.Contract(underlying, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "vweETHs",
    address: "0xc42E4bfb996ED35235bda505430cBE404Eb49F77",
    expectedPrice: parseUnits("2543.558951557850695919", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      const vtoken = new ethers.Contract(address, VTOKEN_ABI, ethers.provider);
      const underlying = await vtoken.underlying();
      const token = new ethers.Contract(underlying, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "vPT-sUSDE",
    address: "0xCca202a95E8096315E3F19E46e19E1b326634889",
    expectedPrice: parseUnits("1.0013723", 18),
    expectedPriceAfterVIP: parseUnits("1.0013723", 18),
    postVIP: async function () {
      await setMaxStalePeriodInChainlinkOracle(
        ethereum.CHAINLINK_ORACLE,
        "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3",
        "0xa569d910839Ae8865Da8F8e70FfFb0cBA869F961",
        ethereum.NORMAL_TIMELOCK,
      );
    },
  },
  {
    symbol: "vPT-USDe",
    address: "0x62D9E2010Cff87Bae05B91d5E04605ef864ABc3B",
    expectedPrice: parseUnits("1.0013723", 18),
    expectedPriceAfterVIP: parseUnits("1.0013723", 18),
  },
  {
    symbol: "vsUSDe",
    address: "0x0792b9c60C728C1D2Fd6665b3D7A08762a9b28e0",
    expectedPrice: parseUnits("1.177824836694072347", 18),
    expectedPriceAfterVIP: parseUnits("1.177861078815923193", 18),
  },
  {
    symbol: "vezETH",
    address: "0xA854D35664c658280fFf27B6eDC6C4195c3229B3",
    expectedPrice: parseUnits("2604.1954123918", 18),
    expectedPriceAfterVIP: parseUnits("2604.1954123918", 18),
    postVIP: async function () {
      await setMaxStalePeriodInChainlinkOracle(
        ethereum.CHAINLINK_ORACLE,
        "0xbf5495Efe5DB9ce00f80364C8B423567e58d2110",
        "0x636A000262F6aA9e1F094ABF0aD8f645C44f641C",
        ethereum.NORMAL_TIMELOCK,
      );
    },
  },
  {
    symbol: "vPT-weETH",
    address: "0x76697f8eaeA4bE01C678376aAb97498Ee8f80D5C",
    expectedPrice: parseUnits("2475.79", 18),
    postVIP: async function (resilientOracle: any, address: string) {
      const vtoken = new ethers.Contract(address, VTOKEN_ABI, ethers.provider);
      const underlying = await vtoken.underlying();
      const token = new ethers.Contract(underlying, ERC20_ABI, ethers.provider);
      await setMaxStalePeriod(resilientOracle, token);
    },
  },
  {
    symbol: "vpufETH",
    address: "0xE0ee5dDeBFe0abe0a4Af50299D68b74Cec31668e",
    expectedPrice: parseUnits("2598.2423010631", 18),
    preVIP: async function () {
      await setRedstonePrice(
        ethereum.REDSTONE_ORACLE,
        "0xD9A442856C234a39a81a089C06451EBAa4306a72",
        "0x76A495b0bFfb53ef3F0E94ef0763e03cE410835C",
        ethereum.NORMAL_TIMELOCK,
      );
    },
  },
  {
    symbol: "vweETH",
    address: "0xb4933AF59868986316Ed37fa865C829Eba2df0C7",
    expectedPrice: parseUnits("2647.131312257631374177", 18),
  },
];

forking(22644795, async () => {
  const provider = ethers.provider;

  await impersonateAccount(ethereum.NORMAL_TIMELOCK);
  await setBalance(ethereum.NORMAL_TIMELOCK, ethers.utils.parseEther("1000000"));
  const resilientOracle = new ethers.Contract(ethereum.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
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

  testForkedNetworkVipCommands("vip511", await vip511());

  describe("Post-VIP behaviour", async () => {
    for (const price of prices) {
      it(`check ${price.symbol} price`, async () => {
        if (price.postVIP) {
          await price.postVIP(resilientOracle, price.address);
        }
        expect(await resilientOracle.getUnderlyingPrice(price.address)).to.equal(
          price.expectedPriceAfterVIP || price.expectedPrice,
        );
      });
    }
  });
});
