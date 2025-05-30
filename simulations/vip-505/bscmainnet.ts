import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip505, {
  CERTIK,
  CERTIK_AMOUNT,
  FAIRYPROOF,
  FAIRYPROOF_AMOUNT,
  QUANTSTAMP,
  QUANTSTAMP_AMOUNT,
  USDC,
  USDT,
} from "../../vips/vip-505/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import VTREASURY_ABI from "./abi/VTreasury.json";

forking(50391406, async () => {
  let usdc: Contract;
  let usdt: Contract;

  let prevUSDTBalanceOfCertik: BigNumber;
  let prevUSDCBalanceOfFairyproof: BigNumber;
  let prevUSDCBalanceOfQuantstamp: BigNumber;

  before(async () => {
    usdc = new ethers.Contract(USDC, ERC20_ABI, ethers.provider);
    usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);

    prevUSDTBalanceOfCertik = await usdt.balanceOf(CERTIK);
    prevUSDCBalanceOfFairyproof = await usdc.balanceOf(FAIRYPROOF);
    prevUSDCBalanceOfQuantstamp = await usdc.balanceOf(QUANTSTAMP);
  });

  testVip("VIP-505", await vip505(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [3]);
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [1, 0],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check balances", async () => {
      const usdtBalanceOfCertik = await usdt.balanceOf(CERTIK);
      const usdcBalanceOfFairyproof = await usdc.balanceOf(FAIRYPROOF);
      const usdcBalanceOfQuantstamp = await usdc.balanceOf(QUANTSTAMP);

      expect(usdtBalanceOfCertik.sub(prevUSDTBalanceOfCertik)).to.equal(CERTIK_AMOUNT);
      expect(usdcBalanceOfFairyproof.sub(prevUSDCBalanceOfFairyproof)).to.equal(FAIRYPROOF_AMOUNT);
      expect(usdcBalanceOfQuantstamp.sub(prevUSDCBalanceOfQuantstamp)).to.equal(QUANTSTAMP_AMOUNT);
    });
  });
});
