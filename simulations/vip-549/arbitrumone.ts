import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip549, {
  ARB_SPEED,
  ARB_XVS_AMOUNT,
  ARB_XVS_STORE,
  ARB_XVS_VAULT_TREASURY,
} from "../../vips/vip-549/bscmainnet";
import XVS_ABI from "./abi/XVS.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";

const { arbitrumone } = NETWORK_ADDRESSES;

forking(384936750, async () => {
  let provider: any;
  let xvs: any;
  let xvsVaultTreasuryPreviousXVSBalance: any;
  let xvsStorePreviousXVSBalance: any;
  let xvsVault: any;

  before(async () => {
    provider = ethers.provider;
    xvs = new ethers.Contract(arbitrumone.XVS, XVS_ABI, provider);
    xvsVaultTreasuryPreviousXVSBalance = await xvs.balanceOf(ARB_XVS_VAULT_TREASURY);
    xvsStorePreviousXVSBalance = await xvs.balanceOf(ARB_XVS_STORE);
    xvsVault = new ethers.Contract(arbitrumone.XVS_VAULT_PROXY, XVS_VAULT_ABI, provider);
  });

  testForkedNetworkVipCommands("vip-549", await vip549());

  describe("Post-VIP behavior", async () => {
    it("should transfer XVS from the XVS Vault Treasury to the XVS Store", async () => {
      const xvsVaultTreasuryXVSBalanceAfter = await xvs.balanceOf(ARB_XVS_VAULT_TREASURY);
      expect(xvsVaultTreasuryXVSBalanceAfter).to.equal(xvsVaultTreasuryPreviousXVSBalance.sub(ARB_XVS_AMOUNT));

      const xvsStoreXVSBalanceAfter = await xvs.balanceOf(ARB_XVS_STORE);
      expect(xvsStoreXVSBalanceAfter).to.equal(xvsStorePreviousXVSBalance.add(ARB_XVS_AMOUNT));
    });

    it("should update the XVS distribution speed", async () => {
      const speed = await xvsVault.rewardTokenAmountsPerBlockOrSecond(arbitrumone.XVS);
      expect(speed).to.equal(ARB_SPEED);
    });
  });
});
