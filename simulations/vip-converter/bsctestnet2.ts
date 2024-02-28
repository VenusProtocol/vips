import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
// imported addresses from converter vip
import {
  BTCBPrimeConverterTokenOuts,
  BaseAssets,
  ETHPrimeConverterTokenOuts,
  RiskFundConverterTokenOuts,
  USDCPrimeConverterTokenOuts,
  USDTPrimeConverterTokenOuts,
  XVSVaultConverterTokenOuts,
  converters,
} from "../../vips/vip-248/vip-248-testnet/Addresses";
import {
  NEW_RISK_FUND_CONVERTER_IMP,
  NEW_SINGLE_TOKEN_CONVERTER_IMP,
  PROXY_ADMIN,
  RISK_FUND_CONVERTER_PROXY,
  SINGLE_TOKEN_CONVERTER_BEACON,
  vipConverter2,
} from "../../vips/vip-converter/bsctestnet2";
import BEACON_ABI from "./abi/Beacon.json";
import DEFAULT_PROXY_ADMIN_ABI from "./abi/DefaultProxyAdmin.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";
import TRANSPARENT_PROXY_ABI from "./abi/TransparentProxyAbi.json";

forking(38131280, () => {
  const provider = ethers.provider;
  let proxyAdmin: Contract;
  let beacon: Contract;

  before(async () => {
    proxyAdmin = new ethers.Contract(PROXY_ADMIN, DEFAULT_PROXY_ADMIN_ABI, provider);
    beacon = new ethers.Contract(SINGLE_TOKEN_CONVERTER_BEACON, BEACON_ABI, provider);
  });

  testVip("VIP-Converter2", vipConverter2(), {
    callbackAfterExecution: async (txResponse: any) => {
      await expectEvents(txResponse, [TRANSPARENT_PROXY_ABI], ["Upgraded"], [2]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("RiskFundConverter and SingleTokenConverter should have new implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(RISK_FUND_CONVERTER_PROXY)).to.equal(NEW_RISK_FUND_CONVERTER_IMP);
      expect(await beacon.implementation()).to.equal(NEW_SINGLE_TOKEN_CONVERTER_IMP);
    });

    it("amount out and amount in tests", async () => {
      const convertersTokenOutArray = [
        RiskFundConverterTokenOuts,
        USDTPrimeConverterTokenOuts,
        USDCPrimeConverterTokenOuts,
        BTCBPrimeConverterTokenOuts,
        ETHPrimeConverterTokenOuts,
        XVSVaultConverterTokenOuts,
      ];

      for (let i = 0; i < converters.length; i++) {
        const converterAddress = converters[i];
        const tokenOuts = convertersTokenOutArray[i];

        for (const tokenAddress of tokenOuts) {
          const converter: Contract = new ethers.Contract(converterAddress, SINGLE_TOKEN_CONVERTER_ABI, provider);
          const configuration = await converter.conversionConfigurations(BaseAssets[i], tokenAddress);
          if (configuration.conversionAccess == 2) continue;

          const balance = await converter.balanceOf(tokenAddress);
          if (balance > 0) {
            const [, amountInMantissa] = await converter.getAmountIn(balance, BaseAssets[i], tokenAddress);
            const [, amountOutMantissa] = await converter.getAmountOut(amountInMantissa, BaseAssets[i], tokenAddress);

            expect(amountOutMantissa).to.be.lessThanOrEqual(balance);
          }
        }
      }
    });
  });
});
