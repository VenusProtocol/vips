import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip001, { BOUND_VALIDATOR } from "../../../proposals/unichainmainnet/vip-001";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import REDSTONE_ORACLE_ABI from "./abi/redstoneOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const { unichainmainnet } = NETWORK_ADDRESSES;

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
    address: "0x078D782b760474a361dDA0AF3839290b0EF57AD6",
    price: "999954990000000000000000000000",
    feed: "0xD15862FC3D5407A03B696548b6902D6464A69b8c",
    oracle: "redstone",
  },
  {
    name: "WETH",
    address: "0x4200000000000000000000000000000000000006",
    price: "2661700440190000000000",
    feed: "0xe8D9FbC10e00ecc9f0694617075fDAF657a76FB2",
    oracle: "redstone",
  },
  {
    name: "XVS",
    address: unichainmainnet.XVS,
    price: "5590976720000000000",
    feed: "0xb4fe9028A4D4D8B3d00e52341F2BB0798860532C",
    oracle: "redstone",
  },
];

forking(8452229, async () => {
  const provider = ethers.provider;
  let resilientOracle: Contract;
  let redstoneOracle: Contract;
  let boundValidator: Contract;

  describe("Pre-VIP behavior", async () => {
    before(async () => {
      resilientOracle = new ethers.Contract(unichainmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
      redstoneOracle = new ethers.Contract(unichainmainnet.REDSTONE_ORACLE, REDSTONE_ORACLE_ABI, provider);
      boundValidator = new ethers.Contract(BOUND_VALIDATOR, BOUND_VALIDATOR_ABI, provider);
    });

    it("correct pending owner", async () => {
      expect(await resilientOracle.pendingOwner()).to.equal(unichainmainnet.GUARDIAN);
      expect(await redstoneOracle.pendingOwner()).to.equal(unichainmainnet.GUARDIAN);
      expect(await boundValidator.pendingOwner()).to.equal(unichainmainnet.GUARDIAN);
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
      expect(await resilientOracle.owner()).to.equal(unichainmainnet.GUARDIAN);
      expect(await redstoneOracle.owner()).to.equal(unichainmainnet.GUARDIAN);
      expect(await boundValidator.owner()).to.equal(unichainmainnet.GUARDIAN);
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
