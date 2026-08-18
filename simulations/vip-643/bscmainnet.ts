import { expect } from "chai";
import { BigNumber } from "ethers";
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
  vip643,
} from "../../vips/vip-643/bscmainnet";
import ATLAS_ORACLE_ABI from "./abi/AtlasOracle.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import DBO_ABI from "./abi/DeviationBoundedOracle.json";
import ERC20_ABI from "./abi/ERC20.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import VTOKEN_ABI from "./abi/VToken.json";

const { bscmainnet } = NETWORK_ADDRESSES;

// Latest block at the time of authoring — after vSKHYB was deployed, the Atlas SKHYB/USD feed is
// live, and the VTreasury has been funded with 0.66 SKHYB (bootstrap draws 0.65 from it).
const FORK_BLOCK = 109922737;

forking(FORK_BLOCK, async () => {
  const comptroller = new ethers.Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, ethers.provider);
  const resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const atlasOracle = new ethers.Contract(ATLAS_ORACLE, ATLAS_ORACLE_ABI, ethers.provider);
  const dbo = new ethers.Contract(DEVIATION_BOUNDED_ORACLE, DBO_ABI, ethers.provider);

  // Snapshot of the VTreasury's real underlying balance before the VIP executes, so we can assert
  // the bootstrap withdraws exactly the initial supply from the live on-chain balance (no seeding).
  const treasuryBalanceBefore: Record<string, BigNumber> = {};

  before(async () => {
    for (const m of MARKETS) {
      const underlying = new ethers.Contract(m.vToken.underlying.address, ERC20_ABI, ethers.provider);
      treasuryBalanceBefore[m.vToken.address] = await underlying.balanceOf(bscmainnet.VTREASURY);
    }
  });

  describe("Pre-VIP behavior", async () => {
    for (const m of MARKETS) {
      it(`check ${m.vToken.symbol} market not listed`, async () => {
        const market = await comptroller.markets(m.vToken.address);
        expect(market.isListed).to.equal(false);
      });

      it(`VTreasury holds enough ${m.vToken.underlying.symbol} for the bootstrap`, async () => {
        const underlying = new ethers.Contract(m.vToken.underlying.address, ERC20_ABI, ethers.provider);
        const balance = await underlying.balanceOf(bscmainnet.VTREASURY);
        expect(balance).to.be.gte(m.initialSupply.amount);
      });
    }
  });

  testVip("VIP-643", await vip643(true), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, VTOKEN_ABI],
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
        // single market listed in this VIP
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
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

        it("bootstrap drew the initial supply from the VTreasury's real balance", async () => {
          const balanceAfter = await underlying.balanceOf(bscmainnet.VTREASURY);
          expect(treasuryBalanceBefore[m.vToken.address].sub(balanceAfter)).to.equal(m.initialSupply.amount);
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
