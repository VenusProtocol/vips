import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

// Core pool: 0xfD36E2c2a6789Db23113685031d7F16329158384
// swapRouter core pool = "0x8938E6dA30b59c1E27d5f70a94688A89F7c815a4"

// Addresses of all the swapRouters
export const swapRouterCorePool = "0x8938E6dA30b59c1E27d5f70a94688A89F7c815a4";

export const vip130 = () => {
  const meta = {
    version: "v2",
    title: "VIP-130 Accepting ownership for swap router",
    description: `Swap router is deployed for core pool, and the ownership of these router is transferred to Timelock
        and this VIP is to accept the ownership of the swap router.`,
    forDescription: "I agree that Venus Protocol should proceed with accepting ownership for swap router",
    againstDescription: "I do not think that Venus Protocol should proceed with accepting ownership for swap router",
    abstainDescription:
      "I am indifferent to whether Venus Protocol proceeds with accepting ownership for swap router or not",
  };

  return makeProposal(
    [
      {
        target: swapRouterCorePool,
        signature: "acceptOwnership()",
        params: [],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
