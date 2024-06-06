import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip019 from "../../../proposals/opbnbmainnet/vip-019";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManagerAbi.json";

const OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER = "0xF6606cB41EbeF4D3968Be7752e0820a0cdCeF413";
const OPBNBMAINNET_ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
const OPBNBMAINNET_NORMAL_TIMELOCK = "0x935a741d81e5F3decC93081f1Db1F37fd6283464";
const { opbnbmainnet } = NETWORK_ADDRESSES;

forking(25917670, async () => {
  let acm: Contract;
  let defaultAdminRole: string;
  before(async () => {
    acm = await ethers.getContractAt(ACCESS_CONTROL_MANAGER_ABI, OPBNBMAINNET_ACM);
    defaultAdminRole = await acm.DEFAULT_ADMIN_ROLE();
  });
  describe("Pre-VIP behaviour", async () => {
    it("Normal Timelock does not has default admin role", async () => {
      const hasRole = await acm.hasRole(defaultAdminRole, OPBNBMAINNET_NORMAL_TIMELOCK);
      expect(hasRole).equals(false);
    });

    it("Guardian is not allowed to call retryMessage", async () => {
      const role = ethers.utils.solidityPack(
        ["address", "string"],
        [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "retryMessage(uint16,bytes,uint64,bytes)"],
      );
      const roleHash = ethers.utils.keccak256(role);
      expect(await acm.hasRole(roleHash, opbnbmainnet.GUARDIAN)).to.be.false;
    });

    it("Guardian is not allowed to call forceResumeReceive", async () => {
      const role = ethers.utils.solidityPack(
        ["address", "string"],
        [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "forceResumeReceive(uint16,bytes)"],
      );
      const roleHash = ethers.utils.keccak256(role);
      expect(await acm.hasRole(roleHash, opbnbmainnet.GUARDIAN)).to.be.false;
    });
  });
  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip019());
    });
    it("Normal Timelock has default admin role", async () => {
      const hasRole = await acm.hasRole(defaultAdminRole, OPBNBMAINNET_NORMAL_TIMELOCK);
      expect(hasRole).equals(true);
    });
    it("Guardian is allowed to call retryMessage", async () => {
      const role = ethers.utils.solidityPack(
        ["address", "string"],
        [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "retryMessage(uint16,bytes,uint64,bytes)"],
      );
      const roleHash = ethers.utils.keccak256(role);
      expect(await acm.hasRole(roleHash, opbnbmainnet.GUARDIAN)).to.be.true;
    });

    it("Guardian is allowed to call forceResumeReceive", async () => {
      const role = ethers.utils.solidityPack(
        ["address", "string"],
        [OPBNBMAINNET_OMNICHAIN_EXECUTOR_OWNER, "forceResumeReceive(uint16,bytes)"],
      );
      const roleHash = ethers.utils.keccak256(role);
      expect(await acm.hasRole(roleHash, opbnbmainnet.GUARDIAN)).to.be.true;
    });
  });
});
