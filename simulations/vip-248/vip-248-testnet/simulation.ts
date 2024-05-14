import { expect } from "chai";
import { BigNumber, Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "../../../src/utils";
import { forking, pretendExecutingVip, testVip } from "../../../src/vip-framework";
import { vip245 } from "../../../vips/vip-245/vip-245-testnet/vip-245-testnet";
import { Assets, converters } from "../../../vips/vip-248/vip-248-testnet/Addresses";
import { vip248 } from "../../../vips/vip-248/vip-248-testnet/vip-248-testnet";
import ACCESS_CONTROL_MANAGER_ABI from "../abi/AccessControlManager.json";
import CONVERTER_NETWORK_ABI from "../abi/ConverterNetwork.json";
import DEFAULT_PROXY_ADMIN_ABI from "../abi/DefaultProxyAdmin.json";
import ERC20_ABI from "../abi/ERC20.json";
import PROTOCOL_SHARE_RESERVE_NEW_IMPLEMENTATION_ABI from "../abi/ProtocolShareReserveNew.json";
import RISK_FUND_CONVERTER_ABI from "../abi/RiskFundConverter.json";
import RISK_FUND_V2_ABI from "../abi/RiskFundV2.json";
import SINGLE_TOKEN_CONVERTER_ABI from "../abi/SingleTokenConverter.json";
import TRANSPARENT_PROXY_ABI from "../abi/TransparentProxyAbi.json";
import XVS_VAULT_CONVERTER_ABI from "../abi/XVSVaultTreasury.json";

const allAssets = [
  ...Assets,
  "0x5fFbE5302BadED40941A403228E6AD03f93752d9", // VAI
];
const DEFAULT_PROXY_ADMIN = "0x7877fFd62649b6A1557B55D4c20fcBaB17344C91";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";

const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const XVS = "0xB9e0E753630434d7863528cc73CB7AC638a7c8ff";
const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
const USDC = "0x16227D60f7a0e586C66B005219dfc887D13C9531";
const XVS_VAULT = "0x9aB56bAD2D7631B2A857ccf36d998232A8b82280";

const CHAINLINK_ORACLE = "0xCeA29f1266e880A1482c06eD656cD08C148BaA32";
const FEED_ADDRESS_USDT = "0xEca2605f0BCF2BA5966372C99837b1F182d3D620";
const FEED_ADDRESS_USDC = "0x90c069C4538adAc136E051052E14c1cD799C41B7";

const VTREASURY = "0x8b293600C50D6fbdc6Ed4251cc75ECe29880276f";
const XVS_VAULT_TREASURY = "0x317c6C4c9AA7F87170754DB08b4804dD689B68bF";

const CONVERTER_NETWORK = "0xC8f2B705d5A2474B390f735A5aFb570e1ce0b2cf";
const RISK_FUND_CONVERTER = "0x32Fbf7bBbd79355B86741E3181ef8c1D9bD309Bb";
const USDC_PRIME_CONVERTER = "0x2ecEdE6989d8646c992344fF6C97c72a3f811A13";
const XVS_VAULT_CONVERTER = "0x258f49254C758a0E37DAb148ADDAEA851F4b02a2";

const RISK_FUND_PROXY = "0x487CeF72dacABD7E12e633bb3B63815a386f7012";
const RISK_FUND_V2_OLD_IMPLEMENTATION = "0x217a907B0c6a7Dc67a21F769a915722B98136F82";
const RISK_FUND_V2_NEW_IMPLEMENTATION = "0xcA2A023FBe3be30b7187E88D7FDE1A9a4358B509";

const PROTOCOL_SHARE_RESERVE_PROXY = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";
const PROTOCOL_SHARE_RESERVE_OLD_IMPLEMENTATION = "0x194777360f9DFAA147F462349E9bC9002F72b0EE";
const PROTOCOL_SHARE_RESERVE_NEW_IMPLEMENTATION = "0x91B67df8B13a1B53a3828EAAD3f4233B55FEc26d";

forking(36752108, async () => {
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
    await pretendExecutingVip(await vip245());
    proxyAdmin = new ethers.Contract(DEFAULT_PROXY_ADMIN, DEFAULT_PROXY_ADMIN_ABI, provider);

    converterNetwork = new ethers.Contract(CONVERTER_NETWORK, CONVERTER_NETWORK_ABI, provider);
    riskFund = new ethers.Contract(RISK_FUND_PROXY, RISK_FUND_V2_ABI, provider);
    protocolShareReserve = new ethers.Contract(
      PROTOCOL_SHARE_RESERVE_PROXY,
      PROTOCOL_SHARE_RESERVE_NEW_IMPLEMENTATION_ABI,
      provider,
    );
    xvsVaultTreasury = new ethers.Contract(XVS_VAULT_TREASURY, XVS_VAULT_CONVERTER_ABI, provider);
    riskFundConverter = new ethers.Contract(RISK_FUND_CONVERTER, RISK_FUND_CONVERTER_ABI, provider);

    riskFundConvertibleBaseAsset = await riskFund.convertibleBaseAsset();
    riskFundMaxLoopsLimit = await riskFund.maxLoopsLimit();
    riskFundShortfall = await riskFund.shortfall();
    psrPoolRegistry = await protocolShareReserve.poolRegistry();
    psrMaxLoopsLimit = await protocolShareReserve.maxLoopsLimit();

    for (const token of allAssets) {
      const pools = await riskFundConverter.getPools(token);
      for (const pool of pools) {
        RiskFundPoolAssetReservesBefore.push(await riskFund.poolAssetsFunds(pool, token));
      }
      PsrTotalAssetReserveBefore.push(await protocolShareReserve.totalAssetReserve(token));
    }
  });

  describe("Pre-VIP behavior Check for RiskFund and PSR", () => {
    it("RiskFund Proxy should have old implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(RISK_FUND_PROXY)).to.equal(RISK_FUND_V2_OLD_IMPLEMENTATION);
    });

    it("ProtocolShareReserve Proxy should have old implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(PROTOCOL_SHARE_RESERVE_PROXY)).to.equal(
        PROTOCOL_SHARE_RESERVE_OLD_IMPLEMENTATION,
      );
    });
  });

  testVip("VIP-248", await vip248(), {
    callbackAfterExecution: async (txResponse: any) => {
      await expectEvents(txResponse, [CONVERTER_NETWORK_ABI], ["ConverterAdded"], [6]);
      await expectEvents(
        txResponse,
        [PROTOCOL_SHARE_RESERVE_NEW_IMPLEMENTATION_ABI],
        ["DistributionConfigUpdated", "DistributionConfigRemoved"],
        [10, 10],
      );
      await expectEvents(
        txResponse,
        [PROTOCOL_SHARE_RESERVE_NEW_IMPLEMENTATION_ABI],
        ["DistributionConfigAdded"],
        [10],
      );
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [12]);
      await expectEvents(txResponse, [RISK_FUND_V2_ABI], ["RiskFundConverterUpdated"], [1]);
      await expectEvents(txResponse, [TRANSPARENT_PROXY_ABI], ["Upgraded"], [2]);
      await expectEvents(
        txResponse,
        [SINGLE_TOKEN_CONVERTER_ABI],
        ["ConversionConfigUpdated", "ConverterNetworkAddressUpdated"],
        [222, 6],
      );
    },
  });

  describe("Post-VIP behavior", () => {
    let usdt: Contract;
    let usdc: Contract;
    let usdcPrimeConverter: Contract;
    let user1: Signer;
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
      await usdt.connect(user1).allocateTo(user1Address, amount);
      await usdc.connect(user1).allocateTo(user1Address, amount);

      for (const token of allAssets) {
        const pools = await riskFundConverter.getPools(token);
        for (const pool of pools) {
          RiskFundPoolAssetReservesAfter.push(await riskFund.poolAssetsFunds(pool, token));
        }
        PsrTotalAssetReserveAfter.push(await protocolShareReserve.totalAssetReserve(token));
      }
    });

    it("RiskFund Proxy should have new implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(RISK_FUND_PROXY)).to.equal(RISK_FUND_V2_NEW_IMPLEMENTATION);
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
      const percentageDistributionConverters = [4000, 420, 192, 177, 211, 1000];
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
      await usdt.connect(user1).allocateTo(user1Address, amount);

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
      await usdc.connect(user1).allocateTo(user1Address, amount);
      await usdc.connect(user1).transfer(RISK_FUND_CONVERTER, amount);
      await riskFundConverter.connect(user1).updateAssetsState(COMPTROLLER, USDC);

      const amountOutMantissa = amount.div(2);
      const amountInMaxMantissa = amount;
      await usdt.connect(user1).allocateTo(user1Address, amount);

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
      await usdc.connect(user1).allocateTo(user1Address, newAmount);
      await usdt.connect(user1).allocateTo(user1Address, newAmount);

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
