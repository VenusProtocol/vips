import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import {
  ARB_DISTRIBUTION_SPEED,
  ARB_RELEASE_AMOUNT,
  ARB_XVS_VAULT_TREASURY,
  vip475,
} from "../../vips/vip-475/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import XVS_VAULT_ABI from "./abi/XVVaultProxy.json";
import XVS_VAULT_TREASURY from "./abi/XVSVaultTreasury.json";
import { NETWORK_ADDRESSES } from "src/networkAddresses";

const {arbitrumone}  = NETWORK_ADDRESSES; 
const XVS_STORE = "0x507D9923c954AAD8eC530ed8Dedb75bFc893Ec5e";

forking(323905381, async () => {
  let xvs: Contract;
  let xvsBalanceBefore: BigNumber;

  before(async () => {
    xvs = new ethers.Contract(arbitrumone.XVS, ERC20_ABI, ethers.provider);
    xvsBalanceBefore = await xvs.balanceOf(XVS_STORE);
  });

  testForkedNetworkVipCommands("VIP-475", await vip475(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [XVS_VAULT_TREASURY], ["FundsTransferredToXVSStore"], [1]);
      await expectEvents(txResponse, [XVS_VAULT_ABI], ["RewardAmountUpdated"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check balances", async () => {
      const xvsBalanceAfter = await xvs.balanceOf(XVS_STORE);
      expect(xvsBalanceAfter.sub(xvsBalanceBefore)).to.equal(ARB_RELEASE_AMOUNT);
    });

    it("check distribution speed", async () => {
      const vault = new ethers.Contract(arbitrumone.XVS_VAULT_PROXY, XVS_VAULT_ABI, ethers.provider);
      const distributionSpeed = await vault.rewardTokenAmountsPerBlockOrSecond(arbitrumone.XVS);
      expect(distributionSpeed).to.equal(ARB_DISTRIBUTION_SPEED);
    })
  });
});
