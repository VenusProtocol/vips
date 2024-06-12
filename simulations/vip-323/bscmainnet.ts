import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip323, {
  BTCB_PRIME_CONVERTER,
  PROTOCOL_SHARE_RESERVE_PROXY,
  USDC_PRIME_CONVERTER,
  USDT_PRIME_CONVERTER,
  VTREASURY,
  XVS_VAULT_CONVERTER,
  XVS_VAULT_REWARDS_SPEED,
} from "../../vips/vip-323/bscmainnet";
import PSR_ABI from "./abi/ProtocolShareReserve.json";
import XVS_VAULT_ABI from "./abi/XVSVaultProxy.json";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(39555400, () => {
  let psr: Contract;
  let xvsVault: Contract;

  before(async () => {
    psr = await ethers.getContractAt(PSR_ABI, PROTOCOL_SHARE_RESERVE_PROXY);
    xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, bscmainnet.XVS_VAULT_PROXY);
  });

  testVip("VIP-323 Update Distribution rules on PSR", vip323(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PSR_ABI], ["DistributionConfigUpdated"], [10]);
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

    it("Should update reward speeds correctly", async () => {
      expect(await xvsVault.rewardTokenAmountsPerBlockOrSecond(bscmainnet.XVS)).to.be.equal(XVS_VAULT_REWARDS_SPEED);
    });
  });
});
