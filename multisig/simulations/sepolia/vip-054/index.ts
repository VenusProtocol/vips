import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { forking, pretendExecutingVip } from "src/vip-framework";

import { vip054 } from "../../../proposals/sepolia/vip-054";
import {
  Assets,
  BaseAssets,
  USDC_PRIME_CONVERTER,
  USDT_PRIME_CONVERTER,
  WBTC_PRIME_CONVERTER,
  WETH_PRIME_CONVERTER,
  XVS_VAULT_CONVERTER,
} from "../../../proposals/sepolia/vip-054/addresses";
import SINGLE_TOKEN_CONVERTER_ABI from "../../../simulations/sepolia/vip-054/abi/SingleTokenConverter.json";

forking(6446869, async () => {
  const provider = ethers.provider;
  const updatedIncentivesAfterVip = 1e14;
  let WBTCPrimeConverter: Contract;
  let WETHPrimeConverter: Contract;
  let USDTPrimeConverter: Contract;
  let USDCPrimeConverter: Contract;
  let XVSVaultConverter: Contract;

  let WETHPrimeConverterBeforeVip: Array<[number, number]> = [];
  let WBTCPrimeConverterBeforeVip: Array<[number, number]> = [];
  let USDTPrimeConverterBeforeVip: Array<[number, number]> = [];
  let USDCPrimeConverterBeforeVip: Array<[number, number]> = [];
  let XVSVaultConverterBeforeVip: Array<[number, number]> = [];

  before(async () => {
    USDCPrimeConverter = new ethers.Contract(USDC_PRIME_CONVERTER, SINGLE_TOKEN_CONVERTER_ABI, provider);
    USDTPrimeConverter = new ethers.Contract(USDT_PRIME_CONVERTER, SINGLE_TOKEN_CONVERTER_ABI, provider);
    XVSVaultConverter = new ethers.Contract(XVS_VAULT_CONVERTER, SINGLE_TOKEN_CONVERTER_ABI, provider);
    WBTCPrimeConverter = new ethers.Contract(WBTC_PRIME_CONVERTER, SINGLE_TOKEN_CONVERTER_ABI, provider);
    WETHPrimeConverter = new ethers.Contract(WETH_PRIME_CONVERTER, SINGLE_TOKEN_CONVERTER_ABI, provider);
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
        if (asset == Assets[14]) {
          // for ezETH no config existed
          expect(result[1]).to.equal(0);
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
    for (let i = 0; i < Assets.length - 1; i++) {
      const asset = Assets[i];
      if (asset != baseAsset) {
        result = await converter.conversionConfigurations(baseAsset, asset);
        const oldIncentivesAndAccess = oldConverterStates[j];
        expect(result[0]).to.equal(updatedIncentivesAfterVip);
        if (asset == Assets[14]) {
          // for ezETH no config existed
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
      USDTPrimeConverterBeforeVip = await getConverterStates(BaseAssets[0], USDTPrimeConverter);

      USDCPrimeConverterBeforeVip = await getConverterStates(BaseAssets[1], USDCPrimeConverter);

      WBTCPrimeConverterBeforeVip = await getConverterStates(BaseAssets[2], WBTCPrimeConverter);

      WETHPrimeConverterBeforeVip = await getConverterStates(BaseAssets[3], WETHPrimeConverter);

      XVSVaultConverterBeforeVip = await getConverterStates(BaseAssets[4], XVSVaultConverter);
    });
  });

  describe("Post-VIP behavior", () => {
    before(async () => {
      await pretendExecutingVip(await vip054());
    });

    it("Get and compare the values for the incentives and conversionAccess for all conversion configs after the execution of VIP", async () => {
      await getAndCompareConverterStates(BaseAssets[0], USDTPrimeConverter, USDTPrimeConverterBeforeVip);

      await getAndCompareConverterStates(BaseAssets[1], USDCPrimeConverter, USDCPrimeConverterBeforeVip);

      await getAndCompareConverterStates(BaseAssets[2], WBTCPrimeConverter, WBTCPrimeConverterBeforeVip);

      await getAndCompareConverterStates(BaseAssets[3], WETHPrimeConverter, WETHPrimeConverterBeforeVip);

      await getAndCompareConverterStates(BaseAssets[4], XVSVaultConverter, XVSVaultConverterBeforeVip);
    });
  });
});
