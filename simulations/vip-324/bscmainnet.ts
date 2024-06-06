import { expect } from "chai";
import { BigNumber } from "ethers";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip324, { TOTAL_XVS_TO_BRIDGE, XVS, XVS_BRIDGE_SRC } from "../../vips/vip-324/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import REWARD_FACET_ABI from "./abi/RewardFacet.json";
import VTREASURY_ABI from "./abi/VTreasuryAbi.json";
import PROXY_ABI from "./abi/XVSProxyOFTSrc.json";

forking(39159653, () => {
  let xvs: Contract;
  let oldXVSBal: BigNumber;

  before(async () => {
    xvs = new ethers.Contract(XVS, ERC20_ABI, ethers.provider);
    oldXVSBal = await xvs.balanceOf(XVS_BRIDGE_SRC);
  });

  testVip("VIP-322", vip324(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [VTREASURY_ABI, REWARD_FACET_ABI, PROXY_ABI],
        ["WithdrawTreasuryBNB", "VenusGranted", "SendToChain"],
        [1, 1, 1],
      );
    },
  });

  describe("Post-Execution state", () => {
    it("Should increase number of locked tokens on bridge", async () => {
      const currXVSBal = await xvs.balanceOf(XVS_BRIDGE_SRC);
      expect(currXVSBal.sub(oldXVSBal)).equals(TOTAL_XVS_TO_BRIDGE);
    });
  });
});