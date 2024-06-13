import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { expectEvents, initMainnetUser } from "../../src/utils";
import { forking, testForkedNetworkVipCommands } from "../../src/vip-framework";
import vip324, { ARBITRUMSEPOLIA_ACM } from "../../vips/vip-324/bsctestnet-addendum";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";
import OMNICHAIN_GOVERNANCE_EXECUTOR_ABI from "./abi/OmnichainGovernanceExecutor_ABI.json";

const { arbitrumsepolia } = NETWORK_ADDRESSES;
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
const ARBITRUMSEPOLIA_NORMAL_TIMELOCK = "0x794BCA78E606f3a462C31e5Aba98653Efc1322F8";

forking(54239346, async () => {
  const provider = ethers.provider;
  let lastProposalReceived: BigNumber;
  let executor: Contract;
  let acm: Contract;
  let multisig: any;

  before(async () => {
    executor = new ethers.Contract(
      arbitrumsepolia.OMNICHAIN_GOVERNANCE_EXECUTOR,
      OMNICHAIN_GOVERNANCE_EXECUTOR_ABI,
      provider,
    );
    acm = new ethers.Contract(ARBITRUMSEPOLIA_ACM, ACCESS_CONTROL_MANAGER_ABI, provider);
    lastProposalReceived = await executor.lastProposalReceived();
    multisig = await initMainnetUser(arbitrumsepolia.GUARDIAN, ethers.utils.parseEther("1"));
    await acm.connect(multisig).grantRole(DEFAULT_ADMIN_ROLE, ARBITRUMSEPOLIA_NORMAL_TIMELOCK); // Will be removed once multisig VIP for this will be executed
  });

  testForkedNetworkVipCommands("vip324 configures bridge", await vip324(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [18]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("Proposal id should be incremented", async () => {
      expect(await executor.lastProposalReceived()).to.be.equals(lastProposalReceived.add(1));
    });
    it("proposal should be executed", async () => {
      const pId = await executor.lastProposalReceived();
      expect(await executor.state(pId)).to.be.equals(2);
    });
  });
});
