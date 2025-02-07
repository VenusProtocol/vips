import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { COMPTROLLERS as SEPOLIA_COMPTROLLERS } from "../../multisig/proposals/sepolia/vip-073";
import { VTOKENS as SEPOLIA_VTOKENS } from "../../multisig/proposals/sepolia/vip-073";

const vip436 = () => {
  const meta = {
    version: "v2",
    title: "Accept ownership/admin of contracts on sepolia and arbitrum sepolia",
    description: `### Description`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      ...SEPOLIA_COMPTROLLERS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.sepolia,
        };
      }),
      ...SEPOLIA_VTOKENS.map(comptroller => {
        return {
          target: comptroller,
          signature: "acceptOwnership()",
          params: [],
          dstChainId: LzChainId.sepolia,
        };
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip436;
