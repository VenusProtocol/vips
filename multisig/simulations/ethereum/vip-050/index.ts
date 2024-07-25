import { expect } from "chai";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip050, {
  REWARDS_DISTRIBUTOR_CORE_NEW,
  REWARDS_DISTRIBUTOR_CORE_OLD,
  REWARDS_DISTRIBUTOR_CURVE_NEW,
  REWARDS_DISTRIBUTOR_LST_NEW,
  REWARDS_DISTRIBUTOR_LST_OLD,
  VCRVUSD_CORE,
  VCRVUSD_CURVE,
  VCRV_CURVE,
  VDAI_CORE,
  VFRAX_CORE,
  VSFRAX_CORE,
  VSFRXETH_LST,
  VTUSD_CORE,
  VUSDC_CORE,
  VUSDT_CORE,
  VWBTC_CORE,
  VWETH_CORE,
  VWETH_LST,
  VWSTETH_LST,
} from "../../../proposals/ethereum/vip-050";
import REWARDS_DISTRIBUTOR_ABI from "./abi/RewardsDistributor.json";

const rewardsDistributorConfigOld = [
  {
    rewardsDistributorOld: REWARDS_DISTRIBUTOR_CORE_OLD,
    vtoken: VFRAX_CORE,
    oldSupplySpeed: "1111111111111111",
    oldBorrowSpeed: "1666666666666666",
  },
  {
    rewardsDistributorOld: REWARDS_DISTRIBUTOR_CORE_OLD,
    vtoken: VSFRAX_CORE,
    oldSupplySpeed: "1111111111111111",
    oldBorrowSpeed: "1666666666666666",
  },
  {
    rewardsDistributorOld: REWARDS_DISTRIBUTOR_CORE_OLD,
    vtoken: VDAI_CORE,
    oldSupplySpeed: "925925925925925",
    oldBorrowSpeed: "1388888888888888",
  },
  {
    rewardsDistributorOld: REWARDS_DISTRIBUTOR_CORE_OLD,
    vtoken: VTUSD_CORE,
    oldSupplySpeed: "370370370370370",
    oldBorrowSpeed: "555555555555555",
  },
  {
    rewardsDistributorOld: REWARDS_DISTRIBUTOR_LST_OLD,
    vtoken: VSFRXETH_LST,
    oldSupplySpeed: "3703703703703703",
    oldBorrowSpeed: "0",
  },
  {
    rewardsDistributorOld: REWARDS_DISTRIBUTOR_CORE_NEW,
    vtoken: VCRVUSD_CORE,
    oldSupplySpeed: "2777777777777777",
    oldBorrowSpeed: "4166666666666666",
  },
  {
    rewardsDistributorOld: REWARDS_DISTRIBUTOR_CORE_NEW,
    vtoken: VUSDC_CORE,
    oldSupplySpeed: "6250000000000000",
    oldBorrowSpeed: "9375000000000000",
  },
  {
    rewardsDistributorOld: REWARDS_DISTRIBUTOR_CORE_NEW,
    vtoken: VUSDT_CORE,
    oldSupplySpeed: "6250000000000000",
    oldBorrowSpeed: "9375000000000000",
  },
  {
    rewardsDistributorOld: REWARDS_DISTRIBUTOR_CORE_NEW,
    vtoken: VWBTC_CORE,
    oldSupplySpeed: "6250000000000000",
    oldBorrowSpeed: "9375000000000000",
  },
  {
    rewardsDistributorOld: REWARDS_DISTRIBUTOR_CORE_NEW,
    vtoken: VWETH_CORE,
    oldSupplySpeed: "2083333333333333",
    oldBorrowSpeed: "3125000000000000",
  },
  {
    rewardsDistributorOld: REWARDS_DISTRIBUTOR_CURVE_NEW,
    vtoken: VCRVUSD_CURVE,
    oldSupplySpeed: "694444444444444",
    oldBorrowSpeed: "1041666666666666",
  },
  {
    rewardsDistributorOld: REWARDS_DISTRIBUTOR_CURVE_NEW,
    vtoken: VCRV_CURVE,
    oldSupplySpeed: "694444444444444",
    oldBorrowSpeed: "1041666666666666",
  },
  {
    rewardsDistributorOld: REWARDS_DISTRIBUTOR_LST_NEW,
    vtoken: VWETH_LST,
    oldSupplySpeed: "25462500000000000",
    oldBorrowSpeed: "59412500000000000",
  },
  {
    rewardsDistributorOld: REWARDS_DISTRIBUTOR_LST_NEW,
    vtoken: VWSTETH_LST,
    oldSupplySpeed: "16666666666666666",
    oldBorrowSpeed: "0",
  },
];

const rewardsDistributorConfigNew = [
  {
    rewardsDistributor: REWARDS_DISTRIBUTOR_CORE_NEW,
    vtoken: VCRVUSD_CORE,
    newSupplySpeed: "1388888888888888",
    newBorrowSpeed: "2083333333333333",
  },
  {
    rewardsDistributor: REWARDS_DISTRIBUTOR_CORE_NEW,
    vtoken: VUSDC_CORE,
    newSupplySpeed: "5625000000000000",
    newBorrowSpeed: "8437500000000000",
  },
  {
    rewardsDistributor: REWARDS_DISTRIBUTOR_CORE_NEW,
    vtoken: VUSDT_CORE,
    newSupplySpeed: "5625000000000000",
    newBorrowSpeed: "8437500000000000",
  },
  {
    rewardsDistributor: REWARDS_DISTRIBUTOR_CORE_NEW,
    vtoken: VWBTC_CORE,
    newSupplySpeed: "4687500000000000",
    newBorrowSpeed: "7031250000000000",
  },
  {
    rewardsDistributor: REWARDS_DISTRIBUTOR_CORE_NEW,
    vtoken: VWETH_CORE,
    newSupplySpeed: "1562499999999999",
    newBorrowSpeed: "2343750000000000",
  },
  {
    rewardsDistributor: REWARDS_DISTRIBUTOR_CORE_NEW,
    vtoken: VFRAX_CORE,
    newSupplySpeed: "555555555555555",
    newBorrowSpeed: "833333333333333",
  },
  {
    rewardsDistributor: REWARDS_DISTRIBUTOR_CORE_NEW,
    vtoken: VSFRAX_CORE,
    newSupplySpeed: "555555555555555",
    newBorrowSpeed: "833333333333333",
  },
  {
    rewardsDistributor: REWARDS_DISTRIBUTOR_CORE_NEW,
    vtoken: VDAI_CORE,
    newSupplySpeed: "462962962962962",
    newBorrowSpeed: "694444444444444",
  },
  {
    rewardsDistributor: REWARDS_DISTRIBUTOR_CORE_NEW,
    vtoken: VTUSD_CORE,
    newSupplySpeed: "185185185185185",
    newBorrowSpeed: "277777777777777",
  },
  {
    rewardsDistributor: REWARDS_DISTRIBUTOR_CURVE_NEW,
    vtoken: VCRVUSD_CURVE,
    newSupplySpeed: "347222222222222",
    newBorrowSpeed: "520833333333333",
  },
  {
    rewardsDistributor: REWARDS_DISTRIBUTOR_CURVE_NEW,
    vtoken: VCRV_CURVE,
    newSupplySpeed: "347222222222222",
    newBorrowSpeed: "520833333333333",
  },
  {
    rewardsDistributor: REWARDS_DISTRIBUTOR_LST_NEW,
    vtoken: VWETH_LST,
    newSupplySpeed: "22916250000000000",
    newBorrowSpeed: "53471250000000000",
  },
  {
    rewardsDistributor: REWARDS_DISTRIBUTOR_LST_NEW,
    vtoken: VWSTETH_LST,
    newSupplySpeed: "8333333333333333",
    newBorrowSpeed: "0",
  },
  {
    rewardsDistributor: REWARDS_DISTRIBUTOR_LST_NEW,
    vtoken: VSFRXETH_LST,
    newSupplySpeed: "1851851851851851",
    newBorrowSpeed: "0",
  },
];

type ConfigType = { [index: string]: number };

const totalXvsTokensPrevAssigned: ConfigType = {};
const totalXvsTokensNewAssigned: ConfigType = {};

const percentageDecrease: ConfigType = {
  [VDAI_CORE]: 50,
  [VFRAX_CORE]: 50,
  [VTUSD_CORE]: 50,
  [VUSDC_CORE]: 10,
  [VUSDT_CORE]: 10,
  [VWBTC_CORE]: 25,
  [VWETH_CORE]: 25,
  [VSFRAX_CORE]: 50,
  [VCRVUSD_CORE]: 50,
  [VCRVUSD_CURVE]: 50,
  [VCRV_CURVE]: 50,
  [VSFRXETH_LST]: 50,
  [VWSTETH_LST]: 50,
  [VWETH_LST]: 10,
};

forking(20382800, async () => {
  describe("Pre-VIP behaviour", () => {
    it("should have old speeds", async () => {
      for (const config of rewardsDistributorConfigOld) {
        const rewardsDistributor = await ethers.getContractAt(REWARDS_DISTRIBUTOR_ABI, config.rewardsDistributorOld);
        const supplySpeed = await rewardsDistributor.rewardTokenSupplySpeeds(config.vtoken);
        const borrowSpeed = await rewardsDistributor.rewardTokenBorrowSpeeds(config.vtoken);

        totalXvsTokensPrevAssigned[config.vtoken] = (supplySpeed * 216000 + borrowSpeed * 216000) / 1e18;
        expect(supplySpeed).to.be.equal(config.oldSupplySpeed);
        expect(borrowSpeed).to.be.equal(config.oldBorrowSpeed);
      }
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip050());
    });

    it("old rewards distributor speeds for markets should be set to 0", async () => {
      for (let i = 0; i < 5; i++) {
        const config = rewardsDistributorConfigOld[i];
        const rewardsDistributor = await ethers.getContractAt(REWARDS_DISTRIBUTOR_ABI, config.rewardsDistributorOld);
        const supplySpeed = await rewardsDistributor.rewardTokenSupplySpeeds(config.vtoken);
        const borrowSpeed = await rewardsDistributor.rewardTokenBorrowSpeeds(config.vtoken);

        expect(supplySpeed).to.be.equal(0);
        expect(borrowSpeed).to.be.equal(0);
      }
    });

    it("should set correct distribution speeds and speeds be decreased by correct percentage", async () => {
      for (const config of rewardsDistributorConfigNew) {
        const rewardsDistributor = await ethers.getContractAt(REWARDS_DISTRIBUTOR_ABI, config.rewardsDistributor);
        const supplySpeed = await rewardsDistributor.rewardTokenSupplySpeeds(config.vtoken);
        const borrowSpeed = await rewardsDistributor.rewardTokenBorrowSpeeds(config.vtoken);
        const totalXvsPerMonth = (supplySpeed * 216000 + borrowSpeed * 216000) / 1e18;

        totalXvsTokensNewAssigned[config.vtoken] = totalXvsPerMonth;
        expect(supplySpeed).to.be.equal(config.newSupplySpeed);
        expect(borrowSpeed).to.be.equal(config.newBorrowSpeed);

        const percentageDiff =
          ((totalXvsTokensPrevAssigned[config.vtoken] - totalXvsPerMonth) / totalXvsTokensPrevAssigned[config.vtoken]) *
          100;
        expect(percentageDiff).to.be.closeTo(percentageDecrease[config.vtoken], 0.000000001);
      }
      console.log(totalXvsTokensPrevAssigned);
      console.log(totalXvsTokensNewAssigned);
    });
  });
});
