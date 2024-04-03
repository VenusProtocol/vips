import { TransactionResponse } from "@ethersproject/providers";
import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { checkXVSVault } from "../../src/vip-framework/checks/checkXVSVault";
import {
  DEFAULT_PROXY_ADMIN,
  VTREASURY,
  XVS,
  XVS_DISTRIBUTION_SPEED,
  XVS_FOR_V_TREASURY,
  XVS_FOR_XVS_STORE,
  XVS_VAULT,
  XVS_VAULT_TREASURY,
  XVS_VAULT_TREASURY_NEW_IMPLEMENTATION,
  vip279,
} from "../../vips/vip-279/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";
import XVS_VAULT_TREASURY_ABI from "./abi/XVSVaultTreasury.json";
import PROXY_ABI from "./abi/XVSVaultTreasuryProxy.json";

const XVS_VAULT_TREASURY_OLD_IMPLEMENTATION = "0xCA59D9e8889Bc6034CCD749c4Ddd09c865432bA8";
const XVS_STORE = "0x1e25CF968f12850003Db17E0Dba32108509C4359";

forking(37533772, () => {
  const provider = ethers.provider;
  let xvsVaultTreasuryProxy: Contract;
  let xvs: Contract;
  let xvsVault: Contract;
  let previousXVSStoreBalance: BigNumber;
  let previousVTreasuryBalance: BigNumber;

  before(async () => {
    await impersonateAccount(DEFAULT_PROXY_ADMIN);
    xvsVaultTreasuryProxy = new ethers.Contract(
      XVS_VAULT_TREASURY,
      PROXY_ABI,
      ethers.provider.getSigner(DEFAULT_PROXY_ADMIN),
    );
    xvs = new ethers.Contract(XVS, ERC20_ABI, provider);
    xvsVault = new ethers.Contract(XVS_VAULT, XVS_VAULT_ABI, provider);

    previousXVSStoreBalance = await xvs.balanceOf(XVS_STORE);
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
      await expectEvents(txResponse, [XVS_VAULT_TREASURY_ABI], ["SweepToken", "FundsTransferredToXVSStore"], [1, 1]);
      await expectEvents(txResponse, [XVS_VAULT_ABI], ["RewardAmountUpdated"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check implementation", async () => {
      expect(await xvsVaultTreasuryProxy.callStatic.implementation()).to.be.equal(
        XVS_VAULT_TREASURY_NEW_IMPLEMENTATION,
      );
    });

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
