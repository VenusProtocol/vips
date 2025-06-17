import { expect } from "chai";
import { ethers } from "hardhat";
import { forking, testVip } from "src/vip-framework";

import {
  CONVERSION_INCENTIVE,
  USDFMarketSpec,
  converterBaseAssets,
  vip515addendum,
} from "../../vips/vip-515/bsctestnet-addendum";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";

forking(51594708, async () => {
  testVip("VIP-515 Addendum", await vip515addendum(), {});

  describe("Converters", () => {
    for (const [converterAddress, baseAsset] of Object.entries(converterBaseAssets)) {
      const converterContract = new ethers.Contract(converterAddress, SINGLE_TOKEN_CONVERTER_ABI, ethers.provider);

      it(`should set ${CONVERSION_INCENTIVE} as incentive in converter ${converterAddress}, for asset USDF`, async () => {
        const result = await converterContract.conversionConfigurations(
          baseAsset,
          USDFMarketSpec.vToken.underlying.address,
        );
        expect(result.incentive).to.equal(CONVERSION_INCENTIVE);
      });
    }
  });
});
