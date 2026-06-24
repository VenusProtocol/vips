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
// Comptroller, configures the Prime markets, pauses the XVS Vault until the new
// PrimeLeaderboard is seeded off-chain, and pauses the legacy Prime.
export const PRIME_V2 = "0x4f5fd115Df31CC48De880a988D74aaD931851628";
export const PRIME_LEADERBOARD = "0x55e2ccF68B7A276dc28AfA107997b8B1Be932c0b";

// Existing contracts reused by PrimeV2
export const PLP = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2"; // PrimeLiquidityProvider (existing)
export const LEGACY_PRIME = "0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC"; // current Prime (to be replaced)
export const COMPTROLLER = bscmainnet.UNITROLLER;
export const XVS_VAULT = bscmainnet.XVS_VAULT_PROXY;
export const XVS = bscmainnet.XVS;
export const XVS_VAULT_POOL_ID = 0;

// Prime markets on the Core pool (bscmainnet) — mirrors the legacy Prime markets
// and their supply/borrow multipliers.
const VETH = "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8";
const VBTC = "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B";
const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const VU = "0x3d5E269787d562b74aCC55F18Bd26C5D09Fa245E"; // underlying: U (USD1)
const VWBNB = "0x6bCa74586218dB34cdB402295796b79663d816e9";

interface PrimeMarket {
  vToken: string;
  supplyMultiplier: string;
  borrowMultiplier: string;
}

export const PRIME_MARKETS: PrimeMarket[] = [
  { vToken: VETH, supplyMultiplier: parseUnits("2", 18).toString(), borrowMultiplier: parseUnits("4", 18).toString() },
  { vToken: VBTC, supplyMultiplier: parseUnits("2", 18).toString(), borrowMultiplier: parseUnits("4", 18).toString() },
  { vToken: VUSDC, supplyMultiplier: parseUnits("2", 18).toString(), borrowMultiplier: "0" },
  { vToken: VUSDT, supplyMultiplier: parseUnits("2", 18).toString(), borrowMultiplier: "0" },
  { vToken: VU, supplyMultiplier: parseUnits("2", 18).toString(), borrowMultiplier: "0" },
  { vToken: VWBNB, supplyMultiplier: parseUnits("2", 18).toString(), borrowMultiplier: "0" },
];

const ALL_TIMELOCKS = [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK];

// The off-chain epoch pipeline runs the cycle operations directly: a dedicated
// keeper EOA performs the bulk of the calls, the Guardian is granted the same
// permissions as a fallback / multisig path, and the NormalTimelock keeps the
// permission for governance-initiated operations.
const KEEPER_ACCOUNTS = [NORMAL_TIMELOCK, KEEPER, GUARDIAN];

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
// pause/unpause -> all three timelocks.
const PRIME_V2_PERMISSIONS = [
  ...grant(PRIME_V2, "issue(address)", KEEPER_ACCOUNTS),
  ...grant(PRIME_V2, "issueBatch(address[])", KEEPER_ACCOUNTS),
  ...grant(PRIME_V2, "burn(address)", KEEPER_ACCOUNTS),
  ...grant(PRIME_V2, "burnBatch(address[])", KEEPER_ACCOUNTS),
  ...grant(PRIME_V2, "setMintThreshold(uint256,uint256)", KEEPER_ACCOUNTS),
  ...grant(PRIME_V2, "recordCycleSnapshot(uint256)", KEEPER_ACCOUNTS),
  ...grant(PRIME_V2, "setPrimeLeaderboard(address)"),
  ...grant(PRIME_V2, "addMarket(address,uint256,uint256)"),
  ...grant(PRIME_V2, "removeMarket(address)"),
  ...grant(PRIME_V2, "setLimit(uint256)"),
  ...grant(PRIME_V2, "updateAlpha(uint128,uint128)"),
  ...grant(PRIME_V2, "updateMultipliers(address,uint256,uint256)"),
  ...grant(PRIME_V2, "setMaxLoopsLimit(uint256)"),
  ...grant(PRIME_V2, "sweepUndistributed(address,address)"),
  ...grant(PRIME_V2, "pause()", ALL_TIMELOCKS),
  ...grant(PRIME_V2, "unpause()", ALL_TIMELOCKS),
  // Circuit-breaker pause for the Venus team multisig (matches vip-616 cross-chain pattern).
  ...grant(PRIME_V2, "pause()", [BSCMAINNET_MULTISIG_PAUSER]),
];

// Circuit-breaker pause permission on the XVS Vault for the Venus team multisig.
const XVS_VAULT_MULTISIG_PAUSE_GRANT = grant(XVS_VAULT, "pause()", [BSCMAINNET_MULTISIG_PAUSER]);

// ACM-gated functions on PrimeLeaderboard (see PrimeLeaderboard.sol _checkAccessAllowed).
// Staker seeding -> KEEPER_ACCOUNTS; admin ops -> NormalTimelock only.
const PRIME_LEADERBOARD_PERMISSIONS = [
  ...grant(PRIME_LEADERBOARD, "initializeStakers(address[],uint256[],uint64[])", KEEPER_ACCOUNTS),
  ...grant(PRIME_LEADERBOARD, "finalizeInitialization()", KEEPER_ACCOUNTS),
  ...grant(PRIME_LEADERBOARD, "setMultiplierTiers(uint256[],uint256[])"),
  ...grant(PRIME_LEADERBOARD, "setPrimeV2(address)"),
  ...grant(PRIME_LEADERBOARD, "setMaxLoopsLimit(uint256)"),
];

const vip675 = () => {
  const meta = {
    version: "v2",
    title: "VIP-675 Deploy and configure PrimeV2 and PrimeLeaderboard",
    description: `#### Summary

If passed, this VIP will bring the new PrimeV2 and PrimeLeaderboard contracts live on BNB Chain: it accepts their ownership, grants the required ACM permissions, wires the two contracts together, points the existing PrimeLiquidityProvider at PrimeV2, switches the XVS Vault hook and the Core pool Comptroller from the legacy Prime to the new contracts, adds the Prime markets, pauses the XVS Vault while existing stakers are seeded into PrimeLeaderboard off-chain, and pauses the legacy Prime.

#### Description

If passed, this VIP will:

- Accept ownership of PrimeV2 and PrimeLeaderboard (transferred to the Normal Timelock by the deploy script).
- Grant ACM permissions: configuration functions to the Normal Timelock; cycle / epoch operations (issue/issueBatch/burn/burnBatch, setMintThreshold, recordCycleSnapshot on PrimeV2, and initializeStakers/finalizeInitialization on PrimeLeaderboard) to the Normal Timelock, the Keeper (\`${KEEPER}\`) and the Guardian; pause/unpause on PrimeV2 to all three timelocks; and circuit-breaker pause() on both PrimeV2 and the XVS Vault to the Venus team multisig (\`${BSCMAINNET_MULTISIG_PAUSER}\`). (XVS Vault resume() is already held by the Guardian and the Normal Timelock, so it is not re-granted here.)
- Wire the contracts together by setting PrimeLeaderboard on PrimeV2 and PrimeV2 on PrimeLeaderboard.
- Point the existing PrimeLiquidityProvider at PrimeV2 so Prime rewards accrue to the new contract.
- Switch the XVS Vault prime hook from the legacy Prime to PrimeLeaderboard, so vault deposits/withdrawals update the leaderboard (which in turn calls PrimeV2). Reward token and pool id are unchanged (XVS, pool 0).
- Update the Core pool Comptroller's prime address from the legacy Prime to PrimeV2, so market hooks call the new contract.
- Add the Core pool markets to PrimeV2 (vETH, vBTC, vUSDC, vUSDT, vU, vWBNB) with the same supply/borrow multipliers used by the legacy Prime.
- Pause the XVS Vault. The vault stays paused until the existing stakers are seeded into the new PrimeLeaderboard off-chain by the Guardian; the Guardian then calls XVS Vault \`resume()\` to bring it back online.
- Pause the legacy Prime to decommission it.

The leaderboard multiplier tiers (30/60/90 days mapping to 1.3x/1.6x/2.0x) and the PrimeV2 token limit (500) are set in the contracts' initializers, so they are not re-set here. The permissionless mint window is intentionally left uninitialized (mintThreshold = 0, mintDeadline = 0); governance or the Keeper / Guardian opens it later via setMintThreshold once the protocol is ready.

#### References

- PrimeV2 / PrimeLeaderboard implementation: https://github.com/VenusProtocol/venus-protocol/pull/676
- Testnet rollout (VIP-675 + addendun): https://github.com/VenusProtocol/vips/pull/712`,
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

      // 7. Configure PrimeV2 markets (supply/borrow multipliers mirror the legacy Prime).
      ...PRIME_MARKETS.map(market => ({
        target: PRIME_V2,
        signature: "addMarket(address,uint256,uint256)",
        params: [market.vToken, market.supplyMultiplier, market.borrowMultiplier],
      })),

      // 8. Pause the XVS Vault. The Guardian unpauses via resume() after seeding the
      //    existing stakers into the new PrimeLeaderboard off-chain.
      {
        target: XVS_VAULT,
        signature: "pause()",
        params: [],
      },

      // 9. Decommission the legacy Prime: pause it (halts claim / score updates / issuance).
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

export default vip675;
