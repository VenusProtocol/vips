import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework/index";

import vip006, { ACM } from "../../../proposals/basemainnet/vip-006";
import ACM_ABI from "./abi/AccessControlManager.json";

const { basemainnet } = NETWORK_ADDRESSES;

forking(23531762, async () => {
  let acm: Contract;
  let defaultAdminRole: string;

  before(async () => {
    acm = await ethers.getContractAt(ACM_ABI, ACM);
    defaultAdminRole = await acm.DEFAULT_ADMIN_ROLE();
  });

  describe("Pre-VIP behaviour", async () => {
    it("Normal Timelock does not has default admin role", async () => {
      const hasRole = await acm.hasRole(defaultAdminRole, basemainnet.NORMAL_TIMELOCK);
      expect(hasRole).equals(false);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip006());
    });

    it("Normal Timelock has default admin role", async () => {
      const hasRole = await acm.hasRole(defaultAdminRole, basemainnet.NORMAL_TIMELOCK);
      expect(hasRole).equals(true);
    });
  });
});
