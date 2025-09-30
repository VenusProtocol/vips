import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import {
  expectEvents,
  initMainnetUser,
  setMaxStalePeriodInBinanceOracle,
  setMaxStalePeriodInChainlinkOracle,
  setRedstonePrice,
} from "src/utils";
import { forking, pretendExecutingVip, testVip } from "src/vip-framework";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip547 from "../../vips/vip-547/bscmainnet";
import { CORE_MARKETS } from "../../vips/vip-547/bscmainnet";
import vip548 from "../../vips/vip-548/bscmainnet";
import {
  CONVERSION_INCENTIVE,
  EMODE_POOL,
  PROTOCOL_SHARE_RESERVE,
  PT_SolvBTC_BNB_18DEC2025,
  PT_xSolvBTC_18DEC2025,
  RATE_MODEL,
  convertAmountToVTokens,
  converterBaseAssets,
  solvBTCBNBMarketSpecs,
  vip553,
  xSolvBTCMarketSpecs,
} from "../../vips/vip-553/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import CAPPED_ORACLE_ABI from "./abi/CappedOracle.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import REDSTONE_ORACLE_ABI from "./abi/RedstoneOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";
import VTOKEN_ABI from "./abi/VToken.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const setStalePeriodForVip547 = async () => {
  for (const market of CORE_MARKETS) {
    await setMaxStalePeriodInChainlinkOracle(
      bscmainnet.CHAINLINK_ORACLE,
      market.underlying,
      ethers.constants.AddressZero,
      bscmainnet.NORMAL_TIMELOCK,
      315360000,
    );

    await setMaxStalePeriodInChainlinkOracle(
      bscmainnet.REDSTONE_ORACLE,
      market.underlying,
      ethers.constants.AddressZero,
      bscmainnet.NORMAL_TIMELOCK,
      315360000,
    );
    await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, market.symbol.slice(1), 315360000);
  }

  const xSolvBTC = "0x1346b618dC92810EC74163e4c27004c921D446a5";
  const xSolvBTC_RedStone_Feed = "0x24c8964338Deb5204B096039147B8e8C3AEa42Cc";
  await setRedstonePrice(bscmainnet.REDSTONE_ORACLE, xSolvBTC, xSolvBTC_RedStone_Feed, bscmainnet.NORMAL_TIMELOCK);

  const THE = "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11";
  const THE_REDSTONE_FEED = "0xFB1267A29C0aa19daae4a483ea895862A69e4AA5";
  await setRedstonePrice(bscmainnet.REDSTONE_ORACLE, THE, THE_REDSTONE_FEED, bscmainnet.NORMAL_TIMELOCK);

  const TRX = "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3";
  const TRX_REDSTONE_FEED = "0xa17362dd9AD6d0aF646D7C8f8578fddbfc90B916";
  await setRedstonePrice(bscmainnet.REDSTONE_ORACLE, TRX, TRX_REDSTONE_FEED, bscmainnet.NORMAL_TIMELOCK, 3153600000, {
    tokenDecimals: 6,
  });

  const PTsUSDE_26JUN2025 = "0xDD809435ba6c9d6903730f923038801781cA66ce";
  const PT_SUSDE_FIXED_PRICE = parseUnits("1.05", 18);

  const impersonatedTimelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("2"));
  const oracle = new ethers.Contract(bscmainnet.REDSTONE_ORACLE, REDSTONE_ORACLE_ABI, ethers.provider);
  const resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);

  await resilientOracle
    .connect(impersonatedTimelock)
    .setTokenConfig([
      PTsUSDE_26JUN2025,
      [bscmainnet.REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
      [true, false, false],
      false,
    ]);
  await oracle.connect(impersonatedTimelock).setDirectPrice(PTsUSDE_26JUN2025, PT_SUSDE_FIXED_PRICE);
};

const setStalePeriodForVip548 = async () => {
  // set maxStalePeriod
  const USDT = "0x55d398326f99059fF775485246999027B3197955";
  const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";

  await setMaxStalePeriodInChainlinkOracle(
    NETWORK_ADDRESSES.bscmainnet.CHAINLINK_ORACLE,
    USDT,
    ethers.constants.AddressZero,
    NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK,
    315360000,
  );
  await setMaxStalePeriodInChainlinkOracle(
    NETWORK_ADDRESSES.bscmainnet.CHAINLINK_ORACLE,
    USDC,
    ethers.constants.AddressZero,
    NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK,
    315360000,
  );

  const PT_USDe_30OCT2025 = "0x607C834cfb7FCBbb341Cbe23f77A6E83bCf3F55c";
  const redstoneOracle = new ethers.Contract(bscmainnet.REDSTONE_ORACLE, REDSTONE_ORACLE_ABI, ethers.provider);
  const impersonatedTimelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("2"));
  const PT_USDe_FIXED_PRICE = parseUnits("992132780932187177", 18);
  const resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);

  await resilientOracle
    .connect(impersonatedTimelock)
    .setTokenConfig([
      PT_USDe_30OCT2025,
      [bscmainnet.REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
      [true, false, false],
      false,
    ]);

  await redstoneOracle.connect(impersonatedTimelock).setDirectPrice(PT_USDe_30OCT2025, PT_USDe_FIXED_PRICE);
};

const imporsonateFundingVTreasury = async (PTxSolvBTC: Contract, PTSolvBTC_BNB: Contract) => {
  const VTreasury = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
  const PT_xSolvBTC_18DEC2025_HOLDER = "0xE616D50e441aa2f6d6CD43eba1b1632AB1B046e6";
  const PT_SolvBTC_BNB_18DEC2025_HOLDER = "0x527bE6FA23ff71e3FAf5c2C1511b0531b67a701D";
  const impersonatedPTxSolvBTCHplder = await initMainnetUser(
    PT_xSolvBTC_18DEC2025_HOLDER,
    ethers.utils.parseEther("2"),
  );
  const impersonatedPTSolvBTCBNBHolder = await initMainnetUser(
    PT_SolvBTC_BNB_18DEC2025_HOLDER,
    ethers.utils.parseEther("2"),
  );
  PTxSolvBTC.connect(impersonatedPTxSolvBTCHplder).transfer(VTreasury, parseUnits("0.01", 18));
  PTSolvBTC_BNB.connect(impersonatedPTSolvBTCBNBHolder).transfer(VTreasury, parseUnits("0.01", 18));
};

forking(62971525, async () => {
  let comptroller: Contract;
  let resilientOracle: Contract;
  let PTxSolvBTC: Contract;
  let PTSolvBTC_BNB: Contract;
  let vPTxSolvBTC: Contract;
  let vPTSolvBTC_BNB: Contract;

  before(async () => {
    // TODO remove pretendExecutingVip once they are exicuted
    await setStalePeriodForVip547();
    await pretendExecutingVip(await vip547(), NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK);
    await setStalePeriodForVip548();
    await pretendExecutingVip(await vip548(), NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK);
    const provider = ethers.provider;
    comptroller = new ethers.Contract(xSolvBTCMarketSpecs.vToken.comptroller, COMPTROLLER_ABI, provider);
    PTxSolvBTC = new ethers.Contract(xSolvBTCMarketSpecs.vToken.underlying.address, ERC20_ABI, provider);
    PTSolvBTC_BNB = new ethers.Contract(solvBTCBNBMarketSpecs.vToken.underlying.address, ERC20_ABI, provider);
    vPTxSolvBTC = new ethers.Contract(xSolvBTCMarketSpecs.vToken.address, VTOKEN_ABI, provider);
    vPTSolvBTC_BNB = new ethers.Contract(solvBTCBNBMarketSpecs.vToken.address, VTOKEN_ABI, provider);
    resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);

    // TODO remove once we have fund in the VTreasury
    await imporsonateFundingVTreasury(PTxSolvBTC, PTSolvBTC_BNB);

    // Set maxStalePeriod
    const BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
    const SolvBTC = "0x4aae823a6a0b376De6A78e74eCC5b079d38cBCf7";
    const xSolvBTC = "0x1346b618dC92810EC74163e4c27004c921D446a5";
    for (const asset of [BTCB, SolvBTC, xSolvBTC]) {
      await setMaxStalePeriodInChainlinkOracle(
        NETWORK_ADDRESSES.bscmainnet.CHAINLINK_ORACLE,
        asset,
        ethers.constants.AddressZero,
        NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK,
        315360000,
      );
    }
    // Change oracle to redstone for PT tokens in the simulations to avoid stale period error
    const redstoneOracle = new ethers.Contract(bscmainnet.REDSTONE_ORACLE, REDSTONE_ORACLE_ABI, ethers.provider);
    const impersonatedTimelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("2"));
    const PT_xSolvBTC_FIXED_PRICE = parseUnits("0.996374117903232014", 18);
    const PT_SolvBTC_BNB_FIXED_PRICE = parseUnits("0.985801401412392011", 18);

    await redstoneOracle.connect(impersonatedTimelock).setDirectPrice(PT_xSolvBTC_18DEC2025, PT_xSolvBTC_FIXED_PRICE);
    await redstoneOracle
      .connect(impersonatedTimelock)
      .setDirectPrice(PT_SolvBTC_BNB_18DEC2025, PT_SolvBTC_BNB_FIXED_PRICE);
  });

  describe("Pre-VIP behavior", async () => {
    it("check vPT-xSolvBTC-18DEC2025 market not listed", async () => {
      const market = await comptroller.markets(xSolvBTCMarketSpecs.vToken.underlying.address);
      expect(market.isListed).to.equal(false);
    });

    it("check vPT-SolvBTC.BNB-18DEC2025 market not listed", async () => {
      const market = await comptroller.markets(solvBTCBNBMarketSpecs.vToken.underlying.address);
      expect(market.isListed).to.equal(false);
    });

    it("check new BTC Emode PoolId does not exist", async () => {
      expect(await comptroller.lastPoolId()).to.be.lessThan(EMODE_POOL.id);
    });
  });

  testVip("VIP-553", await vip553(true), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, VTOKEN_ABI],
        [
          "MarketListed",
          "NewSupplyCap",
          "NewBorrowCap",
          "NewAccessControlManager",
          "NewProtocolShareReserve",
          "NewReduceReservesBlockDelta",
          "NewReserveFactor",
          "NewCollateralFactor",
          "NewLiquidationThreshold",
          "NewLiquidationIncentive",
          "BorrowAllowedUpdated",
          "PoolCreated",
          "PoolMarketInitialized",
        ],
        [2, 2, 2, 2, 2, 2, 2, 4, 4, 7, 1, 1, 5],
      );

      await expectEvents(
        txResponse,
        [CAPPED_ORACLE_ABI],
        ["SnapshotUpdated", "GrowthRateUpdated", "SnapshotGapUpdated"],
        [2, 2, 2],
      );

      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["RoleRevoked"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Fast-track timelock is not allowed to add new markets to the Core pool", async () => {
      const role = ethers.utils.solidityPack(["address", "string"], [bscmainnet.UNITROLLER, "_supportMarket(address)"]);
      const roleHash = ethers.utils.keccak256(role);
      const acm = new ethers.Contract(bscmainnet.ACCESS_CONTROL_MANAGER, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);
      expect(await acm.hasRole(roleHash, bscmainnet.FAST_TRACK_TIMELOCK)).to.be.false;
    });

    it("check new IRM", async () => {
      expect(await vPTxSolvBTC.interestRateModel()).to.equal(RATE_MODEL);
      expect(await vPTSolvBTC_BNB.interestRateModel()).to.equal(RATE_MODEL);
    });

    checkInterestRate(RATE_MODEL, "PT-xSolvBTC-18DEC2025", {
      base: xSolvBTCMarketSpecs.interestRateModel.baseRatePerYear,
      multiplier: xSolvBTCMarketSpecs.interestRateModel.multiplierPerYear,
      jump: xSolvBTCMarketSpecs.interestRateModel.jumpMultiplierPerYear,
      kink: xSolvBTCMarketSpecs.interestRateModel.kink,
    });
    checkInterestRate(RATE_MODEL, "PT-SolvBTC.BNB-18DEC2025", {
      base: solvBTCBNBMarketSpecs.interestRateModel.baseRatePerYear,
      multiplier: solvBTCBNBMarketSpecs.interestRateModel.multiplierPerYear,
      jump: solvBTCBNBMarketSpecs.interestRateModel.jumpMultiplierPerYear,
      kink: solvBTCBNBMarketSpecs.interestRateModel.kink,
    });

    checkVToken(xSolvBTCMarketSpecs.vToken.address, {
      name: xSolvBTCMarketSpecs.vToken.name,
      symbol: xSolvBTCMarketSpecs.vToken.symbol,
      decimals: xSolvBTCMarketSpecs.vToken.decimals,
      underlying: xSolvBTCMarketSpecs.vToken.underlying.address,
      exchangeRate: xSolvBTCMarketSpecs.vToken.exchangeRate,
      comptroller: xSolvBTCMarketSpecs.vToken.comptroller,
    });

    checkVToken(solvBTCBNBMarketSpecs.vToken.address, {
      name: solvBTCBNBMarketSpecs.vToken.name,
      symbol: solvBTCBNBMarketSpecs.vToken.symbol,
      decimals: solvBTCBNBMarketSpecs.vToken.decimals,
      underlying: solvBTCBNBMarketSpecs.vToken.underlying.address,
      exchangeRate: solvBTCBNBMarketSpecs.vToken.exchangeRate,
      comptroller: solvBTCBNBMarketSpecs.vToken.comptroller,
    });

    checkRiskParameters(
      xSolvBTCMarketSpecs.vToken.address,
      xSolvBTCMarketSpecs.vToken,
      xSolvBTCMarketSpecs.riskParameters,
    );

    checkRiskParameters(
      solvBTCBNBMarketSpecs.vToken.address,
      solvBTCBNBMarketSpecs.vToken,
      solvBTCBNBMarketSpecs.riskParameters,
    );

    it("check price PT-xSolvBTC-18DEC2025", async () => {
      const expectedPrice = "996374117903232014";
      expect(await resilientOracle.getPrice(xSolvBTCMarketSpecs.vToken.underlying.address)).to.equal(expectedPrice);
      expect(await resilientOracle.getUnderlyingPrice(xSolvBTCMarketSpecs.vToken.address)).to.equal(expectedPrice);
    });

    it("check price PT-SolvBTC.BNB-18DEC2025", async () => {
      const expectedPrice = "985801401412392011";
      expect(await resilientOracle.getPrice(solvBTCBNBMarketSpecs.vToken.underlying.address)).to.equal(expectedPrice);
      expect(await resilientOracle.getUnderlyingPrice(solvBTCBNBMarketSpecs.vToken.address)).to.equal(expectedPrice);
    });

    it("markets have correct owner", async () => {
      expect(await vPTxSolvBTC.admin()).to.equal(bscmainnet.NORMAL_TIMELOCK);
      expect(await vPTSolvBTC_BNB.admin()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("markets have correct ACM", async () => {
      expect(await vPTxSolvBTC.accessControlManager()).to.equal(bscmainnet.ACCESS_CONTROL_MANAGER);
      expect(await vPTSolvBTC_BNB.accessControlManager()).to.equal(bscmainnet.ACCESS_CONTROL_MANAGER);
    });

    it("markets should have correct protocol share reserve", async () => {
      expect(await vPTxSolvBTC.protocolShareReserve()).to.equal(PROTOCOL_SHARE_RESERVE);
      expect(await vPTSolvBTC_BNB.protocolShareReserve()).to.equal(PROTOCOL_SHARE_RESERVE);
    });

    it("markets should have correct total supply", async () => {
      const vPTxSolvBTCSupply = await vPTxSolvBTC.totalSupply();
      expect(vPTxSolvBTCSupply).to.equal(
        convertAmountToVTokens(xSolvBTCMarketSpecs.initialSupply.amount, xSolvBTCMarketSpecs.vToken.exchangeRate),
      );

      const vPTSolvBTC_BNBSupply = await vPTSolvBTC_BNB.totalSupply();
      expect(vPTSolvBTC_BNBSupply).to.equal(
        convertAmountToVTokens(solvBTCBNBMarketSpecs.initialSupply.amount, solvBTCBNBMarketSpecs.vToken.exchangeRate),
      );
    });

    it("markets should have balance of underlying", async () => {
      const PTxSolvBTCBalance = await PTxSolvBTC.balanceOf(vPTxSolvBTC.address);
      expect(PTxSolvBTCBalance).to.equal(xSolvBTCMarketSpecs.initialSupply.amount);

      const vPTSolvBTC_BNBalance = await PTSolvBTC_BNB.balanceOf(vPTSolvBTC_BNB.address);
      expect(vPTSolvBTC_BNBalance).to.equal(solvBTCBNBMarketSpecs.initialSupply.amount);
    });

    it("should burn vTokens", async () => {
      const vPTxSolvBTCBalanceBurned = await vPTxSolvBTC.balanceOf(ethers.constants.AddressZero);
      expect(vPTxSolvBTCBalanceBurned).to.equal(xSolvBTCMarketSpecs.initialSupply.vTokensToBurn);

      const vPTSolvBTC_BNBBalanceBurned = await vPTSolvBTC_BNB.balanceOf(ethers.constants.AddressZero);
      expect(vPTSolvBTC_BNBBalanceBurned).to.equal(solvBTCBNBMarketSpecs.initialSupply.vTokensToBurn);
    });

    it("should transfer remaining vTokens to receiver", async () => {
      const vPTUSDReceiverBalance = await vPTxSolvBTC.balanceOf(xSolvBTCMarketSpecs.initialSupply.vTokenReceiver);
      expect(vPTUSDReceiverBalance).to.equal(
        convertAmountToVTokens(xSolvBTCMarketSpecs.initialSupply.amount, xSolvBTCMarketSpecs.vToken.exchangeRate).sub(
          xSolvBTCMarketSpecs.initialSupply.vTokensToBurn,
        ),
      );

      const vPTSolvBTC_BNBReceiverBalance = await vPTSolvBTC_BNB.balanceOf(
        solvBTCBNBMarketSpecs.initialSupply.vTokenReceiver,
      );
      expect(vPTSolvBTC_BNBReceiverBalance).to.equal(
        convertAmountToVTokens(
          solvBTCBNBMarketSpecs.initialSupply.amount,
          solvBTCBNBMarketSpecs.vToken.exchangeRate,
        ).sub(solvBTCBNBMarketSpecs.initialSupply.vTokensToBurn),
      );
    });

    it("should not leave any vTokens in the timelock", async () => {
      const vPTxSolvBTCTimelockBalance = await vPTxSolvBTC.balanceOf(bscmainnet.NORMAL_TIMELOCK);
      expect(vPTxSolvBTCTimelockBalance).to.equal(0);

      const vPTSolvBTC_BNBTimelockBalance = await vPTSolvBTC_BNB.balanceOf(bscmainnet.NORMAL_TIMELOCK);
      expect(vPTSolvBTC_BNBTimelockBalance).to.equal(0);
    });

    it("should pause Borrows for new PT markets ", async () => {
      expect(await comptroller.actionPaused(xSolvBTCMarketSpecs.vToken.address, 2)).to.equal(true);
      expect(await comptroller.actionPaused(solvBTCBNBMarketSpecs.vToken.address, 2)).to.equal(true);
    });

    it("should set borrowAllowed to False for new PT markets", async () => {
      const vPTxSolvBTCMarket = await comptroller.markets(xSolvBTCMarketSpecs.vToken.address);
      expect(vPTxSolvBTCMarket.isBorrowAllowed).to.equal(false);

      const vPTSolvBTC_BNBMarket = await comptroller.markets(solvBTCBNBMarketSpecs.vToken.address);
      expect(vPTSolvBTC_BNBMarket.isBorrowAllowed).to.equal(false);
    });

    describe("Converters", () => {
      for (const [converterAddress, baseAsset] of Object.entries(converterBaseAssets)) {
        const converterContract = new ethers.Contract(converterAddress, SINGLE_TOKEN_CONVERTER_ABI, ethers.provider);

        it(`should set ${CONVERSION_INCENTIVE} as incentive in converter ${converterAddress}, for asset PT-xSolvBTC-18DEC2025`, async () => {
          const result = await converterContract.conversionConfigurations(
            baseAsset,
            xSolvBTCMarketSpecs.vToken.underlying.address,
          );
          expect(result.incentive).to.equal(CONVERSION_INCENTIVE);
        });

        it(`should set ${CONVERSION_INCENTIVE} as incentive in converter ${converterAddress}, for asset PT-SolvBTC.BNB-18DEC2025`, async () => {
          const result = await converterContract.conversionConfigurations(
            baseAsset,
            solvBTCBNBMarketSpecs.vToken.underlying.address,
          );
          expect(result.incentive).to.equal(CONVERSION_INCENTIVE);
        });
      }
    });

    describe("emode", () => {
      it("should update lastPoolId to the new pool", async () => {
        expect(await comptroller.lastPoolId()).to.equals(EMODE_POOL.id);
      });

      it("should set the newly created pool as active with correct label", async () => {
        const newPool = await comptroller.pools(EMODE_POOL.id);
        expect(newPool.label).to.equals(EMODE_POOL.label);
        expect(newPool.isActive).to.equals(true);
        expect(newPool.allowCorePoolFallback).to.equal(EMODE_POOL.allowCorePoolFallback);
      });

      it("should set the correct risk parameters to all pool markets", async () => {
        for (const config of Object.values(EMODE_POOL.marketConfig)) {
          const marketData = await comptroller.poolMarkets(EMODE_POOL.id, config.address);
          expect(marketData.marketPoolId).to.be.equal(EMODE_POOL.id);
          expect(marketData.isListed).to.be.equal(true);
          expect(marketData.collateralFactorMantissa).to.be.equal(config.collateralFactor);
          expect(marketData.liquidationThresholdMantissa).to.be.equal(config.liquidationThreshold);
          expect(marketData.liquidationIncentiveMantissa).to.be.equal(config.liquidationIncentive);
          expect(marketData.isBorrowAllowed).to.be.equal(config.borrowAllowed);
        }
      });
    });
  });
});
