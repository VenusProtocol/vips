import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { PRIME_V2 } from "./bsctestnet";

const { bsctestnet } = NETWORK_ADDRESSES;

const ACM = bsctestnet.ACCESS_CONTROL_MANAGER;
const NORMAL_TIMELOCK = bsctestnet.NORMAL_TIMELOCK;
const GUARDIAN = bsctestnet.GUARDIAN;

// DefaultProxyAdmin owning the PrimeV2 / PrimeLeaderboard transparent proxies on
// bsctestnet. Its owner is NormalTimelock (verified on-chain).
export const PROXY_ADMIN = "0xef480a5654b231ff7d80A0681F938f3Db71a6Ca6";

// New PrimeV2 implementation deployed via venus-protocol PR #677
export const NEW_PRIME_V2_IMPL = "0xa327c5F6858113e228edA782D59e5A70387669a1";

// New ACM-gated function introduced by the new impl. The view-only additions
// (getLifetimeAccruedByMarket / getLifetimeAccruedByUser) need no ACM grant.
export const NEW_CYCLE_SIG = "recordCycleSnapshot(uint256)";

// Mirrors the keeper grant pattern in the original VIP-675: NormalTimelock for
// governance-driven operation, Guardian for off-chain epoch operations.
export const NEW_CYCLE_GRANT_ACCOUNTS = [NORMAL_TIMELOCK, GUARDIAN];

const grant = (target: string, signature: string, account: string) => ({
  target: ACM,
  signature: "giveCallPermission(address,string,address)",
  params: [target, signature, account],
});

const vip675Addendum2 = () => {
  const meta = {
    version: "v2",
    title: "VIP-675 addendum 2 [Testnet] Upgrade PrimeV2 implementation",
    description: `#### Summary

If passed, this second addendum to VIP-675 will:

- Upgrade the PrimeV2 proxy at \`${PRIME_V2}\` to a new implementation at \`${NEW_PRIME_V2_IMPL}\` (deployed via venus-protocol PR [#677](https://github.com/VenusProtocol/venus-protocol/pull/677)).
- Grant ACM permission for the new \`${NEW_CYCLE_SIG}\` function on PrimeV2 to the NormalTimelock and the Guardian, matching the keeper grant pattern established for the existing epoch operations (issue/burn/setMintThreshold) in the original VIP-675.

#### Description

The new implementation adds:

- \`${NEW_CYCLE_SIG}\` — ACM-gated; records a per-cycle accrual snapshot consumed by the new lifetime-accrued view functions below. Granted here to NormalTimelock + Guardian.
- \`getLifetimeAccruedByMarket(address,address[])\` — view, no ACM grant required.
- \`getLifetimeAccruedByUser(address,address[])\` — view, no ACM grant required.

No existing function signatures are removed, no storage layout changes that affect already-initialized state.

#### References

- venus-protocol PR #677 (deploy script + bsctestnet artifacts): https://github.com/VenusProtocol/venus-protocol/pull/677
- Original VIP-675 (PrimeV2 / PrimeLeaderboard setup): https://github.com/VenusProtocol/vips/pull/712`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // 1. Upgrade the PrimeV2 proxy to the new implementation.
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [PRIME_V2, NEW_PRIME_V2_IMPL],
      },

      // 2. Grant ACM permission for the new recordCycleSnapshot(uint256) function
      //    to NormalTimelock + Guardian, matching the keeper pattern from VIP-675.
      ...NEW_CYCLE_GRANT_ACCOUNTS.map(account => grant(PRIME_V2, NEW_CYCLE_SIG, account)),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip675Addendum2;
