import { ethers } from "ethers";
import { Command, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { giveCallPermission } from "../vip-668/permissions";
import {
  ACM,
  ADAPTER_SWAPS,
  AUX_COMMANDS_AGGREGATOR,
  DEFAULT_ADMIN_ROLE,
  HUB_BEACON,
  HUB_IMPL,
  HUB_STACKS,
  SPOKE_SOURCE_GRANTS_BATCH_INDEX,
} from "./addresses/bscmainnet";
import { SPOKE_SOURCE_GRANTS } from "./permissions-bscmainnet";

// ===================================================================================================
// VIP-669 [BNB Chain]: Hub-Funded Spoke pool, Liquidity Hub infrastructure. 23 commands, no funds move.
//
// Second of three. Independent of VIP-668. VIP-670 (markets and Hub wiring) needs both executed.
//
// STATUS: the grants batch is stored at index 5 by ./provisionAcmBatches.ts (bscmainnet block 128,505,093, tx
// 0x67cc851ce00b0501cfdc527c0c042946c856fd918cb7ff29332f0a38d3ac6b1b), and the simulation compares it call for call.
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
// GAS, from a bscmainnet fork at block 127,750,000 with the deployed contracts: propose() about 4.59M (27.4% of the
// cap), queue() 1.33M, execute() 5.30M (31.6%). Storing the batch is a separate transaction: addBatch 10.37M (61.8%).
//
// ---------------------------------------------------------------------------------------------------
// WHAT CHANGES FOR THE LIVE HUBS
//
//  - Hub implementation (#20, #22, #29 and #37 over the live `main` build): `maxDeposit` and `maxMint` return
//    `type(uint256).max` (deposits stay capped by `_routeDeposit`; `HubLens` reports the real capacity),
//    `emergencyReallocate` on a paused Hub settles each yield group first, skipping one whose `accrue()` reverts,
//    and a yield group's percentage cap rounds up instead of down. Same storage layout, and no role string changes.
//  - Adapters: each new one adds `resourceName`, and `AdapterFRV.spotAPYBps` nets the vault's reserve factor.
//    Valuation, deposit and withdraw code is unchanged.
//
// ORDER that matters:
//  - `grantRole`, `executeBatch`, `revokeRole`, in that order.
//  - `addYieldGroup` before `setOuterWithdrawQueue` on the same Hub, or `YieldGroupNotRegistered`.
//
// NOT IN THIS PROPOSAL:
//  - Spoke markets and Spoke in a deposit queue: VIP-670. Until a market is registered, which only governance can do
//    (`addResource`), no deposit can reach a Spoke source.
//  - Yield-group beacon upgrades. #20 and #22 change no yield-group contract, and the live implementations
//    already have `updateResourceAdapter` and `accrue()`.
//  - SpokeBeacon ownership: `13_DeploySpoke` transfers it to the Normal Timelock. Spoke sources have no owner.
// ===================================================================================================

const VIP_NUMBER = 669;

export type AcmCommand = { target: string; signature: string; params: [string, string, string] };

/// The 60 Spoke source grants, 20 per source. ./provisionAcmBatches.ts stores exactly this and the simulation
/// compares the stored batch against it.
export const buildSpokeSourceGrantsBatch = (): AcmCommand[] =>
  HUB_STACKS.flatMap(({ spokeSource }) =>
    SPOKE_SOURCE_GRANTS.map(({ role, account }) => giveCallPermission(ACM, spokeSource, role, account) as AcmCommand),
  );

/// The batch as the aggregator stores it, `(target, calldata)` per call. Shared by the script and the simulation.
export const encodeAcmBatch = (batch: AcmCommand[]) =>
  batch.map(({ target, signature, params }) => ({
    target,
    data: new ethers.utils.Interface([`function ${signature}`]).encodeFunctionData(
      signature.slice(0, signature.indexOf("(")),
      params,
    ),
  }));

export const vip669 = () => {
  const capLines = HUB_STACKS.map(({ name, spokeAbsoluteCap, spokePercentageCapBps }) => {
    const symbol = name.replace("Hub_", "");
    const absolute = Number(ethers.utils.formatUnits(spokeAbsoluteCap, 18)).toLocaleString("en-US");
    return `   - ${symbol} Hub: ${absolute} ${symbol}, or ${spokePercentageCapBps / 100}% of the Hub's assets`;
  });

  const meta = {
    version: "v2",
    title: `VIP-${VIP_NUMBER} [BNB Chain] Hub-Funded Spoke pool: Liquidity Hub infrastructure`,
    description: `#### Summary

If passed, this VIP will prepare the **Liquidity Hub** for the Hub-Funded Spoke pool on BNB Chain. It upgrades the three Hubs (USDT, USDC and U), moves every existing yield group resource to new adapters, and registers a new, empty **Spoke** yield group on each Hub. No funds move: each Spoke yield group holds no market and stays out of its Hub's deposit queue. A later proposal lists the pool's markets and lets the Hubs supply them.

#### Proposed changes

1. Upgrade the Hub implementation behind the shared Hub beacon, which moves all three Hubs:
   - maxDeposit and maxMint no longer compute the remaining capacity on chain and return the maximum value, even while a Hub is paused (they returned 0 then). Deposits stay limited by each yield group's caps; the new HubLens contract reports the real capacity.
   - During a Hub pause, an emergency reallocation first settles interest on each yield group, and skips a group whose settlement fails instead of failing the whole operation.
   - A yield group's percentage cap rounds up instead of down, so caps that add up to 100% leave no gap of a single unit.
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
- Integrators that read maxDeposit or maxMint on a Hub to size a deposit should read them from HubLens instead.

#### References

- [Hub deposit capacity, adapter resource names and FRV APY](https://github.com/VenusProtocol/venus-liquidity-hub/pull/20)
- [Spoke yield family](https://github.com/VenusProtocol/venus-liquidity-hub/pull/22)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/781)`,
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

export default vip669;
