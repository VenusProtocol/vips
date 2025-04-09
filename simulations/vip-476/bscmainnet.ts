import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip476, { BSCMAINNET_ETH, ETH_AMOUNT_SEND } from "../../vips/vip-476/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import DLNSOURCE_ABI from "./abi/dlnSource.json";

const { VTREASURY } = NETWORK_ADDRESSES["bscmainnet"];

forking(48142130, async () => {
  let eth: Contract;
  let beforeTransfer: BigNumber;
  let afterTransfer: BigNumber;

  before(async () => {
    eth = new ethers.Contract(BSCMAINNET_ETH, ERC20_ABI, ethers.provider);
    beforeTransfer = await eth.balanceOf(VTREASURY);
  });

  testVip("VIP-476 Bridge 101 ETH from the Treasury on BNB Chain to the Treasury on Base", await vip476(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [1, 0],
      );
      await expectEvents(txResponse, [DLNSOURCE_ABI], ["CreatedOrder"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Should decrease eth balance in vTreasury BNB", async () => {
      afterTransfer = await eth.balanceOf(VTREASURY);
      expect(beforeTransfer).to.equal(afterTransfer.add(ETH_AMOUNT_SEND));
    });
  });
});
