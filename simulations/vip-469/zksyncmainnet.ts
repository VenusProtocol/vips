import { setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { initMainnetUser } from "src/utils";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip469, {
  ZKSYNCMAINNET_TARGETS,
  ZKSYNCMAINNET_TOTAL_AMOUNT,
  ZKSYNC_XVS,
  ZKSYNC_XVS_VAULT,
  ZKSYNC_XVS_VAULT_REWARD,
  emissions,
} from "../../vips/vip-469/bscmainnet";
import REWARDS_DISTRIBUTOR_ABI from "./abi/RewardDistributor.json";
import XVS_ABI from "./abi/XVS.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";

const { zksyncmainnet } = NETWORK_ADDRESSES;
const BRIDGE = "0x16a62B534e09A7534CD5847CFE5Bf6a4b0c1B116";

forking(57936959, async () => {
  const previousBalances: Record<string, BigNumber> = {};
  const xvs = new ethers.Contract(ZKSYNC_XVS, XVS_ABI, ethers.provider);
  let previousTreasuryBalance: BigNumber;

  before(async () => {
    for (const { target } of ZKSYNCMAINNET_TARGETS) {
      previousBalances[target] = await xvs.balanceOf(target);
    }

    const xvsMinter = await initMainnetUser(BRIDGE, ethers.utils.parseEther("1"));
    await setBalance(BRIDGE, parseUnits("1000000", 18));
    await xvs.connect(xvsMinter).mint(zksyncmainnet.VTREASURY, ZKSYNCMAINNET_TOTAL_AMOUNT);

    previousTreasuryBalance = await xvs.balanceOf(zksyncmainnet.VTREASURY);
  });

  testForkedNetworkVipCommands("VIP 469", await vip469(), {
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
        if (chainId == LzChainId.zksyncmainnet) {
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
      const xvsVault = new ethers.Contract(ZKSYNC_XVS_VAULT, XVS_VAULT_ABI, ethers.provider);
      expect(await xvsVault.rewardTokenAmountsPerBlockOrSecond(ZKSYNC_XVS)).to.equals(ZKSYNC_XVS_VAULT_REWARD);
    });

    it(`should transfer ${ZKSYNCMAINNET_TOTAL_AMOUNT} XVS to the targets`, async () => {
      const balance = await xvs.balanceOf(zksyncmainnet.VTREASURY);
      expect(balance).to.equal(previousTreasuryBalance.sub(ZKSYNCMAINNET_TOTAL_AMOUNT));
    });

    for (const { target, amount } of ZKSYNCMAINNET_TARGETS) {
      it(`should transfer ${amount} XVS to ${target}`, async () => {
        const balance = await xvs.balanceOf(target);
        expect(balance).to.equal(previousBalances[target].add(amount));
      });
    }
  });
});
