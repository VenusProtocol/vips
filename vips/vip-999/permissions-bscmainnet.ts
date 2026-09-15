// ===================================================================================================
// Centrifuge YieldGroup ACM role strings for BNB Chain mainnet.
// ===================================================================================================

const YIELD_GROUP_BASE = [
  "addResource(address,address)",
  "removeResource(address)",
  "updateResourceAdapter(address,address)",
  "setInnerDepositQueue(address[])",
  "setInnerWithdrawQueue(address[])",
  "pauseResource(address)",
  "unpauseResource(address)",
  "sweep(address,address)",
];

// Opening a redemption and cancelling either direction.
const CENTRIFUGE_ASYNC_REQUESTS = [
  "requestRedeem(address,uint256)",
  "cancelDepositRequest(address)",
  "cancelRedeemRequest(address)",
];

// Collecting whatever the fund has settled. Idempotent, and moves no value out of the group — a
// claim only shifts a settled bucket into this contract. This is also the Keeper's whole surface:
// the bot that sweeps settled redemptions once a day holds these four and nothing else.
export const CENTRIFUGE_CLAIMS = [
  "claimDeposit(address)",
  "claimRedeem(address)",
  "claimCancelDeposit(address)",
  "claimCancelRedeem(address)",
];

// The NAV band. Too tight a value misreports the position on every Hub read.
export const CENTRIFUGE_NAV_GUARD = [
  "setNavGuardRate(address,uint16,uint16,uint16,uint32,bool,bool)",
  "setNavGuardSnapshot(address,uint128,uint64)",
  "setNavGuardEnabled(address,bool,bool)",
];

// Centrifuge publishes no rate on chain, so the reported APY is a governance input.
const SET_SPOT_APY = "setSpotAPYBps(address,uint64)";

export const CENTRIFUGE_GOVERNANCE = [
  ...YIELD_GROUP_BASE,
  "forceRemoveResource(address)",
  ...CENTRIFUGE_ASYNC_REQUESTS,
  ...CENTRIFUGE_CLAIMS,
  ...CENTRIFUGE_NAV_GUARD,
  SET_SPOT_APY,
];

// No Fast-Track set on purpose: it holds nothing on any Hub, source or the registry today, so the
// Centrifuge source stays on the same footing as the other nine sources.

export const CENTRIFUGE_OPERATOR = [
  "setInnerDepositQueue(address[])",
  "setInnerWithdrawQueue(address[])",
  "pauseResource(address)",
  ...CENTRIFUGE_ASYNC_REQUESTS,
  ...CENTRIFUGE_CLAIMS,
  SET_SPOT_APY,
];

export const CENTRIFUGE_GUARDIAN = [
  "pauseResource(address)",
  "forceRemoveResource(address)",
  ...CENTRIFUGE_NAV_GUARD,
  SET_SPOT_APY,
];
