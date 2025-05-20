import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import { WETH_ORACLE, WSTETH_ORACLE, vip500, weETH, wstETH } from "../../vips/vip-500/bsctestnet";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import ORACLE_ABI from "./abi/oracle.json";

const { unichainsepolia } = NETWORK_ADDRESSES;

forking(20881282, async () => {
  let resilientOracle: Contract;
  let wethOracle: Contract;
  let wstethOracle: Contract;

  before(async () => {
    resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, unichainsepolia.RESILIENT_ORACLE);
    wethOracle = await ethers.getContractAt(ORACLE_ABI, WETH_ORACLE);
    wstethOracle = await ethers.getContractAt(ORACLE_ABI, WSTETH_ORACLE);
  });

  testForkedNetworkVipCommands("Oracle configuration", await vip500());

  describe("weETH Oracle Configuration", () => {
    it("should set correct token config in ResilientOracle", async () => {
      const config = await resilientOracle.getTokenConfig(weETH);
      expect(config.asset).to.equal(weETH);
    });

    it("should set correct snapshot parameters", async () => {
      const expectedRate = parseUnits("1.06778921", 18).mul(503).div(10000).add(parseUnits("1.06778921", 18));

      expect(await wethOracle.snapshotMaxExchangeRate()).to.equal(expectedRate);
      expect(await wethOracle.snapshotTimestamp()).to.equal(1747589544);
    });

    it("should set correct growth rate parameters", async () => {
      const SECONDS_PER_YEAR = 365 * 24 * 60 * 60; // 31,536,000
      const annualGrowthRate = parseUnits("0.053", 18); // 5.3% in 18 decimals
      const expectedGrowthRatePerSecond = annualGrowthRate.div(SECONDS_PER_YEAR);

      expect(await wethOracle.growthRatePerSecond()).to.equal(expectedGrowthRatePerSecond);
      expect(await wethOracle.snapshotInterval()).to.equal(30 * 24 * 60 * 60);
    });

    it("should set correct snapshot gap", async () => {
      expect(await wethOracle.snapshotGap()).to.equal(parseUnits("0.0044", 18));
    });
  });

  describe("wstETH Oracle Configuration", () => {
    it("should set correct token config in ResilientOracle", async () => {
      const config = await resilientOracle.getTokenConfig(wstETH);
      expect(config.asset).to.equal(wstETH);
    });

    it("should set correct snapshot parameters", async () => {
      const expectedRate = parseUnits("1.20297267", 18).mul(607).div(10000).add(parseUnits("1.20297267", 18));

      expect(await wstethOracle.snapshotMaxExchangeRate()).to.equal(expectedRate);
      expect(await wstethOracle.snapshotTimestamp()).to.equal(1747589544);
    });

    it("should set correct growth rate parameters", async () => {
      const SECONDS_PER_YEAR = 365 * 24 * 60 * 60; // 31,536,000
      const annualGrowthRate = parseUnits("0.067", 18); // 6.7% in 18 decimals
      const expectedGrowthRatePerSecond = annualGrowthRate.div(SECONDS_PER_YEAR);

      expect(await wstethOracle.growthRatePerSecond()).to.equal(expectedGrowthRatePerSecond);
      expect(await wstethOracle.snapshotInterval()).to.equal(30 * 24 * 60 * 60);
    });

    it("should set correct snapshot gap", async () => {
      expect(await wstethOracle.snapshotGap()).to.equal(parseUnits("0.0055", 18));
    });
  });
});
