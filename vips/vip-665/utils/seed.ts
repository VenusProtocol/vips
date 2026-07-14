import { Contract, Signer } from "ethers";

import ACM_COMMANDS_AGGREGATOR_ABI from "../../../simulations/vip-665/abi/ACMCommandsAggregator.json";
import { Permission } from "./commands";

// Append the VIP's grant and revoke batches to a chain's ACMCommandsAggregator and return the indices they
// landed at (read from the emitted *PermissionsAdded events). addGrant/RevokePermissions are permissionless,
// so any funded signer works — the fork simulations pass an impersonated signer, scripts/seedAggregators.ts
// passes the configured deployer.
export const seedAggregator = async (
  signer: Signer,
  aggregator: string,
  grants: Permission[],
  revokes: Permission[],
): Promise<{ grantIndex?: number; revokeIndex?: number }> => {
  const agg = new Contract(aggregator, ACM_COMMANDS_AGGREGATOR_ABI, signer);
  const result: { grantIndex?: number; revokeIndex?: number } = {};

  if (grants.length > 0) {
    const receipt = await (await agg.addGrantPermissions(grants)).wait();
    result.grantIndex = receipt.events
      ?.find((e: { event?: string }) => e.event === "GrantPermissionsAdded")
      ?.args?.index.toNumber();
  }
  if (revokes.length > 0) {
    const receipt = await (await agg.addRevokePermissions(revokes)).wait();
    result.revokeIndex = receipt.events
      ?.find((e: { event?: string }) => e.event === "RevokePermissionsAdded")
      ?.args?.index.toNumber();
  }

  return result;
};
