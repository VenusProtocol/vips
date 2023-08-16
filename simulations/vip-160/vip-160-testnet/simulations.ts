import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, testVip } from "../../../src/vip-framework";
import { vip160Testnet } from "../../../vips/vip-160/vip-160-testnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import PROTOCOL_SHARE_RESERVE_ABI from "./abi/protocolShareReserve.json";
import RISK_FUND_ABI from "./abi/riskFund.json";
import SHORTFALL_ABI from "./abi/shortfall.json";
import VTOKEN_ABI from "./abi/vToken.json";

const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const POOL_REGISTRY = "0xC85491616Fa949E048F3aAc39fbf5b0703800667";
const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
const VENUS_TREASURY = "0x8b293600C50D6fbdc6Ed4251cc75ECe29880276f";
const SWAP_ROUTER_CORE_POOL = "0x83edf1deE1B730b7e8e13C00ba76027D63a51ac0";

const SHORTFALL = "0xd50392301b7f02eEDf3f33e54FE5de2e508c9DE5";
const PROTOCOL_SHARE_RESERVE = "0xCc096D31b291DF58B9da7Ae109a367771fD5EAd1";
const RISK_FUND = "0x7dF785302793155fcD6033f2b8487a7107546e48";

interface VenusPool {
  comptroller: string;
}

const getAllMarkets = async (poolRegistry: Contract) => {
  const pools = await poolRegistry.getAllPools();
  const comptrollers = await Promise.all(
    pools.map((pool: VenusPool) => ethers.getContractAt(COMPTROLLER_ABI, pool.comptroller)),
  );
  const marketAddresses = (
    await Promise.all(comptrollers.map(async (comptroller: Contract) => comptroller.getAllMarkets()))
  ).flat();
  const markets = await Promise.all(
    marketAddresses.map((address: string) => ethers.getContractAt(VTOKEN_ABI, address)),
  );
  return markets;
};

forking(32497650, () => {
  let poolRegistry: Contract;

  testVip("Risk fund, shortfall, PSR, stage 1", vip160Testnet());

  describe("RiskFund configuration", () => {
    let riskFund: Contract;

    before(async () => {
      riskFund = await ethers.getContractAt(RISK_FUND_ABI, RISK_FUND);
    });

    it("should accept ownership over the RiskFund", async () => {
      expect(await riskFund.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it("should have the PoolRegistry address set", async () => {
      expect(await riskFund.poolRegistry()).to.equal(POOL_REGISTRY);
    });

    it("should have convertibleBaseAsset equal to USDT", async () => {
      expect(await riskFund.convertibleBaseAsset()).to.equal(USDT);
    });

    it("should have the Shortfall contract address set", async () => {
      expect(await riskFund.shortfall()).to.equal(SHORTFALL);
    });

    it("should have pancakeSwapRouter equal to the core pool swap router", async () => {
      expect(await riskFund.pancakeSwapRouter()).to.equal(SWAP_ROUTER_CORE_POOL);
    });

    it("should have minAmountToConvert equal to $10", async () => {
      expect(await riskFund.minAmountToConvert()).to.equal(parseUnits("10", 18));
    });
  });

  describe("Shortfall configuration", () => {
    let shortfall: Contract;

    before(async () => {
      shortfall = await ethers.getContractAt(SHORTFALL_ABI, SHORTFALL);
    });

    it("should accept ownership over the Shortfall", async () => {
      expect(await shortfall.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it("should have the PoolRegistry address set", async () => {
      expect(await shortfall.poolRegistry()).to.equal(POOL_REGISTRY);
    });

    it("should have the RiskFund address set", async () => {
      expect(await shortfall.riskFund()).to.equal(RISK_FUND);
    });

    it("should have minimumPoolBadDebt equal to $1000", async () => {
      expect(await shortfall.minimumPoolBadDebt()).to.equal(parseUnits("1000", 18));
    });

    it("should have incentive equal to 10% (1000bps)", async () => {
      expect(await shortfall.incentiveBps()).to.equal(1000);
    });

    it("should have waitForFirstBidder equal to 100 blocks", async () => {
      expect(await shortfall.waitForFirstBidder()).to.equal(100);
    });

    it("should have nextBidderBlockLimit equal to 100 blocks", async () => {
      expect(await shortfall.nextBidderBlockLimit()).to.equal(100);
    });

    it("should have convertibleBaseAsset equal to USDT", async () => {
      expect(await shortfall.convertibleBaseAsset()).to.equal(USDT);
    });
  });

  describe("ProtocolShareReserve configuration", () => {
    let protocolShareReserve: Contract;

    before(async () => {
      protocolShareReserve = await ethers.getContractAt(PROTOCOL_SHARE_RESERVE_ABI, PROTOCOL_SHARE_RESERVE);
    });

    it("should accept ownership over the ProtocolShareReserve", async () => {
      expect(await protocolShareReserve.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it("should have the PoolRegistry address set", async () => {
      expect(await protocolShareReserve.poolRegistry()).to.equal(POOL_REGISTRY);
    });

    it("should have the RiskFund address set", async () => {
      expect(await protocolShareReserve.riskFund()).to.equal(RISK_FUND);
    });

    it("should send the remaining income to Venus Treasury", async () => {
      expect(await protocolShareReserve.protocolIncome()).to.equal(VENUS_TREASURY);
    });
  });

  describe("Markets configuration", () => {
    before(async () => {
      poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, POOL_REGISTRY);
    });

    it("sets ProtocolShareReserve address for all markets", async () => {
      const markets = await getAllMarkets(poolRegistry);
      for (const market of markets) {
        expect(await market.protocolShareReserve()).to.equal(PROTOCOL_SHARE_RESERVE);
      }
    });

    it("sets Shortfall contract address for all markets", async () => {
      const markets = await getAllMarkets(poolRegistry);
      for (const market of markets) {
        expect(await market.shortfall()).to.equal(SHORTFALL);
      }
    });
  });
});
