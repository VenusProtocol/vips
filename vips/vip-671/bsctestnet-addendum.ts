import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  ACM,
  GUARDIAN,
  SPOKE_COMPTROLLER,
  SPOKE_COMPTROLLER_BEACON,
  SPOKE_COMPTROLLER_IMPL,
} from "./addresses/bsctestnet";
import { PAUSE_ROLE, ROUTER_ROLES, UNLIST_ROLE, giveCallPermission } from "./permissions";

// ===================================================================================================
// VIP-671 addendum [BNB Chain Testnet] — Hub-Funded Spoke pool, PHASE 1 follow-up.
//
// The listing VIP is executed and the pool is live. This addendum does two things and nothing else:
// point the comptroller beacon at the current `SpokeComptroller` implementation, and give the
// Guardian three roles the listing left on the Normal Timelock alone.
//
// ---------------------------------------------------------------------------------------------------
// 1. THE BEACON UPGRADE
//
// The beacon still serves 0x7F81dC61F3D75569A67155fb188171Aef173a52b, which was compiled before
// `enterMarketBehalf(address,address)` was renamed to `enterMarketForAccount(address,address)` and its
// two parameters were swapped to `(account, vToken)`. That rename is the ONLY difference between the
// live implementation and the one deployed for this addendum; the source diff between the two deploy
// commits touches six lines of `SpokeComptroller.sol` and no storage, so the upgrade is a pure ABI
// correction on a pool that already holds supplier positions.
//
// Verified against the deployed bytecode rather than the deployment record:
//   - The live implementation carries selector 0xd585c3c6 (`enterMarketBehalf`) and not 0x2e30a93c.
//   - The new implementation carries 0x2e30a93c (`enterMarketForAccount`) and not 0xd585c3c6.
//   - Every other ACM-gated role string on the contract is unchanged, so none of the grants the
//     listing VIP made stop matching after the upgrade.
//
// The beacon is plain `Ownable` and its owner is the Normal Timelock, so `upgradeTo` needs no ACM
// grant. The comptroller's EIP-1967 beacon slot holds this beacon, so the upgrade reaches the pool.
//
// ---------------------------------------------------------------------------------------------------
// 2. THE THREE GUARDIAN GRANTS
//
// All three were verified false for the Guardian on chain, both as an exact grant against the
// comptroller and as an address(0) wildcard, so none of them is a no-op.
//
//   setActionsPaused(address[],uint256[],bool)
//     The listing VIP deliberately left this out, on the argument that all three timelocks hold it as
//     a wildcard and the emergency pause path was therefore already open. That is true and still true,
//     but it puts every pause behind a proposal. On a pool whose whole purpose here is to be driven
//     through its failure modes by hand, the Guardian is the account that has to be able to pause and
//     unpause an action in the same session.
//     NOTE: the role string carries `uint256[]` while the CALL signature is
//     `setActionsPaused(address[],uint8[],bool)`, because `Action` is an enum. The two strings hash to
//     different roles. The `uint256[]` form is the one the contract checks. Do not "fix" either.
//
//   unlistMarket(address)
//     Held by the Normal Timelock as a wildcard, by the Guardian not at all. Unlisting is how a test
//     market is retired without redeploying the pool around it.
//
//   enterMarketForAccount(address,address)
//     The role the beacon upgrade renames. It lets an approved caller enter a market on a supplier's
//     behalf, so a first-time supplier needs one transaction instead of two.
//     THIS GRANTEE IS A TESTNET STAND-IN. On a mainnet listing this role belongs to the
//     CollateralGateway (venus-periphery#74), which passes its own caller through as `account`; it
//     ships in Phase 2 and is not deployed on this chain. Granting it to the Guardian here is what
//     makes the one-transaction supply path testable before that contract exists. Do not copy this
//     grant into a mainnet listing, and revoke it when the gateway lands.
//
// ---------------------------------------------------------------------------------------------------
// ORDER. Not load-bearing. An ACM role is keyed on the target address and the role string, never on
// the implementation behind it, so all three grants land identically whichever side of the upgrade
// they run on. The upgrade is written first only because `enterMarketForAccount` is a function that
// does not exist until it lands, and reading the proposal in that order is easier.
//
// ---------------------------------------------------------------------------------------------------
// NOT IN THIS PROPOSAL.
//   - `SpokePoolLens` was redeployed after the listing VIP. The lens holds no state, has no owner,
//     takes the registry to read as a call argument, and nothing on chain stores its address, so the
//     redeploy needs no command. `SPOKE_POOL_LENS` in ./addresses/bsctestnet.ts is corrected to the
//     new address alongside this addendum, so off-chain consumers of that file are not left pointing
//     at a contract the deployment record has replaced.
//   - No revocation. The old `enterMarketBehalf(address,address)` role was never granted to anyone,
//     verified for both the Guardian and the Normal Timelock, so the rename leaves nothing behind.
// ===================================================================================================

/// The roles the Guardian does not hold on the spoke comptroller and receives here. Every string comes
/// from ./permissions.ts rather than being written out again: an ACM string that exists in two places
/// is one rename away from granting a role nothing checks.
export const ADDENDUM_GUARDIAN_ROLES = [PAUSE_ROLE, UNLIST_ROLE, ...ROUTER_ROLES];

export const vip671Addendum = () => {
  const meta = {
    version: "v2",
    title: "VIP-671 addendum [BNB Chain Testnet] Spoke comptroller upgrade and Guardian permissions",
    description: `#### Summary

If passed, this addendum to VIP-671 will:

- Upgrade the Hub-Funded Spoke comptroller beacon to the current \`SpokeComptroller\` implementation. The live implementation was compiled before \`enterMarketBehalf\` was renamed to \`enterMarketForAccount\`, so its ABI no longer matches the source. That rename is the only difference between the two implementations, and it changes no storage.
- Grant the Guardian three permissions on the spoke comptroller that the original VIP left with the Normal Timelock alone: \`setActionsPaused(address[],uint256[],bool)\`, \`unlistMarket(address)\` and \`enterMarketForAccount(address,address)\`.

#### Details

The pool exists on BNB Chain Testnet to be exercised by hand. Pausing an action, retiring a test market and entering a market on a supplier's behalf each required a governance proposal, which is a delay rather than a control on a testnet pool. The Guardian is the multisig that already carries the day-to-day testnet parameters on this chain.

\`enterMarketForAccount\` is granted to the Guardian only as a testnet stand-in. On mainnet the role belongs to the CollateralGateway, which passes its own caller through as the account; that contract ships with Phase 2 and is not deployed on this chain.

These grants are a testnet decision and do not carry to a mainnet listing.

#### References

- VIP-671, the original listing: https://github.com/VenusProtocol/vips/pull/762
- Spoke pool contracts: https://github.com/VenusProtocol/isolated-pools/pull/559
- CollateralGateway, Phase 2: https://github.com/VenusProtocol/venus-periphery/pull/74`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: SPOKE_COMPTROLLER_BEACON,
        signature: "upgradeTo(address)",
        params: [SPOKE_COMPTROLLER_IMPL],
      },
      ...ADDENDUM_GUARDIAN_ROLES.map(role => giveCallPermission(ACM, SPOKE_COMPTROLLER, role, GUARDIAN)),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip671Addendum;
