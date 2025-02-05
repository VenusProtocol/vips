import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip410, { BSC_COMPTROLLER, BSC_XVS, BSC_XVS_MARKET, BSC_XVS_VAULT } from "../../vips/vip-410/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

forking(45126615, async () => {
  let comptroller: Contract;
  let xvsVault: Contract;

  describe("Pre-VIP behaviour", () => {
    before(async () => {
      comptroller = new ethers.Contract(BSC_COMPTROLLER, COMPTROLLER_ABI, ethers.provider);
      xvsVault = new ethers.Contract(BSC_XVS_VAULT, XVS_VAULT_ABI, ethers.provider);
    });

    it("check XVS vault speed", async () => {
      expect(await xvsVault.rewardTokenAmountsPerBlockOrSecond(BSC_XVS)).to.equals("52083333333333334");
    });

    it("check VAI vault rate", async () => {
      expect(await comptroller.venusVAIVaultRate()).to.equals("4340277777777780");
    });

    it("check XVS market speed", async () => {
      expect(await comptroller.venusSupplySpeeds(BSC_XVS_MARKET)).to.equals("1388888888888888");
    });
  });

  testVip("vip-410", await vip410(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [3, 0],
      );

      await expectEvents(
        txResponse,
        [XVS_VAULT_ABI, COMPTROLLER_ABI],
        ["RewardAmountUpdated", "NewVenusVAIVaultRate", "VenusSupplySpeedUpdated"],
        [1, 1, 1],
      );
    },
  });

  describe("Post-VIP behavior", () => {
    it("check XVS vault speed", async () => {
      expect(await xvsVault.rewardTokenAmountsPerBlockOrSecond(BSC_XVS)).to.equals("15312500000000000");
    });

    it("check VAI vault rate", async () => {
      expect(await comptroller.venusVAIVaultRate()).to.equals("3255787037037037");
    });

    it("check XVS market speed", async () => {
      expect(await comptroller.venusSupplySpeeds(BSC_XVS_MARKET)).to.equals("1041666666666666");
    });
  });
});
