import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip528, {
  CERTIK,
  CERTIK_USDT_AMOUNT_1,
  CERTIK_USDT_AMOUNT_2,
  NODEREAL,
  NODEREAL_USDT_AMOUNT,
  QUANTSTAMP,
  QUANTSTAMP_USDC_AMOUNT,
  USDC_BSC,
  USDT_BSC,
} from "../../vips/vip-528/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(52015098, async () => {
  const usdc = new Contract(USDC_BSC, ERC20_ABI, ethers.provider);
  const usdt = new Contract(USDT_BSC, ERC20_ABI, ethers.provider);
  const certikBalanceBefore = await usdt.balanceOf(CERTIK);
  const quantstampBalanceBefore = await usdc.balanceOf(QUANTSTAMP);
  const noderealBalanceBefore = await usdt.balanceOf(NODEREAL);
  const vtreasuryUSDCBalanceBefore = await usdc.balanceOf(bscmainnet.VTREASURY);
  const vtreasuryUSDTBalanceBefore = await usdt.balanceOf(bscmainnet.VTREASURY);

  testVip("VIP-528", await vip528(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [1, 0],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check Certik USDT balance", async () => {
      const certikBalanceAfter = await usdt.balanceOf(CERTIK);
      expect(certikBalanceAfter).to.equal(certikBalanceBefore.add(CERTIK_USDT_AMOUNT_1).add(CERTIK_USDT_AMOUNT_2));
    });

    it("check Quantstamp USDC balance", async () => {
      const quantstampBalanceAfter = await usdc.balanceOf(QUANTSTAMP);
      expect(quantstampBalanceAfter).to.equal(quantstampBalanceBefore.add(QUANTSTAMP_USDC_AMOUNT));
    });

    it("check NodeReal USDT balance", async () => {
      const noderealBalanceAfter = await usdt.balanceOf(NODEREAL);
      expect(noderealBalanceAfter).to.equal(noderealBalanceBefore.add(NODEREAL_USDT_AMOUNT));
    });

    it("check VTreasury USDC balance", async () => {
      const vtreasuryUSDCBalanceAfter = await usdc.balanceOf(bscmainnet.VTREASURY);
      expect(vtreasuryUSDCBalanceAfter).to.equal(vtreasuryUSDCBalanceBefore.sub(QUANTSTAMP_USDC_AMOUNT));
    });

    it("check VTreasury USDT balance", async () => {
      const vtreasuryUSDTBalanceAfter = await usdt.balanceOf(bscmainnet.VTREASURY);
      expect(vtreasuryUSDTBalanceAfter).to.equal(
        vtreasuryUSDTBalanceBefore.sub(CERTIK_USDT_AMOUNT_1).sub(CERTIK_USDT_AMOUNT_2).sub(NODEREAL_USDT_AMOUNT),
      );
    });
  });
});
