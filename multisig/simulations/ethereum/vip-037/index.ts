/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect } from "chai";
import { BigNumber, Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { initMainnetUser } from "src/utils";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip037, {
  COMPTROLLER_CORE,
  COMPTROLLER_LST,
  NEW_IMPLEMENTATION,
  PLP,
  PRIME,
  PROTOCOL_SHARE_RESERVE_PROXY,
  SINGLE_TOKEN_CONVERTER_BEACON,
  USDC,
  USDT,
  VTREASURY,
  VUSDC_CORE,
  VUSDT_CORE,
  VWBTC_CORE,
  VWETH_LST,
  WBTC,
  WETH,
  XVS_VAULT_TREASURY,
} from "../../../proposals/ethereum/vip-037";
import {
  CONVERTER_NETWORK,
  GUARDIAN,
  USDC_PRIME_CONVERTER,
  USDT_PRIME_CONVERTER,
  XVS_VAULT_CONVERTER,
  converters,
} from "../../../proposals/ethereum/vip-037/Addresses";
import CONVERTER_NETWORK_ABI from "./abi/ConverterNetwork.json";
import ERC20_ABI from "./abi/ERC20.json";
import COMPTROLLER_ABI from "./abi/ILComptroller.json";
import PRIME_ABI from "./abi/Prime.json";
import PLP_ABI from "./abi/PrimeLiquidityProvider.json";
import PROTOCOL_SHARE_RESERVE_ABI from "./abi/ProtocolShareReserve.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";
import SINGLE_TOKEN_CONVERTER_BEACON_ABI from "./abi/SingleTokenConverterBeacon.json";
import XVS_VAULT_CONVERTER_ABI from "./abi/XVSVaultTreasury.json";
import XVS_VAULT_TREASURY_ABI from "./abi/XVSVaultTreasury.json";

const XVS = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";
const XVS_VAULT = "0xA0882C2D5DF29233A092d2887A258C2b90e9b994";
const USDT_HOLDER = "0xb23360CCDd9Ed1b15D45E5d3824Bb409C8D7c460";
const USDC_HOLDER = "0x974CaA59e49682CdA0AD2bbe82983419A2ECC400";

const OLD_IMPLEMENTATION = "0x97D77d7e02095C26854FF7E1dCBE03041e2Af432";

forking(20120060, async () => {
  const provider = ethers.provider;
  let converterNetwork: Contract;
  let xvsVaultTreasury: Contract;
  let singleTokenConverterBeacon: Contract;

  describe("Pre-VIP behaviour", () => {
    before(async () => {
      singleTokenConverterBeacon = new ethers.Contract(
        SINGLE_TOKEN_CONVERTER_BEACON,
        SINGLE_TOKEN_CONVERTER_BEACON_ABI,
        provider,
      );
    });

    it("Converters should have old implementation", async () => {
      expect(await singleTokenConverterBeacon.implementation()).to.equal(OLD_IMPLEMENTATION);
    });
  });

  describe("Post-VIP behavior", () => {
    before(async () => {
      await pretendExecutingVip(await vip037());

      converterNetwork = new ethers.Contract(CONVERTER_NETWORK, CONVERTER_NETWORK_ABI, provider);
      xvsVaultTreasury = new ethers.Contract(XVS_VAULT_TREASURY, XVS_VAULT_CONVERTER_ABI, provider);
    });

    it("Converters should have new implementation", async () => {
      expect(await singleTokenConverterBeacon.implementation()).to.equal(NEW_IMPLEMENTATION);
    });

    it("Timelock should be the owner of all converters", async () => {
      for (const converter of converters) {
        const Converter = new ethers.Contract(converter, SINGLE_TOKEN_CONVERTER_ABI, provider);
        expect(await Converter.owner()).to.equal(GUARDIAN);
      }
    });
    it("Owner of single token converter should be normal timelock", async () => {
      expect(await singleTokenConverterBeacon.owner()).to.equal(GUARDIAN);
    });

    it("Timelock should be the owner of ConverterNetwork", async () => {
      expect(await converterNetwork.owner()).to.equal(GUARDIAN);
    });

    it("Timelock should be the owner of XVSVaultTreasury", async () => {
      expect(await xvsVaultTreasury.owner()).to.equal(GUARDIAN);
    });
  });
});

forking(20120060, async () => {
  const provider = ethers.provider;
  let converterNetwork: Contract;
  let xvsVaultTreasury: Contract;
  let protocolShareReserve: Contract;
  let usdtPrimeConverter: Contract;
  let usdcPrimeConverter: Contract;

  before(async () => {
    usdcPrimeConverter = new ethers.Contract(USDC_PRIME_CONVERTER, SINGLE_TOKEN_CONVERTER_ABI, provider);
    usdtPrimeConverter = new ethers.Contract(USDT_PRIME_CONVERTER, SINGLE_TOKEN_CONVERTER_ABI, provider);

    converterNetwork = new ethers.Contract(CONVERTER_NETWORK, CONVERTER_NETWORK_ABI, provider);
    protocolShareReserve = new ethers.Contract(PROTOCOL_SHARE_RESERVE_PROXY, PROTOCOL_SHARE_RESERVE_ABI, provider);
    xvsVaultTreasury = new ethers.Contract(XVS_VAULT_TREASURY, XVS_VAULT_TREASURY_ABI, provider);

    await pretendExecutingVip(await vip037());
  });

  describe("Post-VIP behavior", () => {
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
      const percentageDistributionConverters = [140, 140, 140, 1580, 2000];
      expect(await protocolShareReserve.totalDistributions()).to.equal(8);

      for (let i = 0; i < 5; i++) {
        expect(await protocolShareReserve.getPercentageDistribution(converters[i], 0)).to.equal(
          percentageDistributionConverters[i],
        );
      }

      expect(await protocolShareReserve.getPercentageDistribution(VTREASURY, 0)).to.equal(6000);
      expect(await protocolShareReserve.getPercentageDistribution(VTREASURY, 1)).to.equal(8000);
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
      const usdtBalanceOfUsdtPrimePrevious = await usdt.balanceOf(PLP);
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
      expect(await usdt.balanceOf(PLP)).to.equal(BigNumber.from(usdtBalanceOfUsdtPrimePrevious).add(amountInMantissa));
    });

    it("ConvertForExactTokens should work properly", async () => {
      await usdc.connect(usdcHolder).transfer(user1Address, amount);
      await usdc.connect(user1).transfer(USDT_PRIME_CONVERTER, amount);

      const amountOutMantissa = amount.div(2);
      const amountInMaxMantissa = amount;
      await usdt.connect(usdtHolder).transfer(user1Address, amount);

      const usdcBalanceOfUsdtPrimeConverterPrevious = await usdtPrimeConverter.balanceOf(USDC);
      const usdtBalanceOfUsdtPrimePrevious = await usdt.balanceOf(PLP);
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
      expect(await usdt.balanceOf(PLP)).to.equal(BigNumber.from(usdtBalanceOfUsdtPrimePrevious).add(amountInMantissa));
    });

    it("Private conversion should occur on updateAssetsState", async () => {
      const newAmount = amount.mul(2);
      await usdc.connect(usdcHolder).transfer(user1Address, newAmount);
      await usdt.connect(usdtHolder).transfer(user1Address, newAmount);

      const destinationAddressForUsdcConverter = await usdcPrimeConverter.destinationAddress();

      await usdc.connect(user1).transfer(USDT_PRIME_CONVERTER, amount);
      await usdtPrimeConverter.connect(user1).updateAssetsState(COMPTROLLER_CORE, USDC);

      const usdcBalanceUsdtPrimeConverterPrevious = await usdtPrimeConverter.balanceOf(USDC);
      const usdtBalanceUsdtPrimePrevious = await usdt.balanceOf(PLP);

      const plpBalanceForUsdcPrevious = await usdc.balanceOf(destinationAddressForUsdcConverter);
      await usdt.connect(user1).transfer(USDC_PRIME_CONVERTER, amount);

      // Private Conversion will occur
      await usdcPrimeConverter.connect(user1).updateAssetsState(COMPTROLLER_CORE, USDT);

      const usdcBalanceUsdtPrimeConverterCurrent = await usdtPrimeConverter.balanceOf(USDC);
      const usdtBalanceUsdtPrimeCurrent = await usdt.balanceOf(PLP);

      expect(usdtBalanceUsdtPrimeCurrent).to.equal(usdtBalanceUsdtPrimePrevious.add(amount));
      expect(usdcBalanceUsdtPrimeConverterCurrent).to.closeTo(
        usdcBalanceUsdtPrimeConverterPrevious.sub(amount),
        parseUnits("1", 6),
      );
      expect(await usdc.balanceOf(destinationAddressForUsdcConverter)).to.closeTo(
        plpBalanceForUsdcPrevious.add(amount),
        parseUnits("1", 6),
      );
    });
  });
});

forking(20120060, async () => {
  const provider = ethers.provider;
  let prime: Contract;
  let plp: Contract;

  describe("Pre-VIP behaviour", () => {
    before(async () => {
      prime = new ethers.Contract(PRIME, PRIME_ABI, provider);
      plp = new ethers.Contract(PLP, PLP_ABI, provider);
    });

    it("Plp should not contain tokens", async () => {
      plp = new ethers.Contract(PLP, PLP_ABI, provider);

      expect(await plp.lastAccruedBlockOrSecond(USDT)).to.be.equal(0);
      expect(await plp.lastAccruedBlockOrSecond(USDC)).to.be.equal(0);
      expect(await plp.lastAccruedBlockOrSecond(WETH)).to.be.equal(0);
      expect(await plp.lastAccruedBlockOrSecond(WBTC)).to.be.equal(0);
    });

    it("Prime should have not contain number of revocable and irrevocable tokens", async () => {
      expect(await prime.irrevocableLimit()).to.equal(0);
      expect(await prime.revocableLimit()).to.equal(0);
    });
  });

  describe("Post-VIP behavior", () => {
    let prime: Contract;
    let plp: Contract;

    before(async () => {
      await pretendExecutingVip(await vip037());

      prime = new ethers.Contract(PRIME, PRIME_ABI, provider);
      plp = new ethers.Contract(PLP, PLP_ABI, provider);
    });

    it("Comptroller lst should have correct Prime token address", async () => {
      const comptrollerLst = new ethers.Contract(COMPTROLLER_LST, COMPTROLLER_ABI, provider);
      expect(await comptrollerLst.prime()).to.be.equal(PRIME);
    });

    it("Prime should contain correct markets", async () => {
      expect((await prime.markets(VUSDC_CORE))[4]).to.be.equal(true);
      expect((await prime.markets(VUSDT_CORE))[4]).to.be.equal(true);
      expect((await prime.markets(VWBTC_CORE))[4]).to.be.equal(true);
      expect((await prime.markets(VWETH_LST))[4]).to.be.equal(true);
    });

    it("Prime should have correct number of revocable and irrevocable tokens", async () => {
      expect(await prime.irrevocableLimit()).to.equal(0);
      expect(await prime.revocableLimit()).to.equal(500);
    });

    it("Plp should have correct tokens", async () => {
      expect(await plp.lastAccruedBlockOrSecond(USDT)).to.be.gt(0);
      expect(await plp.lastAccruedBlockOrSecond(USDC)).to.be.gt(0);
      expect(await plp.lastAccruedBlockOrSecond(WETH)).to.be.gt(0);
      expect(await plp.lastAccruedBlockOrSecond(WBTC)).to.be.gt(0);
    });
  });
});
