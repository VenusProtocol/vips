import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { PRIME_LEADERBOARD, PRIME_V2 } from "./bsctestnet";

const { bsctestnet } = NETWORK_ADDRESSES;

const ACM = bsctestnet.ACCESS_CONTROL_MANAGER;
const GUARDIAN = bsctestnet.GUARDIAN;

// Grant ACM permission for `target.signature` to `account`.
const grant = (target: string, signature: string, account: string) => ({
  target: ACM,
  signature: "giveCallPermission(address,string,address)",
  params: [target, signature, account],
});

// ACM-gated functions on PrimeV2 / PrimeLeaderboard that the Guardian did NOT yet hold
// after the original VIP-675. Granting them here gives the Guardian full operational
// control over both contracts (issue/burn/setMintThreshold/initializeStakers/finalizeInitialization
// were already granted in the original VIP-675 and are intentionally not re-granted).
const PRIME_V2_GUARDIAN_PERMISSIONS = [
  grant(PRIME_V2, "setPrimeLeaderboard(address)", GUARDIAN),
  grant(PRIME_V2, "addMarket(address,uint256,uint256)", GUARDIAN),
  grant(PRIME_V2, "removeMarket(address)", GUARDIAN),
  grant(PRIME_V2, "setLimit(uint256)", GUARDIAN),
  grant(PRIME_V2, "updateAlpha(uint128,uint128)", GUARDIAN),
  grant(PRIME_V2, "updateMultipliers(address,uint256,uint256)", GUARDIAN),
  grant(PRIME_V2, "setMaxLoopsLimit(uint256)", GUARDIAN),
  grant(PRIME_V2, "pause()", GUARDIAN),
  grant(PRIME_V2, "unpause()", GUARDIAN),
];

const PRIME_LEADERBOARD_GUARDIAN_PERMISSIONS = [
  grant(PRIME_LEADERBOARD, "setMultiplierTiers(uint256[],uint256[])", GUARDIAN),
  grant(PRIME_LEADERBOARD, "setPrimeV2(address)", GUARDIAN),
  grant(PRIME_LEADERBOARD, "setMaxLoopsLimit(uint256)", GUARDIAN),
];

// Compressed multiplier tiers for faster testnet iteration:
//   <1h  -> 1.0x (implicit base, not a tier entry)
//   1-2h -> 1.3x
//   2-3h -> 1.6x
//   >=3h -> 2.0x
export const TIER_DURATIONS = [3600, 7200, 10800];
export const TIER_MULTIPLIERS = [
  parseUnits("1.3", 18).toString(),
  parseUnits("1.6", 18).toString(),
  parseUnits("2", 18).toString(),
];

const vip675Addendum = () => {
  const meta = {
    version: "v2",
    title: "VIP-675 addendum [Testnet] Extend Guardian permissions and compress leaderboard tiers",
    description: `#### Summary

If passed, this addendum to VIP-675 will:

- Grant the Guardian the remaining ACM permissions on PrimeV2 and PrimeLeaderboard (every ACM-gated function), so the Guardian can fully operate both contracts without going through governance for each call during testnet integration.
- Compress the PrimeLeaderboard multiplier tiers from day-scale (30/60/90 days -> 1.3x/1.6x/2.0x) to hour-scale (1h/2h/3h -> 1.3x/1.6x/2.0x), so FE/BE testing can exercise the tier progression without waiting weeks.

The base 1.0x multiplier (<1h) is implicit and is not a tier entry.

#### References

- VIP-675 (original): https://github.com/VenusProtocol/vips/pull/712`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      ...PRIME_V2_GUARDIAN_PERMISSIONS,
      ...PRIME_LEADERBOARD_GUARDIAN_PERMISSIONS,
      {
        target: PRIME_LEADERBOARD,
        signature: "setMultiplierTiers(uint256[],uint256[])",
        params: [TIER_DURATIONS, TIER_MULTIPLIERS],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip675Addendum;
