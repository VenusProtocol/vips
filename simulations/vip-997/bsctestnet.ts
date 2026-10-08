import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip997, {
  ABSOLUTE_CAP_UNBOUNDED,
  ACM,
  ADAPTER_SPOKE_V1,
  CENTRIFUGE_SOURCE_USDT,
  CORE_SOURCE_USDT,
  CRITICAL_TIMELOCK,
  FAST_TRACK_TIMELOCK,
  FLUX_SOURCE_USDT,
  FRV_SOURCE_USDT,
  GUARDIAN,
  HUB_USDT,
  NORMAL_TIMELOCK,
  OUTER_DEPOSIT_QUEUE,
  OUTER_WITHDRAW_QUEUE,
  PERCENTAGE_CAP_DISABLED,
  SPOKE_BEACON,
  SPOKE_COMPTROLLER,
  SPOKE_SOURCE_USDT,
  USDT,
  VUSDT_SPOKE,
} from "../../vips/vip-997/bsctestnet";
import {
  GUARDIAN_GRANTS,
  GUARDIAN_WILDCARDS,
  HUB_YIELD_GROUP_SETTERS,
  REALLOCATE,
  SET_ALLOWED_SUPPLIER,
  SPOKE_SOURCE_GOVERNANCE,
  TIMELOCK_GRANTS,
} from "../../vips/vip-997/permissions-bsctestnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import ADAPTER_SPOKE_ABI from "./abi/AdapterSpokeV1.json";
import HUB_ABI from "./abi/Hub.json";
import SPOKE_COMPTROLLER_ABI from "./abi/SpokeComptroller.json";
import VTOKEN_ABI from "./abi/VToken.json";
import YIELD_GROUP_ABI from "./abi/YieldGroup.json";

// After the Spoke family deployment and after QA's changes to the spoke pool and the Hub.
const BLOCK_NUMBER = 135359000;

const addr = (a: string) => ethers.utils.getAddress(a);
const addrs = (list: string[]) => list.map(addr);
const ZERO_ADDRESS = ethers.constants.AddressZero;
const TIMELOCKS = [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK];

// EIP-1967 beacon slot: bytes32(uint256(keccak256("eip1967.proxy.beacon")) - 1).
const BEACON_SLOT = "0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50";

// The ACM role key is keccak256(abi.encodePacked(targetContract, functionSignature)). `isAllowedToCall`
// is not usable from a test EOA: it reads `msg.sender` as the target contract.
const roleOf = (contract: string, sig: string) =>
  ethers.utils.solidityKeccak256(["address", "string"], [contract, sig]);

// The testnet USDT mock mints through `allocateTo`, not `faucet`.
const USDT_ABI = [
  "function allocateTo(address,uint256)",
  "function approve(address,uint256) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
];

// Pinned so a queue change made on testnet before execution fails here, instead of being overwritten by
// a proposal built against an older state.
const DEPOSIT_QUEUE_BEFORE_VIP = [FRV_SOURCE_USDT, FLUX_SOURCE_USDT, CORE_SOURCE_USDT];
const WITHDRAW_QUEUE_BEFORE_VIP = [CENTRIFUGE_SOURCE_USDT, FRV_SOURCE_USDT, FLUX_SOURCE_USDT, CORE_SOURCE_USDT];
const GROUPS_BEFORE_VIP = [FRV_SOURCE_USDT, FLUX_SOURCE_USDT, CORE_SOURCE_USDT, CENTRIFUGE_SOURCE_USDT];

// Restated rather than imported, so a change in the VIP has to be mirrored here to pass.
const EXPECTED_DEPOSIT_QUEUE = [SPOKE_SOURCE_USDT, FRV_SOURCE_USDT, FLUX_SOURCE_USDT, CORE_SOURCE_USDT];
const EXPECTED_WITHDRAW_QUEUE = [
  SPOKE_SOURCE_USDT,
  CENTRIFUGE_SOURCE_USDT,
  FRV_SOURCE_USDT,
  FLUX_SOURCE_USDT,
  CORE_SOURCE_USDT,
];
const EXPECTED_ABSOLUTE_CAP = "340282366920938463463374607431768211455"; // type(uint128).max
const EXPECTED_PERCENTAGE_CAP_BPS = 10_000;

// Testnet USDC. Not an asset of this Hub, so the source never holds it and `sweep` is unrestricted.
const USDC = "0x16227D60f7a0e586C66B005219dfc887D13C9531";

// Testnet USDT has 6 decimals, and 10 USDT is the Hub's `maxWithdrawalSize` on this network.
const AMOUNT = ethers.utils.parseUnits("10", 6);
const MAX_WITHDRAWAL_SIZE = ethers.utils.parseUnits("10", 6);

forking(BLOCK_NUMBER, async () => {
  let hub: Contract;
  let source: Contract;
  let acm: Contract;
  let adapter: Contract;
  let comptroller: Contract;
  let vusdt: Contract;
  let usdt: Contract;

  before(async () => {
    hub = await ethers.getContractAt(HUB_ABI, HUB_USDT);
    source = await ethers.getContractAt(YIELD_GROUP_ABI, SPOKE_SOURCE_USDT);
    acm = await ethers.getContractAt(ACM_ABI, ACM);
    adapter = await ethers.getContractAt(ADAPTER_SPOKE_ABI, ADAPTER_SPOKE_V1);
    comptroller = await ethers.getContractAt(SPOKE_COMPTROLLER_ABI, SPOKE_COMPTROLLER);
    vusdt = await ethers.getContractAt(VTOKEN_ABI, VUSDT_SPOKE);
    usdt = await ethers.getContractAt(USDT_ABI, USDT);
  });

  describe("Pre-VIP state", () => {
    it("the source is a SpokeBeacon proxy bound to Hub_USDT and USDT, with blocksPerYear 0", async () => {
      const beacon = ethers.utils.hexDataSlice(await ethers.provider.getStorageAt(SPOKE_SOURCE_USDT, BEACON_SLOT), 12);
      expect(addr(beacon)).to.equal(addr(SPOKE_BEACON));
      expect(addr(await source.hub())).to.equal(addr(HUB_USDT));
      expect(addr(await source.asset())).to.equal(addr(USDT));
      expect(addr(await source.accessControlManager())).to.equal(addr(ACM));
      expect(await source.blocksPerYear()).to.equal(0);
    });

    it("the source holds no resources and is not registered on the Hub", async () => {
      expect(await source.resources()).to.deep.equal([]);
      expect(await source.innerDepositQueue()).to.deep.equal([]);
      expect(await source.innerWithdrawQueue()).to.deep.equal([]);
      expect(addrs(await hub.registeredYieldGroups())).to.not.include(addr(SPOKE_SOURCE_USDT));
    });

    it("the Hub's yield groups and both outer queues are what the VIP was built against", async () => {
      expect(addrs(await hub.registeredYieldGroups())).to.have.members(addrs(GROUPS_BEFORE_VIP));
      expect(addrs(await hub.outerDepositQueue())).to.deep.equal(addrs(DEPOSIT_QUEUE_BEFORE_VIP));
      expect(addrs(await hub.outerWithdrawQueue())).to.deep.equal(addrs(WITHDRAW_QUEUE_BEFORE_VIP));
      expect(await hub.hubPaused()).to.equal(false);
      expect(await hub.maxWithdrawalSize()).to.equal(MAX_WITHDRAWAL_SIZE);
    });

    it("vUSDT_HubSpoke is a listed USDT market of the spoke pool, with its supply allowlist on", async () => {
      expect(addr(await vusdt.underlying())).to.equal(addr(USDT));
      expect(addr(await vusdt.comptroller())).to.equal(addr(SPOKE_COMPTROLLER));
      expect(await comptroller.isMarketListed(VUSDT_SPOKE)).to.equal(true);
      expect(await comptroller.isSupplyAllowlistEnabled(VUSDT_SPOKE)).to.equal(true);
      expect(await comptroller.isAllowedSupplier(VUSDT_SPOKE, SPOKE_SOURCE_USDT)).to.equal(false);
      expect(await comptroller.actionPaused(VUSDT_SPOKE, 0)).to.equal(false); // MINT
      expect(await comptroller.actionPaused(VUSDT_SPOKE, 1)).to.equal(false); // REDEEM
    });

    it("without the allowlist entry the adapter rejects the registration", async () => {
      // This is the trap the allowlist command exists for. `validateRegistration` reads `msg.sender`
      // as the prospective supplier, so the call is made from the source's address.
      const asSource = adapter.connect(ethers.provider);
      await expect(asSource.validateRegistration(VUSDT_SPOKE, { from: SPOKE_SOURCE_USDT }))
        .to.be.revertedWithCustomError(adapter, "SupplyNotAllowed")
        .withArgs(VUSDT_SPOKE, SPOKE_SOURCE_USDT);
      expect(await asSource.maxDeposit(VUSDT_SPOKE, { from: SPOKE_SOURCE_USDT })).to.equal(0);
    });

    it("no timelock holds any role on the source, as a grant or as a wildcard", async () => {
      for (const holder of TIMELOCKS) {
        for (const sig of SPOKE_SOURCE_GOVERNANCE) {
          expect(await acm.hasRole(roleOf(SPOKE_SOURCE_USDT, sig), holder), sig).to.equal(false);
          expect(await acm.hasRole(roleOf(ZERO_ADDRESS, sig), holder), sig).to.equal(false);
        }
      }
    });

    it("the timelocks already hold every Hub-side yield-group setter on Hub_USDT", async () => {
      // The Normal Timelock uses three of these in the VIP; none of them is granted by it.
      for (const holder of TIMELOCKS) {
        for (const sig of HUB_YIELD_GROUP_SETTERS) {
          expect(await acm.hasRole(roleOf(HUB_USDT, sig), holder), sig).to.equal(true);
        }
      }
    });

    it("the normal timelock already holds the allowlist setter on the spoke comptroller", async () => {
      expect(await acm.hasRole(roleOf(SPOKE_COMPTROLLER, SET_ALLOWED_SUPPLIER), NORMAL_TIMELOCK)).to.equal(true);
    });

    it("the guardian already holds every source role as an address(0) wildcard", async () => {
      // Why the VIP grants it nothing on the source. Asserted so a revoked wildcard fails here.
      for (const sig of GUARDIAN_WILDCARDS) {
        expect(await acm.hasRole(roleOf(ZERO_ADDRESS, sig), GUARDIAN), sig).to.equal(true);
      }
      expect(GUARDIAN_GRANTS).to.deep.equal([]);
    });

    it("the guardian already holds every Hub-side setter for this group, and the allowlist", async () => {
      for (const sig of [...HUB_YIELD_GROUP_SETTERS, REALLOCATE]) {
        expect(await acm.hasRole(roleOf(HUB_USDT, sig), GUARDIAN), sig).to.equal(true);
      }
      expect(await acm.hasRole(roleOf(SPOKE_COMPTROLLER, SET_ALLOWED_SUPPLIER), GUARDIAN)).to.equal(true);
    });

    it("the market carries bad debt, which the adapter excludes from the position's value", async () => {
      // Pins the precondition of the mark-down asserted in the round trip below.
      expect(await vusdt.badDebt()).to.be.gt(0);
    });
  });

  testVip("VIP-997 [BNB Chain Testnet] Liquidity Hub (USDT): wire the Spoke yield family", await vip997(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACM_ABI], ["RoleGranted"], [TIMELOCKS.length * TIMELOCK_GRANTS.length]);
      await expectEvents(txResponse, [SPOKE_COMPTROLLER_ABI], ["AllowedSupplierUpdated"], [1]);
      await expectEvents(
        txResponse,
        [YIELD_GROUP_ABI],
        ["ResourceAdded", "InnerDepositQueueSet", "InnerWithdrawQueueSet"],
        [1, 1, 1],
      );
      await expectEvents(
        txResponse,
        [HUB_ABI],
        ["YieldGroupAdded", "OuterDepositQueueSet", "OuterWithdrawQueueSet"],
        [1, 1, 1],
      );
    },
  });

  describe("Post-VIP state", () => {
    it("the source is allowlisted on vUSDT_HubSpoke, and the allowlist stays on", async () => {
      expect(await comptroller.isAllowedSupplier(VUSDT_SPOKE, SPOKE_SOURCE_USDT)).to.equal(true);
      expect(await comptroller.isSupplyAllowlistEnabled(VUSDT_SPOKE)).to.equal(true);
    });

    it("vUSDT_HubSpoke is the only resource, behind AdapterSpokeV1", async () => {
      expect(addrs(await source.resources())).to.deep.equal([addr(VUSDT_SPOKE)]);
      const cfg = await source.resourceConfig(VUSDT_SPOKE);
      expect(cfg.registered).to.equal(true);
      expect(cfg.paused).to.equal(false);
      expect(addr(cfg.adapter)).to.equal(addr(ADAPTER_SPOKE_V1));
      // No per-resource cap: the market's own supply cap is the binding limit.
      expect(await source.resourceCap(VUSDT_SPOKE)).to.equal(0);
    });

    it("both inner queues hold vUSDT_HubSpoke alone", async () => {
      expect(addrs(await source.innerDepositQueue())).to.deep.equal([addr(VUSDT_SPOKE)]);
      expect(addrs(await source.innerWithdrawQueue())).to.deep.equal([addr(VUSDT_SPOKE)]);
    });

    it("the source is registered on the Hub, uncapped and unpaused", async () => {
      expect(addrs(await hub.registeredYieldGroups())).to.have.members(
        addrs([...GROUPS_BEFORE_VIP, SPOKE_SOURCE_USDT]),
      );
      const group = await hub.yieldGroupConfig(SPOKE_SOURCE_USDT);
      expect(group.registered).to.equal(true);
      expect(group.paused).to.equal(false);
      expect(group.absoluteCap).to.equal(EXPECTED_ABSOLUTE_CAP);
      expect(group.percentageCapBps).to.equal(EXPECTED_PERCENTAGE_CAP_BPS);
      expect(ABSOLUTE_CAP_UNBOUNDED).to.equal(EXPECTED_ABSOLUTE_CAP);
      expect(PERCENTAGE_CAP_DISABLED).to.equal(EXPECTED_PERCENTAGE_CAP_BPS);
    });

    it("Spoke leads both outer queues, and every earlier entry is kept in order", async () => {
      expect(addrs(await hub.outerDepositQueue())).to.deep.equal(addrs(EXPECTED_DEPOSIT_QUEUE));
      expect(addrs(await hub.outerWithdrawQueue())).to.deep.equal(addrs(EXPECTED_WITHDRAW_QUEUE));
      expect(addrs(OUTER_DEPOSIT_QUEUE)).to.deep.equal(addrs(EXPECTED_DEPOSIT_QUEUE));
      expect(addrs(OUTER_WITHDRAW_QUEUE)).to.deep.equal(addrs(EXPECTED_WITHDRAW_QUEUE));
    });

    it("the source now reports deposit room, which the market's supply cap bounds", async () => {
      expect(await source.maxDeposit()).to.be.gt(0);
      expect(await source.maxDeposit()).to.be.lte(await comptroller.supplyCaps(VUSDT_SPOKE));
    });

    it("all three timelocks hold the full source surface as exact grants", async () => {
      for (const holder of TIMELOCKS) {
        for (const sig of TIMELOCK_GRANTS) {
          expect(await acm.hasRole(roleOf(SPOKE_SOURCE_USDT, sig), holder), sig).to.equal(true);
        }
      }
    });

    it("the guardian reaches the full source surface through its wildcards, with no exact grant", async () => {
      for (const sig of SPOKE_SOURCE_GOVERNANCE) {
        expect(await acm.hasRole(roleOf(ZERO_ADDRESS, sig), GUARDIAN), sig).to.equal(true);
        expect(await acm.hasRole(roleOf(SPOKE_SOURCE_USDT, sig), GUARDIAN), sig).to.equal(false);
      }
    });
  });

  // One deposit through the new route and back out. The steps share state and run in order.
  describe("Post-VIP round trip: a Hub deposit lands in vUSDT_HubSpoke and is withdrawn from it", () => {
    let user: SignerWithAddress;
    let shares: BigNumber;
    let vBalBefore: BigNumber;
    let vBalAfterDeposit: BigNumber;

    before(async () => {
      user = await initMainnetUser("0x00000000000000000000000000000000000Ab997", ethers.utils.parseEther("1"));
      await usdt.connect(user).allocateTo(user.address, AMOUNT);
      await usdt.connect(user).approve(HUB_USDT, AMOUNT);
      vBalBefore = await vusdt.balanceOf(SPOKE_SOURCE_USDT);
    });

    it("the deposit is routed entirely to the Spoke source, into vUSDT_HubSpoke", async () => {
      const tx = await hub.connect(user).deposit(AMOUNT, user.address);
      await expect(tx).to.emit(hub, "DepositRouted").withArgs(SPOKE_SOURCE_USDT, AMOUNT);
      await expect(tx).to.emit(source, "DepositRouted").withArgs(VUSDT_SPOKE, AMOUNT);

      shares = await hub.balanceOf(user.address);
      expect(shares).to.be.gt(0);
      vBalAfterDeposit = await vusdt.balanceOf(SPOKE_SOURCE_USDT);
      expect(vBalAfterDeposit).to.be.gt(vBalBefore);
      // Every unit reached the market: nothing is left idle on the source.
      expect(await usdt.balanceOf(SPOKE_SOURCE_USDT)).to.equal(0);
    });

    it("the position is marked down by its share of the market's bad debt", async () => {
      // AdapterSpokeV1 values the position off cash + borrows - reserves, with bad debt excluded,
      // while the mint priced it at the market's exchange rate, which includes bad debt.
      const value = await source.totalAssets();
      expect(value).to.equal(await adapter.totalAssets(VUSDT_SPOKE, SPOKE_SOURCE_USDT));
      expect(value).to.be.lt(AMOUNT);
      const atMarketRate = (await vusdt.balanceOf(SPOKE_SOURCE_USDT))
        .mul(await vusdt.exchangeRateStored())
        .div(ethers.constants.WeiPerEther);
      expect(value).to.be.lt(atMarketRate);
    });

    it("redeeming the shares withdraws from the Spoke source first", async () => {
      const usdtBefore = await usdt.balanceOf(user.address);
      const expectedAssets = await hub.previewRedeem(shares);

      const tx = await hub.connect(user).redeem(shares, user.address, user.address);
      const receipt = await tx.wait();

      const routed = receipt.logs
        .filter((log: { address: string }) => addr(log.address) === addr(HUB_USDT))
        .map((log: { topics: string[]; data: string }) => {
          try {
            return hub.interface.parseLog(log);
          } catch {
            return undefined;
          }
        })
        .filter((parsed: { name: string } | undefined) => parsed?.name === "WithdrawRouted");

      expect(routed.length).to.be.gte(1);
      expect(addr(routed[0].args.yieldGroup)).to.equal(addr(SPOKE_SOURCE_USDT));
      expect(routed[0].args.amount).to.be.gt(0);

      const received = (await usdt.balanceOf(user.address)).sub(usdtBefore);
      expect(received).to.equal(expectedAssets);
      const totalRouted = routed.reduce(
        (sum: BigNumber, e: { args: { amount: BigNumber } }) => sum.add(e.args.amount),
        BigNumber.from(0),
      );
      expect(totalRouted).to.equal(received);
      expect(await hub.balanceOf(user.address)).to.equal(0);
      // The Spoke leg burned vTokens out of the position the deposit created.
      expect(await vusdt.balanceOf(SPOKE_SOURCE_USDT)).to.be.lt(vBalAfterDeposit);
    });
  });

  // The point of granting the Guardian nothing: it can already make every Spoke config change a
  // proposal would otherwise be needed for. Each call is reverted to the VIP's state afterwards.
  describe("Post-VIP: the guardian can reconfigure the Spoke family without a proposal", () => {
    let guardian: SignerWithAddress;

    before(async () => {
      guardian = await initMainnetUser(GUARDIAN, ethers.utils.parseEther("1"));
    });

    it("reorders both outer queues", async () => {
      const depositLast = [FRV_SOURCE_USDT, FLUX_SOURCE_USDT, CORE_SOURCE_USDT, SPOKE_SOURCE_USDT];
      const withdrawLast = [
        CENTRIFUGE_SOURCE_USDT,
        FRV_SOURCE_USDT,
        FLUX_SOURCE_USDT,
        CORE_SOURCE_USDT,
        SPOKE_SOURCE_USDT,
      ];
      await hub.connect(guardian).setOuterDepositQueue(depositLast);
      await hub.connect(guardian).setOuterWithdrawQueue(withdrawLast);
      expect(addrs(await hub.outerDepositQueue())).to.deep.equal(addrs(depositLast));
      expect(addrs(await hub.outerWithdrawQueue())).to.deep.equal(addrs(withdrawLast));

      await hub.connect(guardian).setOuterDepositQueue(EXPECTED_DEPOSIT_QUEUE);
      await hub.connect(guardian).setOuterWithdrawQueue(EXPECTED_WITHDRAW_QUEUE);
      expect(addrs(await hub.outerDepositQueue())).to.deep.equal(addrs(EXPECTED_DEPOSIT_QUEUE));
      expect(addrs(await hub.outerWithdrawQueue())).to.deep.equal(addrs(EXPECTED_WITHDRAW_QUEUE));
    });

    it("sets the inner deposit queue", async () => {
      await source.connect(guardian).setInnerDepositQueue([]);
      expect(await source.innerDepositQueue()).to.deep.equal([]);
      await source.connect(guardian).setInnerDepositQueue([VUSDT_SPOKE]);
      await source.connect(guardian).setInnerWithdrawQueue([VUSDT_SPOKE]);
      expect(addrs(await source.innerDepositQueue())).to.deep.equal([addr(VUSDT_SPOKE)]);
      expect(addrs(await source.innerWithdrawQueue())).to.deep.equal([addr(VUSDT_SPOKE)]);
    });

    it("lowers and raises the per-resource cap and the Hub cap on the group", async () => {
      const cap = ethers.utils.parseUnits("1000", 6);
      await source.connect(guardian).lowerResourceCap(VUSDT_SPOKE, cap);
      expect(await source.resourceCap(VUSDT_SPOKE)).to.equal(cap);
      await source.connect(guardian).raiseResourceCap(VUSDT_SPOKE, 0); // 0 = unbounded
      expect(await source.resourceCap(VUSDT_SPOKE)).to.equal(0);

      await hub.connect(guardian).lowerYieldGroupCap(SPOKE_SOURCE_USDT, cap, EXPECTED_PERCENTAGE_CAP_BPS);
      expect((await hub.yieldGroupConfig(SPOKE_SOURCE_USDT)).absoluteCap).to.equal(cap);
      await hub
        .connect(guardian)
        .raiseYieldGroupCap(SPOKE_SOURCE_USDT, EXPECTED_ABSOLUTE_CAP, EXPECTED_PERCENTAGE_CAP_BPS);
      expect((await hub.yieldGroupConfig(SPOKE_SOURCE_USDT)).absoluteCap).to.equal(EXPECTED_ABSOLUTE_CAP);
    });

    it("pauses and unpauses the resource and the group", async () => {
      await source.connect(guardian).pauseResource(VUSDT_SPOKE);
      expect((await source.resourceConfig(VUSDT_SPOKE)).paused).to.equal(true);
      await source.connect(guardian).unpauseResource(VUSDT_SPOKE);
      expect((await source.resourceConfig(VUSDT_SPOKE)).paused).to.equal(false);

      await hub.connect(guardian).pauseYieldGroup(SPOKE_SOURCE_USDT);
      expect((await hub.yieldGroupConfig(SPOKE_SOURCE_USDT)).paused).to.equal(true);
      await hub.connect(guardian).unpauseYieldGroup(SPOKE_SOURCE_USDT);
      expect((await hub.yieldGroupConfig(SPOKE_SOURCE_USDT)).paused).to.equal(false);
    });

    it("swaps the adapter, sets the annualiser and sweeps", async () => {
      // Re-pointing at the same adapter runs the full validation path, as a swap to a new one would.
      await expect(source.connect(guardian).updateResourceAdapter(VUSDT_SPOKE, ADAPTER_SPOKE_V1)).to.emit(
        source,
        "ResourceAdapterUpdated",
      );
      await source.connect(guardian).setBlocksPerYear(0);
      expect(await source.blocksPerYear()).to.equal(0);
      // A token the source does not hold: a no-op transfer, but the role check still runs.
      await source.connect(guardian).sweep(USDC, GUARDIAN);
    });

    it("toggles the source's supply allowlist entry on the market", async () => {
      await comptroller.connect(guardian).setAllowedSupplier(VUSDT_SPOKE, SPOKE_SOURCE_USDT, false);
      expect(await comptroller.isAllowedSupplier(VUSDT_SPOKE, SPOKE_SOURCE_USDT)).to.equal(false);
      // Off the allowlist, the source reports no room, so the Hub routes around it.
      expect(await source.maxDeposit()).to.equal(0);
      await comptroller.connect(guardian).setAllowedSupplier(VUSDT_SPOKE, SPOKE_SOURCE_USDT, true);
      expect(await comptroller.isAllowedSupplier(VUSDT_SPOKE, SPOKE_SOURCE_USDT)).to.equal(true);
    });
  });
});
