import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { vip003 } from "../../../proposals/vip-003/vip-003-sepolia";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const { sepolia } = NETWORK_ADDRESSES;

const RESILIENT_ORACLE = sepolia.RESILIENT_ORACLE;
const CHAINLINK_ORACLE = sepolia.CHAINLINK_ORACLE;
const REDSTONE_ORACLE = sepolia.REDSTONE_ORACLE;
const NORMAL_TIMELOCK = sepolia.NORMAL_TIMELOCK;
const BOUND_VALIDATOR = sepolia.BOUND_VALIDATOR;

interface AssetConfig {
  name: string;
  address: string;
  price: string;
  feed: string;
  oracle: string;
}

interface AssetDirectPriceConfig {
  name: string;
  address: string;
  price: string;
}

const assetConfigs: AssetConfig[] = [
  {
    name: "WBTC",
    address: "0x92A2928f5634BEa89A195e7BeCF0f0FEEDAB885b",
    price: "364945263073900",
    feed: "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43",
    oracle: "chainlink",
  },
  {
    name: "WETH",
    address: "0x700868CAbb60e90d77B6588ce072d9859ec8E281",
    price: "2016.06622358",
    feed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    oracle: "chainlink",
  },
  {
    name: "USDC",
    address: "0x772d68929655ce7234C8C94256526ddA66Ef641E",
    price: "1000000000000", // 1e12 (18-6 decimals returned from oracle)
    feed: "0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E",
    oracle: "chainlink",
  },
  {
    name: "XVS",
    address: "0xdb633c11d3f9e6b8d17ac2c972c9e3b05da59bf9",
    price: "6.46900867",
    feed: "0x0d7697a15bce933cE8671Ba3D60ab062dA216C60",
    oracle: "redstone",
  },
];

const directAssetPriceConfigs: AssetDirectPriceConfig[] = [
  {
    name: "USDT",
    address: "0x8d412FD0bc5d826615065B931171Eed10F5AF266",
    price: "1000000000000", // 1e12 (18-6 decimals returned from oracle)
  },
  {
    name: "CRV",
    address: "0x2c78EF7eab67A6e0C9cAa6f2821929351bdDF3d3",
    price: "0.5",
  },
  {
    name: "crvUSD",
    address: "0x36421d873abCa3E2bE6BB3c819C0CF26374F63b6",
    price: "1", // 1$
  },
];

forking(4744200, () => {
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
      for (let i = 0; i < directAssetPriceConfigs.length; i++) {
        const assetConfig = directAssetPriceConfigs[i];
        await expect(resilientOracle.getPrice(assetConfig.address)).to.be.revertedWith(
          "invalid resilient oracle price",
        );
      }
    });
  });
  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vip003());
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
        expect(price).to.be.equal(parseUnits(assetConfig.price, 18));
      }

      for (let i = 0; i < directAssetPriceConfigs.length; i++) {
        const assetConfig = directAssetPriceConfigs[i];
        const price = await resilientOracle.getPrice(assetConfig.address);
        expect(price).to.be.equal(parseUnits(assetConfig.price, 18));
      }
    });
  });
});
