import { setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip018 from "../../multisig/proposals/zksyncmainnet/vip-018/index";
import {
  ZKSYNCMAINNET_TARGETS,
  ZKSYNCMAINNET_TOTAL_AMOUNT,
  ZKSYNCMAINNET_VTREASURY,
  ZKSYNCMAINNET_XVS,
  vip419,
} from "../../vips/vip-419/bscmainnet";
import VTREASURY_ABI from "./abi/VTreasury.json";
import XVS_ABI from "./abi/XVS.json";

const { zksyncmainnet } = NETWORK_ADDRESSES;
const BRIDGE = "0x16a62B534e09A7534CD5847CFE5Bf6a4b0c1B116";

forking(52786809, async () => {
  const previousBalances: Record<string, BigNumber> = {};
  let previousTreasuryBalance: BigNumber;
  const xvs = new ethers.Contract(ZKSYNCMAINNET_XVS, XVS_ABI, ethers.provider);
  const vTreasury = new ethers.Contract(ZKSYNCMAINNET_VTREASURY, VTREASURY_ABI, ethers.provider);

  before(async () => {
    for (const { target } of ZKSYNCMAINNET_TARGETS) {
      previousBalances[target] = await xvs.balanceOf(target);
    }

    const xvsMinter = await initMainnetUser(BRIDGE, ethers.utils.parseEther("1"));
    await setBalance(BRIDGE, parseUnits("1000000", 18));
    await xvs.connect(xvsMinter).mint(ZKSYNCMAINNET_VTREASURY, ZKSYNCMAINNET_TOTAL_AMOUNT);

    previousTreasuryBalance = await xvs.balanceOf(ZKSYNCMAINNET_VTREASURY);
  });

  await pretendExecutingVip(await vip018());
  testForkedNetworkVipCommands("XVS Bridging", await vip419());

  describe("Post-Execution state", () => {
    for (const { target, amount } of ZKSYNCMAINNET_TARGETS) {
      it(`should transfer ${amount} XVS to ${target}`, async () => {
        const balance = await xvs.balanceOf(target);
        expect(balance).to.equal(previousBalances[target].add(amount));
      });
    }

    it("owner of VTreasury should be the timelock", async () => {
      expect(await vTreasury.owner()).to.be.equal(zksyncmainnet.NORMAL_TIMELOCK);
    });

    it(`should transfer ${ZKSYNCMAINNET_TOTAL_AMOUNT} XVS to the targets`, async () => {
      const balance = await xvs.balanceOf(ZKSYNCMAINNET_VTREASURY);
      expect(balance).to.equal(previousTreasuryBalance.sub(ZKSYNCMAINNET_TOTAL_AMOUNT));
    });
  });
});
