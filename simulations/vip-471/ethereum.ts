import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip471, {
  ETHEREUM_TARGETS,
  ETHEREUM_TOTAL_AMOUNT,
  ETHEREUM_XVS,
  ETHEREUM_XVS_VAULT,
  ETHEREUM_XVS_VAULT_REWARD,
  emissions,
} from "../../vips/vip-471/bscmainnet";
import REWARDS_DISTRIBUTOR_ABI from "./abi/RewardDistributor.json";
import XVS_ABI from "./abi/XVS.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";

const { ethereum } = NETWORK_ADDRESSES;

const BRIDGE = "0x888E317606b4c590BBAD88653863e8B345702633";

forking(22094800, async () => {
  const previousBalances: Record<string, BigNumber> = {};
  const xvs = new ethers.Contract(ETHEREUM_XVS, XVS_ABI, ethers.provider);
  let previousTreasuryBalance: BigNumber;

  before(async () => {
    for (const { target } of ETHEREUM_TARGETS) {
      previousBalances[target] = await xvs.balanceOf(target);
    }

    await impersonateAccount(BRIDGE);
    await setBalance(BRIDGE, parseUnits("10", 18));
    await xvs.connect(await ethers.getSigner(BRIDGE)).mint(ethereum.VTREASURY, ETHEREUM_TOTAL_AMOUNT);

    previousTreasuryBalance = await xvs.balanceOf(ethereum.VTREASURY);
  });

  testForkedNetworkVipCommands("VIP 471", await vip471(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [REWARDS_DISTRIBUTOR_ABI],
        ["RewardTokenSupplySpeedUpdated", "RewardTokenBorrowSpeedUpdated"],
        [3, 2],
      );
      await expectEvents(txResponse, [XVS_VAULT_ABI], ["RewardAmountUpdated"], [1]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("Check reward distirbutor speed", async () => {
      for (const {
        chainId,
        newAllocation,
        isSupplierAllocation,
        isBorrowerAllocation,
        vToken,
        rewardsDistributor,
        blocksOrSecondsPerMonth,
      } of emissions) {
        if (chainId == LzChainId.ethereum) {
          const rewardDistirbutor = new ethers.Contract(rewardsDistributor, REWARDS_DISTRIBUTOR_ABI, ethers.provider);
          expect(await rewardDistirbutor.rewardTokenSupplySpeeds(vToken)).to.equals(
            isSupplierAllocation ? newAllocation.div(blocksOrSecondsPerMonth) : 0,
          );

          expect(await rewardDistirbutor.rewardTokenBorrowSpeeds(vToken)).to.equals(
            isBorrowerAllocation ? newAllocation.div(blocksOrSecondsPerMonth) : 0,
          );
        }
      }
    });

    it("check xvs vault speed", async () => {
      const xvsVault = new ethers.Contract(ETHEREUM_XVS_VAULT, XVS_VAULT_ABI, ethers.provider);
      expect(await xvsVault.rewardTokenAmountsPerBlockOrSecond(ETHEREUM_XVS)).to.equals(ETHEREUM_XVS_VAULT_REWARD);
    });

    it(`should transfer ${ETHEREUM_TOTAL_AMOUNT} XVS to the targets`, async () => {
      const balance = await xvs.balanceOf(ethereum.VTREASURY);
      expect(balance).to.equal(previousTreasuryBalance.sub(ETHEREUM_TOTAL_AMOUNT));
    });

    for (const { target, amount } of ETHEREUM_TARGETS) {
      it(`should transfer ${amount} XVS to ${target}`, async () => {
        const balance = await xvs.balanceOf(target);
        expect(balance).to.equal(previousBalances[target].add(amount));
      });
    }
  });
});
