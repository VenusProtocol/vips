/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip067, {
  USDC,
  USDC_PRIME_CONVERTER,
  USDT,
  USDT_PRIME_CONVERTER,
  WBTC,
  WBTC_PRIME_CONVERTER,
  WETH,
  WETH_PRIME_CONVERTER,
  XVS,
  XVS_VAULT_CONVERTER,
  usdcConverterAssets,
  usdtConverterAssets,
  wbtcConverterAssets,
  wethConverterAssets,
  xvsConverterAssets,
} from "../../../proposals/ethereum/vip-067";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";

const getAndCompareConverterPreStates = async (
  baseAsset: string,
  assets: string[],
  converter: Contract,
  state: [number, number],
) => {
  for (const asset of assets) {
    const result = await converter.conversionConfigurations(baseAsset, asset);
    expect(result[0]).to.equal(state[0]);
    expect(result[1]).to.equal(state[1]);
  }
};

const getAndCompareConverterStates = async (
  baseAsset: string,
  assets: string[],
  converter: Contract,
  state: [number, number],
) => {
  for (const asset of assets) {
    const result = await converter.conversionConfigurations(baseAsset, asset);
    expect(result[0]).to.equal(state[0]);
    expect(result[1]).to.equal(state[1]);
  }
};

forking(21041502, async () => {
  const provider = ethers.provider;
  let wethPrimeConverter: Contract;
  let wbtcPrimeConverter: Contract;
  let usdtPrimeConverter: Contract;
  let usdcPrimeConverter: Contract;
  let xvsVaultConverter: Contract;

  before(async () => {
    usdcPrimeConverter = new ethers.Contract(USDC_PRIME_CONVERTER, SINGLE_TOKEN_CONVERTER_ABI, provider);
    usdtPrimeConverter = new ethers.Contract(USDT_PRIME_CONVERTER, SINGLE_TOKEN_CONVERTER_ABI, provider);
    xvsVaultConverter = new ethers.Contract(XVS_VAULT_CONVERTER, SINGLE_TOKEN_CONVERTER_ABI, provider);
    wethPrimeConverter = new ethers.Contract(WETH_PRIME_CONVERTER, SINGLE_TOKEN_CONVERTER_ABI, provider);
    wbtcPrimeConverter = new ethers.Contract(WBTC_PRIME_CONVERTER, SINGLE_TOKEN_CONVERTER_ABI, provider);
  });

  describe("VIP-067", async () => {
    it("Check pre vip incentives and conversionAccess for all conversion configs before the execution of VIP", async () => {
      await getAndCompareConverterPreStates(USDC, usdcConverterAssets, usdcPrimeConverter, [0, 1]);

      await getAndCompareConverterPreStates(USDT, usdtConverterAssets, usdtPrimeConverter, [0, 1]);

      await getAndCompareConverterPreStates(WBTC, wbtcConverterAssets, wbtcPrimeConverter, [0, 1]);

      await getAndCompareConverterPreStates(WETH, wethConverterAssets, wethPrimeConverter, [0, 1]);

      await getAndCompareConverterPreStates(XVS, xvsConverterAssets, xvsVaultConverter, [0, 1]);
    });

    it("should execute VIP-067", async () => {
      const txResponses = await pretendExecutingVip(await vip067());
      for (const txResponse of txResponses.slice(0, 4)) {
        await expectEvents(txResponse, [SINGLE_TOKEN_CONVERTER_ABI], ["ConversionConfigUpdated"], [16]);
      }
      await expectEvents(txResponses[4], [SINGLE_TOKEN_CONVERTER_ABI], ["ConversionConfigUpdated"], [17]);
    });

    it("Get and compare the values for the incentives and conversionAccess for all conversion configs after the execution of VIP", async () => {
      await getAndCompareConverterStates(USDC, usdcConverterAssets, usdcPrimeConverter, [1e14, 1]);

      await getAndCompareConverterStates(USDT, usdtConverterAssets, usdtPrimeConverter, [1e14, 1]);

      await getAndCompareConverterStates(WBTC, wbtcConverterAssets, wbtcPrimeConverter, [1e14, 1]);

      await getAndCompareConverterStates(WETH, wethConverterAssets, wethPrimeConverter, [1e14, 1]);

      await getAndCompareConverterStates(XVS, xvsConverterAssets, xvsVaultConverter, [1e14, 1]);
    });
  });
});
