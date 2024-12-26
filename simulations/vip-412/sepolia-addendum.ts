import { expect } from "chai";
import { ethers } from "hardhat";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import { vip411 } from "../../vips/vip-411/bsctestnet";
import { underlyingAddress, vip412 } from "../../vips/vip-412/bsctestnet";
import { CONVERSION_INCENTIVE, converterBaseAssets, vip412Addendum } from "../../vips/vip-412/bsctestnet-addendum";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";

forking(7302561, async () => {
  testForkedNetworkVipCommands("Ethena pool 1", await vip411());
  testForkedNetworkVipCommands("Ethena pool 2", await vip412());
  testForkedNetworkVipCommands("Ethena pool 3", await vip412Addendum());

  describe("Post-Execution state", async () => {
    describe("Converters", () => {
      for (const [converterAddress, baseAsset] of Object.entries(converterBaseAssets)) {
        for (const asset of underlyingAddress) {
          const converterContract = new ethers.Contract(converterAddress, SINGLE_TOKEN_CONVERTER_ABI, ethers.provider);

          it(`should set ${CONVERSION_INCENTIVE} as incentive in converter ${converterAddress}, for asset ${asset}`, async () => {
            if (baseAsset != asset) {
              const result = await converterContract.conversionConfigurations(baseAsset, asset);
              expect(result.incentive).to.equal(CONVERSION_INCENTIVE);
            }
          });
        }
      }
    });
  });
});
