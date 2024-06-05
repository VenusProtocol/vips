import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { initMainnetUser } from "../../../../src/utils";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip035, {
  CORE_vwETH,
  CORE_vWBTC,
  CORE_vDAI,
  CORE_vUSDC,
  CORE_vUSDT,
  CORE_vcrvUSD,
  CORE_vFRAX,
  CORE_vsFRAX,
  CORE_vTUSD,
  CURVE_vCRV,
  CURVE_vcrvUSD,
  LST_vwETH,
  LST_vweETH,
  LST_vwstETH,
  CORE_XVS_DISTRIBUTOR,
  CURVE_XVS_DISTRIBUTOR,
  LST_XVS_DISTRIBUTOR,
  BLOCKS_PER_YEAR
} from "../../../proposals/ethereum/vip-035";
import REWARDS_DISTRIBUTOR_ABI from "./abi/rewardsDistributor.json";

export const BLOCKS_IN_ONE_DAY = BLOCKS_PER_YEAR.div(365);
const DAILY_REWARDS = [
  {
    market: CORE_vwETH,
    supply: parseUnits("15", 18),
    borrow: parseUnits("22.50", 18),
    distributor: CORE_XVS_DISTRIBUTOR
  },
  {
    market: CORE_vWBTC,
    supply: parseUnits("45", 18),
    borrow: parseUnits("67.50", 18),
    distributor: CORE_XVS_DISTRIBUTOR
  },
  {
    market: CORE_vUSDT,
    supply: parseUnits("45", 18),
    borrow: parseUnits("67.50", 18),
    distributor: CORE_XVS_DISTRIBUTOR
  },
  {
    market: CORE_vUSDC,
    supply: parseUnits("45", 18),
    borrow: parseUnits("67.50", 18),
    distributor: CORE_XVS_DISTRIBUTOR
  },
  {
    market: CORE_vcrvUSD,
    supply: parseUnits("20", 18),
    borrow: parseUnits("30", 18),
    distributor: CORE_XVS_DISTRIBUTOR
  },
  {
    market: CORE_vFRAX,
    supply: parseUnits("8", 18),
    borrow: parseUnits("12", 18),
    distributor: CORE_XVS_DISTRIBUTOR
  },
  {
    market: CORE_vsFRAX,
    supply: parseUnits("8", 18),
    borrow: parseUnits("12", 18),
    distributor: CORE_XVS_DISTRIBUTOR
  },
  {
    market: CORE_vTUSD,
    supply: parseUnits("2.67", 18),
    borrow: parseUnits("4", 18),
    distributor: CORE_XVS_DISTRIBUTOR
  },
  {
    market: CORE_vDAI,
    supply: parseUnits("6.67", 18),
    borrow: parseUnits("10", 18),
    distributor: CORE_XVS_DISTRIBUTOR
  },
  {
    market: CURVE_vCRV,
    supply: parseUnits("5", 18),
    borrow: parseUnits("7.50", 18),
    distributor: CURVE_XVS_DISTRIBUTOR
  },
  {
    market: CURVE_vcrvUSD,
    supply: parseUnits("5", 18),
    borrow: parseUnits("7.50", 18),
    distributor: CURVE_XVS_DISTRIBUTOR
  },
  {
    market: LST_vwETH,
    supply: parseUnits("183.33", 18),
    borrow: parseUnits("427.78", 18),
    distributor: LST_XVS_DISTRIBUTOR
  },
  {
    market: LST_vwstETH,
    supply: parseUnits("120", 18),
    borrow: parseUnits("0", 18),
    distributor: LST_XVS_DISTRIBUTOR
  },
  {
    market: LST_vweETH,
    supply: parseUnits("0", 18),
    borrow: parseUnits("0", 18),
    distributor: LST_XVS_DISTRIBUTOR
  },
]

const XVS = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";

forking(20025819, () => {
  before(async () => {
  });

  describe("Post-Execution state", () => {
    before(async () => {
      await pretendExecutingVip(vip035());
    });

    it("check daily speeds", async () => {
      for (let data of DAILY_REWARDS) {
        const { supply, borrow, distributor, market } = data;
        const rewardsDistributor = await ethers.getContractAt(REWARDS_DISTRIBUTOR_ABI, distributor);

        const _x = await rewardsDistributor.rewardTokenSupplySpeeds(market);
        console.log(supply.toString(), _x.mul(BLOCKS_IN_ONE_DAY).toString());
        // expect(await rewardsDistributor.supplySpeed()).to.equal(supply.mul(supplySpeedPercentage).div(100));
        // expect(await rewardsDistributor.borrowSpeed()).to.equal(borrow.mul(borrowSpeedPercentage).div(100));
      }
    });
  });
});
