import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  CONVERSION_INCENTIVE,
  PT_USDe_30Oct2025,
  converterBaseAssets,
  vUSDC,
  vUSDT,
  vip548,
} from "../../vips/vip-548/bsctestnet-addendum";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";

const { bsctestnet } = NETWORK_ADDRESSES;

forking(66746052, async () => {
  testVip("VIP-548-addendum", await vip548(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewLiquidationIncentive"], [2]);
    },
  });

  describe("Post-VIP behavior", async () => {
    describe("Converters", () => {
      for (const [converterAddress, baseAsset] of Object.entries(converterBaseAssets)) {
        const converterContract = new ethers.Contract(converterAddress, SINGLE_TOKEN_CONVERTER_ABI, ethers.provider);

        it(`should set ${CONVERSION_INCENTIVE} as incentive in converter ${converterAddress}, for asset vPTUSDe`, async () => {
          const result = await converterContract.conversionConfigurations(baseAsset, PT_USDe_30Oct2025);
          expect(result.incentive).to.equal(CONVERSION_INCENTIVE);
        });
      }
    });

    describe("emode", () => {
      it("should set the correct liquidation incentives for vUSDT and vUSDC", async () => {
        const comptroller = new ethers.Contract(bsctestnet.UNITROLLER, COMPTROLLER_ABI, ethers.provider);

        for (const vToken of [vUSDT, vUSDC]) {
          const marketData = await comptroller.poolMarkets(1, vToken);
          expect(marketData.liquidationIncentiveMantissa).to.be.equal(parseUnits("1", 18));
        }
      });
    });
  });
});
