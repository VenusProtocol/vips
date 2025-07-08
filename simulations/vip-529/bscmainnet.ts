import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip529, {
  DISTRIBUTION_SPEED_BSC,
  RELEASE_AMOUNT_BSC,
  TOTAL_XVS,
  XVS_STORE_BSC,
  XVS_TOTAL_AMOUNT_BSC,
} from "../../vips/vip-529/bscmainnet";
import CORE_COMPTROLLER_ABI from "./abi/CoreComptroller.json";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import XVS_ABI from "./abi/XVS.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const oldRewardTokenAmountsPerBlockOrSecond = ethers.BigNumber.from("14314236111111111");

forking(52704740, async () => {
  let xvsVault: Contract;
  let provider: any;
  let xvs: any;
  let comptrollerPreviousXVSBalance: any;
  let xvsStorePreviousBalance: any;

  describe("Pre-VIP behaviour", () => {
    before(async () => {
      xvsVault = new ethers.Contract(bscmainnet.XVS_VAULT_PROXY, XVS_VAULT_ABI, ethers.provider);
      provider = ethers.provider;
      xvs = new ethers.Contract(bscmainnet.XVS, XVS_ABI, provider);
      comptrollerPreviousXVSBalance = await xvs.balanceOf(bscmainnet.UNITROLLER);
      xvsStorePreviousBalance = await xvs.balanceOf(XVS_STORE_BSC);
    });

    it("check XVS vault speed", async () => {
      expect(await xvsVault.rewardTokenAmountsPerBlockOrSecond(bscmainnet.XVS)).to.equals(
        oldRewardTokenAmountsPerBlockOrSecond,
      );
    });
  });

  testVip("vip-529", await vip529(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [4, 0],
      );

      await expectEvents(txResponse, [XVS_VAULT_ABI], ["RewardAmountUpdated"], [1]);

      await expectEvents(txResponse, [CORE_COMPTROLLER_ABI], ["VenusGranted"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("should transfer XVS from the Comptroller", async () => {
      const comptrollerXVSBalanceAfter = await xvs.balanceOf(bscmainnet.UNITROLLER);
      expect(comptrollerXVSBalanceAfter).to.equal(comptrollerPreviousXVSBalance.sub(TOTAL_XVS));
    });

    it("check XVS vault speed", async () => {
      expect(await xvsVault.rewardTokenAmountsPerBlockOrSecond(bscmainnet.XVS)).to.equals(DISTRIBUTION_SPEED_BSC);
    });

    it("should transfer XVS to the XVS Store", async () => {
      const xvsStoreBalanceAfter = await xvs.balanceOf(XVS_STORE_BSC);
      expect(xvsStoreBalanceAfter).to.equal(xvsStorePreviousBalance.add(XVS_TOTAL_AMOUNT_BSC).add(RELEASE_AMOUNT_BSC));
    });
  });
});
