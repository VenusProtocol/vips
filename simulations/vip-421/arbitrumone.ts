import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents, initMainnetUser, setMaxStalePeriod } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import {
  ARBITRUM_ARB,
  ARBITRUM_USDC_PRIME_CONVERTER,
  ARBITRUM_USDT,
  ARBITRUM_USDT_PRIME_CONVERTER,
  ARBITRUM_WBTC_PRIME_CONVERTER,
  ARBITRUM_WETH_PRIME_CONVERTER,
  ARBITRUM_XVS_VAULT_CONVERTER,
  arbitrumBaseAssets,
  arbitrumTokenAddresses,
} from "../../vips/vip-421/addresses";
import vip421 from "../../vips/vip-421/bscmainnetPartA";
import CONVERTER_ABI from "./abi/Converter.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import ERC20_ABI from "./abi/erc20.json";

const ARB_HOLDER = "0xf7F468B184A48f6ca37EeFFE12733Ee1c16B6E26";
const USDT_HOLDER = "0x25681Ab599B4E2CEea31F8B498052c53FC2D74db";
const RESILIENT_ORACLE = "0xd55A98150e0F9f5e3F6280FC25617A5C93d96007";

forking(295028620, async () => {
  let converter;
  describe("Pre VIP", () => {
    arbitrumTokenAddresses.map(token => {
      it(`Incentives in USDT converter for ${token}`, async () => {
        converter = await ethers.getContractAt(CONVERTER_ABI, ARBITRUM_USDT_PRIME_CONVERTER);
        const incentiveAndAccess = await converter.conversionConfigurations(arbitrumBaseAssets[0], token);
        expect(incentiveAndAccess[0]).to.equal(0);
        expect(incentiveAndAccess[1]).to.equal(0);
      });

      it(`Incentives in USDC converter for ${token}`, async () => {
        converter = await ethers.getContractAt(CONVERTER_ABI, ARBITRUM_USDC_PRIME_CONVERTER);
        const incentiveAndAccess = await converter.conversionConfigurations(arbitrumBaseAssets[1], token);
        expect(incentiveAndAccess[0]).to.equal(0);
        expect(incentiveAndAccess[1]).to.equal(0);
      });

      it(`Incentives in WBTC converter for ${token}`, async () => {
        converter = await ethers.getContractAt(CONVERTER_ABI, ARBITRUM_WBTC_PRIME_CONVERTER);
        const incentiveAndAccess = await converter.conversionConfigurations(arbitrumBaseAssets[2], token);
        expect(incentiveAndAccess[0]).to.equal(0);
        expect(incentiveAndAccess[1]).to.equal(0);
      });

      it(`Incentives in WETH converter for ${token}`, async () => {
        converter = await ethers.getContractAt(CONVERTER_ABI, ARBITRUM_WETH_PRIME_CONVERTER);
        const incentiveAndAccess = await converter.conversionConfigurations(arbitrumBaseAssets[3], token);
        expect(incentiveAndAccess[0]).to.equal(0);
        expect(incentiveAndAccess[1]).to.equal(0);
      });

      it(`Incentives in XVS vault converter for ${token}`, async () => {
        converter = await ethers.getContractAt(CONVERTER_ABI, ARBITRUM_XVS_VAULT_CONVERTER);
        const incentiveAndAccess = await converter.conversionConfigurations(arbitrumBaseAssets[4], token);
        expect(incentiveAndAccess[0]).to.equal(0);
        expect(incentiveAndAccess[1]).to.equal(0);
      });
    });
  });

  testForkedNetworkVipCommands("vip421", await vip421(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [CONVERTER_ABI], ["ConversionConfigUpdated"], [15]);
    },
  });

  describe("Post VIP", () => {
    arbitrumTokenAddresses.map(token => {
      it(`Incentives in USDT converter for ${token}`, async () => {
        converter = await ethers.getContractAt(CONVERTER_ABI, ARBITRUM_USDT_PRIME_CONVERTER);
        const incentiveAndAccess = await converter.conversionConfigurations(arbitrumBaseAssets[0], token);
        expect(incentiveAndAccess[0]).to.equal(0);
        expect(incentiveAndAccess[1]).to.equal(1);
      });

      it(`Incentives in USDC converter for ${token}`, async () => {
        converter = await ethers.getContractAt(CONVERTER_ABI, ARBITRUM_USDC_PRIME_CONVERTER);
        const incentiveAndAccess = await converter.conversionConfigurations(arbitrumBaseAssets[1], token);
        expect(incentiveAndAccess[0]).to.equal(0);
        expect(incentiveAndAccess[1]).to.equal(1);
      });

      it(`Incentives in WBTC converter for ${token}`, async () => {
        converter = await ethers.getContractAt(CONVERTER_ABI, ARBITRUM_WBTC_PRIME_CONVERTER);
        const incentiveAndAccess = await converter.conversionConfigurations(arbitrumBaseAssets[2], token);
        expect(incentiveAndAccess[0]).to.equal(0);
        expect(incentiveAndAccess[1]).to.equal(1);
      });

      it(`Incentives in WETH converter for ${token}`, async () => {
        converter = await ethers.getContractAt(CONVERTER_ABI, ARBITRUM_WETH_PRIME_CONVERTER);
        const incentiveAndAccess = await converter.conversionConfigurations(arbitrumBaseAssets[3], token);
        expect(incentiveAndAccess[0]).to.equal(0);
        expect(incentiveAndAccess[1]).to.equal(1);
      });

      it(`Incentives in XVS vault converter for ${token}`, async () => {
        converter = await ethers.getContractAt(CONVERTER_ABI, ARBITRUM_XVS_VAULT_CONVERTER);
        const incentiveAndAccess = await converter.conversionConfigurations(arbitrumBaseAssets[4], token);
        expect(incentiveAndAccess[0]).to.equal(0);
        expect(incentiveAndAccess[1]).to.equal(1);
      });
    });
  });

  describe("Generic checks post VIP", () => {
    let usdt: Contract;
    let arb: Contract;
    let user1: Signer;
    let usdtHolder: Signer;
    let arbHolder: Signer;
    let user1Address: string;
    let usdtPrimeConverter: Contract;
    let oracle: Contract;

    const amount = parseUnits("1000", 6);
    const provider = ethers.provider;

    before(async () => {
      oracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, RESILIENT_ORACLE);
      usdtPrimeConverter = await ethers.getContractAt(CONVERTER_ABI, ARBITRUM_USDT_PRIME_CONVERTER);

      usdt = new ethers.Contract(ARBITRUM_USDT, ERC20_ABI, provider);
      arb = new ethers.Contract(ARBITRUM_ARB, ERC20_ABI, provider);

      [, user1] = await ethers.getSigners();
      user1Address = await user1.getAddress();

      await impersonateAccount(ARBITRUM_USDT_PRIME_CONVERTER);
      await setBalance(ARBITRUM_USDT_PRIME_CONVERTER, parseUnits("1000", 18));

      arbHolder = await initMainnetUser(ARB_HOLDER, ethers.utils.parseEther("1"));
      usdtHolder = await initMainnetUser(USDT_HOLDER, ethers.utils.parseEther("1"));

      await usdt.connect(usdtHolder).transfer(user1Address, amount);
      await arb.connect(arbHolder).transfer(user1Address, amount);

      await setMaxStalePeriod(oracle, usdt);
      await setMaxStalePeriod(oracle, arb);
    });

    it("Convert exact tokens should work correctly", async () => {
      const amountInMantissa = amount.div(2);
      await usdt.connect(usdtHolder).transfer(user1Address, amount);
      await arb.connect(arbHolder).transfer(ARBITRUM_USDT_PRIME_CONVERTER, parseUnits("1000", 18));

      const arbBalanceOfUsdtPrimeConverterPrevious = await usdtPrimeConverter.balanceOf(ARBITRUM_ARB);
      const usdtBalanceOfUserPrevious = await usdt.balanceOf(user1Address);

      const [, amountOutMantissa] = await usdtPrimeConverter
        .connect(user1)
        .callStatic.getUpdatedAmountOut(amountInMantissa, ARBITRUM_USDT, ARBITRUM_ARB);

      await usdt.connect(user1).approve(ARBITRUM_USDT_PRIME_CONVERTER, amountInMantissa);
      await usdtPrimeConverter
        .connect(user1)
        .convertExactTokens(amountInMantissa, amountInMantissa.div(2), ARBITRUM_USDT, ARBITRUM_ARB, user1Address);

      expect(await usdt.balanceOf(user1Address)).to.equal(usdtBalanceOfUserPrevious.sub(amountInMantissa));
      expect(await usdtPrimeConverter.balanceOf(ARBITRUM_USDT)).to.equal(0);
      expect(await usdtPrimeConverter.balanceOf(ARBITRUM_ARB)).to.equal(
        arbBalanceOfUsdtPrimeConverterPrevious.sub(amountOutMantissa),
      );
    });

    it("ConvertForExactTokens should work properly", async () => {
      await arb.connect(arbHolder).transfer(user1Address, amount);
      await arb.connect(user1).transfer(ARBITRUM_USDT_PRIME_CONVERTER, amount);

      const amountOutMantissa = amount.div(2);
      const amountInMaxMantissa = amount;
      await usdt.connect(usdtHolder).transfer(user1Address, amount);

      const arbBalanceOfUsdtPrimeConverterPrevious = await usdtPrimeConverter.balanceOf(ARBITRUM_ARB);
      const usdtBalanceOfUserPrevious = await usdt.balanceOf(user1Address);

      const [, amountInMantissa] = await usdtPrimeConverter
        .connect(user1)
        .getAmountIn(amountOutMantissa, ARBITRUM_USDT, ARBITRUM_ARB);

      await usdt.connect(user1).approve(ARBITRUM_USDT_PRIME_CONVERTER, amount);
      await usdtPrimeConverter
        .connect(user1)
        .convertForExactTokens(amountInMaxMantissa, amountOutMantissa, ARBITRUM_USDT, ARBITRUM_ARB, user1Address);

      expect(await usdt.balanceOf(user1Address)).to.equal(usdtBalanceOfUserPrevious.sub(amountInMantissa));
      expect(await usdtPrimeConverter.balanceOf(ARBITRUM_USDT)).to.equal(0);
      expect(await usdtPrimeConverter.balanceOf(ARBITRUM_ARB)).to.equal(
        arbBalanceOfUsdtPrimeConverterPrevious.sub(amountOutMantissa),
      );
    });
  });
});
