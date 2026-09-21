import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

// Second PendlePTVaultAdapter proxy, deployed 2026-03-23. Its proxy and its own ProxyAdmin were
// left with the deployer EOA and its implementation was never recorded in a venus-periphery
// deployment artifact. This is the adapter the dApp drove until the frontend was repointed at the
// VIP-606 adapter.
export const PENDLE_PT_VAULT_ADAPTER = "0x179bD219c2a20a49406C9AdA39634eDac1C7F656";
export const PENDLE_PT_VAULT_ADAPTER_PROXY_ADMIN = "0xaE560a5e368Ea72D4090533B245bF163c9Dc6dc2";

// Implementation currently behind the proxy above. Its verified source is identical to the
// implementation below except that _checkAccessAllowed is absent from addMarket(), pause() and
// unpause(), which leaves those three callable by any address.
export const UNGUARDED_IMPLEMENTATION = "0x79276267b23B611ee9Aa8D8D50CB134334e876fA";

// Implementation of the VIP-606 adapter (0x60Db419d8ea13C5827072Cf693D13cA1Ec6E0B4a), recorded in
// venus-periphery deployments/bscmainnet as PendlePTVaultAdapter_Implementation. Same compiler,
// same ABI, same storage layout, with the three access-control checks in place.
export const GUARDED_IMPLEMENTATION = "0x70B093Df30B62105e1aCb91Feeb1E9a916d7d899";

// Original deployer; the ProxyAdmin has already been transferred to the Normal Timelock.
export const DEPLOYER = "0x24c30C9C84b8a3C71A521ad30007ED47372331b3";

const vip672 = () => {
  const meta = {
    version: "v2",
    title: "VIP-672 [BNB Chain] Pendle PT Adapter Governance Handover",
    description: `This VIP completes the governance handover of the second PendlePTVaultAdapter proxy on BNB Chain (${PENDLE_PT_VAULT_ADAPTER}) and restores the access-control checks on it.

Two PendlePTVaultAdapter proxies exist on BNB Chain mainnet. The first (0x60Db419d8ea13C5827072Cf693D13cA1Ec6E0B4a) was activated by VIP-606, is recorded in the venus-periphery deployment artifacts, and is owned by the Normal Timelock under the shared ProxyAdmin 0x6beb6D2695B67FEb73ad4f172E8E2975497187e4. The second (${PENDLE_PT_VAULT_ADAPTER}) was deployed on 2026-03-23 and never went through the same handover: it and its own ProxyAdmin (${PENDLE_PT_VAULT_ADAPTER_PROXY_ADMIN}) remained owned by the deployer address ${DEPLOYER}, and its implementation ${UNGUARDED_IMPLEMENTATION} was never recorded in a deployment artifact.

The two implementations are byte-identical in source except for three lines: the \`_checkAccessAllowed\` call is absent from \`addMarket(address,address)\`, \`pause()\` and \`unpause()\` on ${UNGUARDED_IMPLEMENTATION}. As a result those three functions are callable by any address on this proxy today, while the equivalent calls on the VIP-606 adapter revert with the ACM \`Unauthorized\` error. Because \`withdraw\` and \`redeemAtMaturity\` carry the \`whenNotPaused\` modifier, any address can suspend this adapter's deposit and exit paths — and any address can lift the pause again, since \`unpause()\` is equally open.

Users hold their vTokens directly, but existing delegate approvals remain effective until revoked. This VIP places the legacy adapter under governance and repairs its access checks; it does not revoke those approvals or disable user redemption. Users can also authorize the VIP-606 adapter or redeem directly through the vToken, subject to normal market liquidity, collateral and pause restrictions.

#### Prerequisites

This VIP assumes that, before execution, the deployer address ${DEPLOYER} has submitted two transactions:

1. \`PendlePTVaultAdapter(${PENDLE_PT_VAULT_ADAPTER}).transferOwnership(NORMAL_TIMELOCK)\` — the adapter is \`Ownable2Step\`, so this only sets the pending owner and must be completed by the \`acceptOwnership()\` command below.
2. \`ProxyAdmin(${PENDLE_PT_VAULT_ADAPTER_PROXY_ADMIN}).transferOwnership(NORMAL_TIMELOCK)\` — this ProxyAdmin is single-step \`Ownable\`, so ownership transfers immediately and needs no command in this VIP.

If either transaction has not landed, this VIP reverts.

#### Changes

**1. Accept ownership of the adapter**
- Contract: PendlePTVaultAdapter (${PENDLE_PT_VAULT_ADAPTER})
- Function: \`acceptOwnership()\`
- Effect: Completes the two-step ownership handoff, placing the adapter under Normal Timelock control.

---

**2. Restore the guarded implementation**
- Contract: ProxyAdmin (${PENDLE_PT_VAULT_ADAPTER_PROXY_ADMIN})
- Function: \`upgrade(address proxy, address implementation)\`
- Parameters: proxy ${PENDLE_PT_VAULT_ADAPTER}, implementation ${GUARDED_IMPLEMENTATION}
- Effect: Points the proxy at the implementation already in use by the VIP-606 adapter, which restores the \`_checkAccessAllowed\` checks on \`addMarket\`, \`pause\` and \`unpause\`. The two implementations share an ABI and storage layout, so no state migration is involved and no initializer is re-run.

---

#### Legacy adapter permissions

No ACM permissions are granted: the production integration uses the VIP-606 adapter, so this legacy adapter does not need ongoing market or pause administration. After the upgrade, \`addMarket\`, \`pause\` and \`unpause\` require ACM authorization, which has not been granted on this adapter to the timelocks or guardians. Ownership alone does not authorize these functions. Governance retains the ability to upgrade the contract or grant permissions later if necessary.

The upgrade preserves the existing pause state. If the legacy adapter is paused before execution, it remains paused and cannot be unpaused without a subsequent permission grant or other governance action. Users can instead authorize and redeem through the VIP-606 adapter; the two adapters have independent pause states.

#### Summary

If approved, this VIP will:
- Accept ownership of PendlePTVaultAdapter ${PENDLE_PT_VAULT_ADAPTER} into the Normal Timelock
- Upgrade that proxy to the guarded implementation ${GUARDED_IMPLEMENTATION}, closing the permissionless \`pause()\`, \`unpause()\` and \`addMarket()\` entry points

After execution, both Pendle PT adapters on BNB Chain are owned by the Normal Timelock, but this legacy adapter receives no ACM permission grants.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // 1. Complete the two-step ownership handoff started by the deployer.
      {
        target: PENDLE_PT_VAULT_ADAPTER,
        signature: "acceptOwnership()",
        params: [],
      },
      // 2. Restore the implementation that carries the access-control checks.
      {
        target: PENDLE_PT_VAULT_ADAPTER_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [PENDLE_PT_VAULT_ADAPTER, GUARDED_IMPLEMENTATION],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip672;
