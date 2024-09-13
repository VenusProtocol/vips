import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { vip060, XVS, TREASURY, CORE_XVS_REWARDS_DISTRIBUTOR, LST_ETH_XVS_REWARDS_DISTRIBUTOR, CORE_XVS_REWARDS_DISTRIBUTOR_AMOUNT, LST_ETH_XVS_REWARDS_DISTRIBUTOR_AMOUNT } from "../../../proposals/ethereum/vip-060";
import XVS_ABI from "./abi/xvs.json";

const XVS_MINTER = "0x888E317606b4c590BBAD88653863e8B345702633"

forking(20740985, async () => {
  let xvs: Contract;
  let coreDistributorPreviousBalance: BigNumber;
  let lstEthDistributorPreviousBalance: BigNumber;

  before(async () => {
    await impersonateAccount(XVS_MINTER);
    await setBalance(XVS_MINTER, parseUnits("1", 18));

    xvs = new ethers.Contract(
      XVS,
      XVS_ABI,
      await ethers.getSigner(XVS_MINTER),
    );  

    await xvs.mint(TREASURY, CORE_XVS_REWARDS_DISTRIBUTOR_AMOUNT.add(LST_ETH_XVS_REWARDS_DISTRIBUTOR_AMOUNT));

    coreDistributorPreviousBalance = await xvs.balanceOf(CORE_XVS_REWARDS_DISTRIBUTOR);
    lstEthDistributorPreviousBalance = await xvs.balanceOf(LST_ETH_XVS_REWARDS_DISTRIBUTOR);
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip060());
    });

    it("check distributor balance", async () => {
      let coreDistributorBalance = await xvs.balanceOf(CORE_XVS_REWARDS_DISTRIBUTOR);
      let lstEthDistributorBalance = await xvs.balanceOf(LST_ETH_XVS_REWARDS_DISTRIBUTOR);

      expect(coreDistributorBalance).to.equal(coreDistributorPreviousBalance.add(CORE_XVS_REWARDS_DISTRIBUTOR_AMOUNT));
      expect(lstEthDistributorBalance).to.equal(lstEthDistributorPreviousBalance.add(LST_ETH_XVS_REWARDS_DISTRIBUTOR_AMOUNT));
    })
  });
});
