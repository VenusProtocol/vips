import { expect } from "chai";
import { ethers } from "hardhat";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import { vip407 } from "../../vips/vip-407/bsctestnet";
import { underlyingAddress, vip408 } from "../../vips/vip-408/bsctestnet";
import { CONVERSION_INCENTIVE, converterBaseAssets, vip409 } from "../../vips/vip-409/bsctestnet";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";

forking(7302561, async () => {
  testForkedNetworkVipCommands("Ethena pool 1", await vip407());
  testForkedNetworkVipCommands("Ethena pool 2", await vip408());
  testForkedNetworkVipCommands("Ethena pool 3", await vip409());

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
