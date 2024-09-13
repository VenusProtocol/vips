import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip009, {
  ARBITRUM_ACM,
  ARBITRUM_NORMAL_TIMELOCK,
  ARBITRUM_OMNICHAIN_EXECUTOR_OWNER,
} from "../../../proposals/arbitrumone/vip-009";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManagerAbi.json";

const { arbitrumone } = NETWORK_ADDRESSES;

forking(221758908, async () => {
  let acm: Contract;
  let defaultAdminRole: string;
  before(async () => {
    acm = await ethers.getContractAt(ACCESS_CONTROL_MANAGER_ABI, ARBITRUM_ACM);
    defaultAdminRole = await acm.DEFAULT_ADMIN_ROLE();
  });
  describe("Pre-VIP behaviour", async () => {
    it("Normal Timelock does not has default admin role", async () => {
      const hasRole = await acm.hasRole(defaultAdminRole, ARBITRUM_NORMAL_TIMELOCK);
      expect(hasRole).equals(false);
    });

    it("Guardian is not allowed to call retryMessage", async () => {
      const role = ethers.utils.solidityPack(
        ["address", "string"],
        [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "retryMessage(uint16,bytes,uint64,bytes)"],
      );
      const roleHash = ethers.utils.keccak256(role);
      expect(await acm.hasRole(roleHash, arbitrumone.GUARDIAN)).to.be.false;
    });

    it("Guardian is not allowed to call forceResumeReceive", async () => {
      const role = ethers.utils.solidityPack(
        ["address", "string"],
        [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "forceResumeReceive(uint16,bytes)"],
      );
      const roleHash = ethers.utils.keccak256(role);
      expect(await acm.hasRole(roleHash, arbitrumone.GUARDIAN)).to.be.false;
    });
  });
  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip009());
    });
    it("Normal Timelock has default admin role", async () => {
      const hasRole = await acm.hasRole(defaultAdminRole, ARBITRUM_NORMAL_TIMELOCK);
      expect(hasRole).equals(true);
    });
    it("Guardian is allowed to call retryMessage", async () => {
      const role = ethers.utils.solidityPack(
        ["address", "string"],
        [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "retryMessage(uint16,bytes,uint64,bytes)"],
      );
      const roleHash = ethers.utils.keccak256(role);
      expect(await acm.hasRole(roleHash, arbitrumone.GUARDIAN)).to.be.true;
    });

    it("Guardian is allowed to call forceResumeReceive", async () => {
      const role = ethers.utils.solidityPack(
        ["address", "string"],
        [ARBITRUM_OMNICHAIN_EXECUTOR_OWNER, "forceResumeReceive(uint16,bytes)"],
      );
      const roleHash = ethers.utils.keccak256(role);
      expect(await acm.hasRole(roleHash, arbitrumone.GUARDIAN)).to.be.true;
    });
  });
});
