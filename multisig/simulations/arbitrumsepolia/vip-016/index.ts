/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect } from "chai";
import { BigNumber, Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip016, {
  COMPTROLLER_CORE,
  PLP,
  PROTOCOL_SHARE_RESERVE_PROXY,
  VTREASURY,
  XVS_VAULT_TREASURY,
} from "../../../proposals/arbitrumsepolia/vip-016";
import {
  CONVERTER_NETWORK,
  USDC_PRIME_CONVERTER,
  USDT_PRIME_CONVERTER,
  XVS_VAULT_CONVERTER,
  converters,
} from "../../../proposals/arbitrumsepolia/vip-016/Addresses";
import CONVERTER_NETWORK_ABI from "./abi/ConverterNetwork.json";
import ERC20_ABI from "./abi/ERC20.json";
import PROTOCOL_SHARE_RESERVE_ABI from "./abi/ProtocolShareReserve.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";
import XVS_VAULT_TREASURY_ABI from "./abi/XVSVaultTreasury.json";

const { arbitrumsepolia } = NETWORK_ADDRESSES;
const XVS = "0x877Dc896e7b13096D3827872e396927BbE704407";
const XVS_VAULT = "0x407507DC2809D3aa31D54EcA3BEde5C5c4C8A17F";
const USDT_HOLDER = "0x4e7ab1fD841E1387Df4c91813Ae03819C33D5bdB";
const USDC_HOLDER = "0x4e7ab1fD841E1387Df4c91813Ae03819C33D5bdB";
const USDT = "0xf3118a17863996B9F2A073c9A66Faaa664355cf8";
const USDC = "0x86f096B1D970990091319835faF3Ee011708eAe8";
forking(94312350, async () => {
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

    await pretendExecutingVip(await vip016());
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
        parseUnits("1", 7),
      );
      expect(await usdc.balanceOf(destinationAddressForUsdcConverter)).to.closeTo(
        plpBalanceForUsdcPrevious.add(amount),
        parseUnits("1", 7),
      );
    });
  });
});
