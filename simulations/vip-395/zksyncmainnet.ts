import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { expectEvents, getOmnichainProposalSenderAddress } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip015 from "../../multisig/proposals/zksyncmainnet/vip-015";
import vip395, {
  DEFAULT_ADMIN_ROLE,
  ZKSYNCMAINNET_ACM,
  ZKSYNCMAINNET_ACM_AGGREGATOR,
  ZKSYNCMAINNET_OMNICHAIN_EXECUTOR_OWNER,
} from "../../vips/vip-395/bscmainnet";
import ACMAggregator_ABI from "./abi/ACMAggregator.json";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";
import OMNICHAIN_EXECUTOR_OWNER_ABI from "./abi/OmnichainExecutorOwner_ABI.json";
import OMNICHAIN_GOVERNANCE_EXECUTOR_ABI from "./abi/OmnichainGovernanceExecutor_ABI.json";

const { zksyncmainnet } = NETWORK_ADDRESSES;
const FAST_TRACK_TIMELOCK = "0x32f71c95BC8F9d996f89c642f1a84d06B2484AE9";
const CRITICAL_TIMELOCK = "0xbfbc79D4198963e4a66270F3EfB1fdA0F382E49c";

forking(48280698, async () => {
  const provider = ethers.provider;
  let lastProposalReceived: BigNumber;
  let executor: Contract;
  let executorOwner: Contract;

  before(async () => {
    executor = new ethers.Contract(
      zksyncmainnet.OMNICHAIN_GOVERNANCE_EXECUTOR,
      OMNICHAIN_GOVERNANCE_EXECUTOR_ABI,
      provider,
    );
    executorOwner = new ethers.Contract(ZKSYNCMAINNET_OMNICHAIN_EXECUTOR_OWNER, OMNICHAIN_EXECUTOR_OWNER_ABI, provider);
    lastProposalReceived = await executor.lastProposalReceived();
    await pretendExecutingVip(await vip015());
  });

  describe("Pre-VIP behaviour", async () => {
    it("Normal Timelock has default admin role on ZKsync mainnet", async () => {
      const acm = await ethers.getContractAt(ACCESS_CONTROL_MANAGER_ABI, ZKSYNCMAINNET_ACM);
      const hasRole = await acm.hasRole(DEFAULT_ADMIN_ROLE, zksyncmainnet.NORMAL_TIMELOCK);
      expect(hasRole).equals(true);
    });
  });

  testForkedNetworkVipCommands("vip395 configures bridge", await vip395(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [39]);
      await expectEvents(txResponse, [ACMAggregator_ABI], ["GrantPermissionsExecuted"], [1]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    const acm = new ethers.Contract(ZKSYNCMAINNET_ACM, ACCESS_CONTROL_MANAGER_ABI, provider);

    it("Proposal id should be incremented", async () => {
      expect(await executor.lastProposalReceived()).to.be.equals(lastProposalReceived.add(1));
    });
    it("proposal should be executed", async () => {
      const pId = await executor.lastProposalReceived();
      expect(await executor.state(pId)).to.be.equals(2);
    });
    it("check configuration", async () => {
      // Check Timelock configurations
      expect(await executor.proposalTimelocks(0)).equals(zksyncmainnet.NORMAL_TIMELOCK);
      expect(await executor.proposalTimelocks(1)).equals(FAST_TRACK_TIMELOCK);
      expect(await executor.proposalTimelocks(2)).equals(CRITICAL_TIMELOCK);

      // Check trusted remote
      expect(await executor.trustedRemoteLookup(LzChainId.bsctestnet)).equals(
        ethers.utils.solidityPack(
          ["address", "address"],
          [getOmnichainProposalSenderAddress(), zksyncmainnet.OMNICHAIN_GOVERNANCE_EXECUTOR],
        ),
      );

      // Check receiving limit
      expect(await executor.maxDailyReceiveLimit()).equals(100);
      expect(await executor.last24HourCommandsReceived()).equals(4);

      // Check function registry
      const functionSignatures: string[] = [
        "forceResumeReceive(uint16,bytes)",
        "pause()",
        "unpause()",
        "setSendVersion(uint16)",
        "setReceiveVersion(uint16)",
        "setMaxDailyReceiveLimit(uint256)",
        "setTrustedRemoteAddress(uint16,bytes)",
        "setPrecrime(address)",
        "setMinDstGas(uint16,uint16,uint256)",
        "setPayloadSizeLimit(uint16,uint256)",
        "setConfig(uint16,uint16,uint256,bytes)",
        "addTimelocks(ITimelock[])",
        "setTimelockPendingAdmin(address,uint8)",
        "retryMessage(uint16,bytes,uint64,bytes)",
        "setGuardian(address)",
        "setSrcChainId(uint16)",
      ];
      const getFunctionSelector = (signature: string): string => {
        return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(signature)).substring(0, 10);
      };

      for (const signature of functionSignatures) {
        const selector = getFunctionSelector(signature);
        expect(await executorOwner.functionRegistry(selector)).equals(signature);
      }
    });
    it("Default admin role must be revoked from ACMAggregator contract on ZKsync mainnet", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, ZKSYNCMAINNET_ACM_AGGREGATOR)).to.be.false;
    });
    it("Guardian and all timelocks are allowed to call retryMessage ", async () => {
      const role = ethers.utils.solidityPack(
        ["address", "string"],
        [ZKSYNCMAINNET_OMNICHAIN_EXECUTOR_OWNER, "retryMessage(uint16,bytes,uint64,bytes)"],
      );
      const roleHash = ethers.utils.keccak256(role);
      expect(await acm.hasRole(roleHash, zksyncmainnet.GUARDIAN)).to.be.true;
      expect(await acm.hasRole(roleHash, zksyncmainnet.NORMAL_TIMELOCK)).to.be.true;
      expect(await acm.hasRole(roleHash, FAST_TRACK_TIMELOCK)).to.be.true;
      expect(await acm.hasRole(roleHash, CRITICAL_TIMELOCK)).to.be.true;
    });

    it("Guardian is allowed to call forceResumeReceive but not timelocks", async () => {
      const role = ethers.utils.solidityPack(
        ["address", "string"],
        [ZKSYNCMAINNET_OMNICHAIN_EXECUTOR_OWNER, "forceResumeReceive(uint16,bytes)"],
      );
      const roleHash = ethers.utils.keccak256(role);
      expect(await acm.hasRole(roleHash, zksyncmainnet.GUARDIAN)).to.be.true;
      expect(await acm.hasRole(roleHash, zksyncmainnet.NORMAL_TIMELOCK)).to.be.false;
      expect(await acm.hasRole(roleHash, FAST_TRACK_TIMELOCK)).to.be.false;
      expect(await acm.hasRole(roleHash, CRITICAL_TIMELOCK)).to.be.false;
    });
    it("Normal Timelock is allowed to call setSendVersion but not other timelocks and guardian", async () => {
      const role = ethers.utils.solidityPack(
        ["address", "string"],
        [ZKSYNCMAINNET_OMNICHAIN_EXECUTOR_OWNER, "setSendVersion(uint16)"],
      );
      const roleHash = ethers.utils.keccak256(role);
      expect(await acm.hasRole(roleHash, zksyncmainnet.GUARDIAN)).to.be.false;
      expect(await acm.hasRole(roleHash, zksyncmainnet.NORMAL_TIMELOCK)).to.be.true;
      expect(await acm.hasRole(roleHash, FAST_TRACK_TIMELOCK)).to.be.false;
      expect(await acm.hasRole(roleHash, CRITICAL_TIMELOCK)).to.be.false;
    });
  });
});
