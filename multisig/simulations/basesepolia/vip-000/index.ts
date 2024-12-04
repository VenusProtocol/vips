import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework/index";

import vip000, { BOUND_VALIDATOR, TREASURY } from "../../../proposals/basesepolia/vip-000";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import REDSTONE_ORACLE_ABI from "./abi/chainlinkOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import TREASURY_ABI from "./abi/treasury.json";

const { basesepolia } = NETWORK_ADDRESSES;

const RESILIENT_ORACLE = basesepolia.RESILIENT_ORACLE;
const CHAINLINK_ORACLE = basesepolia.CHAINLINK_ORACLE;
const REDSTONE_ORACLE = basesepolia.REDSTONE_ORACLE;
const GUARDIAN = basesepolia.GUARDIAN;

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
    name: "USDC",
    address: "0xFa264c13d657180e65245a9C3ac8d08b9F5Fc54D",
    price: "999940000000000000000000000000",
    feed: "0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165",
    oracle: "chainlink",
  },
  {
    name: "cbBTC",
    address: "0x0948001047A07e38F685f9a11ea1ddB16B234af9",
    price: "975122118780000000000000000000000",
    feed: "0x0FB99723Aee6f420beAD13e6bBB79b7E6F034298",
    oracle: "chainlink",
  },
  {
    name: "WETH",
    address: "0x4200000000000000000000000000000000000006",
    price: "3361650000000000000000",
    feed: "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1",
    oracle: "chainlink",
  },
];

const directAssetPriceConfig: AssetDirectPriceConfig = {
  name: "XVS",
  address: "0xE657EDb5579B82135a274E85187927C42E38C021",
  price: "10000000000000000000",
};

forking(18216178, async () => {
  const provider = ethers.provider;
  let treasury: Contract;
  let resilientOracle: Contract;
  let chainlinkOracle: Contract;
  let redstoneOracle: Contract;
  let boundValidator: Contract;

  describe("Pre-VIP behavior", async () => {
    before(async () => {
      treasury = await ethers.getContractAt(TREASURY_ABI, TREASURY);
      resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
      chainlinkOracle = new ethers.Contract(CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, provider);
      redstoneOracle = new ethers.Contract(REDSTONE_ORACLE, REDSTONE_ORACLE_ABI, provider);
      boundValidator = new ethers.Contract(BOUND_VALIDATOR, BOUND_VALIDATOR_ABI, provider);
    });

    it("correct pending owner", async () => {
      expect(await resilientOracle.pendingOwner()).to.equal(GUARDIAN);
      expect(await chainlinkOracle.pendingOwner()).to.equal(GUARDIAN);
      expect(await redstoneOracle.pendingOwner()).to.equal(GUARDIAN);
      expect(await boundValidator.pendingOwner()).to.equal(GUARDIAN);
    });

    it("should revert for unconfigured asset price request", async () => {
      for (let i = 0; i < assetConfigs.length; i++) {
        const assetConfig = assetConfigs[i];
        await expect(resilientOracle.getPrice(assetConfig.address)).to.be.revertedWith(
          "invalid resilient oracle price",
        );
      }

      await expect(resilientOracle.getPrice(directAssetPriceConfig.address)).to.be.revertedWith(
        "invalid resilient oracle price",
      );
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip000());
    });

    it("correct owner", async () => {
      expect(await treasury.owner()).to.equal(GUARDIAN);
      expect(await resilientOracle.owner()).to.equal(GUARDIAN);
      expect(await chainlinkOracle.owner()).to.equal(GUARDIAN);
      expect(await redstoneOracle.owner()).to.equal(GUARDIAN);
      expect(await boundValidator.owner()).to.equal(GUARDIAN);
    });

    it("validate asset prices", async () => {
      for (let i = 0; i < assetConfigs.length; i++) {
        const assetConfig = assetConfigs[i];
        const price = await resilientOracle.getPrice(assetConfig.address);

        expect(price).to.be.equal(assetConfig.price);
      }

      await expect(await resilientOracle.getPrice(directAssetPriceConfig.address)).to.be.equal(
        directAssetPriceConfig.price,
      );
    });
  });
});
