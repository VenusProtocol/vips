import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { arbitrumsepolia, opbnbtestnet } = NETWORK_ADDRESSES;
const vip332 = () => {
  const meta = {
    version: "v2",
    title: "vip332 accept ownership of Vtreasury",
    description: `#### Description`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: arbitrumsepolia.VTREASURY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: opbnbtestnet.VTREASURY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbtestnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip332;
