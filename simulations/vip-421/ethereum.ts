import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import { ETHEREUM_XVS_AMOUNT, ETHEREUM_XVS_SPEED, vip421 } from "../../vips/vip-421/bscmainnet";
import XVS_ABI from "./abi/XVS.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";

const { ethereum } = NETWORK_ADDRESSES;
const XVS_STORE = "0x1Db646E1Ab05571AF99e47e8F909801e5C99d37B";

forking(21593471, async () => {
  let xvsStorePreviousBalance: BigNumber;
  const xvs = new ethers.Contract(ethereum.XVS, XVS_ABI, ethers.provider);
  const xvsVault = new ethers.Contract(ethereum.XVS_VAULT_PROXY, XVS_VAULT_ABI, ethers.provider);

  before(async () => {
    xvsStorePreviousBalance = await xvs.balanceOf(XVS_STORE);
  });

  testForkedNetworkVipCommands("XVS", await vip421());

  describe("Post-Execution state", () => {
    it("should transfer XVS to the store", async () => {
      const xvsStoreBalance = await xvs.balanceOf(XVS_STORE);
      expect(xvsStoreBalance).to.equal(xvsStorePreviousBalance.add(ETHEREUM_XVS_AMOUNT));
    });

    it("check speed", async () => {
      const speed = await xvsVault.rewardTokenAmountsPerBlockOrSecond(ethereum.XVS);
      expect(speed).to.equal(ETHEREUM_XVS_SPEED);
    });
  });
});
