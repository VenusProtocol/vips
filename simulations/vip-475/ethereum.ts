import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import {
  ETH_DISTRIBUTION_SPEED,
  ETH_RELEASE_AMOUNT,
  ETH_XVS_VAULT_TREASURY,
  vip475,
} from "../../vips/vip-475/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import XVS_VAULT_ABI from "./abi/XVVaultProxy.json";
import XVS_VAULT_TREASURY from "./abi/XVSVaultTreasury.json";
import { NETWORK_ADDRESSES } from "src/networkAddresses";

const {ethereum}  = NETWORK_ADDRESSES; 
const XVS_STORE = "0x1Db646E1Ab05571AF99e47e8F909801e5C99d37B";

forking(22217734, async () => {
  let xvs: Contract;
  let xvsBalanceBefore: BigNumber;

  before(async () => {
    xvs = new ethers.Contract(ethereum.XVS, ERC20_ABI, ethers.provider);
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
      expect(xvsBalanceAfter.sub(xvsBalanceBefore)).to.equal(ETH_RELEASE_AMOUNT);
    });

    it("check distribution speed", async () => {
      const vault = new ethers.Contract(ethereum.XVS_VAULT_PROXY, XVS_VAULT_ABI, ethers.provider);
      const distributionSpeed = await vault.rewardTokenAmountsPerBlockOrSecond(ethereum.XVS);
      expect(distributionSpeed).to.equal(ETH_DISTRIBUTION_SPEED);
    })
  });
});
