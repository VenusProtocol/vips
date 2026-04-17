import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser, setMaxStalePeriodInBinanceOracle, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip612, {
  ALLEZ_LABS,
  ALLEZ_LABS_USDT_AMOUNT,
  ATLAS_ORACLE,
  ATLAS_U_CONFIG,
  CHAINLINK_SOLVBTC_CONFIG,
  CHAINLINK_U_CONFIG,
  FUNDAMENTAL_SOLVBTC_CONFIG,
  REDSTONE_SOLVBTC_CONFIG,
  SOLVBTC,
  SOLVBTC_FUNDAMENTAL_CHAINLINK_ORACLE,
  SOLVBTC_RESILIENT_ORACLE_CONFIG,
  U,
  USDT,
  USDT_CHAINLINK_ORACLE,
  U_RESILIENT_ORACLE_CONFIG,
  XVS_GRANT_AMOUNT,
  XVS_STORE,
} from "../../vips/vip-612/bscmainnet";
import XVS_ABI from "./abi/XVS.json";
import ACM_ABI from "./abi/accessControlManager.json";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const BOUND_VALIDATOR = "0x6E332fF0bB52475304494E4AE5063c1051c7d735";
const SOLVBTC_UPPER_BOUND_RATIO = ethers.utils.parseUnits("1.05", 18);
const SOLVBTC_LOWER_BOUND_RATIO = ethers.utils.parseUnits("0.95", 18);
const U_UPPER_BOUND_RATIO = ethers.utils.parseUnits("1.01", 18);
const U_LOWER_BOUND_RATIO = ethers.utils.parseUnits("0.99", 18);

const { bscmainnet } = NETWORK_ADDRESSES;

const BLOCK_NUMBER = 92819471;

const STALE_PERIOD_OVERRIDE = 315360000;

const setMaxStaleForU = async () => {
  for (const oracleAddr of [bscmainnet.CHAINLINK_ORACLE, ATLAS_ORACLE]) {
    await setMaxStalePeriodInChainlinkOracle(
      oracleAddr,
      U,
      ethers.constants.AddressZero,
      bscmainnet.NORMAL_TIMELOCK,
      STALE_PERIOD_OVERRIDE,
    );
  }
};

const setMaxStaleForSolvBTC = async () => {
  for (const oracleAddr of [
    bscmainnet.CHAINLINK_ORACLE,
    bscmainnet.REDSTONE_ORACLE,
    SOLVBTC_FUNDAMENTAL_CHAINLINK_ORACLE,
  ]) {
    await setMaxStalePeriodInChainlinkOracle(
      oracleAddr,
      SOLVBTC,
      ethers.constants.AddressZero,
      bscmainnet.NORMAL_TIMELOCK,
      STALE_PERIOD_OVERRIDE,
    );
  }
};

// Workaround for internal staleness checks in the Fundamental and RedStone oracles:
// After VIP execution the new feeds will be stale at the forked block, causing getPrice() to revert.
// Instead of skipping the price check entirely, this function simulates the feed returning the correct
// price by temporarily configuring the new feed, reading the price it would return, then reverting all
// state changes. The fetched price is then pinned via setDirectPrice so the oracle returns it without
// consulting the (stale) feed. This way the test exercises the full oracle stack — feed → oracle →
// resilient oracle — while working around the block-timestamp staleness constraint.
const setDirectPriceForSolvBTCFundamental = async () => {
  const timelockSigner = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("1"));

  const acm = new ethers.Contract(bscmainnet.ACCESS_CONTROL_MANAGER, ACM_ABI, timelockSigner);
  const solvBTCFundamentalOracle = new ethers.Contract(
    SOLVBTC_FUNDAMENTAL_CHAINLINK_ORACLE,
    CHAINLINK_ORACLE_ABI,
    timelockSigner,
  );

  // Snapshot before any state changes so we can undo them after fetching the price
  const snapshotId = await ethers.provider.send("evm_snapshot", []);

  await solvBTCFundamentalOracle.acceptOwnership();
  await acm.giveCallPermission(
    SOLVBTC_FUNDAMENTAL_CHAINLINK_ORACLE,
    "setTokenConfig(TokenConfig)",
    bscmainnet.NORMAL_TIMELOCK,
  );
  await acm.giveCallPermission(
    SOLVBTC_FUNDAMENTAL_CHAINLINK_ORACLE,
    "setDirectPrice(address,uint256)",
    bscmainnet.NORMAL_TIMELOCK,
  );
  await solvBTCFundamentalOracle.setTokenConfigs([
    [SOLVBTC, FUNDAMENTAL_SOLVBTC_CONFIG.newFeed, FUNDAMENTAL_SOLVBTC_CONFIG.maxStalePeriod],
  ]);
  const price = await solvBTCFundamentalOracle.getPrice(SOLVBTC);

  // Revert all state changes — only the pinned direct price survives
  await ethers.provider.send("evm_revert", [snapshotId]);

  // Re-grant setDirectPrice permission (was reverted) and pin the price
  await acm.giveCallPermission(
    SOLVBTC_FUNDAMENTAL_CHAINLINK_ORACLE,
    "setDirectPrice(address,uint256)",
    bscmainnet.NORMAL_TIMELOCK,
  );
  await solvBTCFundamentalOracle.setDirectPrice(SOLVBTC, price);
};

const setDirectPriceForSolvBTCRedstone = async () => {
  const timelockSigner = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
  const redstoneOracle = new ethers.Contract(bscmainnet.REDSTONE_ORACLE, CHAINLINK_ORACLE_ABI, timelockSigner);

  // Snapshot before any state changes so we can undo them after fetching the price
  const snapshotId = await ethers.provider.send("evm_snapshot", []);

  await redstoneOracle.setTokenConfigs([
    [SOLVBTC, REDSTONE_SOLVBTC_CONFIG.newFeed, REDSTONE_SOLVBTC_CONFIG.maxStalePeriod],
  ]);
  const price = await redstoneOracle.getPrice(SOLVBTC);

  // Revert all state changes — only the pinned direct price survives
  await ethers.provider.send("evm_revert", [snapshotId]);

  // setDirectPrice permission already exists on the shared RedStone oracle — pin the price directly
  await redstoneOracle.setDirectPrice(SOLVBTC, price);
};

forking(BLOCK_NUMBER, async () => {
  const provider = ethers.provider;
  let resilientOracle: Contract;
  let chainlinkOracle: Contract;
  let atlasOracle: Contract;
  let usdtChainlinkOracle: Contract;
  let redstoneOracle: Contract;
  let solvBTCFundamentalOracle: Contract;
  let boundValidator: Contract;
  let acm: Contract;
  let xvs: Contract;
  let usdt: Contract;
  let preVipPrice: BigNumber;
  let preVipSolvBTCPrice: BigNumber;
  let xvsStoreBalanceBefore: BigNumber;
  let xvsUnitrollerBalanceBefore: BigNumber;
  let allezLabsUsdtBalanceBefore: BigNumber;
  let treasuryUsdtBalanceBefore: BigNumber;

  before(async () => {
    acm = new ethers.Contract(bscmainnet.ACCESS_CONTROL_MANAGER, ACM_ABI, provider);
    boundValidator = new ethers.Contract(BOUND_VALIDATOR, BOUND_VALIDATOR_ABI, provider);
    resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
    chainlinkOracle = new ethers.Contract(bscmainnet.CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, provider);
    atlasOracle = new ethers.Contract(ATLAS_ORACLE, CHAINLINK_ORACLE_ABI, provider);
    usdtChainlinkOracle = new ethers.Contract(USDT_CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, provider);
    redstoneOracle = new ethers.Contract(bscmainnet.REDSTONE_ORACLE, CHAINLINK_ORACLE_ABI, provider);
    solvBTCFundamentalOracle = new ethers.Contract(
      SOLVBTC_FUNDAMENTAL_CHAINLINK_ORACLE,
      CHAINLINK_ORACLE_ABI,
      provider,
    );
    xvs = new ethers.Contract(bscmainnet.XVS, XVS_ABI, provider);
    usdt = new ethers.Contract(USDT, XVS_ABI, provider);

    xvsStoreBalanceBefore = await xvs.balanceOf(XVS_STORE);
    xvsUnitrollerBalanceBefore = await xvs.balanceOf(bscmainnet.UNITROLLER);
    allezLabsUsdtBalanceBefore = await usdt.balanceOf(ALLEZ_LABS);
    treasuryUsdtBalanceBefore = await usdt.balanceOf(bscmainnet.VTREASURY);
    preVipPrice = await resilientOracle.getPrice(U);
    preVipSolvBTCPrice = await resilientOracle.getPrice(SOLVBTC);

    // set MAxt Stale Period for BTCB to a very high value to prevent staleness issues during testing, since BTCB feeds are used as fallback for SolvBTC in some oracles
    const BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
    await setMaxStalePeriodInChainlinkOracle(
      bscmainnet.CHAINLINK_ORACLE,
      BTCB,
      ethers.constants.AddressZero,
      bscmainnet.NORMAL_TIMELOCK,
      315360000,
    );

    await setMaxStalePeriodInChainlinkOracle(
      bscmainnet.REDSTONE_ORACLE,
      BTCB,
      ethers.constants.AddressZero,
      bscmainnet.NORMAL_TIMELOCK,
      315360000,
    );
    await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "BTCB", 315360000);
  });

  describe("Pre-VIP SolvBTC oracle", () => {
    it("should match pre-VIP ResilientOracle config for SolvBTC", async () => {
      const tokenConfig = await resilientOracle.getTokenConfig(SOLVBTC);
      expect(tokenConfig.oracles[0]).to.equal(SOLVBTC_RESILIENT_ORACLE_CONFIG.old.oracles[0]);
      expect(tokenConfig.oracles[1]).to.equal(SOLVBTC_RESILIENT_ORACLE_CONFIG.old.oracles[1]);
      expect(tokenConfig.oracles[2]).to.equal(SOLVBTC_RESILIENT_ORACLE_CONFIG.old.oracles[2]);
      expect(tokenConfig.enableFlagsForOracles[0]).to.equal(
        SOLVBTC_RESILIENT_ORACLE_CONFIG.old.enableFlagsForOracles[0],
      );
      expect(tokenConfig.enableFlagsForOracles[1]).to.equal(
        SOLVBTC_RESILIENT_ORACLE_CONFIG.old.enableFlagsForOracles[1],
      );
      expect(tokenConfig.enableFlagsForOracles[2]).to.equal(
        SOLVBTC_RESILIENT_ORACLE_CONFIG.old.enableFlagsForOracles[2],
      );
      expect(tokenConfig.cachingEnabled).to.equal(SOLVBTC_RESILIENT_ORACLE_CONFIG.old.cachingEnabled);
    });

    it("should match pre-VIP ChainlinkOracle feed for SolvBTC", async () => {
      const config = await chainlinkOracle.tokenConfigs(SOLVBTC);
      expect(config.feed).to.equal(CHAINLINK_SOLVBTC_CONFIG.oldFeed);
      expect(config.maxStalePeriod).to.equal(CHAINLINK_SOLVBTC_CONFIG.oldMaxStalePeriod);
    });

    it("should match pre-VIP RedStoneOracle feed for SolvBTC", async () => {
      const config = await redstoneOracle.tokenConfigs(SOLVBTC);
      expect(config.feed).to.equal(REDSTONE_SOLVBTC_CONFIG.oldFeed);
      expect(config.maxStalePeriod).to.equal(REDSTONE_SOLVBTC_CONFIG.oldMaxStalePeriod);
    });

    it("should match pre-VIP SolvBTCFundamentalChainlinkOracle feed for SolvBTC", async () => {
      const config = await solvBTCFundamentalOracle.tokenConfigs(SOLVBTC);
      expect(config.feed).to.equal(FUNDAMENTAL_SOLVBTC_CONFIG.oldFeed);
      expect(config.maxStalePeriod).to.equal(FUNDAMENTAL_SOLVBTC_CONFIG.oldMaxStalePeriod);
    });

    it("pre-VIP SolvBTC resilient price should be positive", async () => {
      const price = parseFloat(ethers.utils.formatUnits(preVipSolvBTCPrice, 18));
      console.log(`Pre-VIP SolvBTC price: $${price}`);
      expect(price).to.be.gt(70000);
    });
  });

  describe("Pre-VIP U oracle", () => {
    it("should match pre-VIP ResilientOracle config for U", async () => {
      const tokenConfig = await resilientOracle.getTokenConfig(U);
      expect(tokenConfig.oracles[0]).to.equal(U_RESILIENT_ORACLE_CONFIG.old.oracles[0]);
      expect(tokenConfig.oracles[1]).to.equal(U_RESILIENT_ORACLE_CONFIG.old.oracles[1]);
      expect(tokenConfig.oracles[2]).to.equal(U_RESILIENT_ORACLE_CONFIG.old.oracles[2]);
      expect(tokenConfig.enableFlagsForOracles[0]).to.equal(U_RESILIENT_ORACLE_CONFIG.old.enableFlagsForOracles[0]);
      expect(tokenConfig.enableFlagsForOracles[1]).to.equal(U_RESILIENT_ORACLE_CONFIG.old.enableFlagsForOracles[1]);
      expect(tokenConfig.enableFlagsForOracles[2]).to.equal(U_RESILIENT_ORACLE_CONFIG.old.enableFlagsForOracles[2]);
      expect(tokenConfig.cachingEnabled).to.equal(U_RESILIENT_ORACLE_CONFIG.old.cachingEnabled);
    });

    it("should match pre-VIP ChainlinkOracle feed for U", async () => {
      const config = await chainlinkOracle.tokenConfigs(U);
      expect(config.feed).to.equal(CHAINLINK_U_CONFIG.oldFeed);
      expect(config.maxStalePeriod).to.equal(CHAINLINK_U_CONFIG.maxStalePeriod);
    });

    it("USDT_CHAINLINK_ORACLE should report a valid price for U", async () => {
      const price = await usdtChainlinkOracle.getPrice(U);
      const priceFloat = parseFloat(ethers.utils.formatUnits(price, 18));
      expect(priceFloat).to.be.closeTo(1, 0.01);
    });

    it("pre-VIP U price should be close to $1", async () => {
      const price = parseFloat(ethers.utils.formatUnits(preVipPrice, 18));
      console.log(`Pre-VIP U price: $${price}`);
      expect(price).to.be.closeTo(1, 0.01);
    });
  });

  describe("Pre-VIP ACM permissions", () => {
    const checkNoRole = async (contract: string, fnSig: string, account: string) => {
      const roleHash = ethers.utils.keccak256(ethers.utils.solidityPack(["address", "string"], [contract, fnSig]));
      expect(await acm.hasRole(roleHash, account)).to.be.false;
    };

    it("Normal Timelock should NOT have setTokenConfig permission on SolvBTCFundamentalChainlinkOracle", async () => {
      await checkNoRole(
        SOLVBTC_FUNDAMENTAL_CHAINLINK_ORACLE,
        "setTokenConfig(TokenConfig)",
        bscmainnet.NORMAL_TIMELOCK,
      );
    });

    it("Normal Timelock should NOT have setDirectPrice permission on SolvBTCFundamentalChainlinkOracle", async () => {
      await checkNoRole(
        SOLVBTC_FUNDAMENTAL_CHAINLINK_ORACLE,
        "setDirectPrice(address,uint256)",
        bscmainnet.NORMAL_TIMELOCK,
      );
    });

    it("Normal Timelock should NOT have setTokenConfig permission on AtlasOracle", async () => {
      await checkNoRole(ATLAS_ORACLE, "setTokenConfig(TokenConfig)", bscmainnet.NORMAL_TIMELOCK);
    });

    it("Normal Timelock should NOT have setDirectPrice permission on AtlasOracle", async () => {
      await checkNoRole(ATLAS_ORACLE, "setDirectPrice(address,uint256)", bscmainnet.NORMAL_TIMELOCK);
    });
  });

  describe("Pre-VIP XVS", () => {
    it("XVSStore XVS balance should be recorded before VIP", async () => {
      expect(xvsStoreBalanceBefore).to.be.gte(0);
    });
  });

  describe("Pre-VIP Allez Labs payment", () => {
    it("Treasury USDT balance should be recorded before VIP", async () => {
      expect(treasuryUsdtBalanceBefore).to.be.gte(ALLEZ_LABS_USDT_AMOUNT);
    });
  });

  describe("Pre-VIP BoundValidator configs", () => {
    it("SolvBTC should have upperBoundRatio = 1.05e18", async () => {
      const config = await boundValidator.validateConfigs(SOLVBTC);
      expect(config.upperBoundRatio).to.equal(SOLVBTC_UPPER_BOUND_RATIO);
    });

    it("SolvBTC should have lowerBoundRatio = 0.95e18", async () => {
      const config = await boundValidator.validateConfigs(SOLVBTC);
      expect(config.lowerBoundRatio).to.equal(SOLVBTC_LOWER_BOUND_RATIO);
    });

    it("U should have upperBoundRatio = 1.01e18", async () => {
      const config = await boundValidator.validateConfigs(U);
      expect(config.upperBoundRatio).to.equal(U_UPPER_BOUND_RATIO);
    });

    it("U should have lowerBoundRatio = 0.99e18", async () => {
      const config = await boundValidator.validateConfigs(U);
      expect(config.lowerBoundRatio).to.equal(U_LOWER_BOUND_RATIO);
    });
  });

  describe("set direct price for fundamental and RedStone feeds as they have internal staleness checks", () => {
    it("set Fundamnetal oracle direct price for SolvBTC", async () => {
      await setDirectPriceForSolvBTCFundamental();
    });

    it("set RedStone oracle direct price for SolvBTC", async () => {
      await setDirectPriceForSolvBTCRedstone();
    });
  });

  testVip("VIP-612", await vip612());

  describe("Post-VIP SolvBTC oracle", () => {
    it("should match post-VIP ResilientOracle config for SolvBTC", async () => {
      const tokenConfig = await resilientOracle.getTokenConfig(SOLVBTC);
      expect(tokenConfig.oracles[0]).to.equal(SOLVBTC_RESILIENT_ORACLE_CONFIG.new.oracles[0]);
      expect(tokenConfig.oracles[1]).to.equal(SOLVBTC_RESILIENT_ORACLE_CONFIG.new.oracles[1]);
      expect(tokenConfig.oracles[2]).to.equal(SOLVBTC_RESILIENT_ORACLE_CONFIG.new.oracles[2]);
      expect(tokenConfig.enableFlagsForOracles[0]).to.equal(
        SOLVBTC_RESILIENT_ORACLE_CONFIG.new.enableFlagsForOracles[0],
      );
      expect(tokenConfig.enableFlagsForOracles[1]).to.equal(
        SOLVBTC_RESILIENT_ORACLE_CONFIG.new.enableFlagsForOracles[1],
      );
      expect(tokenConfig.enableFlagsForOracles[2]).to.equal(
        SOLVBTC_RESILIENT_ORACLE_CONFIG.new.enableFlagsForOracles[2],
      );
      expect(tokenConfig.cachingEnabled).to.equal(SOLVBTC_RESILIENT_ORACLE_CONFIG.new.cachingEnabled);
    });

    it("should match post-VIP ChainlinkOracle feed for SolvBTC", async () => {
      const config = await chainlinkOracle.tokenConfigs(SOLVBTC);
      expect(config.feed).to.equal(CHAINLINK_SOLVBTC_CONFIG.newFeed);
      expect(config.maxStalePeriod).to.equal(CHAINLINK_SOLVBTC_CONFIG.maxStalePeriod);
    });

    it("should match post-VIP RedStoneOracle feed for SolvBTC", async () => {
      const config = await redstoneOracle.tokenConfigs(SOLVBTC);
      expect(config.feed).to.equal(REDSTONE_SOLVBTC_CONFIG.newFeed);
      expect(config.maxStalePeriod).to.equal(REDSTONE_SOLVBTC_CONFIG.maxStalePeriod);
    });

    it("should match post-VIP SolvBTCFundamentalChainlinkOracle feed for SolvBTC", async () => {
      const config = await solvBTCFundamentalOracle.tokenConfigs(SOLVBTC);
      expect(config.feed).to.equal(FUNDAMENTAL_SOLVBTC_CONFIG.newFeed);
      expect(config.maxStalePeriod).to.equal(FUNDAMENTAL_SOLVBTC_CONFIG.maxStalePeriod);
    });

    it("post-VIP SolvBTC price should be within 1% of pre-VIP price", async () => {
      await setMaxStaleForSolvBTC();
      const postVipPrice = await resilientOracle.getPrice(SOLVBTC);
      const pre = parseFloat(ethers.utils.formatUnits(preVipSolvBTCPrice, 18));
      const post = parseFloat(ethers.utils.formatUnits(postVipPrice, 18));
      console.log(`Post-VIP SolvBTC price: $${post} (diff from pre: ${(post - pre).toFixed(2)})`);
      expect(post).to.be.closeTo(pre, pre * 0.01);
    });
  });

  describe("Post-VIP U oracle", () => {
    it("should match post-VIP ResilientOracle config for U", async () => {
      const tokenConfig = await resilientOracle.getTokenConfig(U);
      expect(tokenConfig.oracles[0]).to.equal(U_RESILIENT_ORACLE_CONFIG.new.oracles[0]);
      expect(tokenConfig.oracles[1]).to.equal(U_RESILIENT_ORACLE_CONFIG.new.oracles[1]);
      expect(tokenConfig.oracles[2]).to.equal(U_RESILIENT_ORACLE_CONFIG.new.oracles[2]);
      expect(tokenConfig.enableFlagsForOracles[0]).to.equal(U_RESILIENT_ORACLE_CONFIG.new.enableFlagsForOracles[0]);
      expect(tokenConfig.enableFlagsForOracles[1]).to.equal(U_RESILIENT_ORACLE_CONFIG.new.enableFlagsForOracles[1]);
      expect(tokenConfig.enableFlagsForOracles[2]).to.equal(U_RESILIENT_ORACLE_CONFIG.new.enableFlagsForOracles[2]);
      expect(tokenConfig.cachingEnabled).to.equal(U_RESILIENT_ORACLE_CONFIG.new.cachingEnabled);
    });

    it("should match post-VIP ChainlinkOracle feed for U", async () => {
      const config = await chainlinkOracle.tokenConfigs(U);
      expect(config.feed).to.equal(CHAINLINK_U_CONFIG.newFeed);
      expect(config.maxStalePeriod).to.equal(CHAINLINK_U_CONFIG.maxStalePeriod);
    });

    it("should match post-VIP AtlasOracle feed for U", async () => {
      const config = await atlasOracle.tokenConfigs(U);
      expect(config.feed).to.equal(ATLAS_U_CONFIG.feed);
      expect(config.maxStalePeriod).to.equal(ATLAS_U_CONFIG.maxStalePeriod);
    });

    it("post-VIP U price should be within 1% of pre-VIP price", async () => {
      await setMaxStaleForU();

      const postVipPrice = await resilientOracle.getPrice(U);
      const pre = parseFloat(ethers.utils.formatUnits(preVipPrice, 18));
      const post = parseFloat(ethers.utils.formatUnits(postVipPrice, 18));
      expect(post).to.be.closeTo(pre, pre * 0.01);
    });

    it("post-VIP U price should still be close to $1", async () => {
      const postVipPrice = await resilientOracle.getPrice(U);
      const price = parseFloat(ethers.utils.formatUnits(postVipPrice, 18));
      const pre = parseFloat(ethers.utils.formatUnits(preVipPrice, 18));
      console.log(`Post-VIP U price: $${price} (diff from pre: ${(price - pre).toFixed(6)})`);
      expect(price).to.be.closeTo(1, 0.01);
    });
  });

  describe("Post-VIP XVS base reward", () => {
    it("XVSStore XVS balance should increase by XVS_GRANT_AMOUNT", async () => {
      const xvsStoreBalanceAfter = await xvs.balanceOf(XVS_STORE);
      expect(xvsStoreBalanceAfter.sub(xvsStoreBalanceBefore)).to.equal(XVS_GRANT_AMOUNT);
    });

    it("Unitroller XVS balance should decrease by XVS_GRANT_AMOUNT", async () => {
      const xvsUnitrollerBalanceAfter = await xvs.balanceOf(bscmainnet.UNITROLLER);
      expect(xvsUnitrollerBalanceBefore.sub(xvsUnitrollerBalanceAfter)).to.equal(XVS_GRANT_AMOUNT);
    });
  });

  describe("Post-VIP Allez Labs payment", () => {
    it("Allez Labs USDT balance should increase by 105,000 USDT", async () => {
      const allezLabsUsdtBalanceAfter = await usdt.balanceOf(ALLEZ_LABS);
      expect(allezLabsUsdtBalanceAfter.sub(allezLabsUsdtBalanceBefore)).to.equal(ALLEZ_LABS_USDT_AMOUNT);
    });

    it("Treasury USDT balance should decrease by 105,000 USDT", async () => {
      const treasuryUsdtBalanceAfter = await usdt.balanceOf(bscmainnet.VTREASURY);
      expect(treasuryUsdtBalanceBefore.sub(treasuryUsdtBalanceAfter)).to.equal(ALLEZ_LABS_USDT_AMOUNT);
    });
  });

  describe("Post-VIP ACM permissions", () => {
    const checkRole = async (contract: string, fnSig: string, account: string) => {
      const roleHash = ethers.utils.keccak256(ethers.utils.solidityPack(["address", "string"], [contract, fnSig]));
      expect(await acm.hasRole(roleHash, account)).to.be.true;
    };

    it("Normal Timelock should have setTokenConfig permission on SolvBTCFundamentalChainlinkOracle", async () => {
      await checkRole(SOLVBTC_FUNDAMENTAL_CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)", bscmainnet.NORMAL_TIMELOCK);
    });

    it("Normal Timelock should have setDirectPrice permission on SolvBTCFundamentalChainlinkOracle", async () => {
      await checkRole(
        SOLVBTC_FUNDAMENTAL_CHAINLINK_ORACLE,
        "setDirectPrice(address,uint256)",
        bscmainnet.NORMAL_TIMELOCK,
      );
    });

    it("Normal Timelock should have setTokenConfig permission on AtlasOracle", async () => {
      await checkRole(ATLAS_ORACLE, "setTokenConfig(TokenConfig)", bscmainnet.NORMAL_TIMELOCK);
    });

    it("Normal Timelock should have setDirectPrice permission on AtlasOracle", async () => {
      await checkRole(ATLAS_ORACLE, "setDirectPrice(address,uint256)", bscmainnet.NORMAL_TIMELOCK);
    });
  });
});
