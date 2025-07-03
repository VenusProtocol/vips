import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip528, {
  DISTRIBUTION_SPEED_BSC,
  TOTAL_XVS,
} from "../../vips/vip-528/bscmainnet";
import CORE_COMPTROLLER_ABI from "./abi/CoreComptroller.json";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import XVS_ABI from "./abi/XVS.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
const { bscmainnet } = NETWORK_ADDRESSES;

const oldRewardTokenAmountsPerBlockOrSecond = ethers.BigNumber.from("14314236111111111");

forking(52704740, async () => {
  let comptroller: Contract;
  let xvsVault: Contract;
  let provider: any;
  let xvs: any;
  let comptrollerPreviousXVSBalance: any;

  describe("Pre-VIP behaviour", () => {
    before(async () => {
      comptroller = new ethers.Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, ethers.provider);
      xvsVault = new ethers.Contract(bscmainnet.XVS_VAULT_PROXY, XVS_VAULT_ABI, ethers.provider);
      provider = ethers.provider;
      xvs = new ethers.Contract(bscmainnet.XVS, XVS_ABI, provider);
      comptrollerPreviousXVSBalance = await xvs.balanceOf(bscmainnet.UNITROLLER);
    });

    it("check XVS vault speed", async () => {
      expect(await xvsVault.rewardTokenAmountsPerBlockOrSecond(bscmainnet.XVS)).to.equals(
        oldRewardTokenAmountsPerBlockOrSecond,
      );
    });
  });

  testVip("vip-528", await vip528(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [4, 0],
      );

      await expectEvents(
        txResponse,
        [XVS_VAULT_ABI],
        ["RewardAmountUpdated", ],
        [1],
      );

      await expectEvents(txResponse, [CORE_COMPTROLLER_ABI], ["VenusGranted"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("should transfer XVS from the Comptroller", async () => {
      const comptrollerXVSBalanceAfter = await xvs.balanceOf(bscmainnet.UNITROLLER);
      expect(comptrollerXVSBalanceAfter).to.equal(
        comptrollerPreviousXVSBalance.sub(TOTAL_XVS),
      );
    });
  });

  describe("Post-VIP behavior", () => {
    it("check XVS vault speed", async () => {
      expect(await xvsVault.rewardTokenAmountsPerBlockOrSecond(bscmainnet.XVS)).to.equals(DISTRIBUTION_SPEED_BSC);
    });
  });
});
