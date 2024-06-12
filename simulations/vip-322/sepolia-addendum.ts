import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { expectEvents } from "../../src/utils";
import { forking, testForkedNetworkVipCommands } from "../../src/vip-framework";
import vip322, {
  BLOCKS_PER_YEAR,
  CORE_XVS_DISTRIBUTOR,
  CORE_vDAI,
  CORE_vFRAX,
  CORE_vTUSD,
  CORE_vUSDC,
  CORE_vUSDT,
  CORE_vWBTC,
  CORE_vcrvUSD,
  CORE_vsFRAX,
  CORE_vwETH,
  CURVE_XVS_DISTRIBUTOR,
  CURVE_vCRV,
  CURVE_vcrvUSD,
  LST_XVS_DISTRIBUTOR,
  LST_vwETH,
  LST_vwstETH,
  SEPOLIA_XVS,
  TOTAL_XVS_FOR_CURVE,
  TOTAL_XVS_FOR_LST,
} from "../../vips/vip-322/bsctestnet-addendum";
import VTREASURY_ABI from "./abi/VTreasuryEthereumAbi.json";
import REWARDS_DISTRIBUTOR_ABI from "./abi/rewardsDistributor.json";
import XVS_ABI from "./abi/xvs.json";

const { sepolia } = NETWORK_ADDRESSES;

export const BLOCKS_IN_ONE_DAY = BLOCKS_PER_YEAR.div(365);
const DAILY_REWARDS = [
  {
    market: CORE_vwETH,
    supply: parseUnits("1.5", 18),
    borrow: parseUnits("2.250", 18),
    distributor: CORE_XVS_DISTRIBUTOR,
  },
  {
    market: CORE_vWBTC,
    supply: parseUnits("4.5", 18),
    borrow: parseUnits("6.750", 18),
    distributor: CORE_XVS_DISTRIBUTOR,
  },
  {
    market: CORE_vUSDT,
    supply: parseUnits("4.5", 18),
    borrow: parseUnits("6.750", 18),
    distributor: CORE_XVS_DISTRIBUTOR,
  },
  {
    market: CORE_vUSDC,
    supply: parseUnits("4.5", 18),
    borrow: parseUnits("6.750", 18),
    distributor: CORE_XVS_DISTRIBUTOR,
  },
  {
    market: CORE_vcrvUSD,
    supply: parseUnits("2", 18),
    borrow: parseUnits("3", 18),
    distributor: CORE_XVS_DISTRIBUTOR,
  },
  {
    market: CORE_vFRAX,
    supply: parseUnits("0.8", 18),
    borrow: parseUnits("1.2", 18),
    distributor: CORE_XVS_DISTRIBUTOR,
  },
  {
    market: CORE_vsFRAX,
    supply: parseUnits("0.8", 18),
    borrow: parseUnits("1.2", 18),
    distributor: CORE_XVS_DISTRIBUTOR,
  },
  {
    market: CORE_vTUSD,
    supply: parseUnits("0.267", 18),
    borrow: parseUnits("0.4", 18),
    distributor: CORE_XVS_DISTRIBUTOR,
  },
  {
    market: CORE_vDAI,
    supply: parseUnits("0.667", 18),
    borrow: parseUnits("0.10", 18),
    distributor: CORE_XVS_DISTRIBUTOR,
  },
  {
    market: CURVE_vCRV,
    supply: parseUnits("0.5", 18),
    borrow: parseUnits("0.750", 18),
    distributor: CURVE_XVS_DISTRIBUTOR,
  },
  {
    market: CURVE_vcrvUSD,
    supply: parseUnits("0.5", 18),
    borrow: parseUnits("0.750", 18),
    distributor: CURVE_XVS_DISTRIBUTOR,
  },
  {
    market: LST_vwETH,
    supply: parseUnits("18.333", 18),
    borrow: parseUnits("42.778", 18),
    distributor: LST_XVS_DISTRIBUTOR,
  },
  {
    market: LST_vwstETH,
    supply: parseUnits("12", 18),
    borrow: parseUnits("0", 18),
    distributor: LST_XVS_DISTRIBUTOR,
  },
];

const BRIDGE_DEST = "0xc340b7d3406502F43dC11a988E4EC5bbE536E642";

forking(6086455, async () => {
  let xvs: Contract;
  let prevCurveDistributorBalance: BigNumber;
  let prevLstDistributorBalance: BigNumber;

  before(async () => {
    await impersonateAccount(BRIDGE_DEST);
    await setBalance(BRIDGE_DEST, parseUnits("100", 18));

    xvs = await ethers.getContractAt(XVS_ABI, SEPOLIA_XVS, ethers.provider.getSigner(BRIDGE_DEST));
    await xvs.mint(sepolia.VTREASURY, TOTAL_XVS_FOR_CURVE.add(TOTAL_XVS_FOR_LST));

    prevCurveDistributorBalance = await xvs.balanceOf(CURVE_XVS_DISTRIBUTOR);
    prevLstDistributorBalance = await xvs.balanceOf(LST_XVS_DISTRIBUTOR);
  });

  testForkedNetworkVipCommands("VIP-322", await vip322(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryToken"], [2]);
    },
  });

  describe("Post-Execution state", () => {
    it("check daily speeds", async () => {
      for (const data of DAILY_REWARDS) {
        const { supply, borrow, distributor, market } = data;
        const rewardsDistributor = await ethers.getContractAt(REWARDS_DISTRIBUTOR_ABI, distributor);

        const supplySpeed = await rewardsDistributor.rewardTokenSupplySpeeds(market);
        const borrowSpeed = await rewardsDistributor.rewardTokenBorrowSpeeds(market);

        expect(supplySpeed).to.be.closeTo(supply.div(BLOCKS_IN_ONE_DAY), parseUnits("0.01", 18));
        expect(borrowSpeed).to.be.closeTo(borrow.div(BLOCKS_IN_ONE_DAY), parseUnits("0.01", 18));
      }
    });

    it("check balance", async () => {
      const curveDistributorBalance = await xvs.balanceOf(CURVE_XVS_DISTRIBUTOR);
      const lstDistributorBalance = await xvs.balanceOf(LST_XVS_DISTRIBUTOR);

      expect(curveDistributorBalance.sub(prevCurveDistributorBalance)).to.equal(TOTAL_XVS_FOR_CURVE);
      expect(lstDistributorBalance.sub(prevLstDistributorBalance)).to.equal(TOTAL_XVS_FOR_LST);
    });
  });
});
