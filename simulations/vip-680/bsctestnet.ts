import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip680, {
  ADAPTER_CORE_V1,
  CORE_ABSOLUTE_CAP,
  CORE_SOURCE_GOVERNANCE_SIGS,
  CORE_SOURCE_OPERATOR_SIGS,
  CORE_SOURCE_USDT,
  HUB_GOVERNANCE_SIGS,
  HUB_OPERATOR_SIGS,
  HUB_USDT,
  PERCENTAGE_CAP_DISABLED,
  VUSDT_CORE,
} from "../../vips/vip-680/bsctestnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import HUB_ABI from "./abi/Hub.json";
import YIELD_GROUP_ABI from "./abi/YieldGroup.json";

const { NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, GUARDIAN, ACCESS_CONTROL_MANAGER } =
  NETWORK_ADDRESSES.bsctestnet;

// The Fast-Track / Critical timelocks receive their governance grants in the addendum proposal, so
// they must stay ungranted here — this proves the split boundary.
const FAST_LANE_TIMELOCKS = [FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK];

// bsctestnet block after the Liquidity Hub (USDT) deployment (deploy block ~117918419).
const BLOCK_NUMBER = 117930000;

// The exact ACM role id `giveCallPermission(contract, sig, account)` grants:
// keccak256(abi.encodePacked(contract, functionSig)). Asserting `hasRole` on this specific role is
// immune to the `isAllowedToCall` wildcard fallback (a role granted against address(0)), so pre-VIP
// "not granted" checks cannot be masked by an unrelated wildcard permission.
const roleId = (contract: string, sig: string) =>
  ethers.utils.solidityKeccak256(["address", "string"], [contract, sig]);

const addr = (a: string) => ethers.utils.getAddress(a);

// Governance-only signatures = governance set minus the shared (also-Operator) tighten actions.
const HUB_GOVERNANCE_ONLY_SIGS = HUB_GOVERNANCE_SIGS.filter(s => !HUB_OPERATOR_SIGS.includes(s));
const CORE_SOURCE_GOVERNANCE_ONLY_SIGS = CORE_SOURCE_GOVERNANCE_SIGS.filter(
  s => !CORE_SOURCE_OPERATOR_SIGS.includes(s),
);

const REALLOCATE_SIG = "reallocate((address,address,uint256)[],(address,address,uint256)[])";

forking(BLOCK_NUMBER, async () => {
  let acm: Contract;
  let hub: Contract;
  let coreSource: Contract;

  before(async () => {
    acm = await ethers.getContractAt(ACCESS_CONTROL_MANAGER_ABI, ACCESS_CONTROL_MANAGER);
    hub = await ethers.getContractAt(HUB_ABI, HUB_USDT);
    coreSource = await ethers.getContractAt(YIELD_GROUP_ABI, CORE_SOURCE_USDT);
  });

  describe("Pre-VIP state", () => {
    it("Hub has no registered yield groups and empty outer queues", async () => {
      expect(await hub.registeredYieldGroups()).to.deep.equal([]);
      expect(await hub.outerDepositQueue()).to.deep.equal([]);
      expect(await hub.outerWithdrawQueue()).to.deep.equal([]);
    });

    it("Core source has no registered resources and empty inner queues", async () => {
      expect(await coreSource.resources()).to.deep.equal([]);
      expect(await coreSource.innerDepositQueue()).to.deep.equal([]);
      expect(await coreSource.innerWithdrawQueue()).to.deep.equal([]);
    });

    it("Hub advertises zero deposit capacity (no routes wired)", async () => {
      expect(await hub.maxDeposit(NORMAL_TIMELOCK)).to.equal(0);
    });

    it("Normal timelock holds no governance role on Hub or Core source", async () => {
      for (const sig of HUB_GOVERNANCE_SIGS) {
        expect(await acm.hasRole(roleId(HUB_USDT, sig), NORMAL_TIMELOCK)).to.equal(false, `pre Hub gov ${sig}`);
      }
      for (const sig of CORE_SOURCE_GOVERNANCE_SIGS) {
        expect(await acm.hasRole(roleId(CORE_SOURCE_USDT, sig), NORMAL_TIMELOCK)).to.equal(
          false,
          `pre Core gov ${sig}`,
        );
      }
    });

    it("Guardian holds no operator role on Hub or Core source", async () => {
      for (const sig of HUB_OPERATOR_SIGS) {
        expect(await acm.hasRole(roleId(HUB_USDT, sig), GUARDIAN)).to.equal(false, `pre Hub op ${sig}`);
      }
      for (const sig of CORE_SOURCE_OPERATOR_SIGS) {
        expect(await acm.hasRole(roleId(CORE_SOURCE_USDT, sig), GUARDIAN)).to.equal(false, `pre Core op ${sig}`);
      }
    });
  });

  testVip("VIP-680 [BNB Testnet] Configure Liquidity Hub (USDT)", await vip680(), {
    callbackAfterExecution: async txResponse => {
      // Normal-timelock governance: 18 Hub + 11 Core = 29. Guardian operator: 7 Hub + 4 Core = 11. Total 40.
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["RoleGranted"], [40]);
      await expectEvents(
        txResponse,
        [HUB_ABI],
        ["YieldGroupAdded", "OuterDepositQueueSet", "OuterWithdrawQueueSet"],
        [1, 1, 1],
      );
      await expectEvents(
        txResponse,
        [YIELD_GROUP_ABI],
        ["ResourceAdded", "InnerDepositQueueSet", "InnerWithdrawQueueSet"],
        [1, 1, 1],
      );
    },
  });

  describe("Post-VIP wiring", () => {
    it("Core source registered on the Hub with the expected caps", async () => {
      expect((await hub.registeredYieldGroups()).map(addr)).to.deep.equal([addr(CORE_SOURCE_USDT)]);
      const cfg = await hub.yieldGroupConfig(CORE_SOURCE_USDT);
      expect(cfg.registered).to.equal(true);
      expect(cfg.paused).to.equal(false);
      expect(cfg.absoluteCap.toString()).to.equal(CORE_ABSOLUTE_CAP);
      expect(cfg.percentageCapBps).to.equal(PERCENTAGE_CAP_DISABLED);
    });

    it("Hub outer queues route to the Core source", async () => {
      expect((await hub.outerDepositQueue()).map(addr)).to.deep.equal([addr(CORE_SOURCE_USDT)]);
      expect((await hub.outerWithdrawQueue()).map(addr)).to.deep.equal([addr(CORE_SOURCE_USDT)]);
    });

    it("vUSDT registered on the Core source behind AdapterCoreV1", async () => {
      expect((await coreSource.resources()).map(addr)).to.deep.equal([addr(VUSDT_CORE)]);
      const [registered, paused, adapter] = await coreSource.resourceConfig(VUSDT_CORE);
      expect(registered).to.equal(true);
      expect(paused).to.equal(false);
      expect(addr(adapter)).to.equal(addr(ADAPTER_CORE_V1));
    });

    it("Core source inner queues route to vUSDT", async () => {
      expect((await coreSource.innerDepositQueue()).map(addr)).to.deep.equal([addr(VUSDT_CORE)]);
      expect((await coreSource.innerWithdrawQueue()).map(addr)).to.deep.equal([addr(VUSDT_CORE)]);
    });

    it("Hub now advertises deposit capacity through Core → vUSDT", async () => {
      // Non-zero maxDeposit exercises the whole wired route: Hub outer queue → Core source inner
      // queue → AdapterCoreV1.maxDeposit(vUSDT) (mint unpaused, supply-cap headroom).
      expect(await hub.maxDeposit(NORMAL_TIMELOCK)).to.be.gt(0);
    });
  });

  describe("Post-VIP permissions", () => {
    it("Normal timelock holds the full governance role set on Hub and Core source", async () => {
      for (const sig of HUB_GOVERNANCE_SIGS) {
        expect(await acm.hasRole(roleId(HUB_USDT, sig), NORMAL_TIMELOCK)).to.equal(true, `post Hub gov ${sig}`);
      }
      for (const sig of CORE_SOURCE_GOVERNANCE_SIGS) {
        expect(await acm.hasRole(roleId(CORE_SOURCE_USDT, sig), NORMAL_TIMELOCK)).to.equal(
          true,
          `post Core gov ${sig}`,
        );
      }
    });

    it("Guardian holds the full operator role set on Hub and Core source", async () => {
      for (const sig of HUB_OPERATOR_SIGS) {
        expect(await acm.hasRole(roleId(HUB_USDT, sig), GUARDIAN)).to.equal(true, `post Hub op ${sig}`);
      }
      for (const sig of CORE_SOURCE_OPERATOR_SIGS) {
        expect(await acm.hasRole(roleId(CORE_SOURCE_USDT, sig), GUARDIAN)).to.equal(true, `post Core op ${sig}`);
      }
    });

    it("Guardian holds NO governance-only role (asymmetric: Operator can only tighten)", async () => {
      for (const sig of HUB_GOVERNANCE_ONLY_SIGS) {
        expect(await acm.hasRole(roleId(HUB_USDT, sig), GUARDIAN)).to.equal(false, `Guardian must NOT have Hub ${sig}`);
      }
      for (const sig of CORE_SOURCE_GOVERNANCE_ONLY_SIGS) {
        expect(await acm.hasRole(roleId(CORE_SOURCE_USDT, sig), GUARDIAN)).to.equal(
          false,
          `Guardian must NOT have Core ${sig}`,
        );
      }
    });

    it("Normal timelock does NOT hold the operator-only reallocate role", async () => {
      expect(await acm.hasRole(roleId(HUB_USDT, REALLOCATE_SIG), NORMAL_TIMELOCK)).to.equal(false);
    });

    it("Fast-Track and Critical timelocks are not yet granted (deferred to the addendum)", async () => {
      for (const timelock of FAST_LANE_TIMELOCKS) {
        for (const sig of HUB_GOVERNANCE_SIGS) {
          expect(await acm.hasRole(roleId(HUB_USDT, sig), timelock)).to.equal(false, `${sig} @ ${timelock}`);
        }
      }
    });
  });
});
