import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

// Second PendlePTVaultAdapter proxy, deployed 2026-03-23. Its proxy and its own ProxyAdmin were
// left with the deployer EOA and its implementation was never recorded in a venus-periphery
// deployment artifact. This is the adapter the dApp drove until the frontend was repointed at the
// VIP-606 adapter.
export const PENDLE_PT_VAULT_ADAPTER = "0x179bD219c2a20a49406C9AdA39634eDac1C7F656";
export const PENDLE_PT_VAULT_ADAPTER_PROXY_ADMIN = "0xae560a5E368ea72D4090533b245bf163c9DC6dC2";

// Implementation currently behind the proxy above. Its verified source is identical to the
// implementation below except that _checkAccessAllowed is absent from addMarket(), pause() and
// unpause(), which leaves those three callable by any address.
export const UNGUARDED_IMPLEMENTATION = "0x79276267b23B611ee9Aa8D8D50CB134334e876fA";

// Implementation of the VIP-606 adapter (0x60Db419d8ea13C5827072Cf693D13cA1Ec6E0B4a), recorded in
// venus-periphery deployments/bscmainnet as PendlePTVaultAdapter_Implementation. Same compiler,
// same ABI, same storage layout, with the three access-control checks in place.
export const GUARDED_IMPLEMENTATION = "0x70B093Df30B62105e1aCb91Feeb1E9a916d7d899";

// Deployer EOA that currently owns both the proxy and its ProxyAdmin.
export const DEPLOYER = "0x24c30C9C84b8a3C71A521ad30007ED47372331b3";

const vip672 = () => {
  const meta = {
    version: "v2",
    title: "VIP-672 [BNB Chain] Pendle PT Adapter Governance Handover",
    description: `This VIP completes the governance handover of the second PendlePTVaultAdapter proxy on BNB Chain (${PENDLE_PT_VAULT_ADAPTER}) and restores the access-control checks on it.

Two PendlePTVaultAdapter proxies exist on BNB Chain mainnet. The first (0x60Db419d8ea13C5827072Cf693D13cA1Ec6E0B4a) was activated by VIP-606, is recorded in the venus-periphery deployment artifacts, and is owned by the Normal Timelock under the shared ProxyAdmin 0x6beb6d2695b67feb73ad4f172e8e2975497187e4. The second (${PENDLE_PT_VAULT_ADAPTER}) was deployed on 2026-03-23 and never went through the same handover: it and its own ProxyAdmin (${PENDLE_PT_VAULT_ADAPTER_PROXY_ADMIN}) remained owned by the deployer address ${DEPLOYER}, and its implementation ${UNGUARDED_IMPLEMENTATION} was never recorded in a deployment artifact.

The two implementations are byte-identical in source except for three lines: the \`_checkAccessAllowed\` call is absent from \`addMarket(address,address)\`, \`pause()\` and \`unpause()\` on ${UNGUARDED_IMPLEMENTATION}. As a result those three functions are callable by any address on this proxy today, while the equivalent calls on the VIP-606 adapter revert with the ACM \`Unauthorized\` error. Because \`withdraw\` and \`redeemAtMaturity\` carry the \`whenNotPaused\` modifier, any address can suspend this adapter's deposit and exit paths — and any address can lift the pause again, since \`unpause()\` is equally open.

No funds are held by the adapter itself: it is a router and custodies no vTokens, PT or native balance. Accounts that used it hold their vTokens directly and can always redeem through the vToken contract independently of the adapter.

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

**3. Grant ACM permission — addMarket to Normal Timelock**
- Contract: AccessControlManager
- Function: \`giveCallPermission(address,string,address)\`
- Parameters: contractAddress ${PENDLE_PT_VAULT_ADAPTER}, functionSig \`addMarket(address,address)\`, accountToPermit Normal Timelock

---

**4. Grant ACM permissions — pause and unpause to all timelocks and the Guardian**
- Contract: AccessControlManager
- Function: \`giveCallPermission(address,string,address)\` — called 8 times (pause + unpause x Normal, Fast Track, Critical Timelocks + Guardian)
- Effect: After command 2 the three functions are permissioned, so these grants are what makes the adapter operable under governance. They mirror the grants VIP-606 made for the other adapter.

Total ACM permission grants in this VIP: 9 (addMarket x 1 + pause x 4 + unpause x 4).

#### Summary

If approved, this VIP will:
- Accept ownership of PendlePTVaultAdapter ${PENDLE_PT_VAULT_ADAPTER} into the Normal Timelock
- Upgrade that proxy to the guarded implementation ${GUARDED_IMPLEMENTATION}, closing the permissionless \`pause()\`, \`unpause()\` and \`addMarket()\` entry points
- Grant \`addMarket(address,address)\` on the adapter to the Normal Timelock
- Grant \`pause()\` and \`unpause()\` on the adapter to the Normal Timelock, Fast Track Timelock, Critical Timelock and Guardian

After execution, both Pendle PT adapters on BNB Chain are owned by the Normal Timelock and carry the same access-control configuration.`,
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
      // 3-4. Mirror the ACM configuration VIP-606 applied to the governed adapter.
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [PENDLE_PT_VAULT_ADAPTER, "addMarket(address,address)", bscmainnet.NORMAL_TIMELOCK],
      },
      ...[
        bscmainnet.NORMAL_TIMELOCK,
        bscmainnet.FAST_TRACK_TIMELOCK,
        bscmainnet.CRITICAL_TIMELOCK,
        bscmainnet.GUARDIAN,
      ].flatMap(timelock => [
        {
          target: bscmainnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [PENDLE_PT_VAULT_ADAPTER, "pause()", timelock],
        },
        {
          target: bscmainnet.ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [PENDLE_PT_VAULT_ADAPTER, "unpause()", timelock],
        },
      ]),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip672;
