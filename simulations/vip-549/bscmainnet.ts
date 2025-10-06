import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip549, {
  BSC_SPEED,
  BSC_XVS_AMOUNT,
  BSC_XVS_STORE,
  BSC_XVS_VAULT_TREASURY,
  UNICHAIN_XVS_BRIDGE_AMOUNT,
  ZKSYNC_XVS_BRIDGE_AMOUNT,
} from "../../vips/vip-549/bscmainnet";
import CORE_COMPTROLLER_ABI from "./abi/CoreComptroller.json";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import XVS_ABI from "./abi/XVS.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(63648367, async () => {
  let provider: any;
  let xvs: any;
  let comptrollerPreviousXVSBalance: any;
  let xvsVaultTreasuryPreviousXVSBalance: any;
  let xvsStorePreviousXVSBalance: any;
  let xvsVault: any;

  before(async () => {
    provider = ethers.provider;
    xvs = new ethers.Contract(bscmainnet.XVS, XVS_ABI, provider);
    comptrollerPreviousXVSBalance = await xvs.balanceOf(bscmainnet.UNITROLLER);
    xvsVaultTreasuryPreviousXVSBalance = await xvs.balanceOf(BSC_XVS_VAULT_TREASURY);
    xvsStorePreviousXVSBalance = await xvs.balanceOf(BSC_XVS_STORE);
    xvsVault = new ethers.Contract(bscmainnet.XVS_VAULT_PROXY, XVS_VAULT_ABI, provider);
  });

  testVip("vip-549", await vip549(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [4, 0],
      );

      await expectEvents(txResponse, [CORE_COMPTROLLER_ABI], ["VenusGranted"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("should transfer XVS from the Comptroller", async () => {
      const comptrollerXVSBalanceAfter = await xvs.balanceOf(bscmainnet.UNITROLLER);
      expect(comptrollerXVSBalanceAfter).to.equal(
        comptrollerPreviousXVSBalance.sub(ZKSYNC_XVS_BRIDGE_AMOUNT.add(UNICHAIN_XVS_BRIDGE_AMOUNT)),
      );
    });

    it("should transfer XVS from the XVS Vault Treasury to the XVS Store", async () => {
      const xvsVaultTreasuryXVSBalanceAfter = await xvs.balanceOf(BSC_XVS_VAULT_TREASURY);
      expect(xvsVaultTreasuryXVSBalanceAfter).to.equal(xvsVaultTreasuryPreviousXVSBalance.sub(BSC_XVS_AMOUNT));

      const xvsStoreXVSBalanceAfter = await xvs.balanceOf(BSC_XVS_STORE);
      expect(xvsStoreXVSBalanceAfter).to.equal(xvsStorePreviousXVSBalance.add(BSC_XVS_AMOUNT));
    });

    it("should update the XVS distribution speed", async () => {
      const speed = await xvsVault.rewardTokenAmountsPerBlockOrSecond(bscmainnet.XVS);
      expect(speed).to.equal(BSC_SPEED);
    });
  });
});
