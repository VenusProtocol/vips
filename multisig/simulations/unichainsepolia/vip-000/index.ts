import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip000, { BOUND_VALIDATOR, cbBTC } from "../../../proposals/unichainsepolia/vip-000";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import REDSTONE_ORACLE_ABI from "./abi/redstoneOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import TREASURY_ABI from "./abi/treasury.json";

const { unichainsepolia } = NETWORK_ADDRESSES;

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
    address: "0xf16d4774893eB578130a645d5c69E9c4d183F3A5",
    price: "999932510000000000000000000000",
    feed: "0x197225B3B017eb9b72Ac356D6B3c267d0c04c57c",
    oracle: "redstone",
  },
  {
    name: "USDT",
    address: "0x7bc1b67fde923fd3667Fde59684c6c354C8EbFdA",
    price: "1000933250000000000000000000000",
    feed: "0x3fd49f2146FE0e10c4AE7E3fE04b3d5126385Ac4",
    oracle: "redstone",
  },
  {
    name: "WETH",
    address: "0x4200000000000000000000000000000000000006",
    price: "2916507738420000000000",
    feed: "0x4BAD96DD1C7D541270a0C92e1D4e5f12EEEA7a57",
    oracle: "redstone",
  },
];

forking(4207439, async () => {
  const provider = ethers.provider;
  let treasury: Contract;
  let resilientOracle: Contract;
  let redstoneOracle: Contract;
  let boundValidator: Contract;

  describe("Pre-VIP behavior", async () => {
    before(async () => {
      treasury = await ethers.getContractAt(TREASURY_ABI, unichainsepolia.VTREASURY);
      resilientOracle = new ethers.Contract(unichainsepolia.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
      redstoneOracle = new ethers.Contract(unichainsepolia.REDSTONE_ORACLE, REDSTONE_ORACLE_ABI, provider);
      boundValidator = new ethers.Contract(BOUND_VALIDATOR, BOUND_VALIDATOR_ABI, provider);
    });

    it("correct pending owner", async () => {
      expect(await resilientOracle.pendingOwner()).to.equal(unichainsepolia.GUARDIAN);
      expect(await redstoneOracle.pendingOwner()).to.equal(unichainsepolia.GUARDIAN);
      expect(await boundValidator.pendingOwner()).to.equal(unichainsepolia.GUARDIAN);
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

    it("Should set owner to multisig", async () => {
      const owner = await treasury.owner();
      expect(owner).equals(NETWORK_ADDRESSES.unichainsepolia.GUARDIAN);
    });

    it("correct owner", async () => {
      expect(await resilientOracle.owner()).to.equal(unichainsepolia.GUARDIAN);
      expect(await redstoneOracle.owner()).to.equal(unichainsepolia.GUARDIAN);
      expect(await boundValidator.owner()).to.equal(unichainsepolia.GUARDIAN);
    });

    it("validate asset prices", async () => {
      for (let i = 0; i < assetConfigs.length; i++) {
        const assetConfig = assetConfigs[i];
        const price = await resilientOracle.getPrice(assetConfig.address);
        expect(price).to.be.equal(assetConfig.price);
      }
      expect(await resilientOracle.getPrice(cbBTC)).to.be.equal("650000000000000000000000000000000"); // price * (10 ** (18-8))

      expect(await resilientOracle.getPrice(unichainsepolia.XVS)).to.be.equal(parseUnits("7", 18));
    });
  });
});
