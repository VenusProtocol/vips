import { Contract, Signer } from "ethers";

import ACM_COMMANDS_AGGREGATOR_ABI from "../../../simulations/vip-645/abi/ACMCommandsAggregator.json";
import { Permission } from "./commands";

export const seedAggregator = async (
  signer: Signer,
  aggregator: string,
  grants: Permission[],
  revokeBatches: Permission[][],
): Promise<{ grantIndex?: number; revokeIndices: number[] }> => {
  const agg = new Contract(aggregator, ACM_COMMANDS_AGGREGATOR_ABI, signer);
  const result: { grantIndex?: number; revokeIndices: number[] } = { revokeIndices: [] };

  if (grants.length > 0) {
    const receipt = await (await agg.addGrantPermissions(grants)).wait();
    result.grantIndex = receipt.events
      ?.find((e: { event?: string }) => e.event === "GrantPermissionsAdded")
      ?.args?.index.toNumber();
  }
  for (const revokes of revokeBatches) {
    if (revokes.length === 0) continue;
    const receipt = await (await agg.addRevokePermissions(revokes)).wait();
    const index = receipt.events
      ?.find((e: { event?: string }) => e.event === "RevokePermissionsAdded")
      ?.args?.index.toNumber();
    result.revokeIndices.push(index);
  }

  return result;
};
