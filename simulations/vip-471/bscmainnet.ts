import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip471, {
  BSC_COMPTROLLER,
  BSC_VAI_VAULT_RATE,
  BSC_XVS,
  BSC_XVS_MARKET,
  BSC_XVS_VAULT,
  BSC_XVS_VAULT_RATE,
  TOTAL_XVS,
} from "../../vips/vip-471/bscmainnet";
import CORE_COMPTROLLER_ABI from "./abi/CoreComptroller.json";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import XVS_ABI from "./abi/XVS.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

// when the command "setVenusVAIVaultRate(uint256 venusVAIVaultRate_)" in vip-469,
// it sets the amount of XVS distributed per block to VAI Vault. At the same time,
// internally it executes "releaseToVault()" which transfer XVS from comptroller to VAI Vault
// these XVS are extracted apart from TOTAL_XVS
const xvsFetchedInVaiVault = ethers.BigNumber.from("284139046296296293064");
const oldRewardTokenAmountsPerBlockOrSecond = ethers.BigNumber.from("50000000000000000");
const oldVenusVAIVaultRat = ethers.BigNumber.from("3255787037037037");
const oldVenusSupplySpeeds = ethers.BigNumber.from("1041666666666666");
const newVenusSupplySpeeds = ethers.BigNumber.from("781250000000000");

forking(47621639, async () => {
  let comptroller: Contract;
  let xvsVault: Contract;
  let provider: any;
  let xvs: any;
  let comptrollerPreviousXVSBalance: any;

  describe("Pre-VIP behaviour", () => {
    before(async () => {
      comptroller = new ethers.Contract(BSC_COMPTROLLER, COMPTROLLER_ABI, ethers.provider);
      xvsVault = new ethers.Contract(BSC_XVS_VAULT, XVS_VAULT_ABI, ethers.provider);
      provider = ethers.provider;
      xvs = new ethers.Contract(BSC_XVS, XVS_ABI, provider);
      comptrollerPreviousXVSBalance = await xvs.balanceOf(BSC_COMPTROLLER);
    });

    it("check XVS vault speed", async () => {
      expect(await xvsVault.rewardTokenAmountsPerBlockOrSecond(BSC_XVS)).to.equals(
        oldRewardTokenAmountsPerBlockOrSecond,
      );
    });

    it("check VAI vault rate", async () => {
      expect(await comptroller.venusVAIVaultRate()).to.equals(oldVenusVAIVaultRat);
    });

    it("check XVS market speed", async () => {
      expect(await comptroller.venusSupplySpeeds(BSC_XVS_MARKET)).to.equals(oldVenusSupplySpeeds);
    });
  });

  testVip("vip-471", await vip471(), {
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

      await expectEvents(txResponse, [CORE_COMPTROLLER_ABI], ["VenusGranted"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("should transfer XVS from the Comptroller", async () => {
      const comptrollerXVSBalanceAFter = await xvs.balanceOf(BSC_COMPTROLLER);
      expect(comptrollerXVSBalanceAFter).to.equal(
        comptrollerPreviousXVSBalance.sub(TOTAL_XVS).sub(xvsFetchedInVaiVault),
      );
    });
  });

  describe("Post-VIP behavior", () => {
    it("check XVS vault speed", async () => {
      expect(await xvsVault.rewardTokenAmountsPerBlockOrSecond(BSC_XVS)).to.equals(BSC_XVS_VAULT_RATE);
    });

    it("check VAI vault rate", async () => {
      expect(await comptroller.venusVAIVaultRate()).to.equals(BSC_VAI_VAULT_RATE);
    });

    it("check XVS market speed", async () => {
      expect(await comptroller.venusSupplySpeeds(BSC_XVS_MARKET)).to.equals(newVenusSupplySpeeds);
    });
  });
});
