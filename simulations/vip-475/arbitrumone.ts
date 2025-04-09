import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import {
  ARB_DISTRIBUTION_SPEED,
  ARB_RELEASE_AMOUNT,
  ARB_XVS_STORE_AMOUNT,
  vip475,
} from "../../vips/vip-475/bscmainnet";
import VTREASURY_ABI from "./abi/VTreasury.json";
import XVS_ABI from "./abi/XVS.json";
import XVS_VAULT_TREASURY from "./abi/XVSVaultTreasury.json";
import XVS_VAULT_ABI from "./abi/XVVaultProxy.json";

const { arbitrumone } = NETWORK_ADDRESSES;
const XVS_STORE = "0x507D9923c954AAD8eC530ed8Dedb75bFc893Ec5e";
const BRIDGE = "0x20cEa49B5F7a6DBD78cAE772CA5973eF360AA1e6";

forking(323905381, async () => {
  const xvs = new ethers.Contract(arbitrumone.XVS, XVS_ABI, ethers.provider);
  const vTreasury = new ethers.Contract(arbitrumone.VTREASURY, VTREASURY_ABI, ethers.provider);
  let xvsBalanceBefore: BigNumber;

  before(async () => {
    await impersonateAccount(BRIDGE);
    await setBalance(BRIDGE, parseUnits("1000000", 18));
    await xvs.connect(await ethers.getSigner(BRIDGE)).mint(arbitrumone.VTREASURY, ARB_XVS_STORE_AMOUNT.toString());

    xvsBalanceBefore = await xvs.balanceOf(XVS_STORE);
  });

  testForkedNetworkVipCommands("VIP-475", await vip475(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [XVS_VAULT_TREASURY], ["FundsTransferredToXVSStore"], [1]);
      await expectEvents(txResponse, [XVS_VAULT_ABI], ["RewardAmountUpdated"], [1]);
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryToken"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check balances", async () => {
      const xvsBalanceAfter = await xvs.balanceOf(XVS_STORE);
      expect(xvsBalanceAfter.sub(xvsBalanceBefore)).to.equal(ARB_RELEASE_AMOUNT.add(ARB_XVS_STORE_AMOUNT));
    });

    it("check distribution speed", async () => {
      const vault = new ethers.Contract(arbitrumone.XVS_VAULT_PROXY, XVS_VAULT_ABI, ethers.provider);
      const distributionSpeed = await vault.rewardTokenAmountsPerBlockOrSecond(arbitrumone.XVS);
      expect(distributionSpeed).to.equal(ARB_DISTRIBUTION_SPEED);
    });
  });
});
