import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  BSCMAINNET_AMOUNT_BTCB,
  BSCMAINNET_AMOUNT_ETH,
  BSCMAINNET_AMOUNT_USDC,
  BSCMAINNET_AMOUNT_USDT,
  BSCMAINNET_BTCB,
  BSCMAINNET_ETH,
  BSCMAINNET_PLP,
  BSCMAINNET_USDC,
  BSCMAINNET_USDT,
  vip491,
} from "../../vips/vip-491/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import VTREASURY_ABI from "./abi/VTreasury.json";

forking(49145177, async () => {
  const btcb = new ethers.Contract(BSCMAINNET_BTCB, ERC20_ABI, ethers.provider);
  const eth = new ethers.Contract(BSCMAINNET_ETH, ERC20_ABI, ethers.provider);
  const usdc = new ethers.Contract(BSCMAINNET_USDC, ERC20_ABI, ethers.provider);
  const usdt = new ethers.Contract(BSCMAINNET_USDT, ERC20_ABI, ethers.provider);

  let prevBTCBBalanceOfPLP: BigNumber;
  let prevETHBalanceOfPLP: BigNumber;
  let prevUSDCBalanceOfPLP: BigNumber;
  let prevUSDTBalanceOfPLP: BigNumber;

  before(async () => {
    prevBTCBBalanceOfPLP = await btcb.balanceOf(BSCMAINNET_PLP);
    prevETHBalanceOfPLP = await eth.balanceOf(BSCMAINNET_PLP);
    prevUSDCBalanceOfPLP = await usdc.balanceOf(BSCMAINNET_PLP);
    prevUSDTBalanceOfPLP = await usdt.balanceOf(BSCMAINNET_PLP);
  });

  testVip("VIP-491", await vip491(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [1, 0],
      );

      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [4]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check balances", async () => {
      const currentBTCBBalanceOfPLP = await btcb.balanceOf(BSCMAINNET_PLP);
      const currentETHBalanceOfPLP = await eth.balanceOf(BSCMAINNET_PLP);
      const currentUSDCBalanceOfPLP = await usdc.balanceOf(BSCMAINNET_PLP);
      const currentUSDTBalanceOfPLP = await usdt.balanceOf(BSCMAINNET_PLP);

      expect(currentBTCBBalanceOfPLP.sub(prevBTCBBalanceOfPLP)).to.equal(BSCMAINNET_AMOUNT_BTCB);
      expect(currentETHBalanceOfPLP.sub(prevETHBalanceOfPLP)).to.equal(BSCMAINNET_AMOUNT_ETH);
      expect(currentUSDCBalanceOfPLP.sub(prevUSDCBalanceOfPLP)).to.equal(BSCMAINNET_AMOUNT_USDC);
      expect(currentUSDTBalanceOfPLP.sub(prevUSDTBalanceOfPLP)).to.equal(BSCMAINNET_AMOUNT_USDT);
    });
  });
});
