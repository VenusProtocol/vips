import * as helpers from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  Assets,
  BTCB_PRIME_CONVERTER,
  BaseAssets,
  ETH_PRIME_CONVERTER,
  RISK_FUND_CONVERTER,
  USDC_PRIME_CONVERTER,
  USDT_PRIME_CONVERTER,
  XVS_VAULT_CONVERTER,
} from "../../../vips/vip-350/vip-350/addresses";
import { vip350 } from "../../../vips/vip-350/vip-350/bscmainnet";
import SINGLE_TOKEN_CONVERTER_ABI from "../abi/SingleTokenConverter.json";

forking(41043200, async () => {
  await helpers.mine();

  const provider = ethers.provider;
  const updatedIncentivesAfterVip = 1e14;
  let ETHPrimeConverter: Contract;
  let BTCBPrimeConverter: Contract;
  let riskFundConverter: Contract;
  let USDTPrimeConverter: Contract;
  let USDCPrimeConverter: Contract;
  let XVSVaultConverter: Contract;

  let ETHPrimeConverterBeforeVip: Array<[number, number]> = [];
  let BTCBPrimeConverterBeforeVip: Array<[number, number]> = [];
  let riskFundConverterBeforeVip: Array<[number, number]> = [];
  let USDTPrimeConverterBeforeVip: Array<[number, number]> = [];
  let USDCPrimeConverterBeforeVip: Array<[number, number]> = [];
  let XVSVaultConverterBeforeVip: Array<[number, number]> = [];

  before(async () => {
    USDCPrimeConverter = new ethers.Contract(USDC_PRIME_CONVERTER, SINGLE_TOKEN_CONVERTER_ABI, provider);
    riskFundConverter = new ethers.Contract(RISK_FUND_CONVERTER, SINGLE_TOKEN_CONVERTER_ABI, provider);
    USDTPrimeConverter = new ethers.Contract(USDT_PRIME_CONVERTER, SINGLE_TOKEN_CONVERTER_ABI, provider);
    XVSVaultConverter = new ethers.Contract(XVS_VAULT_CONVERTER, SINGLE_TOKEN_CONVERTER_ABI, provider);
    ETHPrimeConverter = new ethers.Contract(ETH_PRIME_CONVERTER, SINGLE_TOKEN_CONVERTER_ABI, provider);
    BTCBPrimeConverter = new ethers.Contract(BTCB_PRIME_CONVERTER, SINGLE_TOKEN_CONVERTER_ABI, provider);
  });

  const getConverterStates = async (baseAsset: string, converter: any) => {
    let result;
    const converterStates: Array<[number, number]> = [];
    for (let i = 0; i < Assets.length; i++) {
      const asset = Assets[i];
      if (asset != baseAsset) {
        result = await converter.conversionConfigurations(baseAsset, asset);
        converterStates.push([result[0], result[1]]);
        expect(result[0]).to.equal(0);
        if (asset == BaseAssets[0] && baseAsset != BaseAssets[5]) {
          expect(result[1]).to.equal(2);
        } else {
          expect(result[1]).to.equal(1);
        }
      }
    }
    return converterStates;
  };

  const getAndCompareConverterStates = async (
    baseAsset: string,
    converter: any,
    oldConverterStates: Array<[number, number]>,
  ) => {
    let result;
    let j = 0;
    for (let i = 0; i < Assets.length; i++) {
      const asset = Assets[i];
      if (asset != baseAsset) {
        result = await converter.conversionConfigurations(baseAsset, asset);
        const oldIncentivesAndAccess = oldConverterStates[j];
        expect(result[0]).to.equal(updatedIncentivesAfterVip);
        if (asset == BaseAssets[0]) {
          expect(result[1]).to.equal(1);
        } else {
          expect(result[1]).to.equal(oldIncentivesAndAccess[1]);
        }
        j++;
      }
    }
  };

  describe("Pre-VIP behaviour", () => {
    it("Get and save the values for the incentives and conversionAccess for all conversion configs before the execution of VIP", async () => {
      riskFundConverterBeforeVip = await getConverterStates(BaseAssets[0], riskFundConverter);
      USDTPrimeConverterBeforeVip = await getConverterStates(BaseAssets[1], USDTPrimeConverter);

      USDCPrimeConverterBeforeVip = await getConverterStates(BaseAssets[2], USDCPrimeConverter);

      BTCBPrimeConverterBeforeVip = await getConverterStates(BaseAssets[3], BTCBPrimeConverter);

      ETHPrimeConverterBeforeVip = await getConverterStates(BaseAssets[4], ETHPrimeConverter);

      XVSVaultConverterBeforeVip = await getConverterStates(BaseAssets[5], XVSVaultConverter);
    });
  });

  testVip("VIP-350", await vip350(), {
    callbackAfterExecution: async (txResponse: any) => {
      await expectEvents(txResponse, [SINGLE_TOKEN_CONVERTER_ABI], ["ConversionConfigUpdated"], [264]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("Get and compare the values for the incentives and conversionAccess for all conversion configs after the execution of VIP", async () => {
      await getAndCompareConverterStates(BaseAssets[0], riskFundConverter, riskFundConverterBeforeVip);

      await getAndCompareConverterStates(BaseAssets[1], USDTPrimeConverter, USDTPrimeConverterBeforeVip);

      await getAndCompareConverterStates(BaseAssets[2], USDCPrimeConverter, USDCPrimeConverterBeforeVip);

      await getAndCompareConverterStates(BaseAssets[3], BTCBPrimeConverter, BTCBPrimeConverterBeforeVip);

      await getAndCompareConverterStates(BaseAssets[4], ETHPrimeConverter, ETHPrimeConverterBeforeVip);

      await getAndCompareConverterStates(BaseAssets[5], XVSVaultConverter, XVSVaultConverterBeforeVip);
    });
  });
});
