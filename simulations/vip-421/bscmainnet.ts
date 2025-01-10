import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip421, { BSCMAINNET_XVS_AMOUNT, BSCMAINNET_XVS_SPEED } from "../../vips/vip-421/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import XVS_ABI from "./abi/XVS.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";

const { bscmainnet } = NETWORK_ADDRESSES;
const XVS_STORE = "0x1e25CF968f12850003Db17E0Dba32108509C4359";

forking(45640970, async () => {
  const provider = ethers.provider;
  const xvs = new ethers.Contract(bscmainnet.XVS, XVS_ABI, provider);
  const xvsVault = new ethers.Contract(bscmainnet.XVS_VAULT_PROXY, XVS_VAULT_ABI, ethers.provider);
  const xvsStorePreviousBalance = await xvs.balanceOf(XVS_STORE);

  testVip("VIP-421", await vip421(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [3, 0],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("should transfer XVS to the store", async () => {
      const xvsStoreBalance = await xvs.balanceOf(XVS_STORE);
      expect(xvsStoreBalance).to.equal(xvsStorePreviousBalance.add(BSCMAINNET_XVS_AMOUNT));
    });

    it("check speed", async () => {
      const speed = await xvsVault.rewardTokenAmountsPerBlockOrSecond(bscmainnet.XVS);
      expect(speed).to.equal(BSCMAINNET_XVS_SPEED);
    });
  });
});
