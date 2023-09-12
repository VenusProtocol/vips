import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip160Testnet } from "../../../vips/vip-160/vip-160-testnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
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

const SHORTFALL = "0x503574a82fE2A9f968d355C8AAc1Ba0481859369";
const PROTOCOL_SHARE_RESERVE = "0xc987a03ab6C2A5891Fc0919f021cc693B5E55278";
const RISK_FUND = "0x487CeF72dacABD7E12e633bb3B63815a386f7012";

const ALL_MARKETS = [
  "0x170d3b2da05cc2124334240fB34ad1359e34C562",
  "0x3338988d0beb4419Acb8fE624218754053362D06",
  "0x899dDf81DfbbF5889a16D075c352F2b959Dd24A4",

  "0xe507B30C41E9e375BCe05197c1e09fc9ee40c0f6",
  "0x5e68913fbbfb91af30366ab1B21324410b49a308",
  "0xb7caC5Ef82cb7f9197ee184779bdc52c5490C02a",
  "0x80CC30811e362aC9aB857C3d7875CbcCc0b65750",
  "0xa109DE0abaeefC521Ec29D89eA42E64F37A6882E",
  "0xb677e080148368EeeE70fA3865d07E92c6500174",
  "0x4C94e67d239aD585275Fdd3246Ab82c8a2668564",

  "0x1958035231E125830bA5d17D168cEa07Bb42184a",
  "0xef470AbC365F88e4582D8027172a392C473A5B53",
  "0x0bFE4e0B8A2a096A27e5B18b078d25be57C08634",
  "0xdeDf3B2bcF25d0023115fd71a0F8221C91C92B1a",

  "0x57a664Dd7f1dE19545fEE9c86C949e3BF43d6D47",
  "0x644A149853E5507AdF3e682218b8AC86cdD62951",
  "0x75aa42c832a8911B77219DbeBABBB40040d16987",
  "0x231dED0Dfc99634e52EE1a1329586bc970d773b3",
  "0x2197d02cC9cd1ad51317A0a85A656a0c82383A7c",
  "0xD5b20708d8f0FcA52cb609938D0594C4e32E5DaD",

  "0x47793540757c6E6D84155B33cd8D9535CFdb9334",
  "0xEe543D5de2Dbb5b07675Fc72831A2f1812428393",
  "0x410286c43a525E1DCC7468a9B091C111C8324cd1",
  "0x712774CBFFCBD60e9825871CcEFF2F917442b2c3",
  "0xD804F74fe21290d213c46610ab171f7c2EeEBDE7",
];

interface VenusPool {
  comptroller: string;
}

forking(33268000, () => {
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

  testVip("Risk fund, shortfall, PSR, stage 1", vip160Testnet(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [VTOKEN_ABI],
        ["NewShortfallContract", "NewProtocolShareReserve", "OwnershipTransferred"],
        [25, 25, 3],
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
          // We have 7 markets on bsctestnet with zero reserves, so tests for these
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
