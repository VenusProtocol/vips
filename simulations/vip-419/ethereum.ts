import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import {
  ETHEREUM_TARGETS,
  ETHEREUM_TOTAL_AMOUNT,
  ETHEREUM_VTREASURY,
  ETHEREUM_XVS,
  vip419,
} from "../../vips/vip-419/bscmainnet";
import XVS_ABI from "./abi/XVS.json";

const BRIDGE = "0x888E317606b4c590BBAD88653863e8B345702633";

forking(21543323, async () => {
  const previousBalances: Record<string, BigNumber> = {};
  let previousTreasuryBalance: BigNumber;
  const xvs = new ethers.Contract(ETHEREUM_XVS, XVS_ABI, ethers.provider);

  before(async () => {
    for (const { target } of ETHEREUM_TARGETS) {
      previousBalances[target] = await xvs.balanceOf(target);
    }

    await impersonateAccount(BRIDGE);
    await setBalance(BRIDGE, parseUnits("1000000", 18));
    await xvs.connect(await ethers.getSigner(BRIDGE)).mint(ETHEREUM_VTREASURY, ETHEREUM_TOTAL_AMOUNT);

    previousTreasuryBalance = await xvs.balanceOf(ETHEREUM_VTREASURY);
  });

  testForkedNetworkVipCommands("XVS Bridging", await vip419());

  describe("Post-Execution state", () => {
    for (const { target, amount } of ETHEREUM_TARGETS) {
      it(`should transfer ${amount} XVS to ${target}`, async () => {
        const balance = await xvs.balanceOf(target);
        expect(balance).to.equal(previousBalances[target].add(amount));
      });
    }

    it(`should transfer ${ETHEREUM_TOTAL_AMOUNT} XVS to the targets`, async () => {
      const balance = await xvs.balanceOf(ETHEREUM_VTREASURY);
      expect(balance).to.equal(previousTreasuryBalance.sub(ETHEREUM_TOTAL_AMOUNT));
    });
  });
});
