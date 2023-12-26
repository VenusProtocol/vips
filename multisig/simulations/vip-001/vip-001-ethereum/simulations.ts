import { expect } from "chai";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { vip001 } from "../../../proposals/vip-001/vip-001-ethereum";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const RESILIENT_ORACLE = "0xd2ce3fb018805ef92b8C5976cb31F84b4E295F94";
const CHAINLINK_ORACLE = "0x94c3A2d6B7B2c051aDa041282aec5B0752F8A1F2";
const REDSTONE_ORACLE = "0x0FC8001B2c9Ec90352A46093130e284de5889C86";
const NORMAL_TIMELOCK = "0x285960C5B22fD66A736C7136967A3eB15e93CC67";
const BOUND_VALIDATOR = "0x1Cd5f336A1d28Dff445619CC63d3A0329B4d8a58";

interface AssetConfig {
  name: string;
  address: string;
  price: string;
}

const assetConfigs: AssetConfig[] = [
  {
    name: "WBTC",
    address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    price: "431380000000000000000000000000000", // 1e28 (36 - 8 decimals returned from oracle)
  },
  {
    name: "WETH",
    address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    price: "2235685478000000000000", // 1e18 (36 - 18 decimals returned from oracle)
  },
  {
    name: "USDC",
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    price: "1000072600000000000000000000000", // 1e30 (36 - 6 decimals returned from oracle)
  },
  {
    name: "USDT",
    address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    price: "999905710000000000000000000000", // 1e30 (36 - 6 decimals returned from oracle)
  },
  {
    name: "CRV",
    address: "0xD533a949740bb3306d119CC777fa900bA034cd52",
    price: "620944260000000000", // 1e18 (36 - 18 decimals returned from oracle)
  },
  {
    name: "crvUSD",
    address: "0xf939e0a03fb07f59a73314e73794be0e57ac1b4e",
    price: "994950040000000000", // 1e18 (36 - 18 decimals returned from oracle)
  },
];

forking(18733570, () => {
  const provider = ethers.provider;
  let resilientOracle: ethers.Contract;
  let redstoneOracle: ethers.Contract;
  let chainLinkOracle: ethers.Contract;
  let boundValidator: ethers.Contract;

  describe("Pre-VIP behavior", async () => {
    before(async () => {
      resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
      redstoneOracle = new ethers.Contract(REDSTONE_ORACLE, CHAINLINK_ORACLE_ABI, provider);
      chainLinkOracle = new ethers.Contract(CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, provider);
      boundValidator = new ethers.Contract(BOUND_VALIDATOR, BOUND_VALIDATOR_ABI, provider);
    });
    it("correct pending owner", async () => {
      expect(await resilientOracle.pendingOwner()).to.equal(NORMAL_TIMELOCK);
      expect(await redstoneOracle.pendingOwner()).to.equal(NORMAL_TIMELOCK);
      expect(await chainLinkOracle.pendingOwner()).to.equal(NORMAL_TIMELOCK);
      expect(await boundValidator.pendingOwner()).to.equal(NORMAL_TIMELOCK);
    });
    it("should revert for unconfigured asset price request", async () => {
      for (let i = 0; i < assetConfigs.length; i++) {
        const assetConfig = assetConfigs[i];
        await expect(resilientOracle.getPrice(assetConfig.address)).to.be.revertedWith(
          "invalid resilient oracle price",
        );
      }
    });
  });
  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vip001());
    });
    it("correct owner", async () => {
      expect(await resilientOracle.owner()).to.equal(NORMAL_TIMELOCK);
      expect(await redstoneOracle.owner()).to.equal(NORMAL_TIMELOCK);
      expect(await chainLinkOracle.owner()).to.equal(NORMAL_TIMELOCK);
      expect(await boundValidator.owner()).to.equal(NORMAL_TIMELOCK);
    });
    it("validate asset prices", async () => {
      for (let i = 0; i < assetConfigs.length; i++) {
        const assetConfig = assetConfigs[i];
        const price = await resilientOracle.getPrice(assetConfig.address);
        expect(price).to.be.equal(assetConfig.price);
      }
    });
  });
});
