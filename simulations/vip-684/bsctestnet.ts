import { SnapshotRestorer, takeSnapshot } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip684, {
  ACCESS_CONTROL_MANAGER,
  ALLOWED_ROUTERS,
  BTCB,
  CORE,
  FEE_RATE_BPS,
  GUARDIAN,
  HUB,
  HUB_USDT,
  KEEPER_1,
  KEEPER_2,
  MAX_ORACLE_DEVIATION_BPS,
  MIN_AMOUNT_PER_BUY,
  NORMAL_TIMELOCK,
  PCS_V3_ROUTER,
  SMART_DCA,
  SMART_DCA_PERMISSIONS,
  U,
  USDC,
  USDT,
  USDT_WBNB_PAIR_ID,
  USDT_WBNB_PATH,
  WBNB,
  vBTC,
  vU,
  vUSDC,
  vWBNB,
} from "../../vips/vip-684/bsctestnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import SMART_DCA_ABI from "./abi/SmartDCA.json";

// After SmartDCA, its library and lens were deployed at blocks 144600985 to 144601245
const BLOCK_NUMBER = 144601300;

const DEPLOYER = "0x33C6476F88eeA28D7E7900F759B4597704Ef95B7";

const PAIRS = [
  { stable: USDT, asset: BTCB, stableKind: HUB, stableSource: HUB_USDT, assetSource: vBTC },
  { stable: USDT, asset: WBNB, stableKind: HUB, stableSource: HUB_USDT, assetSource: vWBNB },
  { stable: USDC, asset: BTCB, stableKind: CORE, stableSource: vUSDC, assetSource: vBTC },
  { stable: USDC, asset: WBNB, stableKind: CORE, stableSource: vUSDC, assetSource: vWBNB },
  { stable: U, asset: BTCB, stableKind: CORE, stableSource: vU, assetSource: vBTC },
  { stable: U, asset: WBNB, stableKind: CORE, stableSource: vU, assetSource: vWBNB },
];

const STABLE_SIDE = 0;
const ASSET_SIDE = 1;

const TOKEN_ABI = [
  "function allocateTo(address, uint256)",
  "function approve(address, uint256) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
];

// `isAllowedToCall` keys the role on msg.sender, so it is asked from SmartDCA's own address
const isAllowed = async (account: string, signature: string): Promise<boolean> => {
  const acm = new ethers.utils.Interface(ACM_ABI);
  const data = acm.encodeFunctionData("isAllowedToCall", [account, signature]);
  const result = await ethers.provider.call({ to: ACCESS_CONTROL_MANAGER, data, from: SMART_DCA });
  return acm.decodeFunctionResult("isAllowedToCall", result)[0];
};
const grants = async () =>
  Promise.all(
    [NORMAL_TIMELOCK, GUARDIAN].flatMap(account => SMART_DCA_PERMISSIONS.map(sig => isAllowed(account, sig))),
  );

forking(BLOCK_NUMBER, async () => {
  const smartDCA = new Contract(SMART_DCA, SMART_DCA_ABI, ethers.provider);

  // addPair reads both prices; the testnet WBNB feed goes stale while the proposal is voted and queued
  before(async () => {
    await setMaxStalePeriodInChainlinkOracle(
      NETWORK_ADDRESSES.bsctestnet.CHAINLINK_ORACLE,
      WBNB,
      ethers.constants.AddressZero,
      NORMAL_TIMELOCK,
    );
  });

  describe("Pre-VIP behavior", () => {
    it("the deployer owns SmartDCA and the Normal Timelock is the pending owner", async () => {
      expect(await smartDCA.owner()).to.equal(DEPLOYER);
      expect(await smartDCA.pendingOwner()).to.equal(NORMAL_TIMELOCK);
    });

    it("has no pairs and the 1% oracle band from initialize", async () => {
      expect(await smartDCA.pairCount()).to.equal(0);
      expect(await smartDCA.maxOracleDeviationBps()).to.equal(100);
    });

    it("nobody holds a SmartDCA permission yet", async () => {
      expect(await grants()).to.deep.equal(Array(SMART_DCA_PERMISSIONS.length * 2).fill(false));
    });
  });

  testVip("VIP-684 [BNB Chain Testnet] Configure Smart DCA", await vip684(), {
    callbackAfterExecution: async txResponse => {
      const permissions = SMART_DCA_PERMISSIONS.length * 2;
      await expectEvents(txResponse, [ACM_ABI], ["PermissionGranted"], [permissions]);
      await expectEvents(
        txResponse,
        [SMART_DCA_ABI],
        [
          "OwnershipTransferred",
          "MinAmountPerBuyUpdated",
          "FeeRateUpdated",
          "MaxOracleDeviationUpdated",
          "PairAdded",
          "YieldSourceUpdated",
          "FallbackRouteUpdated",
          "KeeperUpdated",
          "RouterAllowlisted",
        ],
        [1, MIN_AMOUNT_PER_BUY.length, 1, 1, PAIRS.length, PAIRS.length * 2, 1, 2, ALLOWED_ROUTERS.length],
      );
    },
  });

  describe("Post-VIP behavior", () => {
    it("the Normal Timelock owns SmartDCA", async () => {
      expect(await smartDCA.owner()).to.equal(NORMAL_TIMELOCK);
      expect(await smartDCA.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });

    it("the Normal Timelock and the Guardian hold every SmartDCA permission", async () => {
      expect(await grants()).to.deep.equal(Array(SMART_DCA_PERMISSIONS.length * 2).fill(true));
    });

    it("sets the minimums, the fee and the oracle band", async () => {
      for (const { stable, amount } of MIN_AMOUNT_PER_BUY) {
        expect(await smartDCA.minAmountPerBuy(stable), stable).to.equal(amount);
      }
      expect(await smartDCA.feeRateBps()).to.equal(FEE_RATE_BPS);
      expect(await smartDCA.maxOracleDeviationBps()).to.equal(MAX_ORACLE_DEVIATION_BPS);
    });

    it("adds the 6 pairs in order, enabled, with their yield sources", async () => {
      expect(await smartDCA.pairCount()).to.equal(PAIRS.length);
      for (const [i, pair] of PAIRS.entries()) {
        const id = i + 1;
        const stored = await smartDCA.pairs(id);
        expect([stored.stable, stored.asset, stored.enabled], `pair ${id}`).to.deep.equal([
          pair.stable,
          pair.asset,
          true,
        ]);
        expect(await smartDCA.pairIdByTokens(pair.stable, pair.asset)).to.equal(id);

        const stableSource = await smartDCA.yieldSources(id, STABLE_SIDE);
        expect([stableSource.kind, stableSource.sourceAddress], `pair ${id} stable`).to.deep.equal([
          pair.stableKind,
          pair.stableSource,
        ]);
        const assetSource = await smartDCA.yieldSources(id, ASSET_SIDE);
        expect([assetSource.kind, assetSource.sourceAddress], `pair ${id} asset`).to.deep.equal([
          CORE,
          pair.assetSource,
        ]);
      }
    });

    it("sets the USDT/WBNB forceBuy route", async () => {
      const route = await smartDCA.fallbackRoutes(USDT_WBNB_PAIR_ID);
      expect([route.router, route.path]).to.deep.equal([PCS_V3_ROUTER, USDT_WBNB_PATH]);
    });

    it("adds the keepers and the swap allowlist", async () => {
      expect(await smartDCA.isKeeper(KEEPER_1)).to.equal(true);
      expect(await smartDCA.isKeeper(KEEPER_2)).to.equal(true);
      for (const router of ALLOWED_ROUTERS) {
        expect(await smartDCA.allowedRouters(router), router).to.equal(true);
      }
    });
  });

  describe("Post-VIP functional", () => {
    let snapshot: SnapshotRestorer;
    beforeEach(async () => {
      snapshot = await takeSnapshot();
    });
    afterEach(async () => {
      await snapshot.restore();
    });

    // Pair 1 waits in Hub_USDT, pair 3 in vUSDC
    for (const { pairId, stable, name } of [
      { pairId: 1, stable: USDT, name: "USDT/BTCB (Hub)" },
      { pairId: 3, stable: USDC, name: "USDC/BTCB (Core)" },
    ]) {
      it(`a ${name} plan can be created and cancelled for its deposit back`, async () => {
        const [user] = await ethers.getSigners();
        const amount = parseUnits("120", 6);
        const token = new Contract(stable, TOKEN_ABI, user);
        await token.allocateTo(user.address, amount);
        await token.approve(SMART_DCA, amount);
        const balanceBefore = await token.balanceOf(user.address);

        const asUser = smartDCA.connect(user);
        await asUser.createPlan(pairId, amount, 12, user.address);
        const planId = await smartDCA.lastPlanId();
        expect((await smartDCA.plans(planId)).owner).to.equal(user.address);

        await asUser.cancelPlan(planId, false, user.address);
        // A Hub or vToken round trip can keep 1 wei
        expect(await token.balanceOf(user.address)).to.be.closeTo(balanceBefore, 1);
      });
    }

    it("a deposit under 10 tokens per buy reverts", async () => {
      const [user] = await ethers.getSigners();
      const amount = parseUnits("15", 6);
      const token = new Contract(USDT, TOKEN_ABI, user);
      await token.allocateTo(user.address, amount);
      await token.approve(SMART_DCA, amount);
      await expect(smartDCA.connect(user).createPlan(1, amount, 2, user.address))
        .to.be.revertedWithCustomError(smartDCA, "DepositTooSmall")
        .withArgs(amount, parseUnits("20", 6));
    });
  });
});
