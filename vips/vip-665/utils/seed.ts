import { Contract, Signer } from "ethers";

import ACM_COMMANDS_AGGREGATOR_ABI from "../../../simulations/vip-665/abi/ACMCommandsAggregator.json";
import { Permission } from "./commands";

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
