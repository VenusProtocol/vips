import { expect } from "chai";
import { BigNumber, Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser, setMaxStalePeriodInChainlinkOracle } from "../../../src/utils";
import { forking, pretendExecutingVip, testVip } from "../../../src/vip-framework";
import { vip245 } from "../../../vips/vip-245/vip-245/vip-245";
import {
  Assets,
  CONVERTER_NETWORK,
  RISK_FUND_CONVERTER,
  USDC_PRIME_CONVERTER,
  XVS_VAULT_CONVERTER,
  converters,
} from "../../../vips/vip-248/vip-248/Addresses";
import { vip248 } from "../../../vips/vip-248/vip-248/vip-248";
import ACCESS_CONTROL_MANAGER_ABI from "../abi/AccessControlManagerMainnet.json";
import CONVERTER_NETWORK_ABI from "../abi/ConverterNetwork.json";
import DEFAULT_PROXY_ADMIN_ABI from "../abi/DefaultProxyAdmin.json";
import ERC20_ABI from "../abi/ERC20.json";
import PROTOCOL_SHARE_RESERVE_OLD_IMPLEMENTATION_ABI from "../abi/ProtocolShareReserve.json";
import PROTOCOL_SHARE_RESERVE_NEW_IMPLEMENTATION_ABI from "../abi/ProtocolShareReserveNew.json";
import RISK_FUND_ABI from "../abi/RiskFund.json";
import RISK_FUND_CONVERTER_ABI from "../abi/RiskFundConverter.json";
import RISK_FUND_V2_ABI from "../abi/RiskFundV2.json";
import SINGLE_TOKEN_CONVERTER_ABI from "../abi/SingleTokenConverter.json";
import TRANSPARENT_PROXY_ABI from "../abi/TransparentProxyAbi.json";
import XVS_VAULT_TREASURY_ABI from "../abi/XVSVaultTreasury.json";

const allAssets = [
  ...Assets,
  "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7", // VAI
];
const DEFAULT_PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";

const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const XVS_VAULT = "0x051100480289e704d20e9DB4804837068f3f9204";

const USDT_HOLDER = "0x4982085C9e2F89F2eCb8131Eca71aFAD896e89CB";
const USDC_HOLDER = "0xf89d7b9c864f589bbF53a82105107622B35EaA40";

const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const FEED_ADDRESS_USDT = "0xB97Ad0E74fa7d920791E90258A6E2085088b4320";
const FEED_ADDRESS_USDC = "0x51597f405303C4377E36123cBc172b13269EA163";

const VTREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const XVS_VAULT_TREASURY = "0x269ff7818DB317f60E386D2be0B259e1a324a40a";

const RISK_FUND_PROXY = "0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42";
const RISK_FUND_OLD_IMPLEMENTATION = "0x0E8Ef0EC1e0C109c5B5249CcefB703A414835eaC";
const RISK_FUND_V2_IMPLEMENTATION = "0x2F377545Fd095fA59A56Cb1fD7456A2a0B781Cb6";

const PROTOCOL_SHARE_RESERVE_PROXY = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
const PROTOCOL_SHARE_RESERVE_OLD_IMPLEMENTATION = "0x5108E5F903Ecc5e3a2dA20171527aCe96CB3c7f8";
const PROTOCOL_SHARE_RESERVE_NEW_IMPLEMENTATION = "0x86a2a5EB77984E923E7B5Af45819A8c8f870f061";

forking(35547098, () => {
  const provider = ethers.provider;
  let riskFund: Contract;
  let proxyAdmin: Contract;
  let converterNetwork: Contract;
  let xvsVaultTreasury: Contract;
  let riskFundConverter: Contract;
  let protocolShareReserve: Contract;

  let psrPoolRegistry: string;
  let riskFundShortfall: string;
  let riskFundMaxLoopsLimit: number;
  let riskFundConvertibleBaseAsset: string;
  let psrMaxLoopsLimit: number;
  const RiskFundPoolAssetReservesBefore: number[] = [];
  const PsrTotalAssetReserveBefore: number[] = [];

  before(async () => {
    await pretendExecutingVip(vip245());
    proxyAdmin = new ethers.Contract(DEFAULT_PROXY_ADMIN, DEFAULT_PROXY_ADMIN_ABI, provider);

    converterNetwork = new ethers.Contract(CONVERTER_NETWORK, CONVERTER_NETWORK_ABI, provider);
    riskFund = new ethers.Contract(RISK_FUND_PROXY, RISK_FUND_ABI, provider);
    protocolShareReserve = new ethers.Contract(
      PROTOCOL_SHARE_RESERVE_PROXY,
      PROTOCOL_SHARE_RESERVE_OLD_IMPLEMENTATION_ABI,
      provider,
    );
    xvsVaultTreasury = new ethers.Contract(XVS_VAULT_TREASURY, XVS_VAULT_TREASURY_ABI, provider);
    riskFundConverter = new ethers.Contract(RISK_FUND_CONVERTER, RISK_FUND_CONVERTER_ABI, provider);

    riskFundConvertibleBaseAsset = await riskFund.convertibleBaseAsset();
    riskFundMaxLoopsLimit = await riskFund.maxLoopsLimit();
    riskFundShortfall = await riskFund.shortfall();
    psrPoolRegistry = await protocolShareReserve.poolRegistry();
    psrMaxLoopsLimit = await protocolShareReserve.maxLoopsLimit();

    for (const token of allAssets) {
      const pools = await riskFundConverter.getPools(token);
      for (const pool of pools) {
        RiskFundPoolAssetReservesBefore.push(await riskFund.getPoolAssetReserve(pool, token));
      }
      PsrTotalAssetReserveBefore.push(await protocolShareReserve.totalAssetReserve(token));
    }
  });

  describe("Pre-VIP behavior Check for RiskFund and PSR", () => {
    it("RiskFund Proxy should have old implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(RISK_FUND_PROXY)).to.equal(RISK_FUND_OLD_IMPLEMENTATION);
    });

    it("ProtocolShareReserve Proxy should have old implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(PROTOCOL_SHARE_RESERVE_PROXY)).to.equal(
        PROTOCOL_SHARE_RESERVE_OLD_IMPLEMENTATION,
      );
    });
  });

  testVip("VIP-248", vip248(), {
    callbackAfterExecution: async (txResponse: any) => {
      await expectEvents(txResponse, [CONVERTER_NETWORK_ABI], ["ConverterAdded"], [6]);
      await expectEvents(
        txResponse,
        [PROTOCOL_SHARE_RESERVE_OLD_IMPLEMENTATION_ABI],
        ["DistributionConfigUpdated", "DistributionConfigRemoved"],
        [4, 4],
      );
      await expectEvents(
        txResponse,
        [PROTOCOL_SHARE_RESERVE_NEW_IMPLEMENTATION_ABI],
        ["DistributionConfigAdded"],
        [10],
      );
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["RoleGranted"], [12]);
      await expectEvents(txResponse, [RISK_FUND_V2_ABI], ["RiskFundConverterUpdated"], [1]);
      await expectEvents(txResponse, [TRANSPARENT_PROXY_ABI], ["Upgraded"], [2]);
      await expectEvents(
        txResponse,
        [SINGLE_TOKEN_CONVERTER_ABI],
        ["ConversionConfigUpdated", "ConverterNetworkAddressUpdated"],
        [258, 6],
      );
    },
  });

  describe("Post-VIP behavior", () => {
    let usdt: Contract;
    let usdc: Contract;
    let usdcPrimeConverter: Contract;
    let user1: Signer;
    let usdtHolder: Signer;
    let usdcHolder: Signer;
    let user1Address: string;

    const amount = parseUnits("1000", 18);
    const RiskFundPoolAssetReservesAfter: number[] = [];
    const PsrTotalAssetReserveAfter: number[] = [];

    before(async () => {
      riskFund = new ethers.Contract(RISK_FUND_PROXY, RISK_FUND_V2_ABI, provider);
      protocolShareReserve = new ethers.Contract(
        PROTOCOL_SHARE_RESERVE_PROXY,
        PROTOCOL_SHARE_RESERVE_NEW_IMPLEMENTATION_ABI,
        provider,
      );
      usdcPrimeConverter = new ethers.Contract(USDC_PRIME_CONVERTER, SINGLE_TOKEN_CONVERTER_ABI, provider);
      usdt = new ethers.Contract(USDT, ERC20_ABI, provider);
      usdc = new ethers.Contract(USDC, ERC20_ABI, provider);

      await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, USDT, FEED_ADDRESS_USDT, NORMAL_TIMELOCK);
      await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, USDC, FEED_ADDRESS_USDC, NORMAL_TIMELOCK);

      [, user1] = await ethers.getSigners();
      user1Address = await user1.getAddress();

      usdcHolder = await initMainnetUser(USDC_HOLDER, ethers.utils.parseEther("1"));
      usdtHolder = await initMainnetUser(USDT_HOLDER, ethers.utils.parseEther("1"));

      await usdt.connect(usdtHolder).transfer(user1Address, amount);
      await usdc.connect(usdcHolder).transfer(user1Address, amount);

      for (const token of allAssets) {
        const pools = await riskFundConverter.getPools(token);
        for (const pool of pools) {
          RiskFundPoolAssetReservesAfter.push(await riskFund.poolAssetsFunds(pool, token));
        }
        PsrTotalAssetReserveAfter.push(await protocolShareReserve.totalAssetReserve(token));
      }
    });

    it("RiskFund Proxy should have new implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(RISK_FUND_PROXY)).to.equal(RISK_FUND_V2_IMPLEMENTATION);
    });

    it("RiskFund should have correct storage", async () => {
      expect(await riskFund.accessControlManager()).to.equal(ACM);
      expect(await riskFund.convertibleBaseAsset()).to.equal(riskFundConvertibleBaseAsset);
      expect(await riskFund.maxLoopsLimit()).to.equal(riskFundMaxLoopsLimit);
      expect(await riskFund.owner()).to.equal(NORMAL_TIMELOCK);
      expect(await riskFund.shortfall()).to.equal(riskFundShortfall);
      expect(RiskFundPoolAssetReservesBefore).to.deep.equal(RiskFundPoolAssetReservesAfter);
    });

    it("RiskFund should have correct address of RiskFundConverter", async () => {
      expect(await riskFund.riskFundConverter()).to.equal(RISK_FUND_CONVERTER);
    });

    it("ProtocolShareReserve Proxy should have new implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(PROTOCOL_SHARE_RESERVE_PROXY)).to.equal(
        PROTOCOL_SHARE_RESERVE_NEW_IMPLEMENTATION,
      );
    });

    it("PSR should have correct storage", async () => {
      expect(await protocolShareReserve.poolRegistry()).to.equal(psrPoolRegistry);
      expect(await protocolShareReserve.maxLoopsLimit()).to.equal(psrMaxLoopsLimit);
      expect(await protocolShareReserve.accessControlManager()).to.equal(ACM);
      expect(await protocolShareReserve.owner()).to.equal(NORMAL_TIMELOCK);
      expect(PsrTotalAssetReserveBefore).to.deep.equal(PsrTotalAssetReserveAfter);
    });

    it("PSR should have correct distribution configs", async () => {
      const percentageDistributionConverters = [4000, 400, 300, 50, 250, 1000];
      expect(await protocolShareReserve.totalDistributions()).to.equal(10);
      for (let i = 0; i < 6; i++) {
        expect(await protocolShareReserve.getPercentageDistribution(converters[i], 0)).to.equal(
          percentageDistributionConverters[i],
        );
      }

      expect(await protocolShareReserve.getPercentageDistribution(VTREASURY, 0)).to.equal(4000);
      expect(await protocolShareReserve.getPercentageDistribution(VTREASURY, 1)).to.equal(4000);
      expect(await protocolShareReserve.getPercentageDistribution(RISK_FUND_CONVERTER, 1)).to.equal(5000);
      expect(await protocolShareReserve.getPercentageDistribution(XVS_VAULT_CONVERTER, 1)).to.equal(1000);
    });

    it("XVSVaultTreasury should have correct state variables", async () => {
      expect(await xvsVaultTreasury.XVS_ADDRESS()).to.equal(XVS);
      expect(await xvsVaultTreasury.xvsVault()).to.equal(XVS_VAULT);
    });

    it("ConverterNetwork should contain all converters", async () => {
      expect(await converterNetwork.getAllConverters()).to.deep.equal(converters);
    });
    it("RiskFundConverter should have correct storage", async () => {
      expect(await riskFundConverter.destinationAddress()).to.equal(RISK_FUND_PROXY);
      expect(await riskFundConverter.converterNetwork()).to.equal(CONVERTER_NETWORK);
      expect(await riskFundConverter.conversionConfigurations(USDT, USDC)).to.deep.equal([0, 1]);
      expect(await riskFundConverter.conversionConfigurations(USDC, USDT)).to.deep.equal([0, 0]);
      expect(await riskFundConverter.poolsAssetsDirectTransfer(COMPTROLLER, USDT)).to.equal(true);
      expect(await riskFundConverter.poolsAssetsDirectTransfer(COMPTROLLER, USDC)).to.equal(false);
    });

    it("UpdateAssetState should work correctly", async () => {
      await usdt.connect(user1).transfer(RISK_FUND_CONVERTER, amount);
      await usdc.connect(user1).transfer(RISK_FUND_CONVERTER, amount);

      await riskFundConverter.connect(user1).updateAssetsState(COMPTROLLER, USDT);
      await riskFundConverter.connect(user1).updateAssetsState(COMPTROLLER, USDC);

      // Amount will be transferred to RiskFund so balance is zero
      expect(await riskFundConverter.balanceOf(USDT)).to.equal(0);
      expect(await riskFundConverter.getPoolAssetReserve(COMPTROLLER, USDT)).to.equal(0);

      expect(await riskFundConverter.balanceOf(USDC)).to.equal(amount);
      expect(await riskFundConverter.getPoolAssetReserve(COMPTROLLER, USDC)).to.equal(amount);
    });

    it("Convert exact tokens should work correctly", async () => {
      const amountInMantissa = amount.div(2);
      await usdt.connect(usdtHolder).transfer(user1Address, amount);

      const usdcBalanceOfRiskFundConverterPrevious = await riskFundConverter.balanceOf(USDC);
      const usdtBalanceOfRiskFundPrevious = await usdt.balanceOf(RISK_FUND_PROXY);
      const usdtBalanceOfUserPrevious = await usdt.balanceOf(user1Address);

      const [, amountOutMantissa] = await riskFundConverter
        .connect(user1)
        .callStatic.getUpdatedAmountOut(amountInMantissa, USDT, USDC);

      await usdt.connect(user1).approve(RISK_FUND_CONVERTER, amountInMantissa);
      await riskFundConverter
        .connect(user1)
        .convertExactTokens(amountInMantissa, amountInMantissa.div(2), USDT, USDC, user1Address);

      expect(await usdt.balanceOf(user1Address)).to.equal(usdtBalanceOfUserPrevious.sub(amountInMantissa));
      expect(await riskFundConverter.balanceOf(USDT)).to.equal(0);
      expect(await riskFundConverter.balanceOf(USDC)).to.equal(
        usdcBalanceOfRiskFundConverterPrevious.sub(amountOutMantissa),
      );
      expect(await usdt.balanceOf(RISK_FUND_PROXY)).to.equal(
        BigNumber.from(usdtBalanceOfRiskFundPrevious).add(amountInMantissa),
      );
    });

    it("ConvertForExactTokens should work properly", async () => {
      await usdc.connect(usdcHolder).transfer(user1Address, amount);
      await usdc.connect(user1).transfer(RISK_FUND_CONVERTER, amount);
      await riskFundConverter.connect(user1).updateAssetsState(COMPTROLLER, USDC);

      const amountOutMantissa = amount.div(2);
      const amountInMaxMantissa = amount;
      await usdt.connect(usdtHolder).transfer(user1Address, amount);

      const usdcBalanceOfRiskFundConverterPrevious = await riskFundConverter.balanceOf(USDC);
      const usdtBalanceOfRiskFundPrevious = await usdt.balanceOf(RISK_FUND_PROXY);
      const usdtBalanceOfUserPrevious = await usdt.balanceOf(user1Address);

      const [, amountInMantissa] = await riskFundConverter.connect(user1).getAmountIn(amountOutMantissa, USDT, USDC);

      await usdt.connect(user1).approve(RISK_FUND_CONVERTER, amount);
      await riskFundConverter
        .connect(user1)
        .convertForExactTokens(amountInMaxMantissa, amountOutMantissa, USDT, USDC, user1Address);

      expect(await usdt.balanceOf(user1Address)).to.equal(usdtBalanceOfUserPrevious.sub(amountInMantissa));
      expect(await riskFundConverter.balanceOf(USDT)).to.equal(0);
      expect(await riskFundConverter.balanceOf(USDC)).to.equal(
        usdcBalanceOfRiskFundConverterPrevious.sub(amountOutMantissa),
      );
      expect(await usdt.balanceOf(RISK_FUND_PROXY)).to.equal(
        BigNumber.from(usdtBalanceOfRiskFundPrevious).add(amountInMantissa),
      );
    });

    it("Private conversion should occur on updateAssetsState", async () => {
      const newAmount = amount.mul(2);
      await usdc.connect(usdcHolder).transfer(user1Address, newAmount);
      await usdt.connect(usdtHolder).transfer(user1Address, newAmount);

      const destinationAddressForUsdcConverter = await usdcPrimeConverter.destinationAddress();

      await usdc.connect(user1).transfer(RISK_FUND_CONVERTER, amount);
      await riskFundConverter.connect(user1).updateAssetsState(COMPTROLLER, USDC);

      const usdcBalanceRiskFundConverterPrevious = await riskFundConverter.balanceOf(USDC);
      const usdtBalanceRiskFundPrevious = await usdt.balanceOf(RISK_FUND_PROXY);

      const plpBalanceForUsdcPrevious = await usdc.balanceOf(destinationAddressForUsdcConverter);

      await usdt.connect(user1).transfer(USDC_PRIME_CONVERTER, amount);
      // Private Conversion will occur
      await usdcPrimeConverter.connect(user1).updateAssetsState(COMPTROLLER, USDT);

      const usdcBalanceRiskFundConverterCurrent = await riskFundConverter.balanceOf(USDC);
      const usdtBalanceRiskFundCurrent = await usdt.balanceOf(RISK_FUND_PROXY);

      expect(usdtBalanceRiskFundCurrent).to.equal(usdtBalanceRiskFundPrevious.add(amount));
      expect(usdcBalanceRiskFundConverterCurrent).to.closeTo(
        usdcBalanceRiskFundConverterPrevious.sub(amount),
        parseUnits("1", 18),
      );
      expect(await usdc.balanceOf(destinationAddressForUsdcConverter)).to.closeTo(
        plpBalanceForUsdcPrevious.add(amount),
        parseUnits("1", 18),
      );
    });
  });
});
