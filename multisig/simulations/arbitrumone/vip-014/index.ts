import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import {
  CORE_XVS_REWARDS_DISTRIBUTOR,
  CORE_XVS_REWARDS_DISTRIBUTOR_AMOUNT,
  LST_ETH_XVS_REWARDS_DISTRIBUTOR,
  LST_ETH_XVS_REWARDS_DISTRIBUTOR_AMOUNT,
  TREASURY,
  XVS,
  commands,
  vip014,
} from "../../../proposals/arbitrumone/vip-014";
import REWARDS_DISTRIBUTOR_ABI from "./abi/rewardsDistributor.json";
import XVS_ABI from "./abi/xvs.json";

const XVS_MINTER = "0x20cEa49B5F7a6DBD78cAE772CA5973eF360AA1e6";

forking(256450604, async () => {
  let xvs: Contract;
  let coreDistributorPreviousBalance: BigNumber;
  let lstEthDistributorPreviousBalance: BigNumber;

  before(async () => {
    await impersonateAccount(XVS_MINTER);
    await setBalance(XVS_MINTER, parseUnits("1", 18));

    xvs = new ethers.Contract(XVS, XVS_ABI, await ethers.getSigner(XVS_MINTER));

    await xvs.mint(TREASURY, CORE_XVS_REWARDS_DISTRIBUTOR_AMOUNT.add(LST_ETH_XVS_REWARDS_DISTRIBUTOR_AMOUNT));

    coreDistributorPreviousBalance = await xvs.balanceOf(CORE_XVS_REWARDS_DISTRIBUTOR);
    lstEthDistributorPreviousBalance = await xvs.balanceOf(LST_ETH_XVS_REWARDS_DISTRIBUTOR);
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip014());
    });

    it("check distributor balance", async () => {
      const coreDistributorBalance = await xvs.balanceOf(CORE_XVS_REWARDS_DISTRIBUTOR);
      const lstEthDistributorBalance = await xvs.balanceOf(LST_ETH_XVS_REWARDS_DISTRIBUTOR);

      expect(coreDistributorBalance).to.equal(coreDistributorPreviousBalance.add(CORE_XVS_REWARDS_DISTRIBUTOR_AMOUNT));
      expect(lstEthDistributorBalance).to.equal(
        lstEthDistributorPreviousBalance.add(LST_ETH_XVS_REWARDS_DISTRIBUTOR_AMOUNT),
      );
    });

    it("check speeds", async () => {
      for (const command of commands) {
        const distributor = await ethers.getContractAt(REWARDS_DISTRIBUTOR_ABI, command.distributor);

        const supplySpeed = await distributor.rewardTokenSupplySpeeds(command.vToken);
        const borrowSpeed = await distributor.rewardTokenBorrowSpeeds(command.vToken);

        expect(supplySpeed).to.equal(command.supplySpeed);
        expect(borrowSpeed).to.equal(command.borrowSpeed);
      }
    });
  });
});
