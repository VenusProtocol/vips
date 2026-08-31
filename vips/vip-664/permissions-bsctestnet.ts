// The eight functions every yield group shares.
export const YIELD_GROUP_BASE = [
  "addResource(address,address)",
  "removeResource(address)",
  "updateResourceAdapter(address,address)",
  "setInnerDepositQueue(address[])",
  "setInnerWithdrawQueue(address[])",
  "pauseResource(address)",
  "unpauseResource(address)",
  "sweep(address,address)",
];

// Wildcard permissions the Guardian already holds on testnet, so the proposal skips them.
export const GUARDIAN_WILDCARDS = [...YIELD_GROUP_BASE, "forceRemoveResource(address)", "pauseHub()"];

// Opening a redemption and cancelling either direction.
export const CENTRIFUGE_ASYNC_REQUESTS = [
  "requestRedeem(address,uint256)",
  "cancelDepositRequest(address)",
  "cancelRedeemRequest(address)",
];

// Collecting whatever the fund has settled. Idempotent.
export const CENTRIFUGE_CLAIMS = [
  "claimDeposit(address)",
  "claimRedeem(address)",
  "claimCancelDeposit(address)",
  "claimCancelRedeem(address)",
];

// The three price defences. Too tight a value halts the Hub by itself.
export const CENTRIFUGE_PRICE_GUARDS = [
  "setPriceAgeGuard(address,address,uint64,uint64)",
  "disablePriceAgeGuard(address)",
  "setGrowthGuardRate(address,uint16,uint16,uint32)",
  "setGrowthGuardSnapshot(address,uint128,uint64)",
  "setDropGuardRate(address,uint16,uint16,uint32)",
  "setDropGuardSnapshot(address,uint128,uint64)",
];

// `pauseHub()` is absent: it is granted on the Hub, to the source contract, inline in the proposal.
export const CENTRIFUGE_FULL_SURFACE = [
  ...YIELD_GROUP_BASE,
  "forceRemoveResource(address)",
  ...CENTRIFUGE_ASYNC_REQUESTS,
  ...CENTRIFUGE_CLAIMS,
  ...CENTRIFUGE_PRICE_GUARDS,
];

// ---------------------------------------------------------------------------------------------------
// Who holds what on testnet.
//
// Two accounts, and no split between them: the Normal Timelock, and the Guardian multisig, which
// stands in for the Operator and the Keeper here as well. Both get the whole surface. Nobody else
// needs anything, so the FastTrack and Critical timelocks are left out — granting all three pushed
// the proposal past the 30M block gas limit anyway.
//
// Mainnet is where the roles are actually separated: distinct Operator and Keeper addresses, a
// containment-only Guardian, and the price guards kept with governance.
// ---------------------------------------------------------------------------------------------------
const notAlreadyHeld = (sigs: string[]) => sigs.filter(sig => !GUARDIAN_WILDCARDS.includes(sig));

// Granted every signature: the timelock holds no wildcards at all.
export const NORMAL_TIMELOCK_GRANTS = CENTRIFUGE_FULL_SURFACE;

// Granted only what its wildcards miss, which is everything Centrifuge-specific — those functions
// did not exist when the wildcards were handed out.
export const GUARDIAN_GRANTS = notAlreadyHeld(CENTRIFUGE_FULL_SURFACE);

export const giveCallPermission = (acm: string, contract: string, sig: string, account: string) => ({
  target: acm,
  signature: "giveCallPermission(address,string,address)",
  params: [contract, sig, account],
});
