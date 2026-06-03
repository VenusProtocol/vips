import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

const ACM = bscmainnet.ACCESS_CONTROL_MANAGER;
const NORMAL_TIMELOCK = bscmainnet.NORMAL_TIMELOCK;
const FAST_TRACK_TIMELOCK = bscmainnet.FAST_TRACK_TIMELOCK;
const CRITICAL_TIMELOCK = bscmainnet.CRITICAL_TIMELOCK;

// ============================================================================
// TODO: replace with the deployed PrimeV2 / PrimeLeaderboard proxy addresses
// (not yet deployed on bscmainnet — see venus-protocol deploy/014-deploy-prime-v2.ts).
// On live networks the deploy script initiates transferOwnership of both contracts to the
// NormalTimelock (pending acceptance) but does NOT wire them — the setPrimeV2 /
// setPrimeLeaderboard wiring is ACM-gated and done here. This VIP accepts ownership, grants
// ACM permissions, wires the pair, and configures the markets.
// ============================================================================
export const PRIME_V2 = "0x0000000000000000000000000000000000000000"; // TODO
export const PRIME_LEADERBOARD = "0x0000000000000000000000000000000000000000"; // TODO

// Existing contracts reused by PrimeV2
export const PLP = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2"; // PrimeLiquidityProvider (existing)
export const LEGACY_PRIME = "0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC"; // current Prime (to be replaced)

// Prime markets on the Core pool (bscmainnet)
const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const VBTC = "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B";
const VETH = "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8";

const ALL_TIMELOCKS = [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK];

// Grant a single ACM permission for `target.signature` to every timelock in `accounts`.
const grant = (target: string, signature: string, accounts: string[] = [NORMAL_TIMELOCK]) =>
  accounts.map(account => ({
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [target, signature, account],
  }));

// ACM-gated functions on PrimeV2 (see PrimeV2.sol _checkAccessAllowed)
const PRIME_V2_PERMISSIONS = [
  ...grant(PRIME_V2, "issue(address)"),
  ...grant(PRIME_V2, "issueBatch(address[])"),
  ...grant(PRIME_V2, "burn(address)"),
  ...grant(PRIME_V2, "burnBatch(address[])"),
  ...grant(PRIME_V2, "setPrimeLeaderboard(address)"),
  ...grant(PRIME_V2, "addMarket(address,uint256,uint256)"),
  ...grant(PRIME_V2, "removeMarket(address)"),
  ...grant(PRIME_V2, "setLimit(uint256)"),
  ...grant(PRIME_V2, "updateAlpha(uint128,uint128)"),
  ...grant(PRIME_V2, "updateMultipliers(address,uint256,uint256)"),
  ...grant(PRIME_V2, "setMaxLoopsLimit(uint256)"),
  ...grant(PRIME_V2, "setMintThreshold(uint256,uint256)"),
  ...grant(PRIME_V2, "pause()", ALL_TIMELOCKS),
  ...grant(PRIME_V2, "unpause()", ALL_TIMELOCKS),
];

// ACM-gated functions on PrimeLeaderboard (see PrimeLeaderboard.sol _checkAccessAllowed)
const PRIME_LEADERBOARD_PERMISSIONS = [
  ...grant(PRIME_LEADERBOARD, "initializeStakers(address[],uint256[],uint64[])"),
  ...grant(PRIME_LEADERBOARD, "finalizeInitialization()"),
  ...grant(PRIME_LEADERBOARD, "setMultiplierTiers(uint256[],uint256[])"),
  ...grant(PRIME_LEADERBOARD, "setPrimeV2(address)"),
  ...grant(PRIME_LEADERBOARD, "setMaxLoopsLimit(uint256)"),
];

const vip675 = () => {
  const meta = {
    version: "v2",
    title: "VIP-675 Deploy and configure PrimeV2 and PrimeLeaderboard",
    description: `#### Summary

If passed, this VIP will accept ownership of the new PrimeV2 and PrimeLeaderboard contracts on BNB Chain, grant the governance timelocks the required ACM permissions, point the existing PrimeLiquidityProvider at PrimeV2, and configure the Prime markets and leaderboard tiers.

#### Description

TODO: describe the PrimeV2 / PrimeLeaderboard rollout, the markets added, the leaderboard multiplier tiers, and the migration of existing Prime holders.

#### Security and additional considerations

TODO: list audits (incl. Sherlock VPD-1292), testnet deployment and simulation links.

#### References

- PrimeV2 / PrimeLeaderboard implementation: https://github.com/VenusProtocol/venus-protocol/pull/676`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // 1. Accept ownership (deploy script transferred ownership to NormalTimelock)
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

      // 2. Grant ACM permissions
      ...PRIME_V2_PERMISSIONS,
      ...PRIME_LEADERBOARD_PERMISSIONS,

      // 3. Wire PrimeV2 <-> PrimeLeaderboard (ACM-gated; deploy does NOT wire on live networks)
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

      // 4. Point the existing PrimeLiquidityProvider at PrimeV2 (onlyOwner = NormalTimelock)
      {
        target: PLP,
        signature: "setPrimeToken(address)",
        params: [PRIME_V2],
      },

      // 5. Configure PrimeV2 markets
      // TODO: confirm supplyMultiplier / borrowMultiplier (1e18 scaled) per market
      {
        target: PRIME_V2,
        signature: "addMarket(address,uint256,uint256)",
        params: [VUSDT, "0", "0"], // TODO multipliers
      },
      {
        target: PRIME_V2,
        signature: "addMarket(address,uint256,uint256)",
        params: [VUSDC, "0", "0"], // TODO multipliers
      },
      {
        target: PRIME_V2,
        signature: "addMarket(address,uint256,uint256)",
        params: [VBTC, "0", "0"], // TODO multipliers
      },
      {
        target: PRIME_V2,
        signature: "addMarket(address,uint256,uint256)",
        params: [VETH, "0", "0"], // TODO multipliers
      },

      // Note: setMintThreshold is intentionally not called here — governance sets it
      // after the first epoch ends (the setMintThreshold ACM permission is granted above).

      // 6. Decommission the legacy Prime: pause it (halts claim / score updates / issuance).
      // NormalTimelock already holds the togglePause ACM permission, so no grant is needed.
      // Legacy Prime is currently unpaused, so a single togglePause pauses it.
      // (setLimit(0,0) is NOT used: it reverts with InvalidLimit because the legacy Prime
      // already has revocable tokens minted, and limits cannot be set below the minted total.)
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
