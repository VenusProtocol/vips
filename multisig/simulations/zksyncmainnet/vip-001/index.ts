import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip001, {
  BOUND_VALIDATOR,
  REDSTONE_ORACLE,
  USDC_E,
  USDT,
  WBTC,
  WETH,
  ZK,
} from "../../../proposals/zksyncmainnet/vip-001";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const { zksyncmainnet } = NETWORK_ADDRESSES;

interface AssetConfig {
  name: string;
  address: string;
  price: string;
  feed: string;
  oracle: string;
}

const assetConfigs: AssetConfig[] = [
  {
    name: "WBTC",
    address: WBTC,
    price: "612542540000000",
    feed: "0x4Cba285c15e3B540C474A114a7b135193e4f1EA6",
    oracle: "chainlink",
  },
  {
    name: "WETH",
    address: WETH,
    price: "2640.55729243",
    feed: "0x6D41d1dc818112880b40e26BD6FD347E41008eDA",
    oracle: "chainlink",
  },
  {
    name: "USDC_E",
    address: USDC_E,
    price: "999869090000",
    feed: "0x1824D297C6d6D311A204495277B63e943C2D376E",
    oracle: "chainlink",
  },
  {
    name: "USDT",
    address: USDT,
    price: "1000210000000",
    feed: "0xB615075979AE1836B476F651f1eB79f0Cd3956a9",
    oracle: "chainlink",
  },
  {
    name: "ZK",
    address: ZK,
    price: "0.12066413",
    feed: "0x5efDb74da192584746c96EcCe138681Ec1501218",
    oracle: "redstone",
  },
  {
    name: "XVS",
    address: zksyncmainnet.XVS,
    price: "7.41713141",
    feed: "0xca4793Eeb7a837E30884279b3D557970E444EBDe",
    oracle: "redstone",
  },
];

forking(42322009, async () => {
  const provider = ethers.provider;
  let resilientOracle: Contract;
  let redstoneOracle: Contract;
  let chainLinkOracle: Contract;
  let boundValidator: Contract;

  describe("Pre-VIP behavior", async () => {
    before(async () => {
      resilientOracle = new ethers.Contract(zksyncmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
      redstoneOracle = new ethers.Contract(REDSTONE_ORACLE, CHAINLINK_ORACLE_ABI, provider);
      chainLinkOracle = new ethers.Contract(zksyncmainnet.CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, provider);
      boundValidator = new ethers.Contract(BOUND_VALIDATOR, BOUND_VALIDATOR_ABI, provider);
    });
    it("correct pending owner", async () => {
      expect(await resilientOracle.pendingOwner()).to.equal(zksyncmainnet.GUARDIAN);
      expect(await redstoneOracle.pendingOwner()).to.equal(zksyncmainnet.GUARDIAN);
      expect(await chainLinkOracle.pendingOwner()).to.equal(zksyncmainnet.GUARDIAN);
      expect(await boundValidator.pendingOwner()).to.equal(zksyncmainnet.GUARDIAN);
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
      expect(await resilientOracle.owner()).to.equal(zksyncmainnet.GUARDIAN);
      expect(await redstoneOracle.owner()).to.equal(zksyncmainnet.GUARDIAN);
      expect(await chainLinkOracle.owner()).to.equal(zksyncmainnet.GUARDIAN);
      expect(await boundValidator.owner()).to.equal(zksyncmainnet.GUARDIAN);
    });

    for (let i = 0; i < assetConfigs.length; i++) {
      const assetConfig = assetConfigs[i];
      it(`Validate asset price ${assetConfig.name}`, async () => {
        const price = await resilientOracle.getPrice(assetConfig.address);
        expect(price).to.be.equal(parseUnits(assetConfig.price, 18));
      });
    }
  });
});
