import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip790, {
  ETH_SPEED,
  ETH_XVS_AMOUNT,
  ETH_XVS_STORE,
  ETH_XVS_VAULT_TREASURY,
} from "../../vips/vip-790/bscmainnet";
import XVS_ABI from "./abi/XVS.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";

const { ethereum } = NETWORK_ADDRESSES;

forking(24183252, async () => {
  let provider: any;
  let xvs: any;
  let xvsVaultTreasuryPreviousXVSBalance: any;
  let xvsStorePreviousXVSBalance: any;
  let xvsVault: any;

  before(async () => {
    provider = ethers.provider;
    xvs = new ethers.Contract(ethereum.XVS, XVS_ABI, provider);
    xvsVaultTreasuryPreviousXVSBalance = await xvs.balanceOf(ETH_XVS_VAULT_TREASURY);
    xvsStorePreviousXVSBalance = await xvs.balanceOf(ETH_XVS_STORE);
    xvsVault = new ethers.Contract(ethereum.XVS_VAULT_PROXY, XVS_VAULT_ABI, provider);
  });

  testForkedNetworkVipCommands("vip-790", await vip790());

  describe("Post-VIP behavior", async () => {
    it("should transfer XVS from the XVS Vault Treasury to the XVS Store", async () => {
      const xvsVaultTreasuryXVSBalanceAfter = await xvs.balanceOf(ETH_XVS_VAULT_TREASURY);
      expect(xvsVaultTreasuryXVSBalanceAfter).to.equal(xvsVaultTreasuryPreviousXVSBalance.sub(ETH_XVS_AMOUNT));

      const xvsStoreXVSBalanceAfter = await xvs.balanceOf(ETH_XVS_STORE);
      expect(xvsStoreXVSBalanceAfter).to.equal(xvsStorePreviousXVSBalance.add(ETH_XVS_AMOUNT));
    });

    it("should update the XVS distribution speed", async () => {
      const speed = await xvsVault.rewardTokenAmountsPerBlockOrSecond(ethereum.XVS);
      expect(speed).to.equal(ETH_SPEED);
    });
  });
});
