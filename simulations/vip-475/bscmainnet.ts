import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip475, {
  BSC_DISTRIBUTION_SPEED,
  BSC_RELEASE_AMOUNT 
} from "../../vips/vip-475/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import XVS_VAULT_ABI from "./abi/XVVaultProxy.json";
import XVS_VAULT_TREASURY from "./abi/XVSVaultTreasury.json";
import { NETWORK_ADDRESSES } from "src/networkAddresses";

const {bscmainnet}  = NETWORK_ADDRESSES; 
const XVS_STORE = "0x1e25CF968f12850003Db17E0Dba32108509C4359";

forking(48151669, async () => {
  let xvs: Contract;
  let xvsBalanceBefore: BigNumber;

  before(async () => {
    xvs = new ethers.Contract(bscmainnet.XVS, ERC20_ABI, ethers.provider);
    xvsBalanceBefore = await xvs.balanceOf(XVS_STORE);
  });

  testVip("VIP-475", await vip475(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [XVS_VAULT_TREASURY], ["FundsTransferredToXVSStore"], [1]);
      await expectEvents(txResponse, [XVS_VAULT_ABI], ["RewardAmountUpdated"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check balances", async () => {
      const xvsBalanceAfter = await xvs.balanceOf(XVS_STORE);
      expect(xvsBalanceAfter.sub(xvsBalanceBefore)).to.equal(BSC_RELEASE_AMOUNT);
    });

    it("check distribution speed", async () => {
      const vault = new ethers.Contract(bscmainnet.XVS_VAULT_PROXY, XVS_VAULT_ABI, ethers.provider);
      const distributionSpeed = await vault.rewardTokenAmountsPerBlockOrSecond(bscmainnet.XVS);
      expect(distributionSpeed).to.equal(BSC_DISTRIBUTION_SPEED);
    })
  });
});
