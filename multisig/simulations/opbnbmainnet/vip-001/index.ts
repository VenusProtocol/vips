import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip001 from "../../../proposals/opbnbmainnet/vip-001";
import BINANCE_ORACLE_ABI from "./abi/binanceOracle.json";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const { opbnbmainnet } = NETWORK_ADDRESSES;

const BINANCE_ORACLE = "0xB09EC9B628d04E1287216Aa3e2432291f50F9588";
const RESILIENT_ORACLE = "0x8f3618c4F0183e14A218782c116fb2438571dAC9";
const BOUND_VALIDATOR = "0xd1f80C371C6E2Fa395A5574DB3E3b4dAf43dadCE";
const STALE_PERIOD_26H = 60 * 60 * 26;
const STALE_PERIOD_100S = 100;
const STALE_PERIOD_25M = 60 * 25;

interface AssetConfig {
  name: string;
  address: string;
  price: string;
}

const assetConfigs: AssetConfig[] = [
  {
    name: "BTC",
    address: "0x7c6b91d9be155a6db01f749217d76ff02a7227f2",
    price: "41387756941850000000000",
  },
  {
    name: "ETH",
    address: "0xe7798f023fc62146e8aa1b36da45fb70855a77ea",
    price: "2483997580340000000000",
  },
  {
    name: "USDT",
    address: "0x9e5aac1ba1a2e6aed6b32689dfcf62a509ca96f3",
    price: "998703330000000000",
  },
  {
    name: "BNB",
    address: "0x4200000000000000000000000000000000000006",
    price: "313573063660000000000",
  },
  {
    name: "XVS",
    address: "0x3E2e61F1c075881F3fB8dd568043d8c221fd5c61",
    price: "11937234000000000000",
  },
];

forking(13905270, () => {
  const provider = ethers.provider;
  let resilientOracle: Contract;
  let binanceOracle: Contract;
  let boundValidator: Contract;

  describe("Pre-VIP behavior", async () => {
    before(async () => {
      resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
      binanceOracle = new ethers.Contract(BINANCE_ORACLE, BINANCE_ORACLE_ABI, provider);
      boundValidator = new ethers.Contract(BOUND_VALIDATOR, BOUND_VALIDATOR_ABI, provider);
    });
    it("correct pending owner", async () => {
      expect(await resilientOracle.pendingOwner()).to.equal(opbnbmainnet.NORMAL_TIMELOCK);
      expect(await binanceOracle.pendingOwner()).to.equal(opbnbmainnet.NORMAL_TIMELOCK);
      expect(await boundValidator.pendingOwner()).to.equal(opbnbmainnet.NORMAL_TIMELOCK);
    });
    it("max stale period is not set", async () => {
      expect(await binanceOracle.maxStalePeriod("BTC")).to.be.equals(0);
      expect(await binanceOracle.maxStalePeriod("ETH")).to.be.equals(0);
      expect(await binanceOracle.maxStalePeriod("USDT")).to.be.equals(0);
      expect(await binanceOracle.maxStalePeriod("BNB")).to.be.equals(0);
      expect(await binanceOracle.maxStalePeriod("XVS")).to.be.equals(0);
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
      expect(await resilientOracle.owner()).to.equal(opbnbmainnet.NORMAL_TIMELOCK);
      expect(await binanceOracle.owner()).to.equal(opbnbmainnet.NORMAL_TIMELOCK);
      expect(await boundValidator.owner()).to.equal(opbnbmainnet.NORMAL_TIMELOCK);
    });
    it("max stale period is set", async () => {
      expect(await binanceOracle.maxStalePeriod("BTC")).to.be.equals(STALE_PERIOD_100S);
      expect(await binanceOracle.maxStalePeriod("ETH")).to.be.equals(STALE_PERIOD_100S);
      expect(await binanceOracle.maxStalePeriod("USDT")).to.be.equals(STALE_PERIOD_26H);
      expect(await binanceOracle.maxStalePeriod("BNB")).to.be.equals(STALE_PERIOD_100S);
      expect(await binanceOracle.maxStalePeriod("XVS")).to.be.equals(STALE_PERIOD_25M);
    });
    it("validate asset prices", async () => {
      for (let i = 0; i < assetConfigs.length; i++) {
        const assetConfig = assetConfigs[i];
        const price = await binanceOracle.getPrice(assetConfig.address);
        expect(price).to.be.equal(assetConfig.price);
      }
    });
  });
});
