import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip042, {
  BLOCKS_PER_YEAR,
  CORE_COMPTROLLER,
  CORE_XVS_DISTRIBUTOR,
  CORE_vUSDC,
  CORE_vUSDT,
  CORE_vWBTC,
  CORE_vWETH,
  CORE_vcrvUSD,
  CURVE_COMPTROLLER,
  CURVE_XVS_DISTRIBUTOR,
  CURVE_vCRV,
  CURVE_vcrvUSD,
  LST_COMPTROLLER,
  LST_XVS_DISTRIBUTOR,
  LST_vWETH,
  LST_vwstETH,
  TOTAL_XVS_FOR_CORE,
  TOTAL_XVS_FOR_CURVE,
  TOTAL_XVS_FOR_LST,
  XVS,
} from "../../../proposals/ethereum/vip-042";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import REWARDS_DISTRIBUTOR_ABI from "./abi/RewardsDistributor.json";
import XVS_ABI from "./abi/XVS.json";

export const BLOCKS_IN_ONE_DAY = BLOCKS_PER_YEAR.div(365);
const DAILY_REWARDS = [
  {
    market: CORE_vWETH,
    supply: parseUnits("15", 18),
    borrow: parseUnits("22.50", 18),
    distributor: CORE_XVS_DISTRIBUTOR,
  },
  {
    market: CORE_vWBTC,
    supply: parseUnits("45", 18),
    borrow: parseUnits("67.50", 18),
    distributor: CORE_XVS_DISTRIBUTOR,
  },
  {
    market: CORE_vUSDT,
    supply: parseUnits("45", 18),
    borrow: parseUnits("67.50", 18),
    distributor: CORE_XVS_DISTRIBUTOR,
  },
  {
    market: CORE_vUSDC,
    supply: parseUnits("45", 18),
    borrow: parseUnits("67.50", 18),
    distributor: CORE_XVS_DISTRIBUTOR,
  },
  {
    market: CORE_vcrvUSD,
    supply: parseUnits("20", 18),
    borrow: parseUnits("30", 18),
    distributor: CORE_XVS_DISTRIBUTOR,
  },
  {
    market: CURVE_vCRV,
    supply: parseUnits("5", 18),
    borrow: parseUnits("7.50", 18),
    distributor: CURVE_XVS_DISTRIBUTOR,
  },
  {
    market: CURVE_vcrvUSD,
    supply: parseUnits("5", 18),
    borrow: parseUnits("7.50", 18),
    distributor: CURVE_XVS_DISTRIBUTOR,
  },
  {
    market: LST_vWETH,
    supply: parseUnits("183.33", 18),
    borrow: parseUnits("427.78", 18),
    distributor: LST_XVS_DISTRIBUTOR,
  },
  {
    market: LST_vwstETH,
    supply: parseUnits("120", 18),
    borrow: parseUnits("0", 18),
    distributor: LST_XVS_DISTRIBUTOR,
  },
];

forking(20228802, async () => {
  describe("Post-Execution state", () => {
    let xvs: Contract;
    let prevCoreDistributorBalance: BigNumber;
    let prevCurveDistributorBalance: BigNumber;
    let prevLstDistributorBalance: BigNumber;

    before(async () => {
      xvs = await ethers.getContractAt(XVS_ABI, XVS);

      prevCoreDistributorBalance = await xvs.balanceOf(CORE_XVS_DISTRIBUTOR);
      prevCurveDistributorBalance = await xvs.balanceOf(CURVE_XVS_DISTRIBUTOR);
      prevLstDistributorBalance = await xvs.balanceOf(LST_XVS_DISTRIBUTOR);

      await pretendExecutingVip(await vip042());
    });

    it("registers core distributor in the core comptroller", async () => {
      const coreComptroller = await ethers.getContractAt(COMPTROLLER_ABI, CORE_COMPTROLLER);
      const coreDistributors = await coreComptroller.getRewardDistributors();
      expect(coreDistributors).to.have.lengthOf(3);
      expect(coreDistributors[2]).to.equal(CORE_XVS_DISTRIBUTOR);
    });

    it("registers Curve distributor in the Curve comptroller", async () => {
      const curveComptroller = await ethers.getContractAt(COMPTROLLER_ABI, CURVE_COMPTROLLER);
      const curveDistributors = await curveComptroller.getRewardDistributors();
      expect(curveDistributors).to.have.lengthOf(3);
      expect(curveDistributors[2]).to.equal(CURVE_XVS_DISTRIBUTOR);
    });

    it("registers LST distributor in the LST comptroller", async () => {
      const lstComptroller = await ethers.getContractAt(COMPTROLLER_ABI, LST_COMPTROLLER);
      const lstDistributors = await lstComptroller.getRewardDistributors();
      expect(lstDistributors).to.have.lengthOf(4);
      expect(lstDistributors[3]).to.equal(LST_XVS_DISTRIBUTOR);
    });

    for (const rewardsDistributorAddress of [CORE_XVS_DISTRIBUTOR, CURVE_XVS_DISTRIBUTOR, LST_XVS_DISTRIBUTOR]) {
      it(`accepts ownership over ${rewardsDistributorAddress}`, async () => {
        const rewardsDistributor = await ethers.getContractAt(REWARDS_DISTRIBUTOR_ABI, rewardsDistributorAddress);
        expect(await rewardsDistributor.owner()).to.equal(NETWORK_ADDRESSES.ethereum.NORMAL_TIMELOCK);
      });
    }

    it("has correct daily speeds", async () => {
      for (const data of DAILY_REWARDS) {
        const { supply, borrow, distributor, market } = data;
        const rewardsDistributor = await ethers.getContractAt(REWARDS_DISTRIBUTOR_ABI, distributor);

        const supplySpeed = await rewardsDistributor.rewardTokenSupplySpeeds(market);
        const borrowSpeed = await rewardsDistributor.rewardTokenBorrowSpeeds(market);

        expect(supplySpeed).to.be.closeTo(supply.div(BLOCKS_IN_ONE_DAY), parseUnits("0.01", 18));
        expect(borrowSpeed).to.be.closeTo(borrow.div(BLOCKS_IN_ONE_DAY), parseUnits("0.01", 18));
      }
    });

    it("has correct balance", async () => {
      const coreDistributorBalance = await xvs.balanceOf(CORE_XVS_DISTRIBUTOR);
      const curveDistributorBalance = await xvs.balanceOf(CURVE_XVS_DISTRIBUTOR);
      const lstDistributorBalance = await xvs.balanceOf(LST_XVS_DISTRIBUTOR);

      expect(coreDistributorBalance.sub(prevCoreDistributorBalance)).to.equal(TOTAL_XVS_FOR_CORE);
      expect(curveDistributorBalance.sub(prevCurveDistributorBalance)).to.equal(TOTAL_XVS_FOR_CURVE);
      expect(lstDistributorBalance.sub(prevLstDistributorBalance)).to.equal(TOTAL_XVS_FOR_LST);
    });
  });
});
