import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import {
  SEPOLIA_USDC_PRIME_CONVERTER,
  SEPOLIA_USDT_PRIME_CONVERTER,
  SEPOLIA_WBTC_PRIME_CONVERTER,
  SEPOLIA_WETH_PRIME_CONVERTER,
  SEPOLIA_XVS_VAULT_CONVERTER,
  sepoliaBaseAssets,
  sepoliaUSDCPrimeConverterTokenOuts,
  sepoliaUSDTPrimeConverterTokenOuts,
  sepoliaWBTCPrimeConverterTokenOuts,
  sepoliaWETHPrimeConverterTokenOuts,
  sepoliaXVSVaultConverterTokenOuts,
} from "../../vips/vip-421/addresses";
import vip421 from "../../vips/vip-421/bsctestnet";
import CONVERTER_ABI from "./abi/Converter.json";

forking(7482880, async () => {
  let converter: Contract;

  describe("Incentives before VIP", () => {
    it("Incentives in USDT converter", async () => {
      await Promise.all(
        sepoliaUSDTPrimeConverterTokenOuts.map(async token => {
          converter = await ethers.getContractAt(CONVERTER_ABI, SEPOLIA_USDT_PRIME_CONVERTER);
          const incentiveAndAccess = await converter.conversionConfigurations(sepoliaBaseAssets[0], token);
          if (token === "0x772d68929655ce7234C8C94256526ddA66Ef641E") {
            expect(incentiveAndAccess[0]).to.equal(parseUnits("1", 14));
          } else {
            expect(incentiveAndAccess[0]).to.equal(0);
          }
          if (token === "0xB8eb706b85Ae7355c9FE4371a499F50f3484809c") {
            expect(incentiveAndAccess[1]).to.equal(0);
          } else {
            expect(incentiveAndAccess[1]).to.equal(1);
          }
        }),
      );
    });

    it("Incentives in USDC converter", async () => {
      await Promise.all(
        sepoliaUSDCPrimeConverterTokenOuts.map(async token => {
          converter = await ethers.getContractAt(CONVERTER_ABI, SEPOLIA_USDC_PRIME_CONVERTER);
          const incentiveAndAccess = await converter.conversionConfigurations(sepoliaBaseAssets[1], token);
          expect(incentiveAndAccess[0]).to.equal(0);
          if (token === "0xB8eb706b85Ae7355c9FE4371a499F50f3484809c") {
            expect(incentiveAndAccess[1]).to.equal(0);
          } else {
            expect(incentiveAndAccess[1]).to.equal(1);
          }
        }),
      );
    });

    it("Incentives in WBTC converter", async () => {
      await Promise.all(
        sepoliaWBTCPrimeConverterTokenOuts.map(async token => {
          converter = await ethers.getContractAt(CONVERTER_ABI, SEPOLIA_WBTC_PRIME_CONVERTER);
          const incentiveAndAccess = await converter.conversionConfigurations(sepoliaBaseAssets[2], token);
          if (token === "0x772d68929655ce7234C8C94256526ddA66Ef641E") {
            expect(incentiveAndAccess[0]).to.equal(parseUnits("1", 14));
          } else {
            expect(incentiveAndAccess[0]).to.equal(0);
          }
          if (token === "0xB8eb706b85Ae7355c9FE4371a499F50f3484809c") {
            expect(incentiveAndAccess[1]).to.equal(0);
          } else {
            expect(incentiveAndAccess[1]).to.equal(1);
          }
        }),
      );
    });

    it("Incentives in WETH converter", async () => {
      await Promise.all(
        sepoliaWETHPrimeConverterTokenOuts.map(async token => {
          converter = await ethers.getContractAt(CONVERTER_ABI, SEPOLIA_WETH_PRIME_CONVERTER);
          const incentiveAndAccess = await converter.conversionConfigurations(sepoliaBaseAssets[3], token);
          if (token === "0x772d68929655ce7234C8C94256526ddA66Ef641E") {
            expect(incentiveAndAccess[0]).to.equal(parseUnits("1", 14));
          } else {
            expect(incentiveAndAccess[0]).to.equal(0);
          }
          if (token === "0xB8eb706b85Ae7355c9FE4371a499F50f3484809c") {
            expect(incentiveAndAccess[1]).to.equal(0);
          } else {
            expect(incentiveAndAccess[1]).to.equal(1);
          }
        }),
      );
    });

    it("Incentives in XVSVault converter", async () => {
      await Promise.all(
        sepoliaXVSVaultConverterTokenOuts.map(async token => {
          converter = await ethers.getContractAt(CONVERTER_ABI, SEPOLIA_XVS_VAULT_CONVERTER);
          const incentiveAndAccess = await converter.conversionConfigurations(sepoliaBaseAssets[4], token);
          if (token === "0x772d68929655ce7234C8C94256526ddA66Ef641E") {
            expect(incentiveAndAccess[0]).to.equal(parseUnits("1", 14));
          } else {
            expect(incentiveAndAccess[0]).to.equal(0);
          }
          if (token === "0xB8eb706b85Ae7355c9FE4371a499F50f3484809c") {
            expect(incentiveAndAccess[1]).to.equal(0);
          } else {
            expect(incentiveAndAccess[1]).to.equal(1);
          }
        }),
      );
    });
  });

  testForkedNetworkVipCommands("vip421", await vip421(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [CONVERTER_ABI], ["ConversionConfigUpdated"], [75]);
    },
  });

  describe("Verify incentives post VIP", () => {
    it("Incentives in USDT converter", async () => {
      await Promise.all(
        sepoliaUSDTPrimeConverterTokenOuts.map(async token => {
          converter = await ethers.getContractAt(CONVERTER_ABI, SEPOLIA_USDT_PRIME_CONVERTER);
          const incentiveAndAccess = await converter.conversionConfigurations(sepoliaBaseAssets[0], token);
          expect(incentiveAndAccess[0]).to.equal(parseUnits("3", 14));
          expect(incentiveAndAccess[1]).to.equal(1);
        }),
      );
    });

    it("Incentives in USDC converter", async () => {
      await Promise.all(
        sepoliaUSDCPrimeConverterTokenOuts.map(async token => {
          converter = await ethers.getContractAt(CONVERTER_ABI, SEPOLIA_USDC_PRIME_CONVERTER);
          const incentiveAndAccess = await converter.conversionConfigurations(sepoliaBaseAssets[1], token);
          expect(incentiveAndAccess[0]).to.equal(parseUnits("3", 14));
          expect(incentiveAndAccess[1]).to.equal(1);
        }),
      );
    });

    it("Incentives in WBTC converter", async () => {
      await Promise.all(
        sepoliaWBTCPrimeConverterTokenOuts.map(async token => {
          converter = await ethers.getContractAt(CONVERTER_ABI, SEPOLIA_WBTC_PRIME_CONVERTER);
          const incentiveAndAccess = await converter.conversionConfigurations(sepoliaBaseAssets[2], token);
          expect(incentiveAndAccess[0]).to.equal(parseUnits("3", 14));
          expect(incentiveAndAccess[1]).to.equal(1);
        }),
      );
    });

    it("Incentives in WETH converter", async () => {
      await Promise.all(
        sepoliaWETHPrimeConverterTokenOuts.map(async token => {
          converter = await ethers.getContractAt(CONVERTER_ABI, SEPOLIA_WETH_PRIME_CONVERTER);
          const incentiveAndAccess = await converter.conversionConfigurations(sepoliaBaseAssets[3], token);
          expect(incentiveAndAccess[0]).to.equal(parseUnits("3", 14));
          expect(incentiveAndAccess[1]).to.equal(1);
        }),
      );
    });

    it("Incentives in XVSVault converter", async () => {
      await Promise.all(
        sepoliaXVSVaultConverterTokenOuts.map(async token => {
          converter = await ethers.getContractAt(CONVERTER_ABI, SEPOLIA_XVS_VAULT_CONVERTER);
          const incentiveAndAccess = await converter.conversionConfigurations(sepoliaBaseAssets[4], token);
          expect(incentiveAndAccess[0]).to.equal(parseUnits("3", 14));
          expect(incentiveAndAccess[1]).to.equal(1);
        }),
      );
    });
  });
});
