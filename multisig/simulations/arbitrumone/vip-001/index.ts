import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip001, { BOUND_VALIDATOR } from "../../../proposals/arbitrumone/vip-001";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const { arbitrumone } = NETWORK_ADDRESSES;

const RESILIENT_ORACLE = arbitrumone.RESILIENT_ORACLE;
const CHAINLINK_ORACLE = arbitrumone.CHAINLINK_ORACLE;
const NORMAL_TIMELOCK = arbitrumone.NORMAL_TIMELOCK;

interface AssetConfig {
  name: string;
  address: string;
  price: string;
  feed: string;
  oracle: string;
}

const assetConfigs: AssetConfig[] = [
  {
    name: "USDC",
    address: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    price: "1000067000000000000000000000000",
    feed: "0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3",
    oracle: "chainlink",
  },
  {
    name: "WBTC",
    address: "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
    price: "624399284097000000000000000000000",
    feed: "0xd0C7101eACbB49F3deCcCc166d238410D6D46d57",
    oracle: "chainlink",
  },
  {
    name: "USDT",
    address: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
    price: "999320000000000000000000000000",
    feed: "0x3f3f5dF88dC9F13eac63DF89EC16ef6e7E25DdE7",
    oracle: "chainlink",
  },
  {
    name: "ARB",
    address: "0x912ce59144191c1204e64559fe8253a0e49e6548",
    price: "936499390000000000",
    feed: "0xb2A824043730FE05F3DA2efaFa1CBbe83fa548D6",
    oracle: "chainlink",
  },
  {
    name: "WETH",
    address: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
    price: "2903078950000000000000",
    feed: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612",
    oracle: "chainlink",
  },
];

forking(211510905, () => {
  const provider = ethers.provider;
  let resilientOracle: Contract;
  let chainLinkOracle: Contract;
  let boundValidator: Contract;

  describe("Pre-VIP behavior", async () => {
    before(async () => {
      resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
      chainLinkOracle = new ethers.Contract(CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, provider);
      boundValidator = new ethers.Contract(BOUND_VALIDATOR, BOUND_VALIDATOR_ABI, provider);
    });

    it("correct pending owner", async () => {
      expect(await resilientOracle.pendingOwner()).to.equal(NORMAL_TIMELOCK);
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
