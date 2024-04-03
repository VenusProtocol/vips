import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { XVS_VAULT_TREASURY, XVS_VAULT_TREASURY_NEW_IMPLEMENTATION, DEFAULT_PROXY_ADMIN, vip279 } from "../../vips/vip-279/bscmainnet";
import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";

import PROXY_ABI from "./abi/XVSVaultTreasuryProxy.json";
import XVS_VAULT_TREASURY_ABI from "./abi/XVSVaultTreasury.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";

const XVS_VAULT_TREASURY_OLD_IMPLEMENTATION = "0xCA59D9e8889Bc6034CCD749c4Ddd09c865432bA8";

forking(37533772, () => {
  const provider = ethers.provider;
  let xvsVaultTreasuryProxy: Contract;

  before(async () => {
    impersonateAccount(DEFAULT_PROXY_ADMIN);
    xvsVaultTreasuryProxy = new ethers.Contract(XVS_VAULT_TREASURY, PROXY_ABI, ethers.provider.getSigner(DEFAULT_PROXY_ADMIN));
  });

  describe("Pre-VIP behavior", async  () => {
    it("check implementation", async () => {
      expect(await xvsVaultTreasuryProxy.callStatic.implementation()).to.be.equal(XVS_VAULT_TREASURY_OLD_IMPLEMENTATION);
    })
  });

  testVip("VIP-279", vip279(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [XVS_VAULT_TREASURY_ABI], ["SweepToken", "FundsTransferredToXVSStore"], [1, 1]);
      await expectEvents(txResponse, [XVS_VAULT_ABI], ["RewardAmountUpdated"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check implementation", async () => {
      expect(await xvsVaultTreasuryProxy.callStatic.implementation()).to.be.equal(XVS_VAULT_TREASURY_NEW_IMPLEMENTATION);
    })
  });
});
