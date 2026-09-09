import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip664, {
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
} from "../../vips/vip-664/bsctestnet";
import {
  CENTRIFUGE_FULL_SURFACE,
  GUARDIAN_GRANTS,
  GUARDIAN_WILDCARDS,
  NORMAL_TIMELOCK_GRANTS,
} from "../../vips/vip-664/permissions-bsctestnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import HUB_ABI from "./abi/Hub.json";
import VAULT_ABI from "./abi/TestnetCentrifugeVault.json";
import YIELD_GROUP_CENTRIFUGE_ABI from "./abi/YieldGroupCentrifuge.json";

const BLOCK_NUMBER = 128313501;

const addr = (a: string) => ethers.utils.getAddress(a);
const ZERO_ADDRESS = ethers.constants.AddressZero;
const { FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK } = NETWORK_ADDRESSES.bsctestnet;

// The ACM role key is keccak256(abi.encodePacked(targetContract, functionSignature)). `isAllowedToCall`
// cannot be used from a test EOA: it reads `msg.sender` as the target contract, so it would always
// answer for the caller rather than for the Hub or the source.
const roleOf = (contract: string, sig: string) =>
  ethers.utils.solidityKeccak256(["address", "string"], [contract, sig]);

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
];

// The earlier wiring proposal pointed both outer queues at the same order, so this is the pre-VIP
// state of each, and stays the deposit queue afterwards.
const QUEUE_BEFORE_VIP = [FRV_SOURCE_USDT, FLUX_SOURCE_USDT, CORE_SOURCE_USDT];
const OUTER_DEPOSIT_QUEUE = QUEUE_BEFORE_VIP;
const OUTER_WITHDRAW_QUEUE = [CENTRIFUGE_SOURCE_USDT, FRV_SOURCE_USDT, FLUX_SOURCE_USDT, CORE_SOURCE_USDT];

// Restated rather than imported from the VIP, so a change there has to be mirrored here to pass.
const EXPECTED_ABSOLUTE_CAP = "340282366920938463463374607431768211455"; // type(uint128).max
const EXPECTED_PERCENTAGE_CAP_BPS = 10_000; // cap disabled

forking(BLOCK_NUMBER, async () => {
  let hub: Contract;
  let source: Contract;
  let acm: Contract;
  let vault: Contract;
  let usdt: Contract;

  before(async () => {
    hub = await ethers.getContractAt(HUB_ABI, HUB_USDT);
    source = await ethers.getContractAt(YIELD_GROUP_CENTRIFUGE_ABI, CENTRIFUGE_SOURCE_USDT);
    acm = await ethers.getContractAt(ACM_ABI, ACM);
    vault = await ethers.getContractAt(VAULT_ABI, MOCK_CENTRIFUGE_VAULT_USDT);
    usdt = await ethers.getContractAt(ERC20_ABI, USDT);
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

    it("the guardian already holds the shared surface as an address(0) wildcard", async () => {
      // This is why the VIP does not grant these again. If the wildcards were ever revoked the
      // proposal would be leaving a hole, so assert them rather than trusting the note in
      // permissions-bsctestnet.
      for (const sig of GUARDIAN_WILDCARDS) {
        expect(await acm.hasRole(roleOf(ZERO_ADDRESS, sig), GUARDIAN), sig).to.equal(true);
      }
      // Not wildcarded: everything Centrifuge-specific, which is exactly what the VIP grants.
      for (const sig of GUARDIAN_GRANTS) {
        expect(await acm.hasRole(roleOf(ZERO_ADDRESS, sig), GUARDIAN), sig).to.equal(false);
      }
    });

    it("the normal timelock holds no wildcards, so its grants are all load-bearing", async () => {
      for (const sig of [...CENTRIFUGE_FULL_SURFACE, ...GUARDIAN_WILDCARDS]) {
        expect(await acm.hasRole(roleOf(ZERO_ADDRESS, sig), NORMAL_TIMELOCK), sig).to.equal(false);
      }
    });

    it("both outer queues are still [FRV, Flux, Core]", async () => {
      // Pins the starting point, so the post-VIP checks mean something: that the withdraw queue was
      // reordered rather than already in that order, and that the deposit queue really went untouched
      // rather than being rewritten to a value it happened to hold.
      expect((await hub.outerDepositQueue()).map(addr)).to.deep.equal(QUEUE_BEFORE_VIP.map(addr));
      expect((await hub.outerWithdrawQueue()).map(addr)).to.deep.equal(QUEUE_BEFORE_VIP.map(addr));
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

  testVip("VIP-666 [BNB Testnet] Liquidity Hub (USDT) — onboard the Centrifuge YieldGroup", await vip664(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [ACM_ABI],
        ["RoleGranted"],
        // The +1 is `pauseHub()` on the Hub, granted to the source contract itself.
        [NORMAL_TIMELOCK_GRANTS.length + GUARDIAN_GRANTS.length + 1],
      );
      await expectEvents(txResponse, [HUB_ABI], ["YieldGroupAdded", "OuterWithdrawQueueSet"], [1, 1]);
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

    it("the group is registered on the Hub, uncapped", async () => {
      const groups = (await hub.registeredYieldGroups()).map(addr);
      expect(groups).to.include(addr(CENTRIFUGE_SOURCE_USDT));

      const group = await hub.yieldGroupConfig(CENTRIFUGE_SOURCE_USDT);
      expect(group.registered).to.equal(true);
      expect(group.paused).to.equal(false);
      expect(group.absoluteCap).to.equal(EXPECTED_ABSOLUTE_CAP);
      expect(group.percentageCapBps).to.equal(EXPECTED_PERCENTAGE_CAP_BPS);
    });

    it("both inner queues route to the one registered fund", async () => {
      expect((await source.innerDepositQueue()).map(addr)).to.deep.equal([addr(MOCK_CENTRIFUGE_VAULT_USDT)]);
      expect((await source.innerWithdrawQueue()).map(addr)).to.deep.equal([addr(MOCK_CENTRIFUGE_VAULT_USDT)]);
    });

    it("Centrifuge is in the WITHDRAW queue, and the deposit queue is untouched", async () => {
      expect((await hub.outerWithdrawQueue()).map(addr)).to.deep.equal(OUTER_WITHDRAW_QUEUE.map(addr));
      expect((await hub.outerDepositQueue()).map(addr)).to.deep.equal(OUTER_DEPOSIT_QUEUE.map(addr));
      expect((await hub.outerDepositQueue()).map(addr)).to.not.include(addr(CENTRIFUGE_SOURCE_USDT));
    });

    it("the source can now pause the Hub, so enforceDropGuard can actually fire", async () => {
      expect(await acm.hasRole(roleOf(HUB_USDT, "pauseHub()"), CENTRIFUGE_SOURCE_USDT)).to.equal(true);
    });

    it("the normal timelock holds the full gated surface", async () => {
      for (const sig of CENTRIFUGE_FULL_SURFACE) {
        expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), NORMAL_TIMELOCK), sig).to.equal(true);
      }
    });

    it("the guardian holds the full gated surface too, part granted and part wildcarded", async () => {
      // It is the Operator and the Keeper here as well, so it gets everything the timelock gets. The
      // route differs per signature: granted if the wildcards missed it, wildcarded otherwise.
      for (const sig of CENTRIFUGE_FULL_SURFACE) {
        const granted = await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), GUARDIAN);
        const wildcarded = await acm.hasRole(roleOf(ZERO_ADDRESS, sig), GUARDIAN);
        expect(granted || wildcarded, sig).to.equal(true);
        expect(granted, sig).to.equal(GUARDIAN_GRANTS.includes(sig));
      }
    });

    it("nobody but the normal timelock and the guardian holds anything", async () => {
      for (const holder of [FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK]) {
        for (const sig of CENTRIFUGE_FULL_SURFACE) {
          expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), holder), sig).to.equal(false);
          expect(await acm.hasRole(roleOf(ZERO_ADDRESS, sig), holder), sig).to.equal(false);
        }
      }
    });

    it("the position values at zero and the group advertises no withdrawable liquidity", async () => {
      expect(await source.totalAssets()).to.equal(0);
      expect(await source.maxWithdraw()).to.equal(0);
    });

    it("none of the three price guards is armed — each needs its own sizing decision", async () => {
      // Growth and drop are off while `interval == 0`; the age guard carries its own flag.
      expect((await source.growthGuard(MOCK_CENTRIFUGE_VAULT_USDT)).interval).to.equal(0);
      expect((await source.dropGuard(MOCK_CENTRIFUGE_VAULT_USDT)).interval).to.equal(0);
      expect((await source.priceAgeGuard(MOCK_CENTRIFUGE_VAULT_USDT)).enabled).to.equal(false);
    });

    it("the Hub still routes deposits normally, unaffected by the new group", async () => {
      expect(await hub.maxDeposit(NORMAL_TIMELOCK)).to.be.gt(0);
    });

    it("the guardian can pause the new resource through the wildcard, with no grant of its own", async () => {
      // The end-to-end proof that skipping those grants left no hole: no per-contract role exists,
      // and the call still goes through.
      expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, "pauseResource(address)"), GUARDIAN)).to.equal(false);

      const guardian = await initMainnetUser(GUARDIAN, ethers.utils.parseEther("1"));
      await source.connect(guardian).pauseResource(MOCK_CENTRIFUGE_VAULT_USDT);
      expect((await source.resourceConfig(MOCK_CENTRIFUGE_VAULT_USDT)).paused).to.equal(true);

      // Unpause is wildcarded too. Restore the state so this test leaves nothing behind.
      await source.connect(guardian).unpauseResource(MOCK_CENTRIFUGE_VAULT_USDT);
      expect((await source.resourceConfig(MOCK_CENTRIFUGE_VAULT_USDT)).paused).to.equal(false);
    });
  });

  // One pass through the async lifecycle the group exists for: capital in, shares held, redeemed,
  // claimed, and back out. The steps share state and run in order.
  //
  // The mock fund has `autoFulfill` on, so each request lands in its claimable bucket in the same
  // call instead of waiting on a fund manager. That collapses the waiting, not the steps — every
  // claim the keeper would make on a real fund still has to be made here.
  describe("Post-VIP end-to-end: fund the Centrifuge group, then redeem it back", () => {
    // Testnet USDT is 6-decimal, and 10 is the Hub's `maxWithdrawalSize`. Sizing the round trip to
    // that ceiling is what lets the last step be a single real Hub withdrawal.
    const AMOUNT = ethers.utils.parseUnits("10", 6);

    let operator: SignerWithAddress;
    let shareToken: Contract;
    let vusdt: string;
    let shares: BigNumber;

    before(async () => {
      // The Guardian multisig is the Operator and the Keeper on this network, and already held
      // `reallocate` on the Hub before this VIP.
      operator = await initMainnetUser(GUARDIAN, ethers.utils.parseEther("1"));
      shareToken = await ethers.getContractAt(ERC20_ABI, await vault.share());
      // Read Core's resource rather than hardcoding vUSDT: it is the only one registered there.
      const core = await ethers.getContractAt(YIELD_GROUP_CENTRIFUGE_ABI, CORE_SOURCE_USDT);
      vusdt = (await core.resources())[0];
    });

    const leg = (yieldGroup: string, resource: string, amount: BigNumber) => ({ yieldGroup, resource, amount });

    it("an operator reallocation is what puts capital in — no user deposit can reach it", async () => {
      // Centrifuge is absent from the outer deposit queue, so this targeted leg is the only route.
      await hub
        .connect(operator)
        .reallocate(
          [leg(CORE_SOURCE_USDT, vusdt, AMOUNT)],
          [leg(CENTRIFUGE_SOURCE_USDT, MOCK_CENTRIFUGE_VAULT_USDT, AMOUNT)],
        );

      // Valued at the fund's NAV, which the mock holds at 1.00 while no drift is set.
      expect(await source.totalAssets()).to.equal(AMOUNT);
      // The assets left the Hub for the fund rather than sitting on the group.
      expect(await usdt.balanceOf(CENTRIFUGE_SOURCE_USDT)).to.equal(0);
    });

    it("the group advertises nothing withdrawable while the position is invested", async () => {
      // This is what makes first place in the withdraw queue free: the cascade probes and moves on.
      expect(await source.maxWithdraw()).to.equal(0);
      // Shares are issued but still sit in the fund's claimable bucket, uncollected.
      expect(await shareToken.balanceOf(CENTRIFUGE_SOURCE_USDT)).to.equal(0);
    });

    it("the keeper claims the settled subscription, and the group takes custody of the shares", async () => {
      await source.connect(operator).claimDeposit(MOCK_CENTRIFUGE_VAULT_USDT);

      shares = await shareToken.balanceOf(CENTRIFUGE_SOURCE_USDT);
      expect(shares).to.be.gt(0);
      // Claiming moves shares, it does not change what they are worth.
      expect(await source.totalAssets()).to.equal(AMOUNT);
    });

    it("a redeem request burns the shares and reserves the assets for the group", async () => {
      await source.connect(operator).requestRedeem(MOCK_CENTRIFUGE_VAULT_USDT, shares);

      expect(await shareToken.balanceOf(CENTRIFUGE_SOURCE_USDT)).to.equal(0);
      // Settled proceeds count as withdrawable before anyone claims them, so the group starts
      // advertising liquidity here rather than after the claim.
      expect(await source.maxWithdraw()).to.equal(AMOUNT);
      expect(await source.totalAssets()).to.equal(AMOUNT);
    });

    it("the keeper claims the redemption, leaving the assets idle on the group", async () => {
      await source.connect(operator).claimRedeem(MOCK_CENTRIFUGE_VAULT_USDT);

      expect(await usdt.balanceOf(CENTRIFUGE_SOURCE_USDT)).to.equal(AMOUNT);
      // Still withdrawable, now because it is idle rather than because it is claimable.
      expect(await source.maxWithdraw()).to.equal(AMOUNT);
    });

    it("a Hub withdrawal drains Centrifuge first, emptying the group", async () => {
      // Idle assets sitting on the group are out of reach of a resource-targeted reallocate leg —
      // they are no longer tied to the vault, so the resource reports no liquidity for them. The
      // Hub's own cascade is what reaches them, and Centrifuge leads that queue: the whole
      // withdrawal is routed to this group, and Core is never asked.
      await expect(hub.connect(operator).withdraw(AMOUNT, GUARDIAN, GUARDIAN))
        .to.emit(hub, "WithdrawRouted")
        .withArgs(CENTRIFUGE_SOURCE_USDT, AMOUNT);

      expect(await usdt.balanceOf(CENTRIFUGE_SOURCE_USDT)).to.equal(0);
      expect(await shareToken.balanceOf(CENTRIFUGE_SOURCE_USDT)).to.equal(0);
      expect(await source.totalAssets()).to.equal(0);
      expect(await source.maxWithdraw()).to.equal(0);
    });
  });
});
