import { expect } from "chai";
import { BigNumber, Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, pretendExecutingVip, testVip } from "../../../src/vip-framework";
import { converters } from "../../../vips/vip-converter/vip-converter-testnet/Addresses";
import { vipConverter1 } from "../../../vips/vip-converter/vip-converter-testnet/vip-converter1";
import { vipConverter2 } from "../../../vips/vip-converter/vip-converter-testnet/vip-converter2";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import CONVERTER_NETWORK_ABI from "./abi/ConverterNetwork.json";
import DEFAULT_PROXY_ADMIN_ABI from "./abi/DefaultProxyAdmin.json";
import MOCK_TOKEN_ABI from "./abi/MockToken.json";
import PROTOCOL_SHARE_RESERVE_OLD_IMPLEMENTATION_ABI from "./abi/ProtocolShareReserve.json";
import PROTOCOL_SHARE_RESERVE_NEW_IMPLEMENTATION_ABI from "./abi/ProtocolShareReserveNew.json";
import RISK_FUND_ABI from "./abi/RiskFund.json";
import RISK_FUND_CONVERTER_ABI from "./abi/RiskFundConverter.json";
import RISK_FUND_V2_ABI from "./abi/RiskFundV2.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";
import TRANSPARENT_PROXY_ABI from "./abi/TransparentProxyAbi.json";
import XVS_VAULT_CONVERTER_ABI from "./abi/XVSVaultTreasury.json";

const DEFAULT_PROXY_ADMIN = "0x7877fFd62649b6A1557B55D4c20fcBaB17344C91";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";

const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const XVS = "0xB9e0E753630434d7863528cc73CB7AC638a7c8ff";
const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
const USDC = "0x16227D60f7a0e586C66B005219dfc887D13C9531";
const XVS_VAULT = "0x9aB56bAD2D7631B2A857ccf36d998232A8b82280";

const VTREASURY = "0x8b293600C50D6fbdc6Ed4251cc75ECe29880276f";
const XVS_VAULT_TREASURY = "0xab79995b1154433C9652393B7BF3aeb65C2573Bd";

const CONVERTER_NETWORK = "0x594e8e11A1DfBcdFeBDDe682e4da507935DaC8E3";
const RISK_FUND_CONVERTER = "0xD6669bA6aE3411CDFFE5A826779BDA3DC1adAe8b";
const USDC_PRIME_CONVERTER = "0x882B399662d9608380c4E31145D31A030EB228Af";
const XVS_VAULT_CONVERTER = "0xd44B364a28386a2aa4Df1C54EA32deF3B2b98EeC";

const RISK_FUND_PROXY = "0x487CeF72dacABD7E12e633bb3B63815a386f7012";
const RISK_FUND_OLD_IMPLEMENTATION = "0x1E7DEC93C77740c2bB46daf87ef42056E388dA14";
const RISK_FUND_V2_IMPLEMENTATION = "0x6b925876F9e007b7CD0d7EFd100991F3eF4a4276";

const PROTOCOL_SHARE_RESERVE_PROXY = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";
const PROTOCOL_SHARE_RESERVE_OLD_IMPLEMENTATION = "0x6A7FF4641F52b267102a5a0779cE7a060374d6cC";
const PROTOCOL_SHARE_RESERVE_NEW_IMPLEMENTATION = "0xEdaB2b65fD3413d89b6D2a3AeB61E0c9eECA6A76";

forking(35915672, () => {
  const provider = ethers.provider;
  let ProxyAdmin: Contract;
  let RiskFund: Contract;
  let ConverterNetwork: Contract;
  let XVSVaultTreasury: Contract;
  let ProtocolShareReserve: Contract;

  let riskFundConvertibleBaseAsset: string;
  let riskFundMaxLoopsLimit: number;
  let riskFundShortfall: string;
  let psrPoolRegistry: string;
  let psrMaxLoopsLimit: number;
  let psrTotalAssetReserve: number;

  before(async () => {
    ProxyAdmin = new ethers.Contract(DEFAULT_PROXY_ADMIN, DEFAULT_PROXY_ADMIN_ABI, provider);

    ConverterNetwork = new ethers.Contract(CONVERTER_NETWORK, CONVERTER_NETWORK_ABI, provider);
    RiskFund = new ethers.Contract(RISK_FUND_PROXY, RISK_FUND_ABI, provider);
    ProtocolShareReserve = new ethers.Contract(
      PROTOCOL_SHARE_RESERVE_PROXY,
      PROTOCOL_SHARE_RESERVE_OLD_IMPLEMENTATION_ABI,
      provider,
    );
    XVSVaultTreasury = new ethers.Contract(XVS_VAULT_TREASURY, XVS_VAULT_CONVERTER_ABI, provider);
    riskFundConvertibleBaseAsset = await RiskFund.convertibleBaseAsset();
    riskFundMaxLoopsLimit = await RiskFund.maxLoopsLimit();
    riskFundShortfall = await RiskFund.shortfall();

    psrPoolRegistry = await ProtocolShareReserve.poolRegistry();
    psrMaxLoopsLimit = await ProtocolShareReserve.maxLoopsLimit();
    psrTotalAssetReserve = await ProtocolShareReserve.totalAssetReserve(XVS);
  });

  describe("Pre-VIP behavior Check for RiskFund and PSR", () => {
    it("RiskFund Proxy should have old implementation", async () => {
      expect(await ProxyAdmin.getProxyImplementation(RISK_FUND_PROXY)).to.equal(RISK_FUND_OLD_IMPLEMENTATION);
    });

    it("ProtocolShareReserve Proxy should have old implementation", async () => {
      expect(await ProxyAdmin.getProxyImplementation(PROTOCOL_SHARE_RESERVE_PROXY)).to.equal(
        PROTOCOL_SHARE_RESERVE_OLD_IMPLEMENTATION,
      );
    });
  });

  testVip("VIP-converter1", vipConverter1(), {
    callbackAfterExecution: async (txResponse: any) => {
      await expectEvents(txResponse, [SINGLE_TOKEN_CONVERTER_ABI], ["OwnershipTransferred"], [8]);
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [78]);
    },
  });

  testVip("VIP-converter2", vipConverter2(), {
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
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [12]);
      await expectEvents(txResponse, [RISK_FUND_V2_ABI], ["RiskFundConverterUpdated"], [1]);
      await expectEvents(txResponse, [TRANSPARENT_PROXY_ABI], ["Upgraded"], [2]);
      await expectEvents(
        txResponse,
        [SINGLE_TOKEN_CONVERTER_ABI],
        ["ConversionConfigUpdated", "ConverterNetworkAddressUpdated"],
        [210, 6],
      );
    },
  });

  describe("Post-VIP behavior", () => {
    before(() => {
      RiskFund = new ethers.Contract(RISK_FUND_PROXY, RISK_FUND_V2_ABI, provider);
      ProtocolShareReserve = new ethers.Contract(
        PROTOCOL_SHARE_RESERVE_PROXY,
        PROTOCOL_SHARE_RESERVE_NEW_IMPLEMENTATION_ABI,
        provider,
      );
    });

    it("RiskFund Proxy should have new implementation", async () => {
      expect(await ProxyAdmin.getProxyImplementation(RISK_FUND_PROXY)).to.equal(RISK_FUND_V2_IMPLEMENTATION);
    });

    it("RiskFund should have correct storage", async () => {
      expect(await RiskFund.accessControlManager()).to.equal(ACM);
      expect(await RiskFund.convertibleBaseAsset()).to.equal(riskFundConvertibleBaseAsset);
      expect(await RiskFund.maxLoopsLimit()).to.equal(riskFundMaxLoopsLimit);
      expect(await RiskFund.owner()).to.equal(NORMAL_TIMELOCK);
      expect(await RiskFund.shortfall()).to.equal(riskFundShortfall);
    });

    it("RiskFund should have correct address of RiskFundConverter", async () => {
      expect(await RiskFund.riskFundConverter()).to.equal(RISK_FUND_CONVERTER);
    });

    it("ProtocolShareReserve Proxy should have new implementation", async () => {
      expect(await ProxyAdmin.getProxyImplementation(PROTOCOL_SHARE_RESERVE_PROXY)).to.equal(
        PROTOCOL_SHARE_RESERVE_NEW_IMPLEMENTATION,
      );
    });

    it("PSR should have correct storage", async () => {
      expect(await ProtocolShareReserve.poolRegistry()).to.equal(psrPoolRegistry);
      expect(await ProtocolShareReserve.maxLoopsLimit()).to.equal(psrMaxLoopsLimit);
      expect(await ProtocolShareReserve.totalAssetReserve(XVS)).to.equal(psrTotalAssetReserve);
      expect(await ProtocolShareReserve.accessControlManager()).to.equal(ACM);
      expect(await ProtocolShareReserve.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it("PSR should have correct distribution configs", async () => {
      const percentageDistributionConverters = [4000, 420, 192, 177, 211, 1000];
      expect(await ProtocolShareReserve.totalDistributions()).to.equal(10);
      for (let i = 0; i < 6; i++) {
        expect(await ProtocolShareReserve.getPercentageDistribution(converters[i], 0)).to.equal(
          percentageDistributionConverters[i],
        );
      }

      expect(await ProtocolShareReserve.getPercentageDistribution(VTREASURY, 0)).to.equal(4000);
      expect(await ProtocolShareReserve.getPercentageDistribution(VTREASURY, 1)).to.equal(4000);
      expect(await ProtocolShareReserve.getPercentageDistribution(RISK_FUND_CONVERTER, 1)).to.equal(5000);
      expect(await ProtocolShareReserve.getPercentageDistribution(XVS_VAULT_CONVERTER, 1)).to.equal(1000);
    });

    it("Timelock should be the owner of all converters", async () => {
      for (let i = 0; i < 6; i++) {
        const Converter = new ethers.Contract(converters[i], SINGLE_TOKEN_CONVERTER_ABI, provider);
        expect(await Converter.owner()).to.equal(NORMAL_TIMELOCK);
      }
    });

    it("Timelock should be the owner of ConverterNetwork", async () => {
      expect(await ConverterNetwork.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it("Timelock should be the owner of XVSVaultTreasury", async () => {
      expect(await XVSVaultTreasury.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it("XVSVaultTreasury should have correct state variables", async () => {
      expect(await XVSVaultTreasury.XVS_ADDRESS()).to.equal(XVS);
      expect(await XVSVaultTreasury.xvsVault()).to.equal(XVS_VAULT);
    });

    it("ConverterNetwork should contain all converters", async () => {
      expect(await ConverterNetwork.getAllConverters()).to.deep.equal(converters);
    });
  });
});

forking(35915672, () => {
  const provider = ethers.provider;
  let RiskFundConverter: Contract;
  let USDCPrimeConverter: Contract;
  let usdt: Contract;
  let usdc: Contract;
  let user1: Signer;
  let user1Address: string;
  const amount = parseUnits("10", 18);

  describe("Post-VIP behavior", () => {
    before(async () => {
      await pretendExecutingVip(vipConverter1());
      await pretendExecutingVip(vipConverter2());

      [, user1] = await ethers.getSigners();
      user1Address = await user1.getAddress();

      RiskFundConverter = new ethers.Contract(RISK_FUND_CONVERTER, RISK_FUND_CONVERTER_ABI, provider);
      USDCPrimeConverter = new ethers.Contract(USDC_PRIME_CONVERTER, SINGLE_TOKEN_CONVERTER_ABI, provider);
      usdt = new ethers.Contract(USDT, MOCK_TOKEN_ABI, provider);
      usdc = new ethers.Contract(USDC, MOCK_TOKEN_ABI, provider);

      await usdt.connect(user1).allocateTo(user1Address, amount);
      await usdc.connect(user1).allocateTo(user1Address, amount);
    });

    it("RiskFundConverter should have correct storage", async () => {
      expect(await RiskFundConverter.destinationAddress()).to.equal(RISK_FUND_PROXY);
      expect(await RiskFundConverter.converterNetwork()).to.equal(CONVERTER_NETWORK);
      expect(await RiskFundConverter.conversionConfigurations(USDT, USDC)).to.deep.equal([0, 1]);
      expect(await RiskFundConverter.conversionConfigurations(USDC, USDT)).to.deep.equal([0, 0]);
      expect(await RiskFundConverter.poolsAssetsDirectTransfer(COMPTROLLER, USDT)).to.equal(true);
      expect(await RiskFundConverter.poolsAssetsDirectTransfer(COMPTROLLER, USDC)).to.equal(false);
    });

    it("UpdateAssetState should work correctly", async () => {
      await usdt.connect(user1).transfer(RISK_FUND_CONVERTER, amount);
      await usdc.connect(user1).transfer(RISK_FUND_CONVERTER, amount);

      await RiskFundConverter.connect(user1).updateAssetsState(COMPTROLLER, USDT);
      await RiskFundConverter.connect(user1).updateAssetsState(COMPTROLLER, USDC);

      // Amount will be transferred to RiskFund so balance is zero
      expect(await RiskFundConverter.balanceOf(USDT)).to.equal(0);
      expect(await RiskFundConverter.getPoolAssetReserve(COMPTROLLER, USDT)).to.equal(0);

      expect(await RiskFundConverter.balanceOf(USDC)).to.equal(amount);
      expect(await RiskFundConverter.getPoolAssetReserve(COMPTROLLER, USDC)).to.equal(amount);
    });

    it("Convert exact tokens should work correctly", async () => {
      const amountInMantissa = amount.div(2);
      await usdt.connect(user1).allocateTo(user1Address, amount);

      const usdcBalanceOfRiskFundConverterPrevious = await RiskFundConverter.balanceOf(USDC);
      const usdtBalanceOfRiskFundPrevious = await usdt.balanceOf(RISK_FUND_PROXY);
      const usdtBalanceOfUserPrevious = await usdt.balanceOf(user1Address);

      const [, amountOutMantissa] = await RiskFundConverter.connect(user1).callStatic.getUpdatedAmountOut(
        amountInMantissa,
        USDT,
        USDC,
      );

      await usdt.connect(user1).approve(RISK_FUND_CONVERTER, amountInMantissa);
      await RiskFundConverter.connect(user1).convertExactTokens(
        amountInMantissa,
        amountInMantissa.div(2),
        USDT,
        USDC,
        user1Address,
      );

      expect(await usdt.balanceOf(user1Address)).to.equal(usdtBalanceOfUserPrevious.sub(amountInMantissa));
      expect(await RiskFundConverter.balanceOf(USDT)).to.equal(0);
      expect(await RiskFundConverter.balanceOf(USDC)).to.equal(
        usdcBalanceOfRiskFundConverterPrevious.sub(amountOutMantissa),
      );
      expect(await usdt.balanceOf(RISK_FUND_PROXY)).to.equal(
        BigNumber.from(usdtBalanceOfRiskFundPrevious).add(amountInMantissa),
      );
    });

    it("ConvertForExactTokens should work properly", async () => {
      await usdc.connect(user1).allocateTo(user1Address, amount);
      await usdc.connect(user1).transfer(RISK_FUND_CONVERTER, amount);
      await RiskFundConverter.connect(user1).updateAssetsState(COMPTROLLER, USDC);

      const amountOutMantissa = amount.div(2);
      const amountInMaxMantissa = amount;
      await usdt.connect(user1).allocateTo(user1Address, amount);

      const usdcBalanceOfRiskFundConverterPrevious = await RiskFundConverter.balanceOf(USDC);
      const usdtBalanceOfRiskFundPrevious = await usdt.balanceOf(RISK_FUND_PROXY);
      const usdtBalanceOfUserPrevious = await usdt.balanceOf(user1Address);

      const [, amountInMantissa] = await RiskFundConverter.connect(user1).getAmountIn(amountOutMantissa, USDT, USDC);

      await usdt.connect(user1).approve(RISK_FUND_CONVERTER, amount);
      await RiskFundConverter.connect(user1).convertForExactTokens(
        amountInMaxMantissa,
        amountOutMantissa,
        USDT,
        USDC,
        user1Address,
      );

      expect(await usdt.balanceOf(user1Address)).to.equal(usdtBalanceOfUserPrevious.sub(amountInMantissa));
      expect(await RiskFundConverter.balanceOf(USDT)).to.equal(0);
      expect(await RiskFundConverter.balanceOf(USDC)).to.equal(
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

      const destinationAddressForUsdcConverter = await USDCPrimeConverter.destinationAddress();

      await usdc.connect(user1).transfer(RISK_FUND_CONVERTER, amount);
      await RiskFundConverter.connect(user1).updateAssetsState(COMPTROLLER, USDC);

      const plpBalanceForUsdcPrevious = await usdc.balanceOf(destinationAddressForUsdcConverter);

      await usdt.connect(user1).transfer(USDC_PRIME_CONVERTER, amount);
      // Private Conversion will occur
      await USDCPrimeConverter.connect(user1).updateAssetsState(COMPTROLLER, USDT);

      // New balance of plp will be updated by around 10 tokens because of minimum amount to convert.
      expect(await usdc.balanceOf(destinationAddressForUsdcConverter)).to.closeTo(
        plpBalanceForUsdcPrevious.add(newAmount.div(2)),
        parseUnits("1", 17),
      );
    });
  });
});
