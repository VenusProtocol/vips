import { expect } from "chai";
import { ethers } from "hardhat";
import { forking, testVip } from "src/vip-framework";

import { USDFMarketSpec } from "../../vips/vip-515/bsctestnet";
import { BURNING_CONVERTER, CONVERSION_INCENTIVE, WBNB, vip515addendum } from "../../vips/vip-515/bsctestnet-addendum";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";

forking(54651835, async () => {
  testVip("VIP-515 Addendum", await vip515addendum(), {});

  describe("Converters", () => {
    const converterContract = new ethers.Contract(BURNING_CONVERTER, SINGLE_TOKEN_CONVERTER_ABI, ethers.provider);

    it(`should set ${CONVERSION_INCENTIVE} as incentive in converter ${BURNING_CONVERTER}, for asset USDF`, async () => {
      const result = await converterContract.conversionConfigurations(WBNB, USDFMarketSpec.vToken.underlying.address);
      expect(result.incentive).to.equal(CONVERSION_INCENTIVE);
    });
  });
});
