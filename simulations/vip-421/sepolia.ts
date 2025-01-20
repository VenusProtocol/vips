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
import vip421PartA from "../../vips/vip-421/bsctestnetPartA";
import vip421PartB from "../../vips/vip-421/bsctestnetPartB";
import CONVERTER_ABI from "./abi/Converter.json";

const sepoliaAssetsWithIncentives = [
  "0x772d68929655ce7234C8C94256526ddA66Ef641E",
  "0xd48392CCf3fe028023D0783E570DFc71996859d7",
  "0xf140594470Bff436aE82F2116ab8a438671C6e83",
  "0x74671106a04496199994787B6BcB064d08afbCCf",
  "0x3EBa2Aa29eC2498c2124523634324d4ce89c8579",
  "0x37798CaB3Adde2F4064afBc1C7F9bbBc6A826375",
  "0xA3A3e5ecEA56940a4Ae32d0927bfd8821DdA848A",
];
const sepoliaAssetsWithNoAccess = [
  "0xB8eb706b85Ae7355c9FE4371a499F50f3484809c",
  "0x6D9f78b57AEeB0543a3c3B32Cc038bFB14a4bA68",
  "0xfA0614E5C803E15070d31f7C38d2d430EBe68E47",
  "0x14AECeEc177085fd09EA07348B4E1F7Fcc030fA1",
];

forking(7482880, async () => {
  let converter: Contract;

  describe("Incentives before VIP", () => {
    it("Incentives in USDT converter", async () => {
      await Promise.all(
        sepoliaUSDTPrimeConverterTokenOuts.map(async token => {
          converter = await ethers.getContractAt(CONVERTER_ABI, SEPOLIA_USDT_PRIME_CONVERTER);
          const incentiveAndAccess = await converter.conversionConfigurations(sepoliaBaseAssets[0], token);
          if (sepoliaAssetsWithIncentives.includes(token)) {
            expect(incentiveAndAccess[0]).to.equal(parseUnits("1", 14));
          } else {
            expect(incentiveAndAccess[0]).to.equal(0);
          }
          if (sepoliaAssetsWithNoAccess.includes(token)) {
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
          if (sepoliaAssetsWithIncentives.includes(token)) {
            expect(incentiveAndAccess[0]).to.equal(parseUnits("1", 14));
          } else {
            expect(incentiveAndAccess[0]).to.equal(0);
          }
          if (sepoliaAssetsWithNoAccess.includes(token)) {
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
          if (sepoliaAssetsWithIncentives.includes(token)) {
            expect(incentiveAndAccess[0]).to.equal(parseUnits("1", 14));
          } else {
            expect(incentiveAndAccess[0]).to.equal(0);
          }
          if (sepoliaAssetsWithNoAccess.includes(token)) {
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
          if (sepoliaAssetsWithIncentives.includes(token)) {
            expect(incentiveAndAccess[0]).to.equal(parseUnits("1", 14));
          } else {
            expect(incentiveAndAccess[0]).to.equal(0);
          }
          if (sepoliaAssetsWithNoAccess.includes(token)) {
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
          if (sepoliaAssetsWithIncentives.includes(token)) {
            expect(incentiveAndAccess[0]).to.equal(parseUnits("1", 14));
          } else {
            expect(incentiveAndAccess[0]).to.equal(0);
          }
          if (sepoliaAssetsWithNoAccess.includes(token)) {
            expect(incentiveAndAccess[1]).to.equal(0);
          } else {
            expect(incentiveAndAccess[1]).to.equal(1);
          }
        }),
      );
    });
  });

  testForkedNetworkVipCommands("vip421 part A", await vip421PartA(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [CONVERTER_ABI], ["ConversionConfigUpdated"], [69]);
    },
  });

  testForkedNetworkVipCommands("vip421 part B", await vip421PartB(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [CONVERTER_ABI], ["ConversionConfigUpdated"], [47]);
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
