import { TransactionResponse } from "@ethersproject/providers";
import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import {
  DEFAULT_PROXY_ADMIN,
  VTREASURY,
  XVS,
  XVS_FOR_V_TREASURY,
  XVS_VAULT_TREASURY,
  XVS_VAULT_TREASURY_NEW_IMPLEMENTATION,
  vip279,
} from "../../vips/vip-279/bsctestnet";
import ERC20_ABI from "./abi/ERC20.json";
import XVS_VAULT_TREASURY_ABI from "./abi/XVSVaultTreasury.json";
import PROXY_ABI from "./abi/XVSVaultTreasuryProxy.json";

const XVS_VAULT_TREASURY_OLD_IMPLEMENTATION = "0x5369D9b7ABB78FE9De0Db0310D83159029f0d291";

forking(39145203, () => {
  const provider = ethers.provider;
  let xvsVaultTreasuryProxy: Contract;
  let xvs: Contract;
  let previousVTreasuryBalance: BigNumber;

  before(async () => {
    await impersonateAccount(DEFAULT_PROXY_ADMIN);
    xvsVaultTreasuryProxy = new ethers.Contract(
      XVS_VAULT_TREASURY,
      PROXY_ABI,
      ethers.provider.getSigner(DEFAULT_PROXY_ADMIN),
    );
    xvs = new ethers.Contract(XVS, ERC20_ABI, provider);

    previousVTreasuryBalance = await xvs.balanceOf(VTREASURY);
  });

  describe("Pre-VIP behavior", async () => {
    it("check implementation", async () => {
      expect(await xvsVaultTreasuryProxy.callStatic.implementation()).to.be.equal(
        XVS_VAULT_TREASURY_OLD_IMPLEMENTATION,
      );
    });
  });

  testVip("VIP-279", vip279(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [XVS_VAULT_TREASURY_ABI], ["SweepToken"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check implementation", async () => {
      expect(await xvsVaultTreasuryProxy.callStatic.implementation()).to.be.equal(
        XVS_VAULT_TREASURY_NEW_IMPLEMENTATION,
      );
    });

    it("check XVS balance of VTreasury", async () => {
      const newVTreasuryBalance = await xvs.balanceOf(VTREASURY);
      expect(newVTreasuryBalance).to.be.equal(previousVTreasuryBalance.add(XVS_FOR_V_TREASURY));
    });
  });
});
