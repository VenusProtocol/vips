import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { expectEvents, initMainnetUser, setForkBlock } from "../../src/utils";
import { testVipV2 } from "../../src/vip-framework";
import { omnichain_example } from "../../vips/omnichain_example";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";
import OMNICHAIN_GOVERNANCE_EXECUTOR_ABI from "./abi/OmnichainGovernanceExecutor_ABI.json";

const { sepolia } = NETWORK_ADDRESSES;

const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

(async function () {
  const provider = ethers.provider;
  let lastProposalReceived: number;
  let executor: Contract;
  let acm: Contract;
  let multisig: any;

  before(async () => {
    await setForkBlock(4800221);
    executor = new ethers.Contract(sepolia.OMNICHAIN_GOVERNANCE_EXECUTOR, OMNICHAIN_GOVERNANCE_EXECUTOR_ABI, provider);
    acm = new ethers.Contract(sepolia.ACCESS_CONTROL_MANAGER, ACCESS_CONTROL_MANAGER_ABI, provider);
    lastProposalReceived = await executor.lastProposalReceived();
    multisig = await initMainnetUser(sepolia.GUARDIAN, ethers.utils.parseEther("1"));
    await acm.connect(multisig).grantRole(DEFAULT_ADMIN_ROLE, sepolia.NORMAL_TIMELOCK);
  });

  testVipV2("omnichain_example configures bridge", await omnichain_example(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [13]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("Proposal id should be incremented", async () => {
      expect(await executor.lastProposalReceived()).to.be.equals(lastProposalReceived.add(1));
    });
  });
})();
