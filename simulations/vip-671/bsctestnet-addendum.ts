import { JsonFragment } from "@ethersproject/abi";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  ACM,
  GUARDIAN,
  NORMAL_TIMELOCK,
  SPOKE_COMPTROLLER,
  SPOKE_COMPTROLLER_BEACON,
  SPOKE_COMPTROLLER_IMPL,
  SPOKE_POOL_REGISTRY,
} from "../../vips/vip-671/addresses/bsctestnet";
import vip671Addendum, { ADDENDUM_GUARDIAN_ROLES } from "../../vips/vip-671/bsctestnet-addendum";
import { COLLATERAL_MARKET, MARKETS } from "../../vips/vip-671/config";
import { PAUSE_ROLE, UNLIST_ROLE } from "../../vips/vip-671/permissions";
import ACM_ABI from "./abi/AccessControlManager.json";
import COMPTROLLER_ABI from "./abi/SpokeComptroller.json";

/// After VIP-671 executed, so the pool is listed and configured, and after the new implementation was
/// deployed at block 132,661,139, so `upgradeTo` has a contract to point at. The pre-VIP block below
/// re-proves both rather than trusting the number: a fork block below the deployment reverts the
/// whole proposal with `UpgradeableBeacon: implementation is not a contract`, which says nothing
/// about the block being wrong.
const FORK_BLOCK = 132665000;

/// The implementation the beacon serves today, recorded in isolated-pools before the redeploy. It
/// predates the rename of `enterMarketBehalf` to `enterMarketForAccount`, which is the whole reason
/// for the upgrade.
const PREVIOUS_IMPL = "0x7F81dC61F3D75569A67155fb188171Aef173a52b";

/// EIP-1967 beacon slot, `keccak256("eip1967.proxy.beacon") - 1`. Read directly so the upgrade is
/// proven to reach THIS comptroller rather than some other proxy over the same beacon.
const EIP1967_BEACON_SLOT = "0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50";

/// `Action` in isolated-pools/contracts/ComptrollerInterface.sol.
const ACTION_BORROW = 2;

/// Two addresses that hold nothing anywhere. The first proves the new grants are account-exact rather
/// than address(0) wildcards; the second is the account a market is entered on behalf of. Neither
/// needs a balance or a position, because `_addToMarket` only records membership.
const UNPRIVILEGED = "0x0000000000000000000000000000000000000100";
const BENEFICIARY = "0x0000000000000000000000000000000000000200";

const BEACON_ABI: JsonFragment[] = [
  {
    type: "event",
    name: "Upgraded",
    anonymous: false,
    inputs: [{ name: "implementation", type: "address", indexed: true }],
  },
  { type: "function", name: "implementation", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "owner", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
];

/// `enterMarketForAccount` does not exist in ./abi/SpokeComptroller.json, which was captured from the
/// implementation the listing VIP ran against. That ABI is otherwise identical to the new one: the
/// rename is the only difference between the two implementations, so everything else below keeps
/// using it, and only this call needs a fragment of its own.
const RENAMED_ABI = ["function enterMarketForAccount(address account, address vToken)"];

/// `AccessControlManager.isAllowedToCall` keys the role on `msg.sender`, so the only honest way to ask
/// "may X call this on THIS comptroller" is to ask it from the comptroller's own address. It consults
/// the address(0) wildcards, which `hasPermission` does not, and a wildcard is exactly the thing that
/// would make a grant here a silent no-op.
const ACM_IFACE = new ethers.utils.Interface(["function isAllowedToCall(address,string) view returns (bool)"]);
const mayCall = async (account: string, signature: string): Promise<boolean> => {
  const data = ACM_IFACE.encodeFunctionData("isAllowedToCall", [account, signature]);
  const result = await ethers.provider.call({ to: ACM, data, from: SPOKE_COMPTROLLER });
  return ACM_IFACE.decodeFunctionResult("isAllowedToCall", result)[0];
};

/// Whether a deployed implementation carries the 4-byte selector of `signature`.
const hasSelector = async (implementation: string, signature: string): Promise<boolean> => {
  const code = await ethers.provider.getCode(implementation);
  return code.includes(ethers.utils.id(signature).slice(2, 10));
};

/// Every comptroller value VIP-671 wrote. The beacon upgrade changes no storage layout, so all of it
/// has to read back identical afterwards. A layout that drifted would show up here as garbage rather
/// than as a revert, which is the failure mode a beacon upgrade on a live pool actually has.
const readPoolState = async (comptroller: Contract) => {
  const markets = await Promise.all(
    MARKETS.map(async m => {
      const market = await comptroller.markets(m.vToken);
      return {
        symbol: m.symbol,
        isListed: market.isListed,
        collateralFactorMantissa: market.collateralFactorMantissa.toString(),
        liquidationThresholdMantissa: market.liquidationThresholdMantissa.toString(),
        liquidationIncentive: (await comptroller.liquidationIncentives(m.vToken)).toString(),
        supplyCap: (await comptroller.supplyCaps(m.vToken)).toString(),
        borrowCap: (await comptroller.borrowCaps(m.vToken)).toString(),
        supplyAllowlistEnabled: await comptroller.isSupplyAllowlistEnabled(m.vToken),
      };
    }),
  );

  return {
    owner: await comptroller.owner(),
    poolRegistry: await comptroller.poolRegistry(),
    accessControlManager: await comptroller.accessControlManager(),
    oracle: await comptroller.oracle(),
    deviationBoundedOracle: await comptroller.deviationBoundedOracle(),
    closeFactorMantissa: (await comptroller.closeFactorMantissa()).toString(),
    liquidationIncentiveMantissa: (await comptroller.liquidationIncentiveMantissa()).toString(),
    minLiquidatableCollateral: (await comptroller.minLiquidatableCollateral()).toString(),
    maxLoopsLimit: (await comptroller.maxLoopsLimit()).toString(),
    liquidationAllowlistEnabled: await comptroller.isLiquidationAllowlistEnabled(),
    allMarkets: await comptroller.getAllMarkets(),
    markets,
  };
};

forking(FORK_BLOCK, async () => {
  const comptroller = new ethers.Contract(SPOKE_COMPTROLLER, COMPTROLLER_ABI, ethers.provider);
  const beacon = new ethers.Contract(SPOKE_COMPTROLLER_BEACON, BEACON_ABI, ethers.provider);

  let preState: Awaited<ReturnType<typeof readPoolState>>;

  describe("Pre-VIP state", () => {
    before(async () => {
      preState = await readPoolState(comptroller);
    });

    it("has the pool already listed and configured by VIP-671", async () => {
      // If this fails, FORK_BLOCK is before the listing executed and nothing below means anything.
      expect(preState.owner).to.equal(NORMAL_TIMELOCK);
      expect(preState.poolRegistry).to.equal(SPOKE_POOL_REGISTRY);
      expect(preState.oracle).to.not.equal(ethers.constants.AddressZero);
      expect(preState.deviationBoundedOracle).to.not.equal(ethers.constants.AddressZero);
      expect(preState.allMarkets).to.have.lengthOf(MARKETS.length);
      for (const m of preState.markets) {
        expect(m.isListed, `${m.symbol} listed`).to.be.true;
      }
    });

    it("serves the implementation the listing VIP ran against", async () => {
      expect(await beacon.implementation()).to.equal(PREVIOUS_IMPL);
      expect(await beacon.implementation()).to.not.equal(SPOKE_COMPTROLLER_IMPL);
    });

    it("already has the new implementation deployed", async () => {
      // `UpgradeableBeacon.upgradeTo` requires a contract, so a fork block before the deployment
      // fails the proposal rather than this assertion. Checked here so the cause is named.
      expect(await ethers.provider.getCode(SPOKE_COMPTROLLER_IMPL)).to.not.equal("0x");
    });

    it("points this comptroller at that beacon, so the upgrade reaches it", async () => {
      const slot = await ethers.provider.getStorageAt(SPOKE_COMPTROLLER, EIP1967_BEACON_SLOT);
      expect(ethers.utils.getAddress(ethers.utils.hexDataSlice(slot, 12))).to.equal(SPOKE_COMPTROLLER_BEACON);
    });

    it("exposes enterMarketBehalf and not enterMarketForAccount", async () => {
      expect(await hasSelector(PREVIOUS_IMPL, "enterMarketBehalf(address,address)")).to.be.true;
      expect(await hasSelector(PREVIOUS_IMPL, "enterMarketForAccount(address,address)")).to.be.false;
    });

    it("gives the Guardian none of the three roles, by grant or by wildcard", async () => {
      for (const signature of ADDENDUM_GUARDIAN_ROLES) {
        expect(await mayCall(GUARDIAN, signature), `guardian may ${signature}`).to.be.false;
      }
    });

    it("rejects the Guardian on both calls it can already reach", async () => {
      // `enterMarketForAccount` has no test here because the function does not exist yet.
      const guardian = await initMainnetUser(GUARDIAN, ethers.utils.parseEther("1"));
      await expect(
        comptroller.connect(guardian).setActionsPaused([COLLATERAL_MARKET.vToken], [ACTION_BORROW], true),
      ).to.be.revertedWithCustomError(comptroller, "Unauthorized");
      await expect(comptroller.connect(guardian).unlistMarket(COLLATERAL_MARKET.vToken)).to.be.revertedWithCustomError(
        comptroller,
        "Unauthorized",
      );
    });
  });

  // What this addendum takes for granted rather than setting. Asserted here so a change shows up as a
  // red simulation rather than as a reverted proposal.
  describe("Pre-VIP assumptions", () => {
    it("leaves the beacon owned by the Normal Timelock, so upgradeTo needs no ACM grant", async () => {
      expect(await beacon.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it("already lets the Normal Timelock pause and unlist", async () => {
      // The Guardian becomes a second holder of these two. It does not become the only one, and the
      // emergency path that VIP-671 relied on is untouched.
      expect(await mayCall(NORMAL_TIMELOCK, PAUSE_ROLE)).to.be.true;
      expect(await mayCall(NORMAL_TIMELOCK, UNLIST_ROLE)).to.be.true;
    });
  });

  testVip("VIP-671 addendum: spoke comptroller upgrade and Guardian permissions", await vip671Addendum(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [BEACON_ABI], ["Upgraded"], [1]);
      await expectEvents(txResponse, [ACM_ABI], ["PermissionGranted"], [ADDENDUM_GUARDIAN_ROLES.length]);
    },
  });

  describe("Post-VIP state", () => {
    it("points the beacon at the new implementation", async () => {
      expect(await beacon.implementation()).to.equal(SPOKE_COMPTROLLER_IMPL);
    });

    it("swaps enterMarketBehalf for enterMarketForAccount and changes nothing else", async () => {
      expect(await hasSelector(SPOKE_COMPTROLLER_IMPL, "enterMarketForAccount(address,address)")).to.be.true;
      expect(await hasSelector(SPOKE_COMPTROLLER_IMPL, "enterMarketBehalf(address,address)")).to.be.false;
    });

    it("leaves every comptroller value VIP-671 wrote untouched", async () => {
      expect(await readPoolState(comptroller)).to.deep.equal(preState);
    });

    it("gives the Guardian all three roles", async () => {
      for (const signature of ADDENDUM_GUARDIAN_ROLES) {
        expect(await mayCall(GUARDIAN, signature), `guardian may ${signature}`).to.be.true;
      }
    });

    it("grants them against this comptroller rather than as wildcards", async () => {
      // A wildcard would have reached every comptroller on the chain and every account. Proving the
      // grant is account-exact is the difference between three roles and a class of control.
      for (const signature of ADDENDUM_GUARDIAN_ROLES) {
        expect(await mayCall(UNPRIVILEGED, signature), `unprivileged may ${signature}`).to.be.false;
      }
    });

    it("revokes nothing from the Normal Timelock", async () => {
      expect(await mayCall(NORMAL_TIMELOCK, PAUSE_ROLE)).to.be.true;
      expect(await mayCall(NORMAL_TIMELOCK, UNLIST_ROLE)).to.be.true;
    });
  });

  describe("Post-VIP behaviour", () => {
    let guardian: Awaited<ReturnType<typeof initMainnetUser>>;

    before(async () => {
      guardian = await initMainnetUser(GUARDIAN, ethers.utils.parseEther("1"));
    });

    it("lets the Guardian pause and unpause an action without a proposal", async () => {
      const vToken = COLLATERAL_MARKET.vToken;
      expect(await comptroller.actionPaused(vToken, ACTION_BORROW)).to.be.false;

      await comptroller.connect(guardian).setActionsPaused([vToken], [ACTION_BORROW], true);
      expect(await comptroller.actionPaused(vToken, ACTION_BORROW)).to.be.true;

      // Restored, so the tests after this one see the pool as the addendum left it.
      await comptroller.connect(guardian).setActionsPaused([vToken], [ACTION_BORROW], false);
      expect(await comptroller.actionPaused(vToken, ACTION_BORROW)).to.be.false;
    });

    it("lets the Guardian enter a market on another account's behalf", async () => {
      const vToken = COLLATERAL_MARKET.vToken;
      const renamed = new ethers.Contract(SPOKE_COMPTROLLER, RENAMED_ABI, guardian);

      expect(await comptroller.checkMembership(BENEFICIARY, vToken)).to.be.false;
      await expect(renamed.enterMarketForAccount(BENEFICIARY, vToken))
        .to.emit(comptroller, "MarketEntered")
        .withArgs(vToken, BENEFICIARY);
      expect(await comptroller.checkMembership(BENEFICIARY, vToken)).to.be.true;
    });

    it("still refuses an account that holds nothing", async () => {
      const stranger = await initMainnetUser(UNPRIVILEGED, ethers.utils.parseEther("1"));
      await expect(
        comptroller.connect(stranger).setActionsPaused([COLLATERAL_MARKET.vToken], [ACTION_BORROW], true),
      ).to.be.revertedWithCustomError(comptroller, "Unauthorized");
    });

    it("gets the Guardian past the ACM gate on unlistMarket without unlisting anything", async () => {
      // `unlistMarket` requires every action on the market to be paused and its caps and collateral
      // factor to be zero, so driving it to completion would dismantle a live market. Reaching the
      // FIRST of those checks proves the permission works and stops before any state changes: the
      // revert is BorrowActionNotPaused rather than the Unauthorized the pre-VIP block asserted.
      await expect(comptroller.connect(guardian).unlistMarket(COLLATERAL_MARKET.vToken)).to.be.revertedWithCustomError(
        comptroller,
        "BorrowActionNotPaused",
      );

      const market = await comptroller.markets(COLLATERAL_MARKET.vToken);
      expect(market.isListed).to.be.true;
    });
  });
});
