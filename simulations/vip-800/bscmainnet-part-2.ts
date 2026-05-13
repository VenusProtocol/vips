import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { forking, pretendExecutingVip, testVip } from "src/vip-framework";

import HELPER_V3_ARTIFACT from "../../artifacts/contracts/helpers/TokenBuybackMigrationHelper.sol/TokenBuybackMigrationHelper.json";
import {
  BTCB_PRIME_CONVERTER,
  ETH_PRIME_CONVERTER,
  RISK_FUND_CONVERTER,
  USDC_PRIME_CONVERTER,
  USDT_PRIME_CONVERTER,
  XVS_VAULT_CONVERTER,
} from "../../vips/vip-618/bscmainnet";
import vip800Part1, {
  BUYBACKS,
  CORE_TOKENS,
  MIGRATION_HELPER_V2,
  RISK_FUND_BUYBACK,
  TIMELOCK_OWNED_CONVERTERS,
  U_PRIME_BUYBACK,
  XVS_BUYBACK,
} from "../../vips/vip-800/bscmainnet-part-1";
import vip800Part2 from "../../vips/vip-800/bscmainnet-part-2";
import ACM_ABI from "../vip-618/abi/AccessControlManager.json";
import ERC20_ABI from "../vip-618/abi/ERC20.json";

const { bscmainnet } = NETWORK_ADDRESSES;

// Real-env block: V2 helper (MIGRATION_HELPER_V2) is on chain.
// Match part-1 sim's FORK_BLOCK.
const FORK_BLOCK = 97988051;

const HELPER_MIN_ABI = ["function executed1() view returns (bool)", "function executed2() view returns (bool)"];
const OWNABLE_MIN_ABI = ["function owner() view returns (address)", "function pendingOwner() view returns (address)"];
const DEFAULT_ADMIN_ROLE = ethers.constants.HashZero;

const DRAIN_BY_CONVERTER: { converter: string; recipient: string }[] = [
  { converter: RISK_FUND_CONVERTER, recipient: RISK_FUND_BUYBACK },
  { converter: USDT_PRIME_CONVERTER, recipient: U_PRIME_BUYBACK },
  { converter: USDC_PRIME_CONVERTER, recipient: U_PRIME_BUYBACK },
  { converter: BTCB_PRIME_CONVERTER, recipient: U_PRIME_BUYBACK },
  { converter: ETH_PRIME_CONVERTER, recipient: U_PRIME_BUYBACK },
  { converter: XVS_VAULT_CONVERTER, recipient: XVS_BUYBACK },
];

forking(FORK_BLOCK, async () => {
  const acm = new ethers.Contract(bscmainnet.ACCESS_CONTROL_MANAGER, ACM_ABI, ethers.provider);
  const helper = new ethers.Contract(MIGRATION_HELPER_V2, HELPER_MIN_ABI, ethers.provider);

  const erc20 = (token: string) => new ethers.Contract(token, ERC20_ABI, ethers.provider);
  const ownable = (a: string) => new ethers.Contract(a, OWNABLE_MIN_ABI, ethers.provider);

  // Per-(token, recipient) snapshot taken AFTER part-1 executes (which leaves
  // converter balances untouched) so that the post-part-2 delta isolates the
  // drain.
  const recipientBalanceAfterPart1 = new Map<string, BigNumber>();
  const converterBalanceAfterPart1 = new Map<string, BigNumber>();

  before(async () => {
    // Etch the freshly compiled V3 helper bytecode at MIGRATION_HELPER_V2
    // (mirrors part-1 sim).
    await ethers.provider.send("hardhat_setCode", [
      MIGRATION_HELPER_V2,
      (HELPER_V3_ARTIFACT as { deployedBytecode: string }).deployedBytecode,
    ]);

    // Pre-condition the deploy script will fulfil on chain: every buyback's
    // pendingOwner must point at MIGRATION_HELPER_V2 so part-1's
    // helper.execute1() can accept ownership. At the fork block buybacks may
    // still point at the V1 helper, so re-point each one via impersonation.
    // Idempotent: skips buybacks already pointed at V2.
    for (const b of BUYBACKS) {
      const buybackOwnable = new ethers.Contract(b, OWNABLE_MIN_ABI, ethers.provider);
      const currentPending = await buybackOwnable.pendingOwner();
      if (currentPending.toLowerCase() === MIGRATION_HELPER_V2.toLowerCase()) continue;

      const currentOwner = await buybackOwnable.owner();
      const ownerSigner = await initMainnetUser(currentOwner, ethers.utils.parseEther("1"));
      const buybackAsOwner = new ethers.Contract(b, ["function transferOwnership(address)"], ownerSigner);
      await buybackAsOwner.transferOwnership(MIGRATION_HELPER_V2);
    }

    // Apply part-1 from NormalTimelock so helper.execute1() passes the
    // `msg.sender == NORMAL_TIMELOCK` gate.
    await pretendExecutingVip(await vip800Part1(), bscmainnet.NORMAL_TIMELOCK);

    for (const d of DRAIN_BY_CONVERTER) {
      for (const t of CORE_TOKENS) {
        const recipientKey = `${t.toLowerCase()}:${d.recipient.toLowerCase()}`;
        if (!recipientBalanceAfterPart1.has(recipientKey)) {
          recipientBalanceAfterPart1.set(recipientKey, await erc20(t).balanceOf(d.recipient));
        }
        const converterKey = `${d.converter.toLowerCase()}:${t.toLowerCase()}`;
        converterBalanceAfterPart1.set(converterKey, await erc20(t).balanceOf(d.converter));
      }
    }
  });

  describe("Pre-VIP state (part 2, after part-1 has executed)", () => {
    it("helper.executed1 is true and executed2 is false", async () => {
      expect(await helper.executed1()).to.be.true;
      expect(await helper.executed2()).to.be.false;
    });

    it("helper still owns each timelock-owned legacy converter", async () => {
      for (const c of TIMELOCK_OWNED_CONVERTERS) {
        expect((await ownable(c).owner()).toLowerCase()).to.equal(MIGRATION_HELPER_V2.toLowerCase());
      }
    });

    it("helper does NOT hold DEFAULT_ADMIN_ROLE on the ACM", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, MIGRATION_HELPER_V2)).to.be.false;
    });
  });

  testVip("VIP-800 part 2 — drain converters and hand back ownership", await vip800Part2());

  describe("Post-VIP state (part 2)", () => {
    it("helper.executed2 is true; second execute2() reverts", async () => {
      expect(await helper.executed2()).to.be.true;
      const helperWithExecute2 = new ethers.Contract(MIGRATION_HELPER_V2, ["function execute2()"], ethers.provider);
      const timelockSigner = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
      await expect(helperWithExecute2.connect(timelockSigner).execute2()).to.be.reverted;
    });

    it("each timelock-owned converter has zero residual balance for every core-pool token", async () => {
      for (const d of DRAIN_BY_CONVERTER) {
        for (const t of CORE_TOKENS) {
          expect(await erc20(t).balanceOf(d.converter), `${d.converter}/${t}`).to.equal(0);
        }
      }
    });

    it("recipient buybacks received the drained balances (delta >= pre-part-2 converter balance)", async () => {
      // Aggregate expected inflow per (token, recipient) by summing every
      // converter that maps to the same recipient (e.g. four PrimeConverters
      // all flow to U_PRIME_BUYBACK).
      const expectedInflow = new Map<string, BigNumber>();
      for (const d of DRAIN_BY_CONVERTER) {
        for (const t of CORE_TOKENS) {
          const k = `${t.toLowerCase()}:${d.recipient.toLowerCase()}`;
          const converterKey = `${d.converter.toLowerCase()}:${t.toLowerCase()}`;
          const fromConverter = converterBalanceAfterPart1.get(converterKey) ?? BigNumber.from(0);
          expectedInflow.set(k, (expectedInflow.get(k) ?? BigNumber.from(0)).add(fromConverter));
        }
      }

      for (const [k, expected] of expectedInflow.entries()) {
        const [token, recipient] = k.split(":");
        const before = recipientBalanceAfterPart1.get(k) ?? BigNumber.from(0);
        const after = await erc20(token).balanceOf(recipient);
        expect(after.sub(before), k).to.be.gte(expected);
      }
    });

    it("NormalTimelock owns each timelock-owned legacy converter", async () => {
      for (const c of TIMELOCK_OWNED_CONVERTERS) {
        expect((await ownable(c).owner()).toLowerCase()).to.equal(bscmainnet.NORMAL_TIMELOCK.toLowerCase());
      }
    });

    it("helper is neither owner nor pendingOwner of any of the 16 migrated contracts", async () => {
      const targets = [...BUYBACKS, ...TIMELOCK_OWNED_CONVERTERS];
      for (const t of targets) {
        expect((await ownable(t).owner()).toLowerCase(), `${t} owner`).to.not.equal(MIGRATION_HELPER_V2.toLowerCase());
        expect((await ownable(t).pendingOwner()).toLowerCase(), `${t} pendingOwner`).to.not.equal(
          MIGRATION_HELPER_V2.toLowerCase(),
        );
      }
    });

    it("helper holds zero balance of every core-pool token", async () => {
      for (const t of CORE_TOKENS) {
        expect(await erc20(t).balanceOf(MIGRATION_HELPER_V2), t).to.equal(0);
      }
    });

    it("helper holds zero native BNB", async () => {
      expect(await ethers.provider.getBalance(MIGRATION_HELPER_V2)).to.equal(0);
    });
  });
});
