import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { CONVERTERS as ETHEREUM_CONVERTERS } from "../../multisig/proposals/ethereum/vip-053";

export const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
export const ETHEREUM_FASTTRACK_TIMELOCK = "0x8764F50616B62a99A997876C2DEAaa04554C5B2E";
export const ETHEREUM_CRITICAL_TIMELOCK = "0xeB9b85342c34F65af734C7bd4a149c86c472bC00";

const { ethereum } = NETWORK_ADDRESSES;

const vip353 = () => {
  const meta = {
    version: "v2",
    title: "VIP-332 accept ownership & give permissions to Normal Timelock",
    description: `### Description`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      // Grant permissions to Normal Timelock
      ...ETHEREUM_CONVERTERS.map(converter => {
        return {
          target: ETHEREUM_ACM,
          signature: "giveCallPermission(address,string,address)",
          params: [converter, "pauseConversion()", ethereum.NORMAL_TIMELOCK],
          dstChainId: LzChainId.ethereum,
        };
      }),

      // Grant permissions to fast track timelock
      ...ETHEREUM_CONVERTERS.map(converter => {
        return {
          target: ETHEREUM_ACM,
          signature: "giveCallPermission(address,string,address)",
          params: [converter, "pauseConversion()", ETHEREUM_FASTTRACK_TIMELOCK],
          dstChainId: LzChainId.ethereum,
        };
      }),

      // Grant permissions to critical timelock
      ...ETHEREUM_CONVERTERS.map(converter => {
        return {
          target: ETHEREUM_ACM,
          signature: "giveCallPermission(address,string,address)",
          params: [converter, "pauseConversion()", ETHEREUM_CRITICAL_TIMELOCK],
          dstChainId: LzChainId.ethereum,
        };
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip353;
