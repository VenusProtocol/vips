import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { RESET_POOL_CF_SNAPSHOT } from "./config";

const { ACCESS_CONTROL_MANAGER, CRITICAL_TIMELOCK, FAST_TRACK_TIMELOCK, GUARDIAN, NORMAL_TIMELOCK } =
  NETWORK_ADDRESSES.bsctestnet;

export const DEFAULT_PROXY_ADMIN = "0x7877ffd62649b6a1557b55d4c20fcbab17344c91";
export const EBRAKE = "0x957c09e3Ac3d9e689244DC74307c94111FBa8B42";
export const NEW_EBRAKE_IMPLEMENTATION = "0x73ab4fbfA8d04041ADc25Dd0151F8274191eCd24";

// The accounts that already hold resetCFSnapshot(address) on the testnet EBrake
export const RESET_GRANTEES = [GUARDIAN, NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK];

export const vip683 = () => {
  const meta = {
    version: "v2",
    title: "VIP-683 [BNB Chain Testnet] EBrake per-pool collateral factor snapshot reset",
    description: `#### Summary

Upgrades EBrake on BNB Chain Testnet to the build that adds \`resetCFSnapshot(address,uint96)\`, which clears the stored collateral factor snapshot of a single pool and emits \`PoolCFSnapshotReset(market, poolId)\`. The accounts that already hold \`resetCFSnapshot(address)\` receive the new permission.

#### Actions

1. Upgrade the **EBrake** proxy [${EBRAKE}](https://testnet.bscscan.com/address/${EBRAKE}) to [${NEW_EBRAKE_IMPLEMENTATION}](https://testnet.bscscan.com/address/${NEW_EBRAKE_IMPLEMENTATION}).
2. Grant \`${RESET_POOL_CF_SNAPSHOT}\` on EBrake to the Guardian and the Normal, Fast-track and Critical Timelocks.

#### Notes

- Testnet only.
- The proxy address, its owner, the comptroller, the ACM and the storage layout stay the same.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [EBRAKE, NEW_EBRAKE_IMPLEMENTATION],
      },
      ...RESET_GRANTEES.map(account => ({
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [EBRAKE, RESET_POOL_CF_SNAPSHOT, account],
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip683;
