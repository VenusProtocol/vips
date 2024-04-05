import { TransactionResponse } from "@ethersproject/providers";
import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, pretendExecutingVip, testVip } from "../../src/vip-framework";
import { vip279 } from "../../vips/vip-279/bsctestnet";
import { DEFAULT_PROXY_ADMIN, VTREASURY, XVS, XVS_FOR_V_TREASURY } from "../../vips/vip-280/bsctestnet";
import vip280 from "../../vips/vip-280/bsctestnet";
import ERC20_ABI from "./abi/ERC20.json";
import XVS_VAULT_TREASURY_ABI from "./abi/XVSVaultTreasury.json";

forking(39145203, () => {
  const provider = ethers.provider;
  let xvs: Contract;
  let previousVTreasuryBalance: BigNumber;

  before(async () => {
    await pretendExecutingVip(vip279());

    await impersonateAccount(DEFAULT_PROXY_ADMIN);
    xvs = new ethers.Contract(XVS, ERC20_ABI, provider);

    previousVTreasuryBalance = await xvs.balanceOf(VTREASURY);
  });

  testVip("VIP-280", vip280(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [XVS_VAULT_TREASURY_ABI], ["SweepToken"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check XVS balance of VTreasury", async () => {
      const newVTreasuryBalance = await xvs.balanceOf(VTREASURY);
      expect(newVTreasuryBalance).to.be.equal(previousVTreasuryBalance.add(XVS_FOR_V_TREASURY));
    });
  });
});
