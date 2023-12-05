import { expect } from "chai";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { vip001 } from "../../../proposals/vip-001/vip-001-opbnbtestnet";
import BINANCE_ORACLE_ABI from "./abi/binanceOracle.json";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const { opbnbtestnet } = NETWORK_ADDRESSES;
const RESILIENT_ORACLE = "0xEF4e53a9A4565ef243A2f0ee9a7fc2410E1aA623";
const BINANCE_ORACLE = "0x496B6b03469472572C47bdB407d5549b244a74F2";
const BOUND_VALIDATOR = "0x049537Bb065e6253e9D8D08B45Bf6b753657A746";

interface AssetConfig {
  name: string;
  address: string;
  price: string;
  oracle: string;
}

const assetConfigs: AssetConfig[] = [
  {
    name: "BTCB",
    address: "0x7Af23F9eA698E9b953D2BD70671173AaD0347f19",
    oracle: "binance",
    price: "41601564140460000000000",
  },
  {
    name: "ETH",
    address: "0x94680e003861D43C6c0cf18333972312B6956FF1",
    oracle: "binance",
    price: "2204697234150000000000",
  },
  {
    name: "USDT",
    address: "0x8ac9B3801D0a8f5055428ae0bF301CA1Da976855",
    oracle: "binance",
    price: "1000000000000000000",
  },
  {
    name: "WBNB",
    address: "0xF9ce72611a1BE9797FdD2c995dB6fB61FD20E4eB",
    oracle: "binance",
    price: "229983296290000000000",
  },
  {
    name: "XVS",
    address: "0x3d0e20D4caD958bc848B045e1da19Fe378f86f03",
    oracle: "binance",
    price: "7000000000000000000",
  },
];

forking(14889015, () => {
  const provider = ethers.provider;
  let resilientOracle: ethers.Contract;
  let binanceOracle: ethers.Contract;
  let boundValidator: ethers.Contract;

  describe("Pre-VIP behavior", async () => {
    before(async () => {
      resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
      binanceOracle = new ethers.Contract(BINANCE_ORACLE, BINANCE_ORACLE_ABI, provider);
      boundValidator = new ethers.Contract(BOUND_VALIDATOR, BOUND_VALIDATOR_ABI, provider);
    });
    it("correct pending owner", async () => {
      expect(await resilientOracle.pendingOwner()).to.equal(opbnbtestnet.NORMAL_TIMELOCK);
      expect(await binanceOracle.pendingOwner()).to.equal(opbnbtestnet.NORMAL_TIMELOCK);
      expect(await boundValidator.pendingOwner()).to.equal(opbnbtestnet.NORMAL_TIMELOCK);
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
      expect(await resilientOracle.owner()).to.equal(opbnbtestnet.NORMAL_TIMELOCK);
      expect(await binanceOracle.owner()).to.equal(opbnbtestnet.NORMAL_TIMELOCK);
      expect(await boundValidator.owner()).to.equal(opbnbtestnet.NORMAL_TIMELOCK);
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
