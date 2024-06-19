import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { LzChainId } from "../../src/types";
import { expectEvents, getOmnichainProposalSenderAddress, initMainnetUser } from "../../src/utils";
import { forking, testForkedNetworkVipCommands } from "../../src/vip-framework";
import vip326, {
  ARBITRUM_ACM,
  ARBITRUM_NORMAL_TIMELOCK,
  ARBITRUM_OMNICHAIN_GOVERNANCE_EXECUTOR,
} from "../../vips/vip-326/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";
import OMNICHAIN_GOVERNANCE_EXECUTOR_ABI from "./abi/OmnichainGovernanceExecutor_ABI.json";

const { arbitrumone } = NETWORK_ADDRESSES;
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
const NORMAL_TIMELOCK = "0x4b94589Cc23F618687790036726f744D602c4017";
const FAST_TRACK_TIMELOCK = "0x2286a9B2a5246218f2fC1F380383f45BDfCE3E04";
const CRITICAL_TIMELOCK = "0x181E4f8F21D087bF02Ea2F64D5e550849FBca674";

forking(221760109, async () => {
  const provider = ethers.provider;
  let lastProposalReceived: BigNumber;
  let executor: Contract;
  let acm: Contract;
  let multisig: any;

  before(async () => {
    executor = new ethers.Contract(ARBITRUM_OMNICHAIN_GOVERNANCE_EXECUTOR, OMNICHAIN_GOVERNANCE_EXECUTOR_ABI, provider);
    acm = new ethers.Contract(ARBITRUM_ACM, ACCESS_CONTROL_MANAGER_ABI, provider);
    lastProposalReceived = await executor.lastProposalReceived();
    multisig = await initMainnetUser(arbitrumone.GUARDIAN, ethers.utils.parseEther("1"));
    await acm.connect(multisig).grantRole(DEFAULT_ADMIN_ROLE, ARBITRUM_NORMAL_TIMELOCK); // Will be removed once multisig VIP for this will be executed
  });

  testForkedNetworkVipCommands("vip326 configures bridge", await vip326(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [13]);
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
    it("check configuration", async () => {
      // Check Timelock configurations
      expect(await executor.proposalTimelocks(0)).equals(NORMAL_TIMELOCK);
      expect(await executor.proposalTimelocks(1)).equals(FAST_TRACK_TIMELOCK);
      expect(await executor.proposalTimelocks(2)).equals(CRITICAL_TIMELOCK);

      // Check trusted remote
      expect(await executor.trustedRemoteLookup(LzChainId.bscmainnet)).equals(
        ethers.utils.solidityPack(
          ["address", "address"],
          [getOmnichainProposalSenderAddress(), arbitrumone.OMNICHAIN_GOVERNANCE_EXECUTOR],
        ),
      );

      // Check receiving limit
      expect(await executor.maxDailyReceiveLimit()).equals(100);
      expect(await executor.last24HourCommandsReceived()).equals(14);
    });
  });
});
