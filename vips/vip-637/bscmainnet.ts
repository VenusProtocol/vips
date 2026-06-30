import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

const ACM = bscmainnet.ACCESS_CONTROL_MANAGER;
const NORMAL_TIMELOCK = bscmainnet.NORMAL_TIMELOCK;
const FAST_TRACK_TIMELOCK = bscmainnet.FAST_TRACK_TIMELOCK;
const CRITICAL_TIMELOCK = bscmainnet.CRITICAL_TIMELOCK;
const GUARDIAN = bscmainnet.GUARDIAN;
export const KEEPER = "0xe0237587acA20f9304d30FACC9Afcd5DD9a94899";
// Venus team multisig used as a circuit-breaker pauser across chains (matches the
// MULTISIG_PAUSER pattern from vip-616).
export const BSCMAINNET_MULTISIG_PAUSER = "0xCCa5a587eBDBe80f23c8610F2e53B03158e62948";

// Deployed via venus-protocol PR #677. On live networks the deploy script initiates
// transferOwnership of both contracts to the NormalTimelock (pending acceptance) but
// does NOT wire them — the setPrimeV2 / setPrimeLeaderboard wiring is ACM-gated and
// done here. This VIP accepts ownership, grants ACM permissions, wires PrimeV2 <->
// PrimeLeaderboard, repoints the PrimeLiquidityProvider / XVS Vault / Core pool
// Comptroller / VAIController, configures the Prime markets, and pauses the legacy Prime.
// The XVS Vault is already paused by the preceding critical VIP
// (vip-637/bscmainnet-critical.ts) and stays paused until the new
// PrimeLeaderboard is seeded off-chain.
export const PRIME_V2 = "0x059EabA8676b03e4e8f009eFb7F587C28450F50f";
export const PRIME_LEADERBOARD = "0x55e2ccF68B7A276dc28AfA107997b8B1Be932c0b";

// Existing contracts reused by PrimeV2
export const PLP = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2"; // PrimeLiquidityProvider (existing)
export const LEGACY_PRIME = "0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC"; // current Prime (to be replaced)
export const COMPTROLLER = bscmainnet.UNITROLLER;
export const VAI_CONTROLLER = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE"; // VaiUnitroller proxy
export const XVS_VAULT = bscmainnet.XVS_VAULT_PROXY;
export const XVS = bscmainnet.XVS;
export const XVS_VAULT_POOL_ID = 0;

// Prime markets on the Core pool (bscmainnet). PrimeV2 launches with only the
// vUSDT and vWBNB markets; the other legacy Prime markets are intentionally not
// carried over.
const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const VWBNB = "0x6bCa74586218dB34cdB402295796b79663d816e9";

interface PrimeMarket {
  vToken: string;
  supplyMultiplier: string;
  borrowMultiplier: string;
}

export const PRIME_MARKETS: PrimeMarket[] = [
  { vToken: VUSDT, supplyMultiplier: parseUnits("2", 18).toString(), borrowMultiplier: "0" },
  { vToken: VWBNB, supplyMultiplier: parseUnits("2", 18).toString(), borrowMultiplier: "0" },
];

const ALL_TIMELOCKS = [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK];

// pause/unpause on PrimeV2: all three timelocks plus the Guardian, so the Guardian
// can react out-of-band without waiting on a governance proposal.
const PAUSE_ACCOUNTS = [...ALL_TIMELOCKS, GUARDIAN];

// setLimit (mint cap): the Normal Timelock plus the Guardian as a fallback lever.
const SET_LIMIT_ACCOUNTS = [NORMAL_TIMELOCK, GUARDIAN];

// The off-chain epoch pipeline runs the cycle operations directly: a dedicated
// keeper EOA performs the bulk of the calls, the Guardian is granted the same
// permissions as a fallback / multisig path, and the NormalTimelock keeps the
// permission for governance-initiated operations.
const KEEPER_ACCOUNTS = [NORMAL_TIMELOCK, KEEPER, GUARDIAN];

// setMintThreshold opens/closes the permissionless mint window — a sensitive op
// reserved for governance and the Venus Guardian multisig, NOT the Keeper.
const MINT_THRESHOLD_ACCOUNTS = [NORMAL_TIMELOCK, GUARDIAN];

// PrimeLeaderboard staker seeding (initializeStakers / finalizeInitialization) is a
// one-time bootstrap run off-chain by the Keeper, with the Guardian multisig as a
// fallback. The NormalTimelock is intentionally NOT granted these single-use ops.
const SEEDING_ACCOUNTS = [KEEPER, GUARDIAN];

// Grant ACM permission for `target.signature` to every account in `accounts`
// (defaults to NormalTimelock only).
const grant = (target: string, signature: string, accounts: string[] = [NORMAL_TIMELOCK]) =>
  accounts.map(account => ({
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [target, signature, account],
  }));

// ACM-gated functions on PrimeV2 (see PrimeV2.sol _checkAccessAllowed).
// Cycle ops -> KEEPER_ACCOUNTS; admin ops -> NormalTimelock only;
// setLimit -> NormalTimelock + Guardian; pause/unpause -> all three timelocks + Guardian.
const PRIME_V2_PERMISSIONS = [
  ...grant(PRIME_V2, "issue(address)", KEEPER_ACCOUNTS),
  ...grant(PRIME_V2, "issueBatch(address[])", KEEPER_ACCOUNTS),
  ...grant(PRIME_V2, "burn(address)", KEEPER_ACCOUNTS),
  ...grant(PRIME_V2, "burnBatch(address[])", KEEPER_ACCOUNTS),
  ...grant(PRIME_V2, "setMintThreshold(uint256,uint256)", MINT_THRESHOLD_ACCOUNTS),
  ...grant(PRIME_V2, "recordCycleSnapshot(uint256)", KEEPER_ACCOUNTS),
  ...grant(PRIME_V2, "setPrimeLeaderboard(address)"),
  ...grant(PRIME_V2, "addMarket(address,uint256,uint256)"),
  ...grant(PRIME_V2, "removeMarket(address)"),
  ...grant(PRIME_V2, "setLimit(uint256)", SET_LIMIT_ACCOUNTS),
  ...grant(PRIME_V2, "updateAlpha(uint128,uint128)"),
  ...grant(PRIME_V2, "updateMultipliers(address,uint256,uint256)"),
  ...grant(PRIME_V2, "setMaxLoopsLimit(uint256)"),
  ...grant(PRIME_V2, "sweepUndistributed(address,address)"),
  ...grant(PRIME_V2, "pause()", PAUSE_ACCOUNTS),
  ...grant(PRIME_V2, "unpause()", PAUSE_ACCOUNTS),
  // Circuit-breaker pause for the Venus team multisig (matches vip-616 cross-chain pattern).
  ...grant(PRIME_V2, "pause()", [BSCMAINNET_MULTISIG_PAUSER]),
];

// Circuit-breaker pause permission on the XVS Vault for the Venus team multisig.
const XVS_VAULT_MULTISIG_PAUSE_GRANT = grant(XVS_VAULT, "pause()", [BSCMAINNET_MULTISIG_PAUSER]);

// ACM-gated functions on PrimeLeaderboard (see PrimeLeaderboard.sol _checkAccessAllowed).
// One-time staker seeding -> SEEDING_ACCOUNTS (Keeper + Guardian); admin ops -> NormalTimelock only.
const PRIME_LEADERBOARD_PERMISSIONS = [
  ...grant(PRIME_LEADERBOARD, "initializeStakers(address[],uint256[],uint64[])", SEEDING_ACCOUNTS),
  ...grant(PRIME_LEADERBOARD, "finalizeInitialization()", SEEDING_ACCOUNTS),
  ...grant(PRIME_LEADERBOARD, "setMultiplierTiers(uint256[],uint256[])"),
  ...grant(PRIME_LEADERBOARD, "setPrimeV2(address)"),
  ...grant(PRIME_LEADERBOARD, "setMaxLoopsLimit(uint256)"),
];

const vip637 = () => {
  const meta = {
    version: "v2",
    title: "VIP-637 [BNB Chain] PrimeV2 and PrimeLeaderboard",
    description: `#### Summary

This proposal begins the execution of the Prime Rewards Redesign on BNB Chain — it brings the new PrimeV2 and PrimeLeaderboard contracts live and decommissions the legacy Prime program. It is the migration half of a two-proposal rollout; a companion critical proposal freezes the system beforehand so the transition from legacy Prime to PrimeV2 is seamless and nothing earned under the existing program is lost.

#### Description

This proposal executes the redesign set out in the [Venus Tokenomics Phase II — Prime Rewards Redesign](https://community.venus.io/t/venus-tokenomics-phase-ii-prime-rewards-redesign/5774) proposal; it does not change that design. PrimeV2 and the legacy Prime share one rewards vault (the PrimeLiquidityProvider), which can serve only one Prime contract at a time. Before this proposal is executed, a companion critical proposal pauses XVS Vault staking and zeroes legacy Prime emissions, and an off-chain reward settlement pays every legacy Prime holder their pending rewards in full — so repointing the vault here strands nothing.

This proposal then accepts ownership of the new contracts, grants the required ACM permissions, wires PrimeV2 and PrimeLeaderboard together, repoints the rewards vault / XVS Vault / Core pool Comptroller / VAIController from legacy Prime to the new contracts, configures the launch markets (vUSDT and vWBNB), and pauses legacy Prime. Supplying and borrowing on Venus markets are unaffected throughout; only XVS staking is temporarily paused, and is resumed by the Guardian once existing stakers are seeded into the new leaderboard off-chain.

The contracts are implemented and deployed in venus-protocol PR #676 and PR #677; the governance setup is in vips PR #712.

#### Actions

This proposal performs 54 transactions on BNB Chain, in the following groups. Key addresses: PrimeV2 0x059EabA8676b03e4e8f009eFb7F587C28450F50f, PrimeLeaderboard 0x55e2ccF68B7A276dc28AfA107997b8B1Be932c0b, PrimeLiquidityProvider 0x23c4F844ffDdC6161174eB32c770D4D8C07833F2, legacy Prime 0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC, Core pool Comptroller 0xfD36E2c2a6789Db23113685031d7F16329158384, VAIController 0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE.

- **Accept ownership** — acceptOwnership() on PrimeV2 and PrimeLeaderboard.
- **Grant ACM permissions** (43 txns) — giveCallPermission on the Access Control Manager: per-cycle ops (issue/issueBatch/burn/burnBatch/recordCycleSnapshot) to Normal Timelock + Keeper (0xe0237587acA20f9304d30FACC9Afcd5DD9a94899) + Guardian; one-time staker seeding (initializeStakers/finalizeInitialization) to Keeper + Guardian only; setMintThreshold/setLimit to Normal Timelock + Guardian only; policy levers (addMarket, removeMarket, updateAlpha, updateMultipliers, setMultiplierTiers, etc.) to Normal Timelock only; pause/unpause to all three timelocks + Guardian; circuit-breaker pause() on both PrimeV2 and the XVS Vault to the Venus team multisig (0xCCa5a587eBDBe80f23c8610F2e53B03158e62948).
- **Wire PrimeV2 ↔ PrimeLeaderboard** — setPrimeLeaderboard(address) on PrimeV2 and setPrimeV2(address) on PrimeLeaderboard.
- **Repoint the rewards vault** — setPrimeToken(address) on the PrimeLiquidityProvider, pointing it at PrimeV2.
- **Switch the XVS Vault hook** — setPrimeToken(address,address,uint256) on the XVS Vault, pointing the prime hook at PrimeLeaderboard (reward token XVS, pool id 0 unchanged).
- **Repoint the Core pool Comptroller** — setPrimeToken(address) on the Comptroller, pointing market hooks at PrimeV2.
- **Repoint the VAIController** — setPrimeToken(address) on the VAIController, so the Prime-holder VAI mint gate tracks PrimeV2 membership.
- **Add Core pool markets** — addMarket(address,uint256,uint256) on PrimeV2 for vUSDT and vWBNB, each with a 2x supply multiplier and 0x borrow multiplier.
- **Decommission legacy Prime** — togglePause() on the legacy Prime contract to pause it permanently.

#### References

- PrimeV2 / PrimeLeaderboard implementation: https://github.com/VenusProtocol/venus-protocol/pull/676
- Testnet rollout (VIP-637 + addendum): https://github.com/VenusProtocol/vips/pull/712`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // 1. Accept ownership (deploy script transferred ownership to NormalTimelock).
      {
        target: PRIME_V2,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: PRIME_LEADERBOARD,
        signature: "acceptOwnership()",
        params: [],
      },

      // 2. Grant ACM permissions.
      // (XVS Vault resume() is not granted here — the Guardian already holds it on
      // mainnet, and the NormalTimelock has it via the ACM admin role.)
      ...PRIME_V2_PERMISSIONS,
      ...PRIME_LEADERBOARD_PERMISSIONS,
      ...XVS_VAULT_MULTISIG_PAUSE_GRANT,

      // 3. Wire PrimeV2 <-> PrimeLeaderboard (ACM-gated; deploy does NOT wire on live networks).
      {
        target: PRIME_V2,
        signature: "setPrimeLeaderboard(address)",
        params: [PRIME_LEADERBOARD],
      },
      {
        target: PRIME_LEADERBOARD,
        signature: "setPrimeV2(address)",
        params: [PRIME_V2],
      },

      // 4. Point the existing PrimeLiquidityProvider at PrimeV2 (onlyOwner = NormalTimelock).
      {
        target: PLP,
        signature: "setPrimeToken(address)",
        params: [PRIME_V2],
      },

      // 5. Switch the XVS Vault prime hook from the legacy Prime to PrimeLeaderboard
      //    (onlyAdmin = NormalTimelock; not ACM-gated).
      {
        target: XVS_VAULT,
        signature: "setPrimeToken(address,address,uint256)",
        params: [PRIME_LEADERBOARD, XVS, XVS_VAULT_POOL_ID],
      },

      // 6. Point the Core pool Comptroller at PrimeV2 (ensureAdmin = NormalTimelock).
      {
        target: COMPTROLLER,
        signature: "setPrimeToken(address)",
        params: [PRIME_V2],
      },

      // 6b. Point the VAIController at PrimeV2 (onlyAdmin = NormalTimelock). VAI minting
      //     is gated on prime-holder status (mintEnabledOnlyForPrimeHolder = true) and
      //     reads IPrime(prime).isUserPrimeHolder(minter); repointing keeps that gate
      //     tracking live PrimeV2 membership instead of the decommissioned legacy Prime.
      {
        target: VAI_CONTROLLER,
        signature: "setPrimeToken(address)",
        params: [PRIME_V2],
      },

      // 7. Configure PrimeV2 markets (vUSDT, vWBNB).
      ...PRIME_MARKETS.map(market => ({
        target: PRIME_V2,
        signature: "addMarket(address,uint256,uint256)",
        params: [market.vToken, market.supplyMultiplier, market.borrowMultiplier],
      })),

      // 8. Decommission the legacy Prime: togglePause() it. This halts only claimInterest
      //    (boosted-yield claims), not claim()/issue()/burn(); but with all inbound hooks
      //    repointed in steps 4-7, legacy is inert.
      //    NormalTimelock already holds the togglePause ACM permission, so no grant is needed.
      //    Legacy Prime is currently unpaused, so a single togglePause pauses it.
      //    (setLimit(0,0) is NOT used: it reverts with InvalidLimit because the legacy Prime
      //    already has revocable tokens minted, and limits cannot be set below the minted total.)
      {
        target: LEGACY_PRIME,
        signature: "togglePause()",
        params: [],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip637;
