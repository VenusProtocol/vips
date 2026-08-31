import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  ACM,
  ADAPTER_CENTRIFUGE,
  CENTRIFUGE_SOURCE_USDT,
  CORE_SOURCE_USDT,
  FLUX_SOURCE_USDT,
  FRV_SOURCE_USDT,
  GUARDIAN,
  HUB_USDT,
  MOCK_CENTRIFUGE_VAULT_USDT,
  NORMAL_TIMELOCK,
  USDT,
} from "../../vips/vip-664/addresses/bsctestnet";
import vip664 from "../../vips/vip-664/bsctestnet";
import {
  CENTRIFUGE_GOVERNANCE,
  CENTRIFUGE_GUARDIAN,
  CENTRIFUGE_KEEPER,
  CENTRIFUGE_OPERATOR,
} from "../../vips/vip-664/permissions";
import ACM_ABI from "./abi/AccessControlManager.json";
import HUB_ABI from "./abi/Hub.json";
import VAULT_ABI from "./abi/TestnetCentrifugeVault.json";
import YIELD_GROUP_CENTRIFUGE_ABI from "./abi/YieldGroupCentrifuge.json";

// bsctestnet block just after 08/09 deployed the Centrifuge family and CentrifugeSource_USDT
// (source deployed at block 128,297,808).
const BLOCK_NUMBER = 128298000;

const addr = (a: string) => ethers.utils.getAddress(a);

// The ACM role key is keccak256(abi.encodePacked(targetContract, functionSignature)). `isAllowedToCall`
// cannot be used from a test EOA: it reads `msg.sender` as the target contract, so it would always
// answer for the caller rather than for the Hub or the source.
const roleOf = (contract: string, sig: string) =>
  ethers.utils.solidityKeccak256(["address", "string"], [contract, sig]);

const OUTER_DEPOSIT_QUEUE = [FRV_SOURCE_USDT, FLUX_SOURCE_USDT, CORE_SOURCE_USDT];
const OUTER_WITHDRAW_QUEUE = [FRV_SOURCE_USDT, FLUX_SOURCE_USDT, CENTRIFUGE_SOURCE_USDT, CORE_SOURCE_USDT];

forking(BLOCK_NUMBER, async () => {
  let hub: Contract;
  let source: Contract;
  let acm: Contract;
  let vault: Contract;

  before(async () => {
    hub = await ethers.getContractAt(HUB_ABI, HUB_USDT);
    source = await ethers.getContractAt(YIELD_GROUP_CENTRIFUGE_ABI, CENTRIFUGE_SOURCE_USDT);
    acm = await ethers.getContractAt(ACM_ABI, ACM);
    vault = await ethers.getContractAt(VAULT_ABI, MOCK_CENTRIFUGE_VAULT_USDT);
  });

  describe("Pre-VIP state", () => {
    it("the source is deployed and bound to Hub_USDT and USDT", async () => {
      expect(addr(await source.hub())).to.equal(addr(HUB_USDT));
      expect(addr(await source.asset())).to.equal(addr(USDT));
      expect(addr(await hub.asset())).to.equal(addr(USDT));
    });

    it("the source holds no resources and is not registered on the Hub", async () => {
      expect(await source.resources()).to.deep.equal([]);
      const groups = (await hub.registeredYieldGroups()).map(addr);
      expect(groups).to.not.include(addr(CENTRIFUGE_SOURCE_USDT));
    });

    it("nobody holds the Centrifuge roles yet", async () => {
      for (const holder of [NORMAL_TIMELOCK, GUARDIAN]) {
        expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, "claimDeposit(address)"), holder)).to.equal(false);
      }
    });

    it("the source cannot pause the Hub yet — the drop guard's only reaction", async () => {
      expect(await acm.hasRole(roleOf(HUB_USDT, "pauseHub()"), CENTRIFUGE_SOURCE_USDT)).to.equal(false);
    });

    it("the mock fund is registrable: right asset, and a live share price", async () => {
      expect(addr(await vault.asset())).to.equal(addr(USDT));
      // testnet USDT has 6 decimals, so 1.00 asset per share reads as 1e6.
      expect(await vault.pricePerShare()).to.equal(1_000_000);
    });
  });

  testVip("VIP-664 [BNB Testnet] Liquidity Hub (USDT) — onboard the Centrifuge YieldGroup", await vip664(), {
    callbackAfterExecution: async txResponse => {
      const guardianGrants = new Set([...CENTRIFUGE_OPERATOR, ...CENTRIFUGE_KEEPER, ...CENTRIFUGE_GUARDIAN]);
      await expectEvents(
        txResponse,
        [ACM_ABI],
        ["RoleGranted"],
        // Grants on the source are deduplicated by (account, signature) because testnet collapses
        // Operator, Keeper and Guardian into one multisig; the +1 is `pauseHub()` on the Hub, granted
        // to the source contract itself.
        [CENTRIFUGE_GOVERNANCE.length + guardianGrants.size + 1],
      );
      await expectEvents(
        txResponse,
        [HUB_ABI],
        ["YieldGroupAdded", "OuterDepositQueueSet", "OuterWithdrawQueueSet"],
        [1, 1, 1],
      );
      await expectEvents(
        txResponse,
        [YIELD_GROUP_CENTRIFUGE_ABI],
        ["ResourceAdded", "InnerDepositQueueSet", "InnerWithdrawQueueSet"],
        [1, 1, 1],
      );
    },
  });

  describe("Post-VIP state", () => {
    it("the fund is registered behind AdapterCentrifuge", async () => {
      expect((await source.resources()).map(addr)).to.deep.equal([addr(MOCK_CENTRIFUGE_VAULT_USDT)]);
      const cfg = await source.resourceConfig(MOCK_CENTRIFUGE_VAULT_USDT);
      expect(cfg.registered).to.equal(true);
      expect(cfg.paused).to.equal(false);
      expect(addr(cfg.adapter)).to.equal(addr(ADAPTER_CENTRIFUGE));
    });

    it("the group is registered on the Hub", async () => {
      const groups = (await hub.registeredYieldGroups()).map(addr);
      expect(groups).to.include(addr(CENTRIFUGE_SOURCE_USDT));
    });

    it("Centrifuge is in the WITHDRAW queue but NOT the deposit queue", async () => {
      expect((await hub.outerWithdrawQueue()).map(addr)).to.deep.equal(OUTER_WITHDRAW_QUEUE.map(addr));
      expect((await hub.outerDepositQueue()).map(addr)).to.deep.equal(OUTER_DEPOSIT_QUEUE.map(addr));
      expect((await hub.outerDepositQueue()).map(addr)).to.not.include(addr(CENTRIFUGE_SOURCE_USDT));
    });

    it("the source can now pause the Hub, so enforceDropGuard can actually fire", async () => {
      expect(await acm.hasRole(roleOf(HUB_USDT, "pauseHub()"), CENTRIFUGE_SOURCE_USDT)).to.equal(true);
    });

    it("governance holds the full gated surface", async () => {
      for (const sig of CENTRIFUGE_GOVERNANCE) {
        expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), NORMAL_TIMELOCK), sig).to.equal(true);
      }
    });

    it("the keeper holds the claims and nothing more", async () => {
      for (const sig of CENTRIFUGE_KEEPER) {
        expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), GUARDIAN), sig).to.equal(true);
      }
      // Not a keeper power: configuring how the position is marked stays with governance.
      expect(
        await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, "setDropGuardRate(address,uint16,uint16,uint32)"), GUARDIAN),
      ).to.equal(false);
    });

    it("the position values at zero and the group advertises no withdrawable liquidity", async () => {
      expect(await source.totalAssets()).to.equal(0);
      expect(await source.maxWithdraw()).to.equal(0);
    });

    it("no price guard is armed — each needs its own sizing decision", async () => {
      const growth = await source.growthGuard(MOCK_CENTRIFUGE_VAULT_USDT);
      const drop = await source.dropGuard(MOCK_CENTRIFUGE_VAULT_USDT);
      expect(growth.interval).to.equal(0);
      expect(drop.interval).to.equal(0);
    });

    it("the Hub still routes deposits normally, unaffected by the new group", async () => {
      expect(await hub.maxDeposit(NORMAL_TIMELOCK)).to.be.gt(0);
    });
  });
});
