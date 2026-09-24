import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;

const ACM = bsctestnet.ACCESS_CONTROL_MANAGER;
const NORMAL_TIMELOCK = bsctestnet.NORMAL_TIMELOCK;
const FAST_TRACK_TIMELOCK = bsctestnet.FAST_TRACK_TIMELOCK;
const CRITICAL_TIMELOCK = bsctestnet.CRITICAL_TIMELOCK;
const GUARDIAN = bsctestnet.GUARDIAN;

// Deployed via venus-protocol PR #677 (feat/VPD-1313). On live networks the deploy script
// initiates transferOwnership of both contracts to the NormalTimelock (pending acceptance),
// but does NOT wire them — the setPrimeV2 / setPrimeLeaderboard wiring is ACM-gated and done
// here. This VIP accepts ownership, grants ACM permissions, wires PrimeV2 <-> PrimeLeaderboard,
// repoints the PrimeLiquidityProvider, configures the Prime markets, opens the mint window,
// switches the XVS Vault hook and the Core pool Comptroller to the new contracts, and pauses
// the legacy Prime.
export const PRIME_V2 = "0x4B8b963324dB0D40f64539032AB49CB07c88e312";
export const PRIME_LEADERBOARD = "0x45E9b8A46558c359b6Ee30580A599AAa1e5d9cDE";

// Existing contracts reused by PrimeV2
export const PLP = "0xAdeddc73eAFCbed174e6C400165b111b0cb80B7E"; // PrimeLiquidityProvider (existing)
export const LEGACY_PRIME = "0xe840F8EC2Dc50E7D22e5e2991975b9F6e34b62Ad"; // current Prime (to be replaced)
export const COMPTROLLER = bsctestnet.UNITROLLER;
export const XVS_VAULT = bsctestnet.XVS_VAULT_PROXY;
export const XVS = bsctestnet.XVS;
export const XVS_VAULT_POOL_ID = 1;

// Permissionless mint window config for PrimeV2.setMintThreshold(mintThreshold, mintDeadline)
export const MINT_THRESHOLD = parseUnits("1", 18).toString(); // 1 XVS effective stake (testnet)
export const MINT_DEADLINE = "0"; // 0 = no expiry

// Prime markets on the Core pool (bsctestnet) — mirrors the legacy Prime markets
// and their supply/borrow multipliers (read from the legacy Prime at LEGACY_PRIME).
const VUSDT = "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A";
const VUSDC = "0xD5C4C2e2facBEB59D0216D0595d63FcDc6F9A1a7";
const VBTC = "0xb6e9322C49FD75a367Fcb17B0Fcd62C5070EbCBe";
const VETH = "0x162D005F0Fff510E54958Cfc5CF32A3180A84aab";

interface PrimeMarket {
  vToken: string;
  supplyMultiplier: string;
  borrowMultiplier: string;
}

export const PRIME_MARKETS: PrimeMarket[] = [
  { vToken: VUSDT, supplyMultiplier: parseUnits("2", 18).toString(), borrowMultiplier: "0" },
  { vToken: VUSDC, supplyMultiplier: parseUnits("2", 18).toString(), borrowMultiplier: "0" },
  { vToken: VBTC, supplyMultiplier: parseUnits("2", 18).toString(), borrowMultiplier: parseUnits("4", 18).toString() },
  { vToken: VETH, supplyMultiplier: parseUnits("2", 18).toString(), borrowMultiplier: parseUnits("4", 18).toString() },
];

const ALL_TIMELOCKS = [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK];

// Grant ACM permission for `target.signature` to every account in `accounts`
// (defaults to NormalTimelock only).
const grant = (target: string, signature: string, accounts: string[] = [NORMAL_TIMELOCK]) =>
  accounts.map(account => ({
    target: ACM,
    signature: "giveCallPermission(address,string,address)",
    params: [target, signature, account],
  }));

// The off-chain admin (Guardian) runs the epoch operations directly (ranking + issue/burn,
// mint-threshold updates, and the one-time staker seeding), so it gets those permissions in
// addition to the NormalTimelock.
const KEEPER_ACCOUNTS = [NORMAL_TIMELOCK, GUARDIAN];

// ACM-gated functions on PrimeV2 (see PrimeV2.sol _checkAccessAllowed)
const PRIME_V2_PERMISSIONS = [
  ...grant(PRIME_V2, "issue(address)", KEEPER_ACCOUNTS),
  ...grant(PRIME_V2, "issueBatch(address[])", KEEPER_ACCOUNTS),
  ...grant(PRIME_V2, "burn(address)", KEEPER_ACCOUNTS),
  ...grant(PRIME_V2, "burnBatch(address[])", KEEPER_ACCOUNTS),
  ...grant(PRIME_V2, "setPrimeLeaderboard(address)"),
  ...grant(PRIME_V2, "addMarket(address,uint256,uint256)"),
  ...grant(PRIME_V2, "removeMarket(address)"),
  ...grant(PRIME_V2, "setLimit(uint256)"),
  ...grant(PRIME_V2, "updateAlpha(uint128,uint128)"),
  ...grant(PRIME_V2, "updateMultipliers(address,uint256,uint256)"),
  ...grant(PRIME_V2, "setMaxLoopsLimit(uint256)"),
  ...grant(PRIME_V2, "setMintThreshold(uint256,uint256)", KEEPER_ACCOUNTS),
  ...grant(PRIME_V2, "pause()", ALL_TIMELOCKS),
  ...grant(PRIME_V2, "unpause()", ALL_TIMELOCKS),
];

// ACM-gated functions on PrimeLeaderboard (see PrimeLeaderboard.sol _checkAccessAllowed)
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
    title: "VIP-675 [Testnet] Deploy and configure PrimeV2 and PrimeLeaderboard",
    description: `#### Summary

If passed, this VIP will bring the new PrimeV2 and PrimeLeaderboard contracts live on BNB Chain testnet: it accepts their ownership, grants the required ACM permissions, wires the two contracts together, points the existing PrimeLiquidityProvider at PrimeV2, configures the Prime markets, opens the permissionless mint window, switches the XVS Vault hook and the Core pool Comptroller from the legacy Prime to the new contracts, and pauses the legacy Prime.

#### Description

If passed, this VIP will:

- Accept ownership of PrimeV2 and PrimeLeaderboard (previously transferred to the Normal Timelock by the deploy script).
- Grant ACM permissions: configuration functions to the Normal Timelock; the epoch operations (issue/issueBatch/burn/burnBatch and setMintThreshold on PrimeV2, and initializeStakers/finalizeInitialization on PrimeLeaderboard) to both the Normal Timelock and the Guardian; pause/unpause to all three timelocks.
- Wire the contracts together by setting PrimeLeaderboard on PrimeV2 and PrimeV2 on PrimeLeaderboard.
- Point the existing PrimeLiquidityProvider at PrimeV2 so Prime rewards accrue to the new contract.
- Add the Core pool markets to PrimeV2 (vUSDT, vUSDC, vBTC, vETH) with the same supply/borrow multipliers used by the legacy Prime.
- Open the permissionless mint window via setMintThreshold (minimum effective stake of 1 XVS, no deadline).
- Switch the XVS Vault prime hook from the legacy Prime to PrimeLeaderboard, so vault deposits/withdrawals update the leaderboard (which in turn calls PrimeV2). Reward token and pool id are unchanged (XVS, pool 1).
- Update the Core pool Comptroller's prime address from the legacy Prime to PrimeV2, so market hooks call the new contract.
- Pause the legacy Prime to decommission it.

The leaderboard multiplier tiers (30/60/90 days mapping to 1.3x/1.6x/2.0x) and the PrimeV2 token limit (500) are set in the contracts' initializers, so they are not re-set here. Seeding existing stakers into PrimeLeaderboard (initializeStakers + finalizeInitialization) is performed off-chain by the Guardian using a staker snapshot built from XVS vault history.

#### References

- PrimeV2 / PrimeLeaderboard implementation: https://github.com/VenusProtocol/venus-protocol/pull/676
- PrimeV2 / PrimeLeaderboard testnet deployments: https://github.com/VenusProtocol/venus-protocol/pull/677`,
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

      // 5. Configure PrimeV2 markets (supply/borrow multipliers mirror the legacy Prime)
      ...PRIME_MARKETS.map(market => ({
        target: PRIME_V2,
        signature: "addMarket(address,uint256,uint256)",
        params: [market.vToken, market.supplyMultiplier, market.borrowMultiplier],
      })),

      // 6. Open the permissionless mint window (mintThreshold must be > 0; reverts
      // MintThresholdNotSet while 0). Second param is the mint deadline (unix ts, 0 = no expiry).
      {
        target: PRIME_V2,
        signature: "setMintThreshold(uint256,uint256)",
        params: [MINT_THRESHOLD, MINT_DEADLINE],
      },

      // 7. Switch the XVS Vault hook from the legacy Prime to PrimeLeaderboard, so vault
      // deposit/withdraw events update the leaderboard (which in turn calls PrimeV2).
      // setPrimeToken on the vault is onlyAdmin (admin = NormalTimelock).
      {
        target: XVS_VAULT,
        signature: "setPrimeToken(address,address,uint256)",
        params: [PRIME_LEADERBOARD, XVS, XVS_VAULT_POOL_ID],
      },

      // 8. Point the Core pool Comptroller at PrimeV2 so market hooks call the new contract.
      // setPrimeToken is admin-gated (admin = NormalTimelock); no ACM grant needed.
      {
        target: COMPTROLLER,
        signature: "setPrimeToken(address)",
        params: [PRIME_V2],
      },

      // Note: PrimeLeaderboard staker seeding (initializeStakers + finalizeInitialization) is
      // NOT done in this VIP. The full staker snapshot (addresses, amounts, timestamps) must be
      // built off-chain from XVS vault logs and submitted in batches by the Guardian, which holds
      // the initializeStakers / finalizeInitialization ACM permissions granted above.

      // 9. Decommission the legacy Prime: pause it (halts claim / score updates / issuance).
      // NormalTimelock already holds the togglePause ACM permission, so no grant is needed.
      // Legacy Prime is currently unpaused, so a single togglePause pauses it.
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
