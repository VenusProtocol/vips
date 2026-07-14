import { NETWORK_ADDRESSES } from "src/networkAddresses";

const { bscmainnet } = NETWORK_ADDRESSES;
export const ZERO = "0x0000000000000000000000000000000000000000";

const NORMAL = bscmainnet.NORMAL_TIMELOCK;
const FASTTRACK = bscmainnet.FAST_TRACK_TIMELOCK;
const CRITICAL = bscmainnet.CRITICAL_TIMELOCK;
const G1 = bscmainnet.CRITICAL_GUARDIAN;
const G2 = bscmainnet.GUARDIAN;
const G3 = "0x3a3284dC0FaFfb0b5F0d074c4C704D14326C98cF";

// Retired contracts (absent from every deployment file) still holding grants.
const RISK_FUND_V2 = "0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42";
const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const RETIRED_RISK_CONFIG = "0xBa2a43279a228cf9cD94d072777d8d98e7e0a229";
const RETIRED_RISK_STEWARD = "0xE7252dccd79F2A555E314B9cdd440745b697D562";
const RETIRED_TWAP_ORACLE = "0xea2f042e1A4f057EF8A5220e57733AD747ea8867";

// target = contract the permission is scoped to (ZERO = wildcard); signature = function signature;
// revokeFrom = grantees to drop it from.
export const STALE_ROWS: { target: string; signature: string; revokeFrom: string[] }[] = [
  // Removed setter — the current RiskFundV2 implementation no longer has this function.
  {
    target: RISK_FUND_V2,
    signature: "sweepTokenFromPool(address,address,address,uint256)",
    revokeFrom: [NORMAL, FASTTRACK, CRITICAL],
  },
  // Legacy 2-arg setter; Guardian 1 already holds the current 3/4-arg setters.
  { target: UNITROLLER, signature: "_setCollateralFactor(address,uint256)", revokeFrom: [G1] },
  // Retired risk-config contract — dangling target grants. Holders confirmed on-chain:
  // pause/unpause held by Normal+FastTrack+Critical+G2; setRiskParameterConfig only by Normal;
  // toggleConfigActive by Normal+FastTrack+Critical (not G2).
  { target: RETIRED_RISK_CONFIG, signature: "pause()", revokeFrom: [NORMAL, FASTTRACK, CRITICAL, G2] },
  { target: RETIRED_RISK_CONFIG, signature: "unpause()", revokeFrom: [NORMAL, FASTTRACK, CRITICAL, G2] },
  { target: RETIRED_RISK_CONFIG, signature: "setRiskParameterConfig(string,address,uint256)", revokeFrom: [NORMAL] },
  { target: RETIRED_RISK_CONFIG, signature: "toggleConfigActive(string)", revokeFrom: [NORMAL, FASTTRACK, CRITICAL] },
  // Retired risk steward — dangling target grant.
  { target: RETIRED_RISK_STEWARD, signature: "setMaxDeltaBps(uint256)", revokeFrom: [NORMAL, FASTTRACK, CRITICAL] },
  // Retired oracle — dangling target grant.
  {
    target: RETIRED_TWAP_ORACLE,
    signature: "setTokenConfig(TokenConfig)",
    revokeFrom: [NORMAL, FASTTRACK, CRITICAL, G3],
  },
];
