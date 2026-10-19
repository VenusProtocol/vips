import { JsonFragment } from "@ethersproject/abi";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  NORMAL_TIMELOCK,
  SPOKE_COMPTROLLER,
  SPOKE_COMPTROLLER_BEACON,
  SPOKE_COMPTROLLER_IMPL,
  SPOKE_COMPTROLLER_IMPL_ADDENDUM2,
  VTSLAB_SPOKE,
} from "../../vips/vip-668/addresses/bsctestnet";
import vip668Addendum2 from "../../vips/vip-668/bsctestnet-addendum2";
import COMPTROLLER_ABI from "./abi/SpokeComptroller.json";

// After the new implementation was deployed at block 136,362,704.
const FORK_BLOCK = 136364000;

const UNSAFE_LIQUIDATION_PARAMS = "UnsafeLiquidationParams(uint256,uint256)";
const MANTISSA_ONE_SQUARED = ethers.utils.parseUnits("1", 36);

const BEACON_ABI: JsonFragment[] = [
  {
    type: "event",
    name: "Upgraded",
    anonymous: false,
    inputs: [{ name: "implementation", type: "address", indexed: true }],
  },
  { type: "function", name: "implementation", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "owner", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
];

const hasSelector = async (implementation: string, signature: string): Promise<boolean> => {
  const code = await ethers.provider.getCode(implementation);
  return code.includes(ethers.utils.id(signature).slice(2, 10));
};

// Smallest value `x` with `x * other >= 1e36`, which is the first value `UnsafeLiquidationParams` rejects.
const firstUnsafe = (other: BigNumber): BigNumber => MANTISSA_ONE_SQUARED.add(other).sub(1).div(other);

const readPoolState = async (comptroller: Contract) => {
  const allMarkets: string[] = await comptroller.getAllMarkets();
  const markets = await Promise.all(
    allMarkets.map(async vToken => {
      const market = await comptroller.markets(vToken);
      return {
        vToken,
        isListed: market.isListed,
        collateralFactorMantissa: market.collateralFactorMantissa.toString(),
        liquidationThresholdMantissa: market.liquidationThresholdMantissa.toString(),
        liquidationIncentive: (await comptroller.liquidationIncentives(vToken)).toString(),
      };
    }),
  );

  return {
    owner: await comptroller.owner(),
    poolRegistry: await comptroller.poolRegistry(),
    accessControlManager: await comptroller.accessControlManager(),
    oracle: await comptroller.oracle(),
    closeFactorMantissa: (await comptroller.closeFactorMantissa()).toString(),
    liquidationIncentiveMantissa: (await comptroller.liquidationIncentiveMantissa()).toString(),
    minLiquidatableCollateral: (await comptroller.minLiquidatableCollateral()).toString(),
    maxLoopsLimit: (await comptroller.maxLoopsLimit()).toString(),
    markets,
  };
};

forking(FORK_BLOCK, async () => {
  const comptroller = new ethers.Contract(
    SPOKE_COMPTROLLER,
    [...COMPTROLLER_ABI, `error ${UNSAFE_LIQUIDATION_PARAMS}`],
    ethers.provider,
  );
  const beacon = new ethers.Contract(SPOKE_COMPTROLLER_BEACON, BEACON_ABI, ethers.provider);
  const vToken = VTSLAB_SPOKE;

  let preState: Awaited<ReturnType<typeof readPoolState>>;
  let collateralFactor: BigNumber;
  let incentive: BigNumber;
  let unsafeThreshold: BigNumber;
  let unsafeIncentive: BigNumber;

  before(async () => {
    preState = await readPoolState(comptroller);

    const market = await comptroller.markets(vToken);
    collateralFactor = market.collateralFactorMantissa;
    const marketIncentive: BigNumber = await comptroller.liquidationIncentives(vToken);
    incentive = marketIncentive.isZero() ? await comptroller.liquidationIncentiveMantissa() : marketIncentive;
    unsafeThreshold = firstUnsafe(incentive);
    unsafeIncentive = firstUnsafe(market.liquidationThresholdMantissa);
  });

  describe("Pre-VIP state", () => {
    it("serves the implementation from the first addendum", async () => {
      expect(await beacon.implementation()).to.equal(SPOKE_COMPTROLLER_IMPL);
    });

    it("has the new implementation deployed, carrying the fix the old one lacks", async () => {
      expect(await ethers.provider.getCode(SPOKE_COMPTROLLER_IMPL_ADDENDUM2)).to.not.equal("0x");
      expect(await hasSelector(SPOKE_COMPTROLLER_IMPL_ADDENDUM2, UNSAFE_LIQUIDATION_PARAMS)).to.be.true;
      expect(await hasSelector(SPOKE_COMPTROLLER_IMPL, UNSAFE_LIQUIDATION_PARAMS)).to.be.false;
    });

    it("leaves the beacon owned by the Normal Timelock", async () => {
      expect(await beacon.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it("accepts an unsafe liquidation threshold on the old implementation", async () => {
      const timelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
      await expect(
        comptroller.connect(timelock).callStatic.setCollateralFactor(vToken, collateralFactor, unsafeThreshold),
      ).to.not.be.reverted;
    });
  });

  testVip("VIP-668 addendum 2: spoke comptroller upgrade with audit fixes", await vip668Addendum2(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [BEACON_ABI], ["Upgraded"], [1]);
    },
  });

  describe("Post-VIP state", () => {
    it("points the beacon at the new implementation", async () => {
      expect(await beacon.implementation()).to.equal(SPOKE_COMPTROLLER_IMPL_ADDENDUM2);
    });

    it("leaves every comptroller value untouched", async () => {
      expect(await readPoolState(comptroller)).to.deep.equal(preState);
    });
  });

  describe("Post-VIP behaviour", () => {
    let timelock: Awaited<ReturnType<typeof initMainnetUser>>;

    before(async () => {
      timelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
    });

    it("rejects an unsafe liquidation threshold in setCollateralFactor", async () => {
      await expect(comptroller.connect(timelock).setCollateralFactor(vToken, collateralFactor, unsafeThreshold))
        .to.be.revertedWithCustomError(comptroller, "UnsafeLiquidationParams")
        .withArgs(unsafeThreshold, incentive);
    });

    it("still accepts the threshold just below the unsafe one", async () => {
      await expect(
        comptroller.connect(timelock).callStatic.setCollateralFactor(vToken, collateralFactor, unsafeThreshold.sub(1)),
      ).to.not.be.reverted;
    });

    it("rejects an unsafe incentive in setMarketLiquidationIncentive", async () => {
      await expect(
        comptroller.connect(timelock).setMarketLiquidationIncentive(vToken, unsafeIncentive),
      ).to.be.revertedWithCustomError(comptroller, "UnsafeLiquidationParams");
    });
  });
});
