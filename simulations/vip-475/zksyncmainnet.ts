import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import {
  ZKSYNC_DISTRIBUTION_SPEED,
  vip475,
} from "../../vips/vip-475/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import XVS_VAULT_ABI from "./abi/XVVaultProxy.json";
import { NETWORK_ADDRESSES } from "src/networkAddresses";

const {zksyncmainnet}  = NETWORK_ADDRESSES; 

forking(58794907, async () => {
  let xvs: Contract;

  before(async () => {
    xvs = new ethers.Contract(zksyncmainnet.XVS, ERC20_ABI, ethers.provider);
  });

  testForkedNetworkVipCommands("VIP-475", await vip475(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [XVS_VAULT_ABI], ["RewardAmountUpdated"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check distribution speed", async () => {
      const vault = new ethers.Contract(zksyncmainnet.XVS_VAULT_PROXY, XVS_VAULT_ABI, ethers.provider);
      const distributionSpeed = await vault.rewardTokenAmountsPerBlockOrSecond(zksyncmainnet.XVS);
      expect(distributionSpeed).to.equal(ZKSYNC_DISTRIBUTION_SPEED);
    })
  });
});
