import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import {
  ETHEREUM_USDC_PRIME_CONVERTER,
  ETHEREUM_USDT_PRIME_CONVERTER,
  ETHEREUM_WBTC_PRIME_CONVERTER,
  ETHEREUM_WETH_PRIME_CONVERTER,
  ETHEREUM_XVS_VAULT_CONVERTER,
  ethereumBaseAssets,
  ethereumUSDCPrimeConverterTokenOuts,
  ethereumUSDTPrimeConverterTokenOuts,
  ethereumWBTCPrimeConverterTokenOuts,
  ethereumWETHPrimeConverterTokenOuts,
  ethereumXVSVaultConverterTokenOuts,
} from "../../vips/vip-421/addresses";
import vip421 from "../../vips/vip-421/bscmainnet";
import CONVERTER_ABI from "./abi/Converter.json";

forking(21616427, async () => {
  let converter: Contract;

  describe("Incentives before VIP", () => {
    it("Incentives in USDT converter", async () => {
      await Promise.all(
        ethereumUSDTPrimeConverterTokenOuts.map(async token => {
          converter = await ethers.getContractAt(CONVERTER_ABI, ETHEREUM_USDT_PRIME_CONVERTER);
          const incentiveAndAccess = await converter.conversionConfigurations(ethereumBaseAssets[0], token);
          if (token === "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A") {
            expect(incentiveAndAccess[0]).to.equal("0");
          } else {
            expect(incentiveAndAccess[0]).to.equal(parseUnits("1", 14));
          }
          expect(incentiveAndAccess[1]).to.equal(1);
        }),
      );
    });

    it("Incentives in USDC converter", async () => {
      await Promise.all(
        ethereumUSDCPrimeConverterTokenOuts.map(async token => {
          converter = await ethers.getContractAt(CONVERTER_ABI, ETHEREUM_USDC_PRIME_CONVERTER);
          const incentiveAndAccess = await converter.conversionConfigurations(ethereumBaseAssets[1], token);
          console.log("incentiveAndAccess", incentiveAndAccess, token);
          if (token === "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A") {
            expect(incentiveAndAccess[0]).to.equal("0");
          } else {
            expect(incentiveAndAccess[0]).to.equal(parseUnits("1", 14));
          }
          expect(incentiveAndAccess[1]).to.equal(1);
        }),
      );
    });

    it("Incentives in WBTC converter", async () => {
      await Promise.all(
        ethereumWBTCPrimeConverterTokenOuts.map(async token => {
          converter = await ethers.getContractAt(CONVERTER_ABI, ETHEREUM_WBTC_PRIME_CONVERTER);
          const incentiveAndAccess = await converter.conversionConfigurations(ethereumBaseAssets[2], token);
          if (token === "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A") {
            expect(incentiveAndAccess[0]).to.equal("0");
          } else {
            expect(incentiveAndAccess[0]).to.equal(parseUnits("1", 14));
          }
          expect(incentiveAndAccess[1]).to.equal(1);
        }),
      );
    });

    it("Incentives in WETH converter", async () => {
      await Promise.all(
        ethereumWETHPrimeConverterTokenOuts.map(async token => {
          converter = await ethers.getContractAt(CONVERTER_ABI, ETHEREUM_WETH_PRIME_CONVERTER);
          const incentiveAndAccess = await converter.conversionConfigurations(ethereumBaseAssets[3], token);
          if (token === "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A") {
            expect(incentiveAndAccess[0]).to.equal("0");
          } else {
            expect(incentiveAndAccess[0]).to.equal(parseUnits("1", 14));
          }
          expect(incentiveAndAccess[1]).to.equal(1);
        }),
      );
    });

    it("Incentives in XVSVault converter", async () => {
      await Promise.all(
        ethereumXVSVaultConverterTokenOuts.map(async token => {
          converter = await ethers.getContractAt(CONVERTER_ABI, ETHEREUM_XVS_VAULT_CONVERTER);
          const incentiveAndAccess = await converter.conversionConfigurations(ethereumBaseAssets[4], token);
          expect(incentiveAndAccess[0]).to.equal(parseUnits("1", 14));
          expect(incentiveAndAccess[1]).to.equal(1);
        }),
      );
    });
  });

  testForkedNetworkVipCommands("vip421", await vip421(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [CONVERTER_ABI], ["ConversionConfigUpdated"], [120]);
    },
  });

  describe("Verify incentives post VIP", () => {
    it("Incentives in USDT converter", async () => {
      await Promise.all(
        ethereumUSDTPrimeConverterTokenOuts.map(async token => {
          converter = await ethers.getContractAt(CONVERTER_ABI, ETHEREUM_USDT_PRIME_CONVERTER);
          const incentiveAndAccess = await converter.conversionConfigurations(ethereumBaseAssets[0], token);
          expect(incentiveAndAccess[0]).to.equal(parseUnits("3", 14));
          expect(incentiveAndAccess[1]).to.equal(1);
        }),
      );
    });

    it("Incentives in USDC converter", async () => {
      await Promise.all(
        ethereumUSDCPrimeConverterTokenOuts.map(async token => {
          converter = await ethers.getContractAt(CONVERTER_ABI, ETHEREUM_USDC_PRIME_CONVERTER);
          const incentiveAndAccess = await converter.conversionConfigurations(ethereumBaseAssets[1], token);
          expect(incentiveAndAccess[0]).to.equal(parseUnits("3", 14));
          expect(incentiveAndAccess[1]).to.equal(1);
        }),
      );
    });

    it("Incentives in WBTC converter", async () => {
      await Promise.all(
        ethereumWBTCPrimeConverterTokenOuts.map(async token => {
          converter = await ethers.getContractAt(CONVERTER_ABI, ETHEREUM_WBTC_PRIME_CONVERTER);
          const incentiveAndAccess = await converter.conversionConfigurations(ethereumBaseAssets[2], token);
          expect(incentiveAndAccess[0]).to.equal(parseUnits("3", 14));
          expect(incentiveAndAccess[1]).to.equal(1);
        }),
      );
    });

    it("Incentives in WETH converter", async () => {
      await Promise.all(
        ethereumWETHPrimeConverterTokenOuts.map(async token => {
          converter = await ethers.getContractAt(CONVERTER_ABI, ETHEREUM_WETH_PRIME_CONVERTER);
          const incentiveAndAccess = await converter.conversionConfigurations(ethereumBaseAssets[3], token);
          expect(incentiveAndAccess[0]).to.equal(parseUnits("3", 14));
          expect(incentiveAndAccess[1]).to.equal(1);
        }),
      );
    });

    it("Incentives in XVSVault converter", async () => {
      await Promise.all(
        ethereumXVSVaultConverterTokenOuts.map(async token => {
          converter = await ethers.getContractAt(CONVERTER_ABI, ETHEREUM_XVS_VAULT_CONVERTER);
          const incentiveAndAccess = await converter.conversionConfigurations(ethereumBaseAssets[4], token);
          expect(incentiveAndAccess[0]).to.equal(parseUnits("3", 14));
          expect(incentiveAndAccess[1]).to.equal(1);
        }),
      );
    });
  });
});
