import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { vip001 } from "../../../proposals/vip-001/vip-001-arbitrum-sepolia";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

const RESILIENT_ORACLE = arbitrumsepolia.RESILIENT_ORACLE;
const CHAINLINK_ORACLE = arbitrumsepolia.CHAINLINK_ORACLE;
const NORMAL_TIMELOCK = arbitrumsepolia.NORMAL_TIMELOCK;
const BOUND_VALIDATOR = arbitrumsepolia.BOUND_VALIDATOR;

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
    address: "0xDb3EC247767d586a9B77F7472F3C7759b131bE69",
    price: "1000003160000000000",
    feed: "0x0153002d20B96532C639313c2d54c3dA09109309",
    oracle: "chainlink",
  },
  {
    name: "WBTC",
    address: "0xD47e7683a11d70E479bb948dc8E795778035C62D",
    price: "69520319000000000000000",
    feed: "0x56a43EB56Da12C0dc1D972ACb089c06a5dEF8e69",
    oracle: "chainlink",
  },
  {
    name: "USDT",
    address: "0xE1F20e585B57F82d57Da92ac1639B634f56D77CF",
    price: "1000446400000000000",
    feed: "0x80EDee6f667eCc9f63a0a6f55578F870651f06A4",
    oracle: "chainlink",
  },
  {
    name: "ARB",
    address: "0x4371bb358aB5cC192E481543417D2F67b8781731",
    price: "1595250000000000000",
    feed: "0xD1092a65338d049DB68D7Be6bD89d17a0929945e",
    oracle: "chainlink",
  },
  {
    name: "WETH",
    address: "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73",
    price: "3535845400000000000000",
    feed: "0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165",
    oracle: "chainlink",
  },
];

forking(29138569, () => {
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
