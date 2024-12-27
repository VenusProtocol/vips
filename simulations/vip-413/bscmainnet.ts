import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip413, { BSC_XVS, BSC_XVS_VAULT } from "../../vips/vip-413/bscmainnet";
import XVS_VAULT_ABI from "./abi/XVSVault.json";

forking(45247428, async () => {
  let xvsVault: Contract;

  describe("Pre-VIP behaviour", () => {
    before(async () => {
      xvsVault = new ethers.Contract(BSC_XVS_VAULT, XVS_VAULT_ABI, ethers.provider);
    });

    it("check XVS vault speed", async () => {
      expect(await xvsVault.rewardTokenAmountsPerBlockOrSecond(BSC_XVS)).to.equals("15312500000000000");
    });
  });

  testVip("vip-413", await vip413(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [XVS_VAULT_ABI], ["RewardAmountUpdated"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("check XVS vault speed", async () => {
      expect(await xvsVault.rewardTokenAmountsPerBlockOrSecond(BSC_XVS)).to.equals("45520833333333333");
    });
  });
});
