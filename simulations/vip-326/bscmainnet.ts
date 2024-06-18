import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip326, {
  BTCB_PRIME_CONVERTER,
  COMPTROLLER_CORE_RELEASE_AMOUNT,
  PROTOCOL_SHARE_RESERVE_PROXY,
  USDC_PRIME_CONVERTER,
  USDT_PRIME_CONVERTER,
  VTREASURY,
  XVS_STORE,
  XVS_VAULT_CONVERTER,
  XVS_VAULT_REWARDS_SPEED,
  XVS_VAULT_TREASURY_RELEASE_AMOUNT,
} from "../../vips/vip-326/bscmainnet";
import PSR_ABI from "./abi/ProtocolShareReserve.json";
import REWARD_FACET_ABI from "./abi/RewardFacet.json";
import XVS_VAULT_ABI from "./abi/XVSVaultProxy.json";
import XVS_VAULT_TREASURY_ABI from "./abi/XVSVaultTreasury.json";
import XVS_ABI from "./abi/Xvs.json";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(39555400, () => {
  let psr: Contract;
  let xvs: Contract;
  let xvsVault: Contract;
  let oldXvsStoreBalance: BigNumber;

  before(async () => {
    psr = await ethers.getContractAt(PSR_ABI, PROTOCOL_SHARE_RESERVE_PROXY);
    xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, bscmainnet.XVS_VAULT_PROXY);
    xvs = new ethers.Contract(bscmainnet.XVS, XVS_ABI, ethers.provider);
    oldXvsStoreBalance = await xvs.balanceOf(XVS_STORE);
  });

  testVip("VIP-326 Update Distribution rules on PSR", vip326(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PSR_ABI], ["DistributionConfigUpdated"], [10]);
      await expectEvents(txResponse, [XVS_VAULT_TREASURY_ABI], ["FundsTransferredToXVSStore"], [1]);
      await expectEvents(txResponse, [REWARD_FACET_ABI], ["VenusGranted"], [1]);
    },
  });

  describe("Post-Execution", () => {
    it("Should update the distribution config correctly", async () => {
      const distributionsLength = await psr.totalDistributions();
      expect(distributionsLength).to.be.equal(8);

      for (let i = 0; i < distributionsLength; i++) {
        const target = await psr.distributionTargets(i);

        if (target[2] == XVS_VAULT_CONVERTER) {
          expect(target[1]).to.be.equal(2000);
        } else if (target[2] == VTREASURY && target[0] == 0) {
          expect(target[1]).to.be.equal(6000);
        } else if (target[2] == VTREASURY && target[0] == 1) {
          expect(target[1]).to.be.equal(8000);
        } else if (target[2] == USDC_PRIME_CONVERTER) {
          expect(target[1]).to.be.equal(800);
        } else if (target[2] == USDT_PRIME_CONVERTER) {
          expect(target[1]).to.be.equal(800);
        } else if (target[2] == BTCB_PRIME_CONVERTER) {
          expect(target[1]).to.be.equal(100);
        } else {
          expect(target[1]).to.be.equal(300);
        }
      }
    });

    it("balance of xvs store should increase", async () => {
      expect(await xvs.balanceOf(XVS_STORE)).to.be.equal(
        oldXvsStoreBalance.add(XVS_VAULT_TREASURY_RELEASE_AMOUNT).add(COMPTROLLER_CORE_RELEASE_AMOUNT),
      );
    });

    it("Should update reward speeds correctly", async () => {
      expect(await xvsVault.rewardTokenAmountsPerBlockOrSecond(bscmainnet.XVS)).to.be.equal(XVS_VAULT_REWARDS_SPEED);
    });
  });
});
