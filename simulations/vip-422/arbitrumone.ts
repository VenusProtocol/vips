import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import { ARBITRUMONE_XVS_AMOUNT, ARBITRUMONE_XVS_SPEED, vip422 } from "../../vips/vip-422/bscmainnet";
import XVS_ABI from "./abi/XVS.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";

const { arbitrumone } = NETWORK_ADDRESSES;
const XVS_STORE = "0x507D9923c954AAD8eC530ed8Dedb75bFc893Ec5e";

forking(294039288, async () => {
  let xvsStorePreviousBalance: BigNumber;
  const xvs = new ethers.Contract(arbitrumone.XVS, XVS_ABI, ethers.provider);
  const xvsVault = new ethers.Contract(arbitrumone.XVS_VAULT_PROXY, XVS_VAULT_ABI, ethers.provider);

  before(async () => {
    xvsStorePreviousBalance = await xvs.balanceOf(XVS_STORE);
  });

  testForkedNetworkVipCommands("XVS", await vip422());

  describe("Post-Execution state", () => {
    it("should transfer XVS to the store", async () => {
      const xvsStoreBalance = await xvs.balanceOf(XVS_STORE);
      expect(xvsStoreBalance).to.equal(xvsStorePreviousBalance.add(ARBITRUMONE_XVS_AMOUNT));
    });

    it("check speed", async () => {
      const speed = await xvsVault.rewardTokenAmountsPerBlockOrSecond(arbitrumone.XVS);
      expect(speed).to.equal(ARBITRUMONE_XVS_SPEED);
    });
  });
});
