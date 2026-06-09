import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import {
  ATLAS_ORACLE,
  MARKETS,
  PROTOCOL_SHARE_RESERVE,
  REDUCE_RESERVES_BLOCK_DELTA,
  convertAmountToVTokens,
  vTokensRemaining,
  vip669,
} from "../../vips/vip-669/bscmainnet";
import ATLAS_ORACLE_ABI from "./abi/AtlasOracle.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import VTOKEN_ABI from "./abi/VToken.json";
import VTREASURY_ABI from "./abi/VTreasury.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const FORK_BLOCK = 103175700;

forking(FORK_BLOCK, async () => {
  const comptroller = new ethers.Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, ethers.provider);
  const resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const atlasOracle = new ethers.Contract(ATLAS_ORACLE, ATLAS_ORACLE_ABI, ethers.provider);

  describe("Pre-VIP behavior", async () => {
    for (const m of MARKETS) {
      it(`check ${m.vToken.symbol} market not listed`, async () => {
        const market = await comptroller.markets(m.vToken.address);
        expect(market.isListed).to.equal(false);
      });
    }
  });

  testVip("VIP-669", await vip669(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, VTOKEN_ABI, VTREASURY_ABI],
        [
          "MarketListed",
          "NewSupplyCap",
          "NewBorrowCap",
          "BorrowAllowedUpdated",
          "NewAccessControlManager",
          "NewProtocolShareReserve",
          "NewReduceReservesBlockDelta",
          "NewReserveFactor",
          "NewCollateralFactor",
          "NewLiquidationThreshold",
          "NewLiquidationIncentive",
        ],
        // 2 markets listed in this VIP
        [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
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
          underlying: m.vToken.underlying.address,
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
          expect(config.maxStalePeriod).to.equal(m.oracle.maxStalePeriod);
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

        it("should allow borrowing on the market", async () => {
          const market = await comptroller.markets(m.vToken.address);
          expect(market.isBorrowAllowed).to.equal(true);
        });
      });
    }
  });
});
