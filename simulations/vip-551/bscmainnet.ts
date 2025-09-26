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
import {
  CONVERSION_INCENTIVE,
  EMODE_POOL_SPECS,
  PROTOCOL_SHARE_RESERVE,
  PT_USDe_30OCT2025,
  RATE_MODEL,
  convertAmountToVTokens,
  converterBaseAssets,
  marketSpecs,
  vip551,
} from "../../vips/vip-551/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import CAPPED_ORACLE_ABI from "./abi/CappedOracle.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import REDSTONE_ORACLE_ABI from "./abi/RedstoneOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";
import VTOKEN_ABI from "./abi/VToken.json";
import VTREASURY_ABI from "./abi/VTreasury.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const setStalePeriodForVip547 = async () => {
  for (const market of CORE_MARKETS) {
    // Call function with default feed = AddressZero (so it fetches from oracle.tokenConfigs)
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

forking(62523198, async () => {
  let comptroller: Contract;
  let resilientOracle: Contract;
  let PTUSDe: Contract;
  let vPTUSDe: Contract;

  before(async () => {
    await setStalePeriodForVip547();
    await pretendExecutingVip(await vip547(), NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK);
    const provider = ethers.provider;
    comptroller = new ethers.Contract(marketSpecs.vToken.comptroller, COMPTROLLER_ABI, provider);
    PTUSDe = new ethers.Contract(marketSpecs.vToken.underlying.address, ERC20_ABI, provider);
    vPTUSDe = new ethers.Contract(marketSpecs.vToken.address, VTOKEN_ABI, provider);
    resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);

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

    const redstoneOracle = new ethers.Contract(bscmainnet.REDSTONE_ORACLE, REDSTONE_ORACLE_ABI, ethers.provider);
    const impersonatedTimelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("2"));
    const PT_USDe_FIXED_PRICE = parseUnits("992132780932187177", 18);

    await resilientOracle
      .connect(impersonatedTimelock)
      .setTokenConfig([
        PT_USDe_30OCT2025,
        [bscmainnet.REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
        [true, false, false],
        false,
      ]);

    await redstoneOracle.connect(impersonatedTimelock).setDirectPrice(PT_USDe_30OCT2025, PT_USDe_FIXED_PRICE);
  });

  describe("Pre-VIP behavior", async () => {
    it("check PT-USDe-30Oct2025 market not listed", async () => {
      const market = await comptroller.markets(marketSpecs.vToken.underlying.address);
      expect(market.isListed).to.equal(false);
    });
  });

  testVip("VIP-551", await vip551(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, VTOKEN_ABI, VTREASURY_ABI],
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
          "WithdrawTreasuryBEP20",
        ],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1],
      );

      await expectEvents(
        txResponse,
        [CAPPED_ORACLE_ABI],
        ["SnapshotUpdated", "GrowthRateUpdated", "SnapshotGapUpdated"],
        [1, 1, 1],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Fast-track timelock is allowed to add new markets to the Core pool", async () => {
      const role = ethers.utils.solidityPack(["address", "string"], [bscmainnet.UNITROLLER, "_supportMarket(address)"]);
      const roleHash = ethers.utils.keccak256(role);
      const acm = new ethers.Contract(bscmainnet.ACCESS_CONTROL_MANAGER, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);
      expect(await acm.hasRole(roleHash, bscmainnet.FAST_TRACK_TIMELOCK)).to.be.true;
    });

    it("check new IRM", async () => {
      expect(await vPTUSDe.interestRateModel()).to.equal(RATE_MODEL);
    });

    checkInterestRate(RATE_MODEL, "vPTUSDe", {
      base: marketSpecs.interestRateModel.baseRatePerYear,
      multiplier: marketSpecs.interestRateModel.multiplierPerYear,
      jump: marketSpecs.interestRateModel.jumpMultiplierPerYear,
      kink: marketSpecs.interestRateModel.kink,
    });

    checkVToken(marketSpecs.vToken.address, {
      name: marketSpecs.vToken.name,
      symbol: marketSpecs.vToken.symbol,
      decimals: marketSpecs.vToken.decimals,
      underlying: marketSpecs.vToken.underlying.address,
      exchangeRate: marketSpecs.vToken.exchangeRate,
      comptroller: marketSpecs.vToken.comptroller,
    });

    checkRiskParameters(marketSpecs.vToken.address, marketSpecs.vToken, marketSpecs.riskParameters);

    it("check price PT-USDe-30Oct2025", async () => {
      const expectedPrice = "992487656038106897"; 
      expect(await resilientOracle.getPrice(marketSpecs.vToken.underlying.address)).to.equal(expectedPrice);
      expect(await resilientOracle.getUnderlyingPrice(marketSpecs.vToken.address)).to.equal(expectedPrice);
    });

    it("market have correct owner", async () => {
      expect(await vPTUSDe.admin()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("market have correct ACM", async () => {
      expect(await vPTUSDe.accessControlManager()).to.equal(bscmainnet.ACCESS_CONTROL_MANAGER);
    });

    it("market should have correct protocol share reserve", async () => {
      expect(await vPTUSDe.protocolShareReserve()).to.equal(PROTOCOL_SHARE_RESERVE);
    });

    it("market should have correct total supply", async () => {
      const vPTUSDeSupply = await vPTUSDe.totalSupply();
      expect(vPTUSDeSupply).to.equal(
        convertAmountToVTokens(marketSpecs.initialSupply.amount, marketSpecs.vToken.exchangeRate),
      );
    });

    it("market should have balance of underlying", async () => {
      const PTUSDeBalance = await PTUSDe.balanceOf(vPTUSDe.address);
      expect(PTUSDeBalance).to.equal(marketSpecs.initialSupply.amount);
    });

    it("should burn vTokens", async () => {
      const vPTUSDeBalanceBurned = await vPTUSDe.balanceOf(ethers.constants.AddressZero);

      expect(vPTUSDeBalanceBurned).to.equal(marketSpecs.initialSupply.vTokensToBurn);
    });

    it("should transfer remaining vTokens to receiver", async () => {
      const vPTUSDReceiverBalance = await vPTUSDe.balanceOf(marketSpecs.initialSupply.vTokenReceiver);

      expect(vPTUSDReceiverBalance).to.equal(
        convertAmountToVTokens(marketSpecs.initialSupply.amount, marketSpecs.vToken.exchangeRate).sub(
          marketSpecs.initialSupply.vTokensToBurn,
        ),
      );
    });

    it("should not leave any vTokens in the timelock", async () => {
      const vPTUSDeTimelockBalance = await vPTUSDe.balanceOf(bscmainnet.NORMAL_TIMELOCK);
      expect(vPTUSDeTimelockBalance).to.equal(0);
    });

    it("should pause vPTUSDe market", async () => {
      expect(await comptroller.actionPaused(marketSpecs.vToken.address, 2)).to.equal(true);
    });

    it("should set borrowAllowed to False for vPTUSDe market", async () => {
      const vPTUSDeMarket = await comptroller.markets(marketSpecs.vToken.address);
      expect(vPTUSDeMarket.isBorrowAllowed).to.equal(false);
    });

    describe("Converters", () => {
      for (const [converterAddress, baseAsset] of Object.entries(converterBaseAssets)) {
        const converterContract = new ethers.Contract(converterAddress, SINGLE_TOKEN_CONVERTER_ABI, ethers.provider);

        it(`should set ${CONVERSION_INCENTIVE} as incentive in converter ${converterAddress}, for asset vPTUSDe`, async () => {
          const result = await converterContract.conversionConfigurations(
            baseAsset,
            marketSpecs.vToken.underlying.address,
          );
          expect(result.incentive).to.equal(CONVERSION_INCENTIVE);
        });
      }
    });

    describe("emode", () => {
      it("should set the correct risk parameters to all pool markets", async () => {
        for (const [market, config] of Object.entries(EMODE_POOL_SPECS.marketsConfig)) {
          const marketData = await comptroller.poolMarkets(EMODE_POOL_SPECS.id, config.address);
          expect(marketData.marketPoolId).to.be.equal(EMODE_POOL_SPECS.id);
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
