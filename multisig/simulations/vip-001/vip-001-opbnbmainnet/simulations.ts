import { expect } from "chai";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { vip001 } from "../../../proposals/vip-001/vip-001-opbnbmainnet";
import BINANCE_ORACLE_ABI from "./abi/binanceOracle.json";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const { opbnbmainnet } = NETWORK_ADDRESSES;

const RESILIENT_ORACLE = opbnbmainnet.RESILIENT_ORACLE;
const BINANCE_ORACLE = opbnbmainnet.BINANCE_ORACLE;
const NORMAL_TIMELOCK = opbnbmainnet.NORMAL_TIMELOCK;
const BOUND_VALIDATOR = opbnbmainnet.BOUND_VALIDATOR;

forking(11151379, () => {
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
      expect(await resilientOracle.pendingOwner()).to.equal(NORMAL_TIMELOCK);
      expect(await binanceOracle.pendingOwner()).to.equal(NORMAL_TIMELOCK);
      expect(await boundValidator.pendingOwner()).to.equal(NORMAL_TIMELOCK);
    });
    it("max stale period is not set", async () => {
      expect(await binanceOracle.maxStalePeriod("BTCB")).to.be.equals(0);
      expect(await binanceOracle.maxStalePeriod("ETH")).to.be.equals(0);
      expect(await binanceOracle.maxStalePeriod("USDT")).to.be.equals(0);
      expect(await binanceOracle.maxStalePeriod("WBNB")).to.be.equals(0);
      expect(await binanceOracle.maxStalePeriod("XVS")).to.be.equals(0);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vip001());
    });
    it("correct owner", async () => {
      expect(await resilientOracle.owner()).to.equal(NORMAL_TIMELOCK);
      expect(await binanceOracle.owner()).to.equal(NORMAL_TIMELOCK);
      expect(await boundValidator.owner()).to.equal(NORMAL_TIMELOCK);
    });
    it("max stale period is set", async () => {
      expect(await binanceOracle.maxStalePeriod("BTCB")).to.be.equals(144000);
      expect(await binanceOracle.maxStalePeriod("ETH")).to.be.equals(144000);
      expect(await binanceOracle.maxStalePeriod("USDT")).to.be.equals(144000);
      expect(await binanceOracle.maxStalePeriod("WBNB")).to.be.equals(144000);
      expect(await binanceOracle.maxStalePeriod("XVS")).to.be.equals(144000);
    });
  });
});
