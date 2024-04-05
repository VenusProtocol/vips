import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, pretendExecutingVip, testVip } from "../../src/vip-framework";
import { checkXVSVault } from "../../src/vip-framework/checks/checkXVSVault";
import { vip279 } from "../../vips/vip-279/bscmainnet";
import {
  VTREASURY,
  XVS,
  XVS_DISTRIBUTION_SPEED,
  XVS_FOR_V_TREASURY,
  XVS_FOR_XVS_STORE,
  XVS_VAULT,
  vip280,
} from "../../vips/vip-280/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";
import XVS_VAULT_TREASURY_ABI from "./abi/XVSVaultTreasury.json";

const XVS_STORE = "0x1e25CF968f12850003Db17E0Dba32108509C4359";

forking(37533772, () => {
  const provider = ethers.provider;
  let xvs: Contract;
  let xvsVault: Contract;
  let previousXVSStoreBalance: BigNumber;
  let previousVTreasuryBalance: BigNumber;

  before(async () => {
    await pretendExecutingVip(vip279());

    xvs = new ethers.Contract(XVS, ERC20_ABI, provider);
    xvsVault = new ethers.Contract(XVS_VAULT, XVS_VAULT_ABI, provider);

    previousXVSStoreBalance = await xvs.balanceOf(XVS_STORE);
    previousVTreasuryBalance = await xvs.balanceOf(VTREASURY);
  });

  testVip("VIP-280", vip280(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [XVS_VAULT_TREASURY_ABI], ["SweepToken", "FundsTransferredToXVSStore"], [1, 1]);
      await expectEvents(txResponse, [XVS_VAULT_ABI], ["RewardAmountUpdated"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check XVS balance of XVSStore", async () => {
      const newXVSStoreBalance = await xvs.balanceOf(XVS_STORE);
      expect(newXVSStoreBalance).to.be.equal(previousXVSStoreBalance.add(XVS_FOR_XVS_STORE));
    });

    it("check XVS balance of VTreasury", async () => {
      const newVTreasuryBalance = await xvs.balanceOf(VTREASURY);
      expect(newVTreasuryBalance).to.be.equal(previousVTreasuryBalance.add(XVS_FOR_V_TREASURY));
    });

    it("check XVS distribution speed", async () => {
      expect(await xvsVault.rewardTokenAmountsPerBlock(XVS)).to.be.equal(XVS_DISTRIBUTION_SPEED);
    });

    checkXVSVault();
  });
});
