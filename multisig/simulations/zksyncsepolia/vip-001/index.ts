import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip001 from "../../../proposals/zksyncsepolia/vip-001";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const { zksyncsepolia } = NETWORK_ADDRESSES;

const RESILIENT_ORACLE = zksyncsepolia.RESILIENT_ORACLE;
const CHAINLINK_ORACLE = zksyncsepolia.CHAINLINK_ORACLE;
const REDSTONE_ORACLE = "0x3af097f1Dcec172D5ECdD0D1eFA6B118FF15f152";
const GUARDIAN = zksyncsepolia.GUARDIAN;
const BOUND_VALIDATOR = "0x0A4daBeF41C83Af7e30FfC33feC56ba769f3D24b";

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
    address: "0xeF891B3FA37FfD83Ce8cC7b682E4CADBD8fFc6F0",
    price: "664950000000000",
    feed: "0x95Bc57e794aeb02E4a16eff406147f3ce2531F83",
    oracle: "chainlink",
  },
  {
    name: "WETH",
    address: "0x53F7e72C7ac55b44c7cd73cC13D4EF4b121678e6",
    price: "3315.90563553",
    feed: "0xfEefF7c3fB57d18C5C6Cdd71e45D2D0b4F9377bF",
    oracle: "chainlink",
  },
  {
    name: "USDC",
    address: "0xF98780C8a0843829f98e624d83C3FfDDf43BE984",
    price: "999976210000",
    feed: "0x1844478CA634f3a762a2E71E3386837Bd50C947F",
    oracle: "chainlink",
  },
  {
    name: "USDT",
    address: "0x9Bf62C9C6AaB7AB8e01271f0d7A401306579709B",
    price: "999800000000",
    feed: "0x07F05C2aFeb54b68Ea425CAbCcbF53E2d5605d76",
    oracle: "chainlink",
  },
];

const directAssetPriceConfigs: AssetDirectPriceConfig[] = [
  {
    name: "ZK",
    address: "0x8A2E9048F5d658E88D6eD89DdD1F3B5cA0250B9F",
    price: "0.2", // 0.2$
  },
  {
    name: "XVS",
    address: "0x3AeCac43A2ebe5D8184e650403bf9F656F9D1cfA",
    price: "7", // 7$
  },
];

forking(3551612, async () => {
  const provider = ethers.provider;
  let resilientOracle: Contract;
  let redstoneOracle: Contract;
  let chainLinkOracle: Contract;
  let boundValidator: Contract;

  describe("Pre-VIP behavior", async () => {
    before(async () => {
      resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
      redstoneOracle = new ethers.Contract(REDSTONE_ORACLE, CHAINLINK_ORACLE_ABI, provider);
      chainLinkOracle = new ethers.Contract(CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, provider);
      boundValidator = new ethers.Contract(BOUND_VALIDATOR, BOUND_VALIDATOR_ABI, provider);
    });
    it("correct pending owner", async () => {
      expect(await resilientOracle.pendingOwner()).to.equal(GUARDIAN);
      expect(await redstoneOracle.pendingOwner()).to.equal(GUARDIAN);
      expect(await chainLinkOracle.pendingOwner()).to.equal(GUARDIAN);
      expect(await boundValidator.pendingOwner()).to.equal(GUARDIAN);
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
      await pretendExecutingVip(await vip001());
    });
    it("correct owner", async () => {
      expect(await resilientOracle.owner()).to.equal(GUARDIAN);
      expect(await redstoneOracle.owner()).to.equal(GUARDIAN);
      expect(await chainLinkOracle.owner()).to.equal(GUARDIAN);
      expect(await boundValidator.owner()).to.equal(GUARDIAN);
    });

    for (let i = 0; i < assetConfigs.length; i++) {
      const assetConfig = assetConfigs[i];
      it(`Validate asset price ${assetConfig.name}`, async () => {
        const price = await resilientOracle.getPrice(assetConfig.address);
        expect(price).to.be.equal(parseUnits(assetConfig.price, 18));
      });
    }

    for (let i = 0; i < directAssetPriceConfigs.length; i++) {
      const assetConfig = directAssetPriceConfigs[i];
      it(`Validate asset price ${assetConfig.name}`, async () => {
        const price = await resilientOracle.getPrice(assetConfig.address);
        expect(price).to.be.equal(parseUnits(assetConfig.price, 18));
      });
    }
  });
});
