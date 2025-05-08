import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip501, { BSC_ETH, BSC_USDC } from "../../vips/vip-501/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import ETH_ABI from "./abi/eth.json";
import USDC_ABI from "./abi/usdc.json";

const multisig = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";

forking(51462851, async () => {
  let usdc: Contract;
  let treasuryUSDCBefore: BigNumber;
  let multisigUSDCBefore: BigNumber;
  let eth: Contract;
  let treasuryETHBefore: BigNumber;
  let multisigETHBefore: BigNumber;
  const AMOUNT = parseUnits("1000", 18);

  before(async () => {
    const impersonateMultisig = await initMainnetUser(multisig, ethers.utils.parseEther("2"));

    // Fund treasury
    usdc = new ethers.Contract(BSC_USDC, USDC_ABI, impersonateMultisig);
    eth = new ethers.Contract(BSC_ETH, ETH_ABI, impersonateMultisig);
    await usdc.allocateTo(NETWORK_ADDRESSES.bsctestnet.VTREASURY, AMOUNT);

    await eth.mint(AMOUNT);
    await eth.transfer(NETWORK_ADDRESSES.bsctestnet.VTREASURY, AMOUNT);

    treasuryUSDCBefore = await usdc.balanceOf(NETWORK_ADDRESSES.bsctestnet.VTREASURY);
    multisigUSDCBefore = await usdc.balanceOf(multisig);

    treasuryETHBefore = await eth.balanceOf(NETWORK_ADDRESSES.bsctestnet.VTREASURY);
    multisigETHBefore = await eth.balanceOf(multisig);
  });
  testVip("VIP-501", await vip501(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [1, 0],
      );
    },
  });
  describe("Post-VIP", () => {
    it("post balance check", async function () {
      const treasuryUSDCAfter = await usdc.balanceOf(NETWORK_ADDRESSES.bsctestnet.VTREASURY);
      const multisigUSDCAfter = await usdc.balanceOf(multisig);

      expect(treasuryUSDCAfter).to.eq(treasuryUSDCBefore.sub(AMOUNT));
      expect(multisigUSDCAfter).to.eq(multisigUSDCBefore.add(AMOUNT));

      const treasuryETHAfter = await eth.balanceOf(NETWORK_ADDRESSES.bsctestnet.VTREASURY);
      const multisigETHAfter = await eth.balanceOf(multisig);

      expect(treasuryETHAfter).to.eq(treasuryETHBefore.sub(AMOUNT));
      expect(multisigETHAfter).to.eq(multisigETHBefore.add(AMOUNT));
    });
  });
});
