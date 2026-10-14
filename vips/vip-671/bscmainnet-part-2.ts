import { ethers } from "ethers";
import { Command, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  ACM,
  ADAPTER_SWAPS,
  AUX_COMMANDS_AGGREGATOR,
  DEFAULT_ADMIN_ROLE,
  HUB_BEACON,
  HUB_IMPL,
  HUB_STACKS,
  PENDING,
  SPOKE_BEACON,
  SPOKE_SOURCE_GRANTS_BATCH_INDEX,
  SPOKE_SOURCE_IMPL,
} from "./addresses/bscmainnet";
import { giveCallPermission } from "./permissions";
import { SPOKE_SOURCE_GRANTS } from "./permissions-bscmainnet";

// ===================================================================================================
// VIP-671 [BNB Chain] — Hub-Funded Spoke pool, VIP-B: Liquidity Hub infrastructure. 23 commands, no funds move.
//
// Part 2 of 3. Independent of VIP-A (part 1). VIP-C (part 3, markets and Hub wiring) needs both executed.
//
// STATUS: DRAFT. The new Hub implementation and the Spoke family are not deployed. Each is `PENDING` in
// ./addresses/bscmainnet.ts and `vip671Part2Bscmainnet()` throws until all are filled. Then the grants batch is
// stored with ./provisionAcmBatches.ts, before the proposal is created.
//
// ---------------------------------------------------------------------------------------------------
// WHY THE GRANTS ARE BATCHED
//
// Inline, this is 80 commands, and on a fork `propose()` needed about 19.57M gas, 116.6% of the 16,777,216 per-tx
// cap. The 60 Spoke source grants are stored on the AuxiliaryCommandsAggregator and replayed by `executeBatch`.
// Every entry calls the ACM, which needs DEFAULT_ADMIN_ROLE, so the aggregator holds that role only between the
// `grantRole` and `revokeRole` around it. Of the three timelocks only the Normal one holds DEFAULT_ADMIN_ROLE, so
// this must be REGULAR.
//
// GAS, from a bscmainnet fork at block 127,532,000 with the Hub implementation and Spoke family deployed on the
// fork from venus-liquidity-hub#22: propose() about 4.59M (27.4% of the cap), queue() 1.33M, execute() 5.30M
// (31.6%). Storing the batch is a separate transaction: addBatch 10.37M (61.8%).
//
// ---------------------------------------------------------------------------------------------------
// WHAT CHANGES FOR THE LIVE HUBS
//
//  - Hub implementation (#20 and #22 over the live `main` build): `maxDeposit` and `maxMint` return
//    `type(uint256).max` (deposits stay capped by `_routeDeposit`; `HubLens` reports the real capacity), and
//    `emergencyReallocate` on a paused Hub settles each yield group first, skipping one whose `accrue()` reverts.
//    Same storage layout, and no role string changes.
//  - Adapters: each new one adds `resourceName`, and `AdapterFRV.spotAPYBps` nets the vault's reserve factor.
//    Valuation, deposit and withdraw code is unchanged.
//
// ORDER that matters:
//  - `grantRole`, `executeBatch`, `revokeRole`, in that order.
//  - `addYieldGroup` before `setOuterWithdrawQueue` on the same Hub, or `YieldGroupNotRegistered`.
//
// NOT IN THIS PROPOSAL:
//  - Spoke markets and Spoke in a deposit queue: VIP-C. Until a market is registered, which only governance can do
//    (`addResource`), no deposit can reach a Spoke source.
//  - Yield-group beacon upgrades. #20 and #22 change no yield-group contract, and the live implementations
//    already have `updateResourceAdapter` and `accrue()`.
//  - SpokeBeacon ownership: `13_DeploySpoke` transfers it to the Normal Timelock. Spoke sources have no owner.
// ===================================================================================================

/// Placeholder, as in part 1. VIP numbers are assigned by the governor at proposal time.
const VIP_NUMBER = 671;

/// Every address VIP-B needs that is not deployed yet. Exported so the simulation can report what is missing.
export const pendingDeployments = (): string[] =>
  [
    { name: "Hub implementation", address: HUB_IMPL },
    // No command targets these two, but the simulation checks both.
    { name: "SpokeBeacon", address: SPOKE_BEACON },
    { name: "Spoke source implementation", address: SPOKE_SOURCE_IMPL },
    ...HUB_STACKS.map(({ name, spokeSource }) => ({ name: `Spoke source for ${name}`, address: spokeSource })),
  ]
    .filter(({ address }) => address === PENDING)
    .map(({ name }) => name);

export type AcmCommand = { target: string; signature: string; params: [string, string, string] };

/// The 60 Spoke source grants, 20 per source. ./provisionAcmBatches.ts stores exactly this and the simulation
/// compares the stored batch against it. Throws while a Spoke source is PENDING: a stored batch cannot be removed,
/// and an address(0) contract would make every grant in it a wildcard over every yield group.
export const buildSpokeSourceGrantsBatch = (): AcmCommand[] => {
  const unresolved = HUB_STACKS.filter(({ spokeSource }) => spokeSource === PENDING).map(({ name }) => name);
  if (unresolved.length > 0) {
    throw new Error(`VIP-${VIP_NUMBER} part 2: Spoke source pending for ${unresolved.join(", ")}`);
  }
  return HUB_STACKS.flatMap(({ spokeSource }) =>
    SPOKE_SOURCE_GRANTS.map(({ role, account }) => giveCallPermission(ACM, spokeSource, role, account) as AcmCommand),
  );
};

/// The batch as the aggregator stores it, `(target, calldata)` per call. Shared by the script and the simulation.
export const encodeAcmBatch = (batch: AcmCommand[]) =>
  batch.map(({ target, signature, params }) => ({
    target,
    data: new ethers.utils.Interface([`function ${signature}`]).encodeFunctionData(
      signature.slice(0, signature.indexOf("(")),
      params,
    ),
  }));

export const vip671Part2Bscmainnet = () => {
  const missing = pendingDeployments();
  if (missing.length > 0) {
    throw new Error(
      `VIP-${VIP_NUMBER} [bscmainnet] part 2 is still a draft: ${missing.length} address(es) pending in ` +
        `vips/vip-671/addresses/bscmainnet.ts.\n  - ${missing.join("\n  - ")}\n` +
        `Deploy them and fill the addresses first. Nothing here has a safe default.`,
    );
  }

  const capLines = HUB_STACKS.map(({ name, spokeAbsoluteCap, spokePercentageCapBps }) => {
    const symbol = name.replace("Hub_", "");
    const absolute = Number(ethers.utils.formatUnits(spokeAbsoluteCap, 18)).toLocaleString("en-US");
    return `   - ${symbol} Hub: ${absolute} ${symbol}, or ${spokePercentageCapBps / 100}% of the Hub's assets`;
  });

  // TODO(meta): add the audit report links for venus-liquidity-hub#20 and #22, the deployed addresses, and a
  // public link to the full list of batched grants.
  const meta = {
    version: "v2",
    title: `VIP-${VIP_NUMBER} [BNB Chain] Hub-Funded Spoke pool: Liquidity Hub infrastructure`,
    description: `#### Summary

If passed, this VIP will prepare the **Liquidity Hub** for the Hub-Funded Spoke pool on BNB Chain. It upgrades the three Hubs (USDT, USDC and U), moves every existing yield group resource to new adapters, and registers a new, empty **Spoke** yield group on each Hub. No funds move: each Spoke yield group holds no market and stays out of its Hub's deposit queue. A later proposal lists the pool's markets and lets the Hubs supply them.

#### Proposed changes

1. Upgrade the Hub implementation behind the shared Hub beacon, which moves all three Hubs:
   - \`maxDeposit\` and \`maxMint\` no longer compute the remaining capacity on chain. Deposits stay limited by each yield group's caps; the new HubLens contract reports the real capacity.
   - During a Hub pause, an emergency reallocation first settles interest on each yield group, and skips a group whose settlement fails instead of failing the whole operation.
2. Move the 13 resources of the existing Core, Flux, FRV and Centrifuge yield groups to new adapters. The new adapters expose each resource's name, and the FRV adapter reports its APY net of the vault's reserve factor. Valuation, deposits and withdrawals are unchanged.
3. Grant the permissions of each new Spoke yield group, the same set every existing Core and Flux yield group has today:
   - the Normal Timelock: all 11 yield group permissions
   - the Pause Guardian: replace an adapter, and pause and unpause a resource
   - the Operator: both inner queues, pause and unpause a resource, and raise and lower a resource cap
4. Register the Spoke yield group on each Hub with its caps, the lower of the two applying:
${capLines.join("\n")}
5. Add it to the end of each Hub's withdraw queue. The deposit queues are unchanged.

#### Notes

- The 60 permissions in step 3 are pre-stored on the AuxiliaryCommandsAggregator (${AUX_COMMANDS_AGGREGATOR}) and run as batch ${SPOKE_SOURCE_GRANTS_BATCH_INDEX}, to keep the proposal under BNB Chain's per-transaction gas limit. The aggregator holds the AccessControlManager admin role only while the batch runs, within this proposal.
- No funds can reach a Spoke yield group until a later proposal registers its market and adds it to its Hub's deposit queue.
- Integrators that read \`maxDeposit\` or \`maxMint\` on a Hub to size a deposit should read them from HubLens instead.

#### References

- [Hub deposit capacity, adapter resource names and FRV APY](https://github.com/VenusProtocol/venus-liquidity-hub/pull/20)
- [Spoke yield family](https://github.com/VenusProtocol/venus-liquidity-hub/pull/22)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  const commands: Command[] = [
    // 1. Upgrade all three Hubs through their shared beacon (`onlyOwner`, owned by the Normal Timelock).
    { target: HUB_BEACON, signature: "upgradeTo(address)", params: [HUB_IMPL] },

    // 2. One adapter swap per live resource (13). Each re-runs the new adapter's `validateRegistration` against live
    //    state: the Core Comptroller's `treasuryPercent` must be 0, and each Centrifuge vault's `pricePerShare()`
    //    must not revert. Re-simulate at head before proposing.
    ...ADAPTER_SWAPS.map(({ yieldGroup, resource, newAdapter }) => ({
      target: yieldGroup,
      signature: "updateResourceAdapter(address,address)",
      params: [resource, newAdapter],
    })),

    // 3. The 60 Spoke source grants, replayed from the stored batch (`buildSpokeSourceGrantsBatch`).
    { target: ACM, signature: "grantRole(bytes32,address)", params: [DEFAULT_ADMIN_ROLE, AUX_COMMANDS_AGGREGATOR] },
    {
      target: AUX_COMMANDS_AGGREGATOR,
      signature: "executeBatch(uint256)",
      params: [SPOKE_SOURCE_GRANTS_BATCH_INDEX],
    },
    { target: ACM, signature: "revokeRole(bytes32,address)", params: [DEFAULT_ADMIN_ROLE, AUX_COMMANDS_AGGREGATOR] },

    // 4. Register each Spoke source with its final caps. `addYieldGroup` checks `asset()` but not `hub()`; the
    //    simulation checks both.
    ...HUB_STACKS.map(({ hub, spokeSource, spokeAbsoluteCap, spokePercentageCapBps }) => ({
      target: hub,
      signature: "addYieldGroup(address,uint256,uint16)",
      params: [spokeSource, spokeAbsoluteCap, spokePercentageCapBps],
    })),

    // 5. Append each Spoke source to its Hub's withdraw queue. The queue must keep every funded group, or
    //    `WithdrawQueueOmitsFundedYieldGroup`; the simulation pins the queue it extends.
    ...HUB_STACKS.map(({ hub, spokeSource, withdrawQueueBefore }) => ({
      target: hub,
      signature: "setOuterWithdrawQueue(address[])",
      params: [[...withdrawQueueBefore, spokeSource]],
    })),
  ];

  return makeProposal(commands, meta, ProposalType.REGULAR);
};

export default vip671Part2Bscmainnet;
