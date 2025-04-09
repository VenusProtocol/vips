import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip477, {
  BSC_DISTRIBUTION_SPEED,
  BSC_RELEASE_AMOUNT,
  BSC_XVS_STORE_AMOUNT,
} from "../../vips/vip-477/bscmainnet";
import CORE_COMPTROLLER_ABI from "./abi/CoreComptroller.json";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import XVS_ABI from "./abi/XVS.json";
import XVS_VAULT_TREASURY from "./abi/XVSVaultTreasury.json";
import XVS_VAULT_ABI from "./abi/XVVaultProxy.json";

const { bscmainnet } = NETWORK_ADDRESSES;
const XVS_STORE = "0x1e25CF968f12850003Db17E0Dba32108509C4359";

forking(48151669, async () => {
  let xvs: Contract;
  let xvsBalanceBefore: BigNumber;

  before(async () => {
    xvs = new ethers.Contract(bscmainnet.XVS, XVS_ABI, ethers.provider);
    xvsBalanceBefore = await xvs.balanceOf(XVS_STORE);
  });

  testVip("VIP-477", await vip477(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [XVS_VAULT_TREASURY], ["FundsTransferredToXVSStore"], [1]);
      await expectEvents(txResponse, [XVS_VAULT_ABI], ["RewardAmountUpdated"], [1]);
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [3, 0],
      );
      await expectEvents(txResponse, [CORE_COMPTROLLER_ABI], ["VenusGranted"], [2]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check balances", async () => {
      const xvsBalanceAfter = await xvs.balanceOf(XVS_STORE);
      expect(xvsBalanceAfter.sub(xvsBalanceBefore)).to.equal(BSC_RELEASE_AMOUNT.add(BSC_XVS_STORE_AMOUNT));
    });

    it("check distribution speed", async () => {
      const vault = new ethers.Contract(bscmainnet.XVS_VAULT_PROXY, XVS_VAULT_ABI, ethers.provider);
      const distributionSpeed = await vault.rewardTokenAmountsPerBlockOrSecond(bscmainnet.XVS);
      expect(distributionSpeed).to.equal(BSC_DISTRIBUTION_SPEED);
    });
  });
});
