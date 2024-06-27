import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vip170 } from "../../../vips/vip-170/vip-170";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import PROTOCOL_SHARE_RESERVE_ABI from "./abi/protocolShareReserve.json";
import RISK_FUND_ABI from "./abi/riskFund.json";
import SHORTFALL_ABI from "./abi/shortfall.json";
import VTOKEN_ABI from "./abi/vToken.json";

const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const POOL_REGISTRY = "0x9F7b01A536aFA00EF10310A162877fd792cD0666";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const SWAP_ROUTER_CORE_POOL = "0x8938E6dA30b59c1E27d5f70a94688A89F7c815a4";
const VENUS_TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";

const SHORTFALL = "0xf37530A8a810Fcb501AA0Ecd0B0699388F0F2209";
const PROTOCOL_SHARE_RESERVE = "0xfB5bE09a1FA6CFDA075aB1E69FE83ce8324682e4";
const RISK_FUND = "0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42";

const ALL_MARKETS = [
  "0xCa2D81AA7C09A1a025De797600A7081146dceEd9",
  "0x5e3072305F9caE1c7A82F6Fe9E38811c74922c3B",
  "0xc3a45ad8812189cAb659aD99E64B1376f6aCD035",
  "0x53728FD51060a85ac41974C6C3Eb1DaE42776723",
  "0x8f657dFD3a1354DEB4545765fE6840cc54AFd379",
  "0x02c5Fb0F26761093D297165e902e96D08576D344",
  "0x1D8bBDE12B6b34140604E18e9f9c6e14deC16854",
  "0xA615467caE6B9E0bb98BC04B4411d9296fd1dFa0",
  "0x19CE11C8817a1828D1d357DFBF62dCf5b0B2A362",
  "0x736bf1D21A28b5DC19A1aC8cA71Fc2856C23c03F",
  "0xE5FE5527A5b76C75eedE77FdFA6B80D52444A465",
  "0xc353B7a1E13dDba393B5E120D4169Da7185aA2cb",
  "0x4978591f17670A846137d9d613e333C38dc68A37",
  "0x9f2FD23bd0A5E08C5f2b9DD6CF9C96Bfb5fA515C",
  "0xBfe25459BA784e70E2D7a718Be99a1f3521cA17f",
  "0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791",
  "0xcc5D9e502574cda17215E70bC0B4546663785227",
  "0xe10E80B7FD3a29fE46E16C30CC8F4dd938B742e2",
  "0x49c26e12959345472E2Fd95E5f79F8381058d3Ee",
  "0xb114cfA615c828D88021a41bFc524B800E64a9D5",
  "0x836beb2cB723C498136e1119248436A645845F4E",
  "0x281E5378f99A4bc55b295ABc0A3E7eD32Deba059",
  "0xf1da185CCe5BeD1BeBbb3007Ef738Ea4224025F7",
];

interface VenusPool {
  comptroller: string;
}

forking(31671700, async () => {
  let poolRegistry: Contract;

  before(async () => {
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, POOL_REGISTRY);
  });

  describe("Simulation correctness", () => {
    it("tests all markets", async () => {
      const pools = await poolRegistry.getAllPools();
      const comptrollers = await Promise.all(
        pools.map((pool: VenusPool) => ethers.getContractAt(COMPTROLLER_ABI, pool.comptroller)),
      );
      const marketAddresses = (
        await Promise.all(comptrollers.map(async (comptroller: Contract) => comptroller.getAllMarkets()))
      ).flat();
      expect(marketAddresses).to.deep.equal(ALL_MARKETS);
    });
  });

  testVip("Risk fund, shortfall, PSR, stage 1", await vip170(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [VTOKEN_ABI],
        ["NewShortfallContract", "NewProtocolShareReserve", "OwnershipTransferred"],
        [23, 23, 3],
      );
    },
  });

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

  describe("Markets tests", () => {
    for (const marketAddress of ALL_MARKETS) {
      describe(`VToken at ${marketAddress}`, () => {
        let market: Contract;
        let protocolShareReserve: Contract;
        let underlying: Contract;
        let comptrollerAddress: string;
        let reservesToDistribute: BigNumber;

        before(async () => {
          market = await ethers.getContractAt(VTOKEN_ABI, marketAddress);
          protocolShareReserve = await ethers.getContractAt(PROTOCOL_SHARE_RESERVE_ABI, PROTOCOL_SHARE_RESERVE);
          comptrollerAddress = await market.comptroller();
          underlying = await ethers.getContractAt(ERC20_ABI, await market.underlying());
          await market.accrueInterest();
          reservesToDistribute = await market.totalReserves();
        });

        it("sets ProtocolShareReserve address", async () => {
          expect(await market.protocolShareReserve()).to.equal(PROTOCOL_SHARE_RESERVE);
        });

        it("sets Shortfall contract address", async () => {
          expect(await market.shortfall()).to.equal(SHORTFALL);
        });

        it("transfers reserves", async () => {
          // We actually have four markets on bscmainnet with zero reserves, so tests for these
          // markets are essentially a no-op. Still, we can't skip them at this point.
          // expect(reservesToDistribute).to.be.gt(0);
          const tx = await market.reduceReserves(reservesToDistribute);
          await expect(tx).to.changeTokenBalance(underlying, PROTOCOL_SHARE_RESERVE, reservesToDistribute);
        });

        it("tracks reserves in PSR correctly", async () => {
          expect(await protocolShareReserve.getPoolAssetReserve(comptrollerAddress, underlying.address)).to.equal(
            reservesToDistribute,
          );
        });

        it("distributes reserves to VTreasury (50%) and RiskFund (50%)", async () => {
          const tx = await protocolShareReserve.releaseFunds(
            comptrollerAddress,
            underlying.address,
            reservesToDistribute,
          );
          const treasuryShare = reservesToDistribute.mul(5).div(10);
          const riskFundShare = reservesToDistribute.sub(treasuryShare);
          await expect(tx).to.changeTokenBalances(
            underlying,
            [VENUS_TREASURY, RISK_FUND],
            [treasuryShare, riskFundShare],
          );
        });
      });
    }
  });
});
