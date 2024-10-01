import { expect } from "chai";
import { BigNumber } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import {
  INTEREST_RATE_MODEL_base0bps_slope300bps_jump8000bps_kink9000bps,
  LIQUID_STAKED_ETH_COMPTROLLER,
  NINETY_PERCENT_CF,
  vwETH,
} from "../../../../vips/vip-377/bscmainnet";
import { vip063 } from "../../../proposals/ethereum/vip-063";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vToken.json";

forking(20835289, async () => {
  let lstComptroller: Contract;
  let vwETHContract: Contract;

  before(async () => {
    lstComptroller = await ethers.getContractAt(COMPTROLLER_ABI, LIQUID_STAKED_ETH_COMPTROLLER);
    vwETHContract = await ethers.getContractAt(VTOKEN_ABI, vwETH);
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip063());
    });

    it("check collateral factor and liquidation threshold", async () => {
      const market = await lstComptroller.markets(vwETH);
      expect(market.collateralFactorMantissa).to.equal(NINETY_PERCENT_CF);
      expect(market.liquidationThresholdMantissa).to.equal(parseUnits("0.93", 18));
    });

    it("check it correctly sets new interest rate model", async () => {
      const BLOCKS_PER_YEAR = BigNumber.from(2628000);
      const interestRateModel = await vwETHContract.interestRateModel();
      expect(interestRateModel).to.equal(INTEREST_RATE_MODEL_base0bps_slope300bps_jump8000bps_kink9000bps);
      checkInterestRate(
        INTEREST_RATE_MODEL_base0bps_slope300bps_jump8000bps_kink9000bps,
        "vwETH",
        {
          base: "0",
          multiplier: "0.03",
          jump: "0.8",
          kink: "0.9",
        },
        BLOCKS_PER_YEAR,
      );
    });
  });
});
