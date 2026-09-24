import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import {
  ATLAS_MAX_STALE_PERIOD,
  ATLAS_ORACLE,
  BORROW_ACTION,
  DBO_COOLDOWN_PERIOD,
  DBO_RESET_THRESHOLD,
  DBO_TRIGGER_THRESHOLD,
  DEVIATION_BOUNDED_ORACLE,
  MARKETS,
  ONE_YEAR,
  PROTOCOL_SHARE_RESERVE,
  REDUCE_RESERVES_BLOCK_DELTA,
  convertAmountToVTokens,
  vTokensRemaining,
  vip633,
} from "../../vips/vip-633/bscmainnet";
import ATLAS_ORACLE_ABI from "./abi/AtlasOracle.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import DBO_ABI from "./abi/DeviationBoundedOracle.json";
import ERC20_ABI from "./abi/ERC20.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import VTOKEN_ABI from "./abi/VToken.json";
import VTREASURY_ABI from "./abi/VTreasury.json";

const { bscmainnet } = NETWORK_ADDRESSES;

// Block after all three markets (TSLAB/NVDAB/SPCXB) were deployed, their Atlas feeds went live,
// and the VTreasury received the bootstrap funding for each.
const FORK_BLOCK = 104593700;

forking(FORK_BLOCK, async () => {
  const comptroller = new ethers.Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, ethers.provider);
  const resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const atlasOracle = new ethers.Contract(ATLAS_ORACLE, ATLAS_ORACLE_ABI, ethers.provider);
  const dbo = new ethers.Contract(DEVIATION_BOUNDED_ORACLE, DBO_ABI, ethers.provider);

  describe("Pre-VIP behavior", async () => {
    for (const m of MARKETS) {
      it(`check ${m.vToken.symbol} market not listed`, async () => {
        const market = await comptroller.markets(m.vToken.address);
        expect(market.isListed).to.equal(false);
      });
    }
  });

  testVip("VIP-633", await vip633(true), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, VTOKEN_ABI, VTREASURY_ABI],
        [
          "MarketListed",
          "NewSupplyCap",
          "ActionPausedMarket",
          "NewAccessControlManager",
          "NewProtocolShareReserve",
          "NewReduceReservesBlockDelta",
          "NewReserveFactor",
          "NewCollateralFactor",
          "NewLiquidationThreshold",
          "NewLiquidationIncentive",
        ],
        // 3 markets listed in this VIP
        [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    for (const m of MARKETS) {
      describe(`${m.vToken.symbol} market`, async () => {
        const vToken = new ethers.Contract(m.vToken.address, VTOKEN_ABI, ethers.provider);
        const underlying = new ethers.Contract(m.vToken.underlying.address, ERC20_ABI, ethers.provider);

        it("check new IRM", async () => {
          expect(await vToken.interestRateModel()).to.equal(m.rateModel);
        });

        checkInterestRate(m.rateModel, m.vToken.symbol, {
          base: m.interestRateModel.baseRatePerYear,
          multiplier: m.interestRateModel.multiplierPerYear,
          jump: m.interestRateModel.jumpMultiplierPerYear,
          kink: m.interestRateModel.kink,
        });

        checkVToken(m.vToken.address, {
          name: m.vToken.name,
          symbol: m.vToken.symbol,
          decimals: m.vToken.decimals,
          underlying: m.vToken.underlying,
          exchangeRate: m.vToken.exchangeRate,
          comptroller: m.vToken.comptroller,
        });

        checkRiskParameters(m.vToken.address, m.vToken, m.riskParameters);

        it("returns the configured price from the oracle", async () => {
          const price = await resilientOracle.getUnderlyingPrice(m.vToken.address);
          expect(price).to.equal(m.oracle.price);
        });

        it("configures the ResilientOracle to use the Atlas Oracle", async () => {
          const config = await resilientOracle.getTokenConfig(m.vToken.underlying.address);
          expect(config.oracles[0]).to.equal(m.oracle.address);
          expect(config.enableFlagsForOracles[0]).to.equal(true);
        });

        it("configures the Atlas Oracle feed for the underlying", async () => {
          const config = await atlasOracle.tokenConfigs(m.vToken.underlying.address);
          expect(config.feed).to.equal(m.oracle.feed);
          // Simulations configure a 1-year stale period (see VIP-615 workaround).
          expect(config.maxStalePeriod).to.equal(ONE_YEAR);
        });

        it("enables Oracle Dynamic Protection Mode with a 16.67% trigger", async () => {
          const cfg = await dbo.assetProtectionConfig(m.vToken.underlying.address);
          expect(cfg.isBoundedPricingEnabled).to.equal(true);
          expect(cfg.triggerThreshold).to.equal(DBO_TRIGGER_THRESHOLD);
          expect(cfg.resetThreshold).to.equal(DBO_RESET_THRESHOLD);
          expect(cfg.cooldownPeriod).to.equal(DBO_COOLDOWN_PERIOD);
          expect(cfg.cachingEnabled).to.equal(false);
        });

        it("market has correct owner", async () => {
          expect(await vToken.admin()).to.equal(bscmainnet.NORMAL_TIMELOCK);
        });

        it("market has correct ACM", async () => {
          expect(await vToken.accessControlManager()).to.equal(bscmainnet.ACCESS_CONTROL_MANAGER);
        });

        it("market has correct protocol share reserve", async () => {
          expect(await vToken.protocolShareReserve()).to.equal(PROTOCOL_SHARE_RESERVE);
        });

        it("market has correct total supply", async () => {
          const supply = await vToken.totalSupply();
          expect(supply).to.equal(convertAmountToVTokens(m.initialSupply.amount, m.vToken.exchangeRate));
        });

        it("market has correct reduce reserves block delta", async () => {
          expect(await vToken.reduceReservesBlockDelta()).to.equal(REDUCE_RESERVES_BLOCK_DELTA);
        });

        it("market has balance of underlying", async () => {
          expect(await underlying.balanceOf(m.vToken.address)).to.equal(m.initialSupply.amount);
        });

        it("should not leave any vTokens in the timelock", async () => {
          expect(await vToken.balanceOf(bscmainnet.NORMAL_TIMELOCK)).to.equal(0);
        });

        it("should burn vTokens", async () => {
          expect(await vToken.balanceOf(ethers.constants.AddressZero)).to.equal(m.initialSupply.vTokensToBurn);
        });

        it("should send remaining vTokens to vTokenReceiver", async () => {
          expect(await vToken.balanceOf(m.initialSupply.vTokenReceiver)).to.equal(vTokensRemaining(m));
        });

        it("should pause borrowing on the market", async () => {
          expect(await comptroller.actionPaused(m.vToken.address, BORROW_ACTION)).to.equal(true);
        });
      });
    }
  });

  // Runs last: the proposal configures ONE_YEAR for simulation purposes; here we roll the Atlas
  // stale period back to the production value to confirm it is settable by the Normal Timelock.
  // (Must come after the price assertions above — once the real ~1h period is in place, the feed
  // is stale relative to the mined governance lifecycle and getUnderlyingPrice would revert.)
  describe("Atlas Oracle stale period rollback", () => {
    before(async () => {
      const timelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
      for (const m of MARKETS) {
        await atlasOracle
          .connect(timelock)
          .setTokenConfig([m.vToken.underlying.address, m.oracle.feed, ATLAS_MAX_STALE_PERIOD]);
      }
    });

    for (const m of MARKETS) {
      it(`resets the ${m.vToken.symbol} Atlas stale period to the production value`, async () => {
        const config = await atlasOracle.tokenConfigs(m.vToken.underlying.address);
        expect(config.maxStalePeriod).to.equal(ATLAS_MAX_STALE_PERIOD);
      });
    }
  });
});
