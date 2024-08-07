import { expect } from "chai";
import { BigNumber } from "ethers";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip322, { TOTAL_XVS_TO_BRIDGE, XVS, XVS_BRIDGE_SRC } from "../../vips/vip-322/bsctestnet";
import ERC20_ABI from "./abi/ERC20.json";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSenderAbi.json";
import PROXY_ABI from "./abi/XVSProxyOFTSrc.json";

forking(40991099, async () => {
  let xvs: Contract;
  let oldXVSBal: BigNumber;

  before(async () => {
    xvs = new ethers.Contract(XVS, ERC20_ABI, ethers.provider);
    oldXVSBal = await xvs.balanceOf(XVS_BRIDGE_SRC);
  });

  testVip("VIP-322", await vip322(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PROXY_ABI], ["SendToChain"], [1]);
      await expectEvents(txResponse, [OMNICHAIN_PROPOSAL_SENDER_ABI], ["ExecuteRemoteProposal"], [1]);
    },
  });

  describe("Post-Execution state", () => {
    it("Should increase number of locked tokens on bridge", async () => {
      const currXVSBal = await xvs.balanceOf(XVS_BRIDGE_SRC);
      expect(currXVSBal.sub(oldXVSBal)).equals(TOTAL_XVS_TO_BRIDGE);
    });
  });
});
