import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip001, { BOUND_VALIDATOR } from "../../../proposals/opsepolia/vip-001";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const { opsepolia } = NETWORK_ADDRESSES;

const RESILIENT_ORACLE = opsepolia.RESILIENT_ORACLE;
const CHAINLINK_ORACLE = opsepolia.CHAINLINK_ORACLE;
const NORMAL_TIMELOCK = opsepolia.NORMAL_TIMELOCK;

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
    address: "0x87350147a24099bf1e7e677576f01c1415857c75",
    price: "999933440000000000000000000000",
    feed: "0x6e44e50E3cc14DD16e01C590DC1d7020cb36eD4C",
    oracle: "chainlink",
  },
  {
    name: "WBTC",
    address: "0x149e3b3bd69f1cfc1b42b6a6a152a42e38ceebf1",
    price: "591772870000000000000000000000000",
    feed: "0x3015aa11f5c2D4Bd0f891E708C8927961b38cE7D",
    oracle: "chainlink",
  },
  {
    name: "USDT",
    address: "0xebca682b6c15d539284432edc5b960771f0009e8",
    price: "1000282070000000000000000000000",
    feed: "0x3015aa11f5c2D4Bd0f891E708C8927961b38cE7D",
    oracle: "chainlink",
  },
  {
    name: "OP",
    address: "0xaa5f3e2e31a13adde216a7dc4550872cc253254f",
    price: "1469100000000000000",
    feed: "0x8907a105E562C9F3d7F2ed46539Ae36D87a15590",
    oracle: "chainlink",
  },
  {
    name: "WETH",
    address: "0x4200000000000000000000000000000000000006",
    price: "2523120000000000000000",
    feed: "0x61Ec26aA57019C486B10502285c5A3D4A4750AD7",
    oracle: "chainlink",
  },
];

forking(16643255, async () => {
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
      await pretendExecutingVip(await vip001());
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
