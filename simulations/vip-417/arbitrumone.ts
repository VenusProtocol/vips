import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip019 from "../../multisig/proposals/arbitrumone/vip-019/index";
import {
  ARBITRUM_ONE_TARGETS,
  ARBITRUM_ONE_TOTAL_AMOUNT,
  ARBITRUM_ONE_VTREASURY,
  ARBITRUM_ONE_XVS,
  vip417,
} from "../../vips/vip-417/bscmainnet";
import VTREASURY_ABI from "./abi/VTreasury.json";
import XVS_ABI from "./abi/XVS.json";

const { arbitrumone } = NETWORK_ADDRESSES;
const BRIDGE = "0x20cEa49B5F7a6DBD78cAE772CA5973eF360AA1e6";

forking(291539000, async () => {
  const previousBalances: Record<string, BigNumber> = {};
  let previousTreasuryBalance: BigNumber;
  const xvs = new ethers.Contract(ARBITRUM_ONE_XVS, XVS_ABI, ethers.provider);
  const vTreasury = new ethers.Contract(ARBITRUM_ONE_VTREASURY, VTREASURY_ABI, ethers.provider);

  before(async () => {
    for (const { target } of ARBITRUM_ONE_TARGETS) {
      previousBalances[target] = await xvs.balanceOf(target);
    }

    await impersonateAccount(BRIDGE);
    await setBalance(BRIDGE, parseUnits("1000000", 18));
    await xvs.connect(await ethers.getSigner(BRIDGE)).mint(ARBITRUM_ONE_VTREASURY, ARBITRUM_ONE_TOTAL_AMOUNT);

    previousTreasuryBalance = await xvs.balanceOf(ARBITRUM_ONE_VTREASURY);
  });

  await pretendExecutingVip(await vip019());
  testForkedNetworkVipCommands("XVS Bridging", await vip417());

  describe("Post-Execution state", () => {
    for (const { target, amount } of ARBITRUM_ONE_TARGETS) {
      it(`should transfer ${amount} XVS to ${target}`, async () => {
        const balance = await xvs.balanceOf(target);
        expect(balance).to.equal(previousBalances[target].add(amount));
      });
    }

    it(`should transfer ${ARBITRUM_ONE_TOTAL_AMOUNT} XVS to the targets`, async () => {
      const balance = await xvs.balanceOf(ARBITRUM_ONE_VTREASURY);
      expect(balance).to.equal(previousTreasuryBalance.sub(ARBITRUM_ONE_TOTAL_AMOUNT));
    });

    it("owner of VTreasury should be the timelock", async () => {
      expect(await vTreasury.owner()).to.be.equal(arbitrumone.NORMAL_TIMELOCK);
    });
  });
});
