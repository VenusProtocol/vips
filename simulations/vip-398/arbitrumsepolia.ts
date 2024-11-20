import { expect } from "chai";
import { BigNumber, Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip018 from "../../multisig/proposals/arbitrumsepolia/vip-018";
import vip019, { XVS_VAULT_TREASURY } from "../../multisig/proposals/arbitrumsepolia/vip-019";
import {
  CONVERTER_NETWORK,
  USDC_PRIME_CONVERTER,
  USDT_PRIME_CONVERTER,
  XVS_VAULT_CONVERTER,
  converters,
} from "../../multisig/proposals/arbitrumsepolia/vip-019/Addresses";
import CONVERTER_NETWORK_ABI from "../../multisig/simulations/arbitrumsepolia/vip-019/abi/ConverterNetwork.json";
import SINGLE_TOKEN_CONVERTER_ABI from "../../multisig/simulations/arbitrumsepolia/vip-019/abi/SingleTokenConverter.json";
import XVS_VAULT_TREASURY_ABI from "../../multisig/simulations/arbitrumsepolia/vip-019/abi/XVSVaultTreasury.json";
import vip395, {
  ARBITRUM_SEPOLIA_COMPTROLLER_CORE,
  ARBITRUM_SEPOLIA_COMPTROLLER_LST,
  ARBITRUM_SEPOLIA_PLP,
  ARBITRUM_SEPOLIA_PRIME,
  ARBITRUM_SEPOLIA_USDC,
  ARBITRUM_SEPOLIA_USDT,
  ARBITRUM_SEPOLIA_VUSDC_CORE,
  ARBITRUM_SEPOLIA_VUSDT_CORE,
  ARBITRUM_SEPOLIA_VWBTC_CORE,
  ARBITRUM_SEPOLIA_VWETH_LST,
  ARBITRUM_SEPOLIA_WBTC,
  ARBITRUM_SEPOLIA_WETH,
} from "../../vips/vip-398/bsctestnet";
import ERC20_ABI from "./abi/ERC20.json";
import COMPTROLLER_ABI from "./abi/ILComptroller.json";
import PRIME_ABI from "./abi/Prime.json";
import PLP_ABI from "./abi/PrimeLiquidityProvider.json";
import PROTOCOL_SHARE_RESERVE_ABI from "./abi/ProtocolShareReserve.json";

const { arbitrumsepolia } = NETWORK_ADDRESSES;
const XVS = "0x877Dc896e7b13096D3827872e396927BbE704407";
const XVS_VAULT = "0x407507DC2809D3aa31D54EcA3BEde5C5c4C8A17F";
const USDT_HOLDER = "0x4e7ab1fD841E1387Df4c91813Ae03819C33D5bdB";
const USDC_HOLDER = "0x4e7ab1fD841E1387Df4c91813Ae03819C33D5bdB";
const USDT = "0xf3118a17863996B9F2A073c9A66Faaa664355cf8";
const USDC = "0x86f096B1D970990091319835faF3Ee011708eAe8";

const ARBITRUM_SEPOLIA_PROTOCOL_SHARE_RESERVE_PROXY = "0x09267d30798B59c581ce54E861A084C6FC298666";
const ARBITRUM_SEPOLIA_VTREASURY = "0x4e7ab1fD841E1387Df4c91813Ae03819C33D5bdB";

forking(96329874, async () => {
  const provider = ethers.provider;
  let prime: Contract;
  let converterNetwork: Contract;
  let xvsVaultTreasury: Contract;
  let protocolShareReserve: Contract;
  let usdtPrimeConverter: Contract;
  let usdcPrimeConverter: Contract;

  before(async () => {
    usdcPrimeConverter = new ethers.Contract(USDC_PRIME_CONVERTER, SINGLE_TOKEN_CONVERTER_ABI, provider);
    usdtPrimeConverter = new ethers.Contract(USDT_PRIME_CONVERTER, SINGLE_TOKEN_CONVERTER_ABI, provider);

    converterNetwork = new ethers.Contract(CONVERTER_NETWORK, CONVERTER_NETWORK_ABI, provider);
    protocolShareReserve = new ethers.Contract(
      ARBITRUM_SEPOLIA_PROTOCOL_SHARE_RESERVE_PROXY,
      PROTOCOL_SHARE_RESERVE_ABI,
      provider,
    );
    xvsVaultTreasury = new ethers.Contract(XVS_VAULT_TREASURY, XVS_VAULT_TREASURY_ABI, provider);

    await pretendExecutingVip(await vip018());
    await pretendExecutingVip(await vip019());
  });

  describe("Pre-VIP behaviour", () => {
    before(async () => {
      prime = new ethers.Contract(ARBITRUM_SEPOLIA_PRIME, PRIME_ABI, provider);
    });

    it("Prime should have not contain number of revocable and irrevocable tokens", async () => {
      expect(await prime.irrevocableLimit()).to.equal(0);
      expect(await prime.revocableLimit()).to.equal(0);
    });
  });

  testForkedNetworkVipCommands("VIP 395", await vip395(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PRIME_ABI], ["MarketAdded"], [4]);
      await expectEvents(txResponse, [PRIME_ABI], ["MintLimitsUpdated"], [1]);
      await expectEvents(txResponse, [PROTOCOL_SHARE_RESERVE_ABI], ["DistributionConfigAdded"], [6]);
      await expectEvents(txResponse, [PROTOCOL_SHARE_RESERVE_ABI], ["DistributionConfigUpdated"], [2]);
    },
  });

  describe("Post-VIP behavior", () => {
    let prime: Contract;
    let plp: Contract;

    before(async () => {
      prime = new ethers.Contract(ARBITRUM_SEPOLIA_PRIME, PRIME_ABI, provider);
      plp = new ethers.Contract(ARBITRUM_SEPOLIA_PLP, PLP_ABI, provider);
    });

    it("prime should have correct pool registry address", async () => {
      expect(await prime.poolRegistry()).to.be.equal(arbitrumsepolia.POOL_REGISTRY);
    });

    it("Comptroller lst and core should have correct Prime token address", async () => {
      const comptrollerCore = new ethers.Contract(ARBITRUM_SEPOLIA_COMPTROLLER_CORE, COMPTROLLER_ABI, provider);
      expect(await comptrollerCore.prime()).to.be.equal(ARBITRUM_SEPOLIA_PRIME);

      const comptrollerLst = new ethers.Contract(ARBITRUM_SEPOLIA_COMPTROLLER_LST, COMPTROLLER_ABI, provider);
      expect(await comptrollerLst.prime()).to.be.equal(ARBITRUM_SEPOLIA_PRIME);
    });

    it("Prime should contain correct markets", async () => {
      expect((await prime.markets(ARBITRUM_SEPOLIA_VUSDC_CORE))[4]).to.be.equal(true);
      expect((await prime.markets(ARBITRUM_SEPOLIA_VUSDT_CORE))[4]).to.be.equal(true);
      expect((await prime.markets(ARBITRUM_SEPOLIA_VWBTC_CORE))[4]).to.be.equal(true);
      expect((await prime.markets(ARBITRUM_SEPOLIA_VWETH_LST))[4]).to.be.equal(true);
    });

    it("Prime should have correct number of revocable and irrevocable tokens", async () => {
      expect(await prime.irrevocableLimit()).to.equal(0);
      expect(await prime.revocableLimit()).to.equal(500);
    });

    it("Plp should have correct tokens", async () => {
      expect(await plp.lastAccruedBlockOrSecond(ARBITRUM_SEPOLIA_USDT)).to.be.gt(0);
      expect(await plp.lastAccruedBlockOrSecond(ARBITRUM_SEPOLIA_USDC)).to.be.gt(0);
      expect(await plp.lastAccruedBlockOrSecond(ARBITRUM_SEPOLIA_WETH)).to.be.gt(0);
      expect(await plp.lastAccruedBlockOrSecond(ARBITRUM_SEPOLIA_WBTC)).to.be.gt(0);
    });
  });

  describe("Owner checks", () => {
    it("Timelock should be the owner of all converters", async () => {
      for (const converter of converters) {
        const Converter = new ethers.Contract(converter, SINGLE_TOKEN_CONVERTER_ABI, provider);
        expect(await Converter.owner()).to.equal(arbitrumsepolia.GUARDIAN);
      }
    });

    it("Timelock should be the owner of ConverterNetwork", async () => {
      expect(await converterNetwork.owner()).to.equal(arbitrumsepolia.GUARDIAN);
    });

    it("Timelock should be the owner of XVSVaultTreasury", async () => {
      expect(await xvsVaultTreasury.owner()).to.equal(arbitrumsepolia.GUARDIAN);
    });
  });

  describe("Generic checks", () => {
    let usdt: Contract;
    let usdc: Contract;
    let user1: Signer;
    let usdtHolder: Signer;
    let usdcHolder: Signer;
    let user1Address: string;

    const amount = parseUnits("1000", 6);

    before(async () => {
      usdt = new ethers.Contract(USDT, ERC20_ABI, provider);
      usdc = new ethers.Contract(USDC, ERC20_ABI, provider);

      [, user1] = await ethers.getSigners();
      user1Address = await user1.getAddress();

      usdcHolder = await initMainnetUser(USDC_HOLDER, ethers.utils.parseEther("1"));
      usdtHolder = await initMainnetUser(USDT_HOLDER, ethers.utils.parseEther("1"));

      await usdt.connect(usdtHolder).transfer(user1Address, amount);
      await usdc.connect(usdcHolder).transfer(user1Address, amount);
    });

    it("PSR should have correct distribution configs", async () => {
      const percentageDistributionConverters = [500, 500, 300, 700, 2000];
      expect(await protocolShareReserve.totalDistributions()).to.equal(8);

      for (let i = 0; i < 5; i++) {
        expect(await protocolShareReserve.getPercentageDistribution(converters[i], 0)).to.equal(
          percentageDistributionConverters[i],
        );
      }

      expect(await protocolShareReserve.getPercentageDistribution(ARBITRUM_SEPOLIA_VTREASURY, 0)).to.equal(6000);
      expect(await protocolShareReserve.getPercentageDistribution(ARBITRUM_SEPOLIA_VTREASURY, 1)).to.equal(8000);
      expect(await protocolShareReserve.getPercentageDistribution(XVS_VAULT_CONVERTER, 1)).to.equal(2000);
    });

    it("XVSVaultTreasury should have correct state variables", async () => {
      expect(await xvsVaultTreasury.XVS_ADDRESS()).to.equal(XVS);
      expect(await xvsVaultTreasury.xvsVault()).to.equal(XVS_VAULT);
    });

    it("ConverterNetwork should contain all converters", async () => {
      expect(await converterNetwork.getAllConverters()).to.deep.equal(converters);
    });

    it("Convert exact tokens should work correctly", async () => {
      const amountInMantissa = amount.div(2);
      await usdt.connect(usdtHolder).transfer(user1Address, amount);
      await usdc.connect(usdtHolder).transfer(USDT_PRIME_CONVERTER, amount);

      const usdcBalanceOfUsdtPrimeConverterPrevious = await usdtPrimeConverter.balanceOf(USDC);
      const usdtBalanceOfUsdtPrimePrevious = await usdt.balanceOf(ARBITRUM_SEPOLIA_PLP);
      const usdtBalanceOfUserPrevious = await usdt.balanceOf(user1Address);

      const [, amountOutMantissa] = await usdtPrimeConverter
        .connect(user1)
        .callStatic.getUpdatedAmountOut(amountInMantissa, USDT, USDC);

      await usdt.connect(user1).approve(USDT_PRIME_CONVERTER, amountInMantissa);
      await usdtPrimeConverter
        .connect(user1)
        .convertExactTokens(amountInMantissa, amountInMantissa.div(2), USDT, USDC, user1Address);

      expect(await usdt.balanceOf(user1Address)).to.equal(usdtBalanceOfUserPrevious.sub(amountInMantissa));
      expect(await usdtPrimeConverter.balanceOf(USDT)).to.equal(0);
      expect(await usdtPrimeConverter.balanceOf(USDC)).to.equal(
        usdcBalanceOfUsdtPrimeConverterPrevious.sub(amountOutMantissa),
      );
      expect(await usdt.balanceOf(ARBITRUM_SEPOLIA_PLP)).to.equal(
        BigNumber.from(usdtBalanceOfUsdtPrimePrevious).add(amountInMantissa),
      );
    });

    it("ConvertForExactTokens should work properly", async () => {
      await usdc.connect(usdcHolder).transfer(user1Address, amount);
      await usdc.connect(user1).transfer(USDT_PRIME_CONVERTER, amount);

      const amountOutMantissa = amount.div(2);
      const amountInMaxMantissa = amount;
      await usdt.connect(usdtHolder).transfer(user1Address, amount);

      const usdcBalanceOfUsdtPrimeConverterPrevious = await usdtPrimeConverter.balanceOf(USDC);
      const usdtBalanceOfUsdtPrimePrevious = await usdt.balanceOf(ARBITRUM_SEPOLIA_PLP);
      const usdtBalanceOfUserPrevious = await usdt.balanceOf(user1Address);

      const [, amountInMantissa] = await usdtPrimeConverter.connect(user1).getAmountIn(amountOutMantissa, USDT, USDC);

      await usdt.connect(user1).approve(USDT_PRIME_CONVERTER, amount);
      await usdtPrimeConverter
        .connect(user1)
        .convertForExactTokens(amountInMaxMantissa, amountOutMantissa, USDT, USDC, user1Address);

      expect(await usdt.balanceOf(user1Address)).to.equal(usdtBalanceOfUserPrevious.sub(amountInMantissa));
      expect(await usdtPrimeConverter.balanceOf(USDT)).to.equal(0);
      expect(await usdtPrimeConverter.balanceOf(USDC)).to.equal(
        usdcBalanceOfUsdtPrimeConverterPrevious.sub(amountOutMantissa),
      );
      expect(await usdt.balanceOf(ARBITRUM_SEPOLIA_PLP)).to.equal(
        BigNumber.from(usdtBalanceOfUsdtPrimePrevious).add(amountInMantissa),
      );
    });

    it("Private conversion should occur on updateAssetsState", async () => {
      const newAmount = amount.mul(2);
      await usdc.connect(usdcHolder).transfer(user1Address, newAmount);
      await usdt.connect(usdtHolder).transfer(user1Address, newAmount);

      const destinationAddressForUsdcConverter = await usdcPrimeConverter.destinationAddress();

      await usdc.connect(user1).transfer(USDT_PRIME_CONVERTER, amount);
      await usdtPrimeConverter.connect(user1).updateAssetsState(ARBITRUM_SEPOLIA_COMPTROLLER_CORE, USDC);

      const usdcBalanceUsdtPrimeConverterPrevious = await usdtPrimeConverter.balanceOf(USDC);
      const usdtBalanceUsdtPrimePrevious = await usdt.balanceOf(ARBITRUM_SEPOLIA_PLP);

      const plpBalanceForUsdcPrevious = await usdc.balanceOf(destinationAddressForUsdcConverter);
      await usdt.connect(user1).transfer(USDC_PRIME_CONVERTER, amount);

      // Private Conversion will occur
      await usdcPrimeConverter.connect(user1).updateAssetsState(ARBITRUM_SEPOLIA_COMPTROLLER_CORE, USDT);

      const usdcBalanceUsdtPrimeConverterCurrent = await usdtPrimeConverter.balanceOf(USDC);
      const usdtBalanceUsdtPrimeCurrent = await usdt.balanceOf(ARBITRUM_SEPOLIA_PLP);

      expect(usdtBalanceUsdtPrimeCurrent).to.equal(usdtBalanceUsdtPrimePrevious.add(amount));
      expect(usdcBalanceUsdtPrimeConverterCurrent).to.closeTo(
        usdcBalanceUsdtPrimeConverterPrevious.sub(amount),
        parseUnits("1", 7),
      );
      expect(await usdc.balanceOf(destinationAddressForUsdcConverter)).to.closeTo(
        plpBalanceForUsdcPrevious.add(amount),
        parseUnits("1", 7),
      );
    });
  });
});
