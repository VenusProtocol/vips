import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { REMOTE_CHAINS, RESET_POOL_CF_SNAPSHOT } from "./config";

const { ACCESS_CONTROL_MANAGER, FAST_TRACK_TIMELOCK, GUARDIAN, NORMAL_TIMELOCK } = NETWORK_ADDRESSES.bscmainnet;

export const DEFAULT_PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";
export const EBRAKE = "0x35eBaBB99c7Fb7ba0C90bCc26e5d55Cdf89C23Ec";
export const NEW_EBRAKE_IMPLEMENTATION = "0x0e18f3CA31080fBeF44378372Ec8602fA64cBC63";

// The accounts that already hold resetCFSnapshot(address) on EBrake
export const RESET_GRANTEES = [GUARDIAN, NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK];

export const vip683 = () => {
  const meta = {
    version: "v2",
    title: "VIP-683 [BNB Chain, Ethereum, Arbitrum One, Base] EBrake per-pool collateral factor snapshot reset",
    description: `#### Summary

If this VIP passes, EBrake on BNB Chain will be upgraded to a build that lets governance clear the stored collateral factor snapshot of a single pool, instead of every pool of a market at once. The Guardian and the Normal and Fast-track Timelocks receive the permission for the new function. EBrake is upgraded to the same build on Ethereum, Arbitrum One and Base.

#### Description

EBrake stores a market's collateral factor and liquidation threshold per pool before it lowers the collateral factor, so that governance can recover the pre-incident values later and clear the snapshot with \`resetCFSnapshot(address)\`. That function clears the snapshot of every pool of the market. When governance restores the collateral factor in one pool while other pools stay tightened, clearing everything also erases the baseline of the pools that are still tightened. This was reported as a Low severity finding in the [Cantina Apex audit](https://ai.cantina.xyz/venus/workspace/VENU1) of the periphery contracts (VENU1-91).

The new build adds \`resetCFSnapshot(address market, uint96 poolId)\`, which clears the snapshot of one pool and emits \`PoolCFSnapshotReset(market, poolId)\`. It only touches EBrake's own storage. It is available on BNB Chain, where a market can be listed in several pools, and reverts on the other chains like \`decreaseCF(address,uint96,uint256)\` does. Nothing else in EBrake changes.

#### Actions

1. Upgrade the **EBrake** proxy [${EBRAKE}](https://bscscan.com/address/${EBRAKE}) to [${NEW_EBRAKE_IMPLEMENTATION}](https://bscscan.com/address/${NEW_EBRAKE_IMPLEMENTATION}).
2. Grant \`${RESET_POOL_CF_SNAPSHOT}\` on EBrake to the Guardian and the Normal and Fast-track Timelocks, the accounts that already hold \`resetCFSnapshot(address)\`.
3. On Ethereum, Arbitrum One and Base, upgrade **EBrake** to the same build. No permission changes there, because the new function is not available on those chains:
${REMOTE_CHAINS.map(c => `   - ${c.name}: ${c.newImplementation}`).join("\n")}

#### Notes

- The proxy addresses, their owners, the comptrollers EBrake acts on, the ACM and the storage layout stay the same.
- VIP-680 upgraded EBrake on BNB Chain, Ethereum, Arbitrum One and Base. The implementations proposed here build on that one and add only the function above.
- The new implementations include the fix for VENU1-91 and are verified on each block explorer.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // 1. EBrake upgrade on BNB Chain
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [EBRAKE, NEW_EBRAKE_IMPLEMENTATION],
      },

      // 2. Per-pool snapshot reset permission
      ...RESET_GRANTEES.map(account => ({
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [EBRAKE, RESET_POOL_CF_SNAPSHOT, account],
      })),

      // 3. Remote chains: EBrake upgrade
      ...REMOTE_CHAINS.map(chain => ({
        target: chain.proxyAdmin,
        signature: "upgrade(address,address)",
        params: [chain.eBrake, chain.newImplementation],
        dstChainId: chain.dstChainId,
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip683;
