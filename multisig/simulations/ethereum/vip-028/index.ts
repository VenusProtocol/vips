import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { checkInterestRate } from "../../../../src/vip-framework/checks/interestRateModel";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import vip028, { LST_POOL_COMPTROLLER, LST_POOL_VWETH } from "../../../proposals/ethereum/vip-028";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vtoken.json";

interface InterestRateModelSpec {
  vToken: string;
  kink: string;
  base: string;
  multiplier: string;
  jump: string;
}

const vWETH_interestRateModel_old: InterestRateModelSpec = {
  vToken: "vWETH_LiquidStakedETH",
  kink: "0.8",
  base: "0",
  multiplier: "0.035",
  jump: "0.8",
};

const vWETH_interestRateModel_new: InterestRateModelSpec = {
  vToken: "vWETH_LiquidStakedETH",
  kink: "0.9",
  base: "0",
  multiplier: "0.045",
  jump: "0.8",
};

const BLOCKS_PER_YEAR = BigNumber.from(2628000); // assuming a block is mined every 12 seconds

forking(20526637, () => {
  let comptroller: Contract;
  let vweth: Contract;

  before(async () => {
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, LST_POOL_COMPTROLLER);
    vweth = await ethers.getContractAt(VTOKEN_ABI, LST_POOL_VWETH);
  });

  describe("Pre-VIP behavior", () => {
    it("check reserve factor", async () => {
      const reserveFactor = await vweth.reserveFactorMantissa();
      expect(reserveFactor).to.equal(parseUnits("0.15", 18));
    });

    it("check liquidation threshold and collateral factor", async () => {
      const market = await comptroller.markets(vweth.address);
      expect(market.collateralFactorMantissa).to.equal(parseUnits("0.9", 18));
      expect(market.liquidationThresholdMantissa).to.equal(parseUnits("0.93", 18));
    });

    it("Interest rates", async () => {
      checkInterestRate(
        await vweth.interestRateModel(),
        vWETH_interestRateModel_old.vToken,
        {
          base: vWETH_interestRateModel_old.base,
          multiplier: vWETH_interestRateModel_old.multiplier,
          jump: vWETH_interestRateModel_old.jump,
          kink: vWETH_interestRateModel_old.kink,
        },
        BLOCKS_PER_YEAR,
      );
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vip028());
    });

    it("check reserve factor", async () => {
      const reserveFactor = await vweth.reserveFactorMantissa();
      expect(reserveFactor).to.equal(parseUnits("0.25", 18));
    });

    it("check liquidation threshold and collateral factor", async () => {
      const market = await comptroller.markets(vweth.address);
      expect(market.collateralFactorMantissa).to.equal(parseUnits("0", 18));
      expect(market.liquidationThresholdMantissa).to.equal(parseUnits("0.93", 18));
    });

    it("Interest rates", async () => {
      checkInterestRate(
        await vweth.interestRateModel(),
        vWETH_interestRateModel_new.vToken,
        {
          base: vWETH_interestRateModel_new.base,
          multiplier: vWETH_interestRateModel_new.multiplier,
          jump: vWETH_interestRateModel_new.jump,
          kink: vWETH_interestRateModel_new.kink,
        },
        BLOCKS_PER_YEAR,
      );
    });
  });
});
