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
// stands in for the Operator and the Keeper here as well. Both get the whole surface — the price
// guards included, so the Guardian can arm a drop guard that pauses the Hub. That is not a decision
// this file gets to make on testnet: the Guardian is an ACM admin here, so it could grant itself any
// of this anyway, which is what makes the whole role split advisory rather than enforced.
//
// Granting these two and no one else is the intent, not a fallback: FastTrack and Critical are
// deliberately left out, so the only governance route to this source is the Normal Timelock, and
// anything faster goes through the Guardian multisig.
//
// Mainnet is where the roles are actually separated, and none of the above carries over: distinct
// Operator and Keeper addresses, a containment-only Guardian that is not an ACM admin, and the price
// guards kept with governance.
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
