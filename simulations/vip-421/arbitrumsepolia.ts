import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import {
  ARBITRUM_SEPOLIA_ARB,
  ARBITRUM_SEPOLIA_USDC_PRIME_CONVERTER,
  ARBITRUM_SEPOLIA_USDT,
  ARBITRUM_SEPOLIA_USDT_PRIME_CONVERTER,
  ARBITRUM_SEPOLIA_WBTC_PRIME_CONVERTER,
  ARBITRUM_SEPOLIA_WEETH,
  ARBITRUM_SEPOLIA_WETH_PRIME_CONVERTER,
  ARBITRUM_SEPOLIA_WSTETH,
  ARBITRUM_SEPOLIA_XVS_VAULT_CONVERTER,
  arbitrumSepoliaBaseAssets,
  arbitrumSepoliaUSDCPrimeConverterTokenOuts,
  arbitrumSepoliaUSDTPrimeConverterTokenOuts,
  arbitrumSepoliaWBTCPrimeConverterTokenOuts,
  arbitrumSepoliaWETHPrimeConverterTokenOuts,
  arbitrumSepoliaXVSVaultConverterTokenOuts,
} from "../../vips/vip-421/addresses";
import vip421 from "../../vips/vip-421/bsctestnet";
import CONVERTER_ABI from "./abi/Converter.json";
import ERC20_ABI from "./abi/erc20.json";

const ARB_HOLDER = "0x02EB950C215D12d723b44a18CfF098C6E166C531";
const USDT_HOLDER = "0xFd7dA20ea0bE63ACb0852f97E950376E7E4a817D";
const arbitrumSeploiaAssets = [ARBITRUM_SEPOLIA_ARB, ARBITRUM_SEPOLIA_WEETH, ARBITRUM_SEPOLIA_WSTETH];

forking(114598133, async () => {
  let converter;
  describe("Pre VIP", () => {
    arbitrumSepoliaUSDTPrimeConverterTokenOuts.map(token => {
      it(`Incentives in USDT converter for ${token}`, async () => {
        converter = await ethers.getContractAt(CONVERTER_ABI, ARBITRUM_SEPOLIA_USDT_PRIME_CONVERTER);
        const incentiveAndAccess = await converter.conversionConfigurations(arbitrumSepoliaBaseAssets[0], token);
        expect(incentiveAndAccess[0]).to.equal(0);
        if (arbitrumSeploiaAssets.includes(token)) {
          expect(incentiveAndAccess[1]).to.equal(0);
        } else {
          expect(incentiveAndAccess[1]).to.equal(1);
        }
      });
    });

    arbitrumSepoliaUSDCPrimeConverterTokenOuts.map(token => {
      it(`Incentives in USDC converter for ${token}`, async () => {
        converter = await ethers.getContractAt(CONVERTER_ABI, ARBITRUM_SEPOLIA_USDC_PRIME_CONVERTER);
        const incentiveAndAccess = await converter.conversionConfigurations(arbitrumSepoliaBaseAssets[1], token);
        expect(incentiveAndAccess[0]).to.equal(0);
        if (arbitrumSeploiaAssets.includes(token)) {
          expect(incentiveAndAccess[1]).to.equal(0);
        } else {
          expect(incentiveAndAccess[1]).to.equal(1);
        }
      });
    });

    arbitrumSepoliaWBTCPrimeConverterTokenOuts.map(token => {
      it(`Incentives in WBTC converter for ${token}`, async () => {
        converter = await ethers.getContractAt(CONVERTER_ABI, ARBITRUM_SEPOLIA_WBTC_PRIME_CONVERTER);
        const incentiveAndAccess = await converter.conversionConfigurations(arbitrumSepoliaBaseAssets[2], token);
        expect(incentiveAndAccess[0]).to.equal(0);
        if (arbitrumSeploiaAssets.includes(token)) {
          expect(incentiveAndAccess[1]).to.equal(0);
        } else {
          expect(incentiveAndAccess[1]).to.equal(1);
        }
      });
    });

    arbitrumSepoliaWETHPrimeConverterTokenOuts.map(token => {
      it(`Incentives in WETH converter for ${token}`, async () => {
        converter = await ethers.getContractAt(CONVERTER_ABI, ARBITRUM_SEPOLIA_WETH_PRIME_CONVERTER);
        const incentiveAndAccess = await converter.conversionConfigurations(arbitrumSepoliaBaseAssets[3], token);
        expect(incentiveAndAccess[0]).to.equal(0);
        if (arbitrumSeploiaAssets.includes(token)) {
          expect(incentiveAndAccess[1]).to.equal(0);
        } else {
          expect(incentiveAndAccess[1]).to.equal(1);
        }
      });
    });

    arbitrumSepoliaXVSVaultConverterTokenOuts.map(token => {
      it(`Incentives in XVS vault converter for ${token}`, async () => {
        converter = await ethers.getContractAt(CONVERTER_ABI, ARBITRUM_SEPOLIA_XVS_VAULT_CONVERTER);
        const incentiveAndAccess = await converter.conversionConfigurations(arbitrumSepoliaBaseAssets[4], token);
        expect(incentiveAndAccess[0]).to.equal(0);
        if (arbitrumSeploiaAssets.includes(token)) {
          expect(incentiveAndAccess[1]).to.equal(0);
        } else {
          expect(incentiveAndAccess[1]).to.equal(1);
        }
      });
    });
  });

  testForkedNetworkVipCommands("vip421", await vip421(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [CONVERTER_ABI], ["ConversionConfigUpdated"], [35]);
    },
  });

  describe("Post VIP", () => {
    arbitrumSepoliaUSDTPrimeConverterTokenOuts.map(token => {
      it(`Incentives in USDT converter for ${token}`, async () => {
        converter = await ethers.getContractAt(CONVERTER_ABI, ARBITRUM_SEPOLIA_USDT_PRIME_CONVERTER);
        const incentiveAndAccess = await converter.conversionConfigurations(arbitrumSepoliaBaseAssets[0], token);
        expect(incentiveAndAccess[0]).to.equal(parseUnits("1", 14));
        expect(incentiveAndAccess[1]).to.equal(1);
      });
    });

    arbitrumSepoliaUSDCPrimeConverterTokenOuts.map(token => {
      it(`Incentives in USDC converter for ${token}`, async () => {
        converter = await ethers.getContractAt(CONVERTER_ABI, ARBITRUM_SEPOLIA_USDC_PRIME_CONVERTER);
        const incentiveAndAccess = await converter.conversionConfigurations(arbitrumSepoliaBaseAssets[1], token);
        expect(incentiveAndAccess[0]).to.equal(parseUnits("1", 14));
        expect(incentiveAndAccess[1]).to.equal(1);
      });
    });

    arbitrumSepoliaWBTCPrimeConverterTokenOuts.map(token => {
      it(`Incentives in WBTC converter for ${token}`, async () => {
        converter = await ethers.getContractAt(CONVERTER_ABI, ARBITRUM_SEPOLIA_WBTC_PRIME_CONVERTER);
        const incentiveAndAccess = await converter.conversionConfigurations(arbitrumSepoliaBaseAssets[2], token);
        expect(incentiveAndAccess[0]).to.equal(parseUnits("1", 14));
        expect(incentiveAndAccess[1]).to.equal(1);
      });
    });

    arbitrumSepoliaWETHPrimeConverterTokenOuts.map(token => {
      it(`Incentives in WETH converter for ${token}`, async () => {
        converter = await ethers.getContractAt(CONVERTER_ABI, ARBITRUM_SEPOLIA_WETH_PRIME_CONVERTER);
        const incentiveAndAccess = await converter.conversionConfigurations(arbitrumSepoliaBaseAssets[3], token);
        expect(incentiveAndAccess[0]).to.equal(parseUnits("1", 14));
        expect(incentiveAndAccess[1]).to.equal(1);
      });
    });

    arbitrumSepoliaXVSVaultConverterTokenOuts.map(token => {
      it(`Incentives in XVS vault converter for ${token}`, async () => {
        converter = await ethers.getContractAt(CONVERTER_ABI, ARBITRUM_SEPOLIA_XVS_VAULT_CONVERTER);
        const incentiveAndAccess = await converter.conversionConfigurations(arbitrumSepoliaBaseAssets[4], token);
        expect(incentiveAndAccess[0]).to.equal(parseUnits("1", 14));
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

    const amount = parseUnits("1000", 6);
    const provider = ethers.provider;

    before(async () => {
      usdtPrimeConverter = await ethers.getContractAt(CONVERTER_ABI, ARBITRUM_SEPOLIA_USDT_PRIME_CONVERTER);

      usdt = new ethers.Contract(ARBITRUM_SEPOLIA_USDT, ERC20_ABI, provider);
      arb = new ethers.Contract(ARBITRUM_SEPOLIA_ARB, ERC20_ABI, provider);

      [, user1] = await ethers.getSigners();
      user1Address = await user1.getAddress();

      await impersonateAccount(ARBITRUM_SEPOLIA_USDT_PRIME_CONVERTER);
      await setBalance(ARBITRUM_SEPOLIA_USDT_PRIME_CONVERTER, parseUnits("1000", 18));

      arbHolder = await initMainnetUser(ARB_HOLDER, ethers.utils.parseEther("1"));
      usdtHolder = await initMainnetUser(USDT_HOLDER, ethers.utils.parseEther("1"));

      await usdt.connect(usdtHolder).transfer(user1Address, amount);
      await arb.connect(arbHolder).transfer(user1Address, amount);
    });

    it("Convert exact tokens should work correctly", async () => {
      const amountInMantissa = amount.div(2);
      await usdt.connect(usdtHolder).transfer(user1Address, amount);
      await arb.connect(arbHolder).transfer(ARBITRUM_SEPOLIA_USDT_PRIME_CONVERTER, parseUnits("1000", 18));

      const arbBalanceOfUsdtPrimeConverterPrevious = await usdtPrimeConverter.balanceOf(ARBITRUM_SEPOLIA_ARB);
      const usdtBalanceOfUserPrevious = await usdt.balanceOf(user1Address);

      const [, amountOutMantissa] = await usdtPrimeConverter
        .connect(user1)
        .callStatic.getUpdatedAmountOut(amountInMantissa, ARBITRUM_SEPOLIA_USDT, ARBITRUM_SEPOLIA_ARB);

      await usdt.connect(user1).approve(ARBITRUM_SEPOLIA_USDT_PRIME_CONVERTER, amountInMantissa);
      await usdtPrimeConverter
        .connect(user1)
        .convertExactTokens(
          amountInMantissa,
          amountInMantissa.div(2),
          ARBITRUM_SEPOLIA_USDT,
          ARBITRUM_SEPOLIA_ARB,
          user1Address,
        );

      expect(await usdt.balanceOf(user1Address)).to.equal(usdtBalanceOfUserPrevious.sub(amountInMantissa));
      expect(await usdtPrimeConverter.balanceOf(ARBITRUM_SEPOLIA_USDT)).to.equal(0);
      expect(await usdtPrimeConverter.balanceOf(ARBITRUM_SEPOLIA_ARB)).to.equal(
        arbBalanceOfUsdtPrimeConverterPrevious.sub(amountOutMantissa),
      );
    });

    it("ConvertForExactTokens should work properly", async () => {
      await arb.connect(arbHolder).transfer(user1Address, amount);
      await arb.connect(user1).transfer(ARBITRUM_SEPOLIA_USDT_PRIME_CONVERTER, amount);

      const amountOutMantissa = amount.div(2);
      const amountInMaxMantissa = amount;
      await usdt.connect(usdtHolder).transfer(user1Address, amount);

      const arbBalanceOfUsdtPrimeConverterPrevious = await usdtPrimeConverter.balanceOf(ARBITRUM_SEPOLIA_ARB);
      const usdtBalanceOfUserPrevious = await usdt.balanceOf(user1Address);

      const [, amountInMantissa] = await usdtPrimeConverter
        .connect(user1)
        .getAmountIn(amountOutMantissa, ARBITRUM_SEPOLIA_USDT, ARBITRUM_SEPOLIA_ARB);

      await usdt.connect(user1).approve(ARBITRUM_SEPOLIA_USDT_PRIME_CONVERTER, amount);
      await usdtPrimeConverter
        .connect(user1)
        .convertForExactTokens(
          amountInMaxMantissa,
          amountOutMantissa,
          ARBITRUM_SEPOLIA_USDT,
          ARBITRUM_SEPOLIA_ARB,
          user1Address,
        );

      expect(await usdt.balanceOf(user1Address)).to.equal(usdtBalanceOfUserPrevious.sub(amountInMantissa));
      expect(await usdtPrimeConverter.balanceOf(ARBITRUM_SEPOLIA_USDT)).to.equal(0);
      expect(await usdtPrimeConverter.balanceOf(ARBITRUM_SEPOLIA_ARB)).to.equal(
        arbBalanceOfUsdtPrimeConverterPrevious.sub(amountOutMantissa),
      );
    });
  });
});
