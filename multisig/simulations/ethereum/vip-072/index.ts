import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip072 from "../../../proposals/ethereum/vip-072";
import VTREASURY_ABI from "./abi/VTreasury.json";

const { VTREASURY, GUARDIAN, NORMAL_TIMELOCK } = NETWORK_ADDRESSES.ethereum;

forking(21442115, async () => {
  let vTreasury: Contract;

  before(async () => {
    await impersonateAccount(NORMAL_TIMELOCK);
    await setBalance(NORMAL_TIMELOCK, parseUnits("1000", 18));
    vTreasury = await ethers.getContractAt(VTREASURY_ABI, VTREASURY, await ethers.getSigner(NORMAL_TIMELOCK));
  });

  describe("Pre-VIP behaviour", async () => {
    it("check owner", async () => {
      expect(await vTreasury.owner()).to.be.equal(GUARDIAN);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip072());
    });

    it("transfers ownership to normal timelock", async () => {
      expect(await vTreasury.pendingOwner()).to.equal(NORMAL_TIMELOCK);
      await vTreasury.acceptOwnership();
      expect(await vTreasury.owner()).to.equal(NORMAL_TIMELOCK);
    });
  });
});
