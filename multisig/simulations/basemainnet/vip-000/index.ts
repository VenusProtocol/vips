import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework/index";

import vip000, { BOUND_VALIDATOR, TREASURY } from "../../../proposals/basemainnet/vip-000";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import REDSTONE_ORACLE_ABI from "./abi/chainlinkOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import TREASURY_ABI from "./abi/treasury.json";

const { basemainnet } = NETWORK_ADDRESSES;

const RESILIENT_ORACLE = basemainnet.RESILIENT_ORACLE;
const CHAINLINK_ORACLE = basemainnet.CHAINLINK_ORACLE;
const REDSTONE_ORACLE = basemainnet.REDSTONE_ORACLE;
const GUARDIAN = basemainnet.GUARDIAN;

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
    address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    price: "999940000000000000000000000000",
    feed: "0x7e860098F58bBFC8648a4311b374B1D669a2bc6B",
    oracle: "chainlink",
  },
  {
    name: "cbBTC",
    address: "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
    price: "975122118780000000000000000000000",
    feed: "0x07DA0E54543a844a80ABE69c8A12F22B3aA59f9D",
    oracle: "chainlink",
  },
  {
    name: "WETH",
    address: "0x4200000000000000000000000000000000000006",
    price: "3361650000000000000000",
    feed: "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70",
    oracle: "chainlink",
  },
  {
    name: "XVS",
    address: "0xebB7873213c8d1d9913D8eA39Aa12d74cB107995",
    price: "3361650000000000000000",
    feed: "0x5ED849a45B4608952161f45483F4B95BCEa7f8f0",
    oracle: "redstone",
  },
];

forking(23258443, async () => {
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
    });
  });
});
