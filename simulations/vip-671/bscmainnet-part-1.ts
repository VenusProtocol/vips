import { expect } from "chai";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  ACM,
  BSTOCK_LIQUIDATOR,
  BSTOCK_LIQUIDATOR_IMPL,
  BSTOCK_LIQUIDATOR_LIVE_IMPL,
  BSTOCK_LIQUIDATOR_PROXY_ADMIN,
  BSTOCK_LIQUIDATOR_ROUTERS,
  BSTOCK_LIQUIDATOR_VBNB,
  BSTOCK_LIQUIDATOR_VWBNB,
  CLOSE_FACTOR,
  CORE_COMPTROLLER,
  CRITICAL_GUARDIAN,
  CRITICAL_TIMELOCK,
  DEFAULT_PROXY_ADMIN,
  DEVIATION_BOUNDED_ORACLE,
  FAST_TRACK_TIMELOCK,
  ISOLATED_POOL_REGISTRY,
  MAX_LOOPS_LIMIT,
  MIN_LIQUIDATABLE_COLLATERAL,
  NORMAL_TIMELOCK,
  OPERATOR,
  ORACLE_GUARDIAN,
  PAUSE_GUARDIAN,
  PENDING,
  POOL_LIQUIDATION_INCENTIVE,
  POOL_NAME,
  PROTOCOL_SHARE_RESERVE,
  PROTOCOL_SHARE_RESERVE_IMPL,
  PROTOCOL_SHARE_RESERVE_LIVE_IMPL,
  RESILIENT_ORACLE,
  RISK_FUND_CONVERTER,
  SPOKE_COMPTROLLER,
  SPOKE_COMPTROLLER_BEACON,
  SPOKE_POOL_REGISTRY,
  SPOKE_VTOKEN_BEACON,
  WBNB,
} from "../../vips/vip-671/addresses/bscmainnet";
import vip671Part1Bscmainnet, { pendingDeployments } from "../../vips/vip-671/bscmainnet-part-1";
import { REGISTRY_DRIVEN_ROLES, SPOKE_COMPTROLLER_ROLES } from "../../vips/vip-671/permissions";
import { ASSUMED_WILDCARDS, MUST_NOT_BE_WILDCARD, VIP_A_GRANTS } from "../../vips/vip-671/permissions-bscmainnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import BSTOCK_LIQUIDATOR_ABI from "./abi/BStockLiquidator.json";
import DBO_ABI from "./abi/DeviationBoundedOracle.json";
import PSR_ABI from "./abi/ProtocolShareReserve.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";
import COMPTROLLER_ABI from "./abi/SpokeComptroller.json";
import POOL_REGISTRY_ABI from "./abi/SpokePoolRegistry.json";
import VTOKEN_ABI from "./abi/VToken.json";

/// TODO(deploy): move past the block that deploys the spoke stack and both implementations, so the gated
/// assertions below run against the real deployment. Until then this block only checks what VIP-A relies on
/// from the live chain.
const FORK_BLOCK = 127396000;

/// EIP-1967 slots, each `bytes32(uint256(keccak256("eip1967.proxy.<name>")) - 1)`. Read directly rather than through
/// `ProxyAdmin.getProxyAdmin`, which only answers for proxies that expose `admin()` to their admin.
const ADMIN_SLOT = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";
const IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
const BEACON_SLOT = "0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50";

/// A `msg.sender` that holds no grant of its own. `isAllowedToCall` tries `keccak256(msg.sender, role)` and
/// then `keccak256(address(0), role)`, so asking from here isolates the address(0) wildcard. Asking from the
/// target contract instead answers "wildcard OR a grant against this contract", which is what a real call sees.
const UNRELATED = ethers.utils.getAddress(ethers.utils.hexDataSlice(ethers.utils.id("vip-671 unrelated sender"), 12));

/// Every account whose permissions this proposal touches or relies on. A wildcard held by anyone else cannot be
/// seen from here; these are the ones that would matter. SPOKE_POOL_REGISTRY is the zero address until it is
/// deployed, so before that this entry also covers address(0).
const KNOWN_ACCOUNTS = [
  NORMAL_TIMELOCK,
  FAST_TRACK_TIMELOCK,
  CRITICAL_TIMELOCK,
  CRITICAL_GUARDIAN,
  PAUSE_GUARDIAN,
  SPOKE_POOL_REGISTRY,
  OPERATOR,
  ORACLE_GUARDIAN,
  ISOLATED_POOL_REGISTRY,
];

const ACM_IFACE = new ethers.utils.Interface(["function isAllowedToCall(address,string) view returns (bool)"]);
const mayCall = async (onBehalfOf: string, account: string, signature: string): Promise<boolean> => {
  const data = ACM_IFACE.encodeFunctionData("isAllowedToCall", [account, signature]);
  const result = await ethers.provider.call({ to: ACM, data, from: onBehalfOf });
  return ACM_IFACE.decodeFunctionResult("isAllowedToCall", result)[0];
};

const sameAddress = (a: string, b: string) => ethers.utils.getAddress(a) === ethers.utils.getAddress(b);

/// Deployment packages and literals do not agree on checksum casing, so every address comparison normalizes both
/// sides.
const expectAddress = (actual: string, expected: string, label?: string) =>
  expect(ethers.utils.getAddress(actual), label).to.equal(ethers.utils.getAddress(expected));

const readSlotAddress = async (proxy: string, slot: string): Promise<string> =>
  ethers.utils.getAddress(ethers.utils.hexDataSlice(await ethers.provider.getStorageAt(proxy, slot), 12));

const reverts = async (call: () => Promise<unknown>): Promise<boolean> => {
  try {
    await call();
    return false;
  } catch {
    return true;
  }
};

type DistributionRow = { schema: number; percentage: number; destination: string };

forking(FORK_BLOCK, async () => {
  const missing = pendingDeployments();

  const psr = new ethers.Contract(PROTOCOL_SHARE_RESERVE, PSR_ABI, ethers.provider);
  const defaultProxyAdmin = new ethers.Contract(DEFAULT_PROXY_ADMIN, PROXY_ADMIN_ABI, ethers.provider);
  const liquidator = new ethers.Contract(BSTOCK_LIQUIDATOR, BSTOCK_LIQUIDATOR_ABI, ethers.provider);
  const liquidatorProxyAdmin = new ethers.Contract(BSTOCK_LIQUIDATOR_PROXY_ADMIN, PROXY_ADMIN_ABI, ethers.provider);
  const dbo = new ethers.Contract(DEVIATION_BOUNDED_ORACLE, DBO_ABI, ethers.provider);
  const isolatedRegistry = new ethers.Contract(ISOLATED_POOL_REGISTRY, POOL_REGISTRY_ABI, ethers.provider);

  const readDistributions = async (): Promise<DistributionRow[]> => {
    const total = (await psr.totalDistributions()).toNumber();
    const rows = await Promise.all([...Array(total)].map((_, i) => psr.distributionTargets(i)));
    return rows.map(r => ({ schema: r.schema, percentage: r.percentage, destination: r.destination }));
  };

  /// Captured before the proposal runs and compared after it: VIP-A must not move a single distribution row.
  let distributionsBefore: DistributionRow[] = [];

  // Everything VIP-A takes for granted rather than granting, read from the chain as it is today. None of it
  // depends on the spoke stack being deployed, so it runs on every fork block. A revocation or an upgrade by
  // another proposal turns this red instead of reverting VIP-A on execution.
  describe("Pre-VIP: what VIP-A relies on, on the live chain", () => {
    it("holds every wildcard the proposal relies on, for every account the VIP document names", async () => {
      for (const [target, grants] of Object.entries(ASSUMED_WILDCARDS)) {
        for (const { role, account } of grants) {
          expect(await mayCall(UNRELATED, account, role), `${target}: ${account} may ${role}`).to.be.true;
        }
      }
    });

    it("gives the isolated-pools registry the setters addPool drives, as wildcards naming that registry", async () => {
      // The spoke registry is a different account and inherits none of these, which is why VIP-A grants them.
      for (const role of REGISTRY_DRIVEN_ROLES) {
        expect(await mayCall(UNRELATED, ISOLATED_POOL_REGISTRY, role), `isolated registry may ${role}`).to.be.true;
      }
    });

    it("holds none of the spoke-only roles, the router role or the uint8[] pause form as a wildcard", async () => {
      for (const role of MUST_NOT_BE_WILDCARD) {
        for (const account of KNOWN_ACCOUNTS) {
          expect(await mayCall(UNRELATED, account, role), `${account} holds ${role} as a wildcard`).to.be.false;
        }
      }
    });

    it("holds none of the 19 VIP-A grants as a wildcard, so each grant is a real change", async () => {
      for (const { role, account } of VIP_A_GRANTS.filter(g => !sameAddress(g.account, PENDING))) {
        expect(await mayCall(UNRELATED, account, role), `${account} holds ${role} as a wildcard`).to.be.false;
      }
    });

    it("owns ProtocolShareReserve and its proxy admin from the Normal Timelock", async () => {
      // `upgrade` and `addPoolRegistry` are both onlyOwner, so neither needs an ACM grant.
      expectAddress(await psr.owner(), NORMAL_TIMELOCK);
      expectAddress(await defaultProxyAdmin.owner(), NORMAL_TIMELOCK);
      expectAddress(await readSlotAddress(PROTOCOL_SHARE_RESERVE, ADMIN_SLOT), DEFAULT_PROXY_ADMIN);
    });

    it("runs ProtocolShareReserve on the single-registry implementation", async () => {
      expectAddress(
        await readSlotAddress(PROTOCOL_SHARE_RESERVE, IMPLEMENTATION_SLOT),
        PROTOCOL_SHARE_RESERVE_LIVE_IMPL,
      );
      expectAddress(await psr.poolRegistry(), ISOLATED_POOL_REGISTRY);
      expect(await reverts(() => psr.getPoolRegistries()), "getPoolRegistries reachable").to.be.true;
      // `addPoolRegistry` checks the additional-registry count against this bound.
      expect(await psr.maxLoopsLimit()).to.be.gte(1);
    });

    it("splits each schema 100% with the RiskFundConverter on neither", async () => {
      distributionsBefore = await readDistributions();
      for (const schema of [0, 1]) {
        const total = distributionsBefore.filter(r => r.schema === schema).reduce((sum, r) => sum + r.percentage, 0);
        expect(total, `schema ${schema} total`).to.equal(10_000);
      }
      expect(distributionsBefore.filter(r => sameAddress(r.destination, RISK_FUND_CONVERTER))).to.have.lengthOf(0);
    });

    it("owns BStockLiquidator's proxy admin from the Normal Timelock, and the liquidator from the Operator", async () => {
      expectAddress(await liquidatorProxyAdmin.owner(), NORMAL_TIMELOCK);
      expectAddress(await readSlotAddress(BSTOCK_LIQUIDATOR, ADMIN_SLOT), BSTOCK_LIQUIDATOR_PROXY_ADMIN);
      expectAddress(await readSlotAddress(BSTOCK_LIQUIDATOR, IMPLEMENTATION_SLOT), BSTOCK_LIQUIDATOR_LIVE_IMPL);
      expectAddress(await liquidator.owner(), OPERATOR);
      expectAddress(await liquidator.pendingOwner(), ethers.constants.AddressZero);
    });

    it("builds the live BStockLiquidator with the immutables the new implementation must repeat", async () => {
      expectAddress(await liquidator.comptroller(), CORE_COMPTROLLER);
      expectAddress(await liquidator.vBNB(), BSTOCK_LIQUIDATOR_VBNB);
      expectAddress(await liquidator.vWBNB(), BSTOCK_LIQUIDATOR_VWBNB);
      expectAddress(await liquidator.wbnb(), WBNB);
    });

    it("allowlists the recorded routers and spenders, and has no poolRegistry yet", async () => {
      for (const { name, router, spender } of BSTOCK_LIQUIDATOR_ROUTERS) {
        expect(await liquidator.isRouter(router), `${name} allowlisted`).to.be.true;
        expectAddress(await liquidator.routerSpender(router), spender, `${name} spender`);
      }
      expect(await reverts(() => liquidator.poolRegistry()), "poolRegistry reachable").to.be.true;
    });

    it("pairs the DeviationBoundedOracle with the ResilientOracle the pool will use", async () => {
      expectAddress(await dbo.RESILIENT_ORACLE(), RESILIENT_ORACLE);
    });
  });

  if (missing.length > 0) {
    describe("VIP-671 [bscmainnet] VIP-A spoke pool infrastructure", () => {
      // Mocha reports an `it` without a body as pending, so the run stays green and says what is missing.
      it(`is not simulated until these are deployed: ${missing.join(", ")}`);
    });
    return;
  }

  const comptroller = new ethers.Contract(SPOKE_COMPTROLLER, COMPTROLLER_ABI, ethers.provider);
  const registry = new ethers.Contract(SPOKE_POOL_REGISTRY, POOL_REGISTRY_ABI, ethers.provider);

  describe("Pre-VIP: the deployed spoke stack", () => {
    it("leaves both Ownable2Step contracts with the deployer, the Normal Timelock only nominated", async () => {
      for (const c of [comptroller, registry]) {
        expect(sameAddress(await c.owner(), NORMAL_TIMELOCK), "already owned by the Normal Timelock").to.be.false;
        expectAddress(await c.pendingOwner(), NORMAL_TIMELOCK);
      }
    });

    it("hands both beacons to the Normal Timelock already, so the proposal needs no command for them", async () => {
      const beaconAbi = ["function owner() view returns (address)"];
      for (const beacon of [SPOKE_COMPTROLLER_BEACON, SPOKE_VTOKEN_BEACON]) {
        expectAddress(await new ethers.Contract(beacon, beaconAbi, ethers.provider).owner(), NORMAL_TIMELOCK);
      }
    });

    it("puts the comptroller behind its own beacon", async () => {
      expectAddress(await readSlotAddress(SPOKE_COMPTROLLER, BEACON_SLOT), SPOKE_COMPTROLLER_BEACON);
    });

    it("puts the registry behind the shared DefaultProxyAdmin", async () => {
      expectAddress(await readSlotAddress(SPOKE_POOL_REGISTRY, ADMIN_SLOT), DEFAULT_PROXY_ADMIN);
    });

    it("wires the comptroller to the spoke registry, not the isolated-pools one", async () => {
      // A constructor immutable with no setter, checked by `supportMarket`. Nothing in the proposal can fix it.
      expectAddress(await comptroller.poolRegistry(), SPOKE_POOL_REGISTRY);
      expectAddress(await comptroller.accessControlManager(), ACM);
      expectAddress(await registry.accessControlManager(), ACM);
      expect(await comptroller.maxLoopsLimit()).to.equal(MAX_LOOPS_LIMIT);
    });

    it("has an empty registry, no market and both oracles unset", async () => {
      expect(await registry.getAllPools()).to.have.lengthOf(0);
      expect(await comptroller.getAllMarkets()).to.have.lengthOf(0);
      expectAddress(await comptroller.oracle(), ethers.constants.AddressZero);
      expectAddress(await comptroller.deviationBoundedOracle(), ethers.constants.AddressZero);
    });

    it("gives no account any of the 19 VIP-A permissions on the comptroller yet", async () => {
      for (const { role, account } of VIP_A_GRANTS) {
        expect(await mayCall(SPOKE_COMPTROLLER, account, role), `${account} may ${role}`).to.be.false;
      }
    });

    it("builds the new ProtocolShareReserve implementation with the live immutables", async () => {
      // `deploy/000-psr.ts` falls back to a placeholder when an artifact is missing, and a drifted
      // CORE_POOL_COMPTROLLER silently breaks the Core bypass in `updateAssetsState`.
      expect(sameAddress(PROTOCOL_SHARE_RESERVE_IMPL, PROTOCOL_SHARE_RESERVE_LIVE_IMPL), "same as live").to.be.false;
      const impl = new ethers.Contract(PROTOCOL_SHARE_RESERVE_IMPL, PSR_ABI, ethers.provider);
      for (const getter of ["CORE_POOL_COMPTROLLER", "WBNB", "vBNB"]) {
        expectAddress(await impl[getter](), await psr[getter](), getter);
      }
    });

    it("builds the new BStockLiquidator implementation with the live immutables", async () => {
      expect(sameAddress(BSTOCK_LIQUIDATOR_IMPL, BSTOCK_LIQUIDATOR_LIVE_IMPL), "same as live").to.be.false;
      const impl = new ethers.Contract(BSTOCK_LIQUIDATOR_IMPL, BSTOCK_LIQUIDATOR_ABI, ethers.provider);
      expectAddress(await impl.comptroller(), CORE_COMPTROLLER);
      expectAddress(await impl.vBNB(), BSTOCK_LIQUIDATOR_VBNB);
      expectAddress(await impl.vWBNB(), BSTOCK_LIQUIDATOR_VWBNB);
      expectAddress(await impl.wbnb(), WBNB);
    });
  });

  testVip("VIP-671 [bscmainnet] VIP-A spoke pool infrastructure", await vip671Part1Bscmainnet(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACM_ABI], ["PermissionGranted"], [VIP_A_GRANTS.length]);
      // Both Ownable2Step contracts share the event, so it is counted through one ABI only.
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        [
          "OwnershipTransferred",
          "NewPriceOracle",
          "NewDeviationBoundedOracle",
          "NewCloseFactor",
          "NewLiquidationIncentive",
          "NewMinLiquidatableCollateral",
        ],
        [2, 1, 1, 1, 1, 1],
      );
      await expectEvents(txResponse, [POOL_REGISTRY_ABI], ["PoolRegistered"], [1]);
      await expectEvents(txResponse, [PSR_ABI], ["PoolRegistryAdded"], [1]);
      await expectEvents(txResponse, [PROXY_ADMIN_ABI], ["Upgraded"], [2]);
    },
  });

  describe("Post-VIP", () => {
    it("hands both Ownable2Step contracts to the Normal Timelock", async () => {
      for (const c of [comptroller, registry]) {
        expectAddress(await c.owner(), NORMAL_TIMELOCK);
        expectAddress(await c.pendingOwner(), ethers.constants.AddressZero);
      }
    });

    it("grants all 19 permissions on the spoke comptroller", async () => {
      for (const { role, account } of VIP_A_GRANTS) {
        expect(await mayCall(SPOKE_COMPTROLLER, account, role), `${account} may ${role}`).to.be.true;
      }
    });

    it("grants none of them as a wildcard", async () => {
      for (const { role, account } of VIP_A_GRANTS) {
        expect(await mayCall(UNRELATED, account, role), `${account} holds ${role} as a wildcard`).to.be.false;
      }
    });

    it("gives the spoke-only roles to no account the proposal did not name", async () => {
      const named = VIP_A_GRANTS.map(g => `${ethers.utils.getAddress(g.account)}:${g.role}`);
      for (const role of SPOKE_COMPTROLLER_ROLES) {
        for (const account of KNOWN_ACCOUNTS) {
          const expected = named.includes(`${ethers.utils.getAddress(account)}:${role}`);
          expect(await mayCall(SPOKE_COMPTROLLER, account, role), `${account} may ${role}`).to.equal(expected);
        }
      }
    });

    it("sets both oracles", async () => {
      expectAddress(await comptroller.oracle(), RESILIENT_ORACLE);
      expectAddress(await comptroller.deviationBoundedOracle(), DEVIATION_BOUNDED_ORACLE);
    });

    it("registers the pool with its parameters, in the spoke registry only", async () => {
      const pools = await registry.getAllPools();
      expect(pools).to.have.lengthOf(1);
      expect(pools[0].name).to.equal(POOL_NAME);
      expectAddress(pools[0].comptroller, SPOKE_COMPTROLLER);

      // `addPool` pushes these three under the registry's grants, so they also prove those grants were used.
      expect(await comptroller.closeFactorMantissa()).to.equal(CLOSE_FACTOR);
      expect(await comptroller.effectiveLiquidationIncentive(ethers.constants.AddressZero)).to.equal(
        POOL_LIQUIDATION_INCENTIVE,
      );
      expect(await comptroller.minLiquidatableCollateral()).to.equal(MIN_LIQUIDATABLE_COLLATERAL);

      const isolated = await isolatedRegistry.getPoolByComptroller(SPOKE_COMPTROLLER);
      expectAddress(isolated.comptroller, ethers.constants.AddressZero);
    });

    it("upgrades ProtocolShareReserve and adds the spoke registry behind the isolated-pools one", async () => {
      expectAddress(await readSlotAddress(PROTOCOL_SHARE_RESERVE, IMPLEMENTATION_SLOT), PROTOCOL_SHARE_RESERVE_IMPL);
      expectAddress(await psr.poolRegistry(), ISOLATED_POOL_REGISTRY);
      const registries: string[] = await psr.getPoolRegistries();
      expect(registries.map(r => ethers.utils.getAddress(r))).to.deep.equal(
        [ISOLATED_POOL_REGISTRY, SPOKE_POOL_REGISTRY].map(r => ethers.utils.getAddress(r)),
      );
    });

    it("still resolves a live isolated pool's market, so the upgrade is not a regression", async () => {
      // Picked at run time from the isolated-pools registry rather than pinned: the first market it still resolves.
      const [pool] = await isolatedRegistry.getAllPools();
      const poolComptroller = new ethers.Contract(pool.comptroller, COMPTROLLER_ABI, ethers.provider);
      let checked = false;
      for (const vToken of await poolComptroller.getAllMarkets()) {
        const underlying = await new ethers.Contract(vToken, VTOKEN_ABI, ethers.provider).underlying();
        if (sameAddress(await isolatedRegistry.getVTokenForAsset(pool.comptroller, underlying), vToken)) {
          expect(await psr.isMarketRegistered(pool.comptroller, underlying)).to.be.true;
          checked = true;
          break;
        }
      }
      expect(checked, `no registered market found in ${pool.comptroller}`).to.be.true;
    });

    it("leaves every distribution row as it was", async () => {
      expect(await readDistributions()).to.deep.equal(distributionsBefore);
    });

    it("upgrades BStockLiquidator in place, with ownership, immutables and routers unchanged", async () => {
      expectAddress(await readSlotAddress(BSTOCK_LIQUIDATOR, IMPLEMENTATION_SLOT), BSTOCK_LIQUIDATOR_IMPL);
      expectAddress(await liquidator.owner(), OPERATOR);
      expectAddress(await liquidator.pendingOwner(), ethers.constants.AddressZero);
      expectAddress(await liquidator.comptroller(), CORE_COMPTROLLER);
      expectAddress(await liquidator.vBNB(), BSTOCK_LIQUIDATOR_VBNB);
      expectAddress(await liquidator.vWBNB(), BSTOCK_LIQUIDATOR_VWBNB);
      expectAddress(await liquidator.wbnb(), WBNB);
      for (const { name, router, spender } of BSTOCK_LIQUIDATOR_ROUTERS) {
        expect(await liquidator.isRouter(router), `${name} allowlisted`).to.be.true;
        expectAddress(await liquidator.routerSpender(router), spender, `${name} spender`);
      }
    });

    it("leaves the liquidator's isolated branch closed until its owner opens it", async () => {
      // Appended storage starts empty. The Operator sets it after execution, outside this proposal.
      expectAddress(await liquidator.poolRegistry(), ethers.constants.AddressZero);
    });

    // TODO(decision): a Core bStock liquidation through the upgraded liquidator, to prove the Core path is
    // unchanged end to end. Needs a liquidatable Core bStock position and a router quote at the fork block.
    it("liquidates a Core bStock position through the upgraded liquidator as before");
  });
});
