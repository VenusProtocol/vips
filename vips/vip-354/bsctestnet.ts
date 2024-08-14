import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { CONVERTERS as SEPOLIA_CONVERTERS } from "../../multisig/proposals/sepolia/vip-052";
import { CONVERTER_NETWORK as SEPOLIA_CONVERTER_NETWORK } from "../../multisig/proposals/sepolia/vip-052";

export const SEPOLIA_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
export const SEPOLIA_FASTTRACK_TIMELOCK = "0x8764F50616B62a99A997876C2DEAaa04554C5B2E";
export const SEPOLIA_CRITICAL_TIMELOCK = "0xeB9b85342c34F65af734C7bd4a149c86c472bC00";

const { sepolia } = NETWORK_ADDRESSES;

const vip354 = () => {
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
      ...SEPOLIA_CONVERTERS.map(converter => {
        return {
          target: SEPOLIA_ACM,
          signature: "giveCallPermission(address,string,address)",
          params: [converter, "resumeConversion()", sepolia.NORMAL_TIMELOCK],
          dstChainId: LzChainId.sepolia,
        }
      }),

      // Grant permissions to fast track timelock
      ...SEPOLIA_CONVERTERS.map(converter => {
        return {
          target: SEPOLIA_ACM,
          signature: "giveCallPermission(address,string,address)",
          params: [converter, "resumeConversion()", SEPOLIA_FASTTRACK_TIMELOCK],
          dstChainId: LzChainId.sepolia,
        }
      }),

      // Grant permissions to critical timelock
      ...SEPOLIA_CONVERTERS.map(converter => {
        return {
          target: SEPOLIA_ACM,
          signature: "giveCallPermission(address,string,address)",
          params: [converter, "resumeConversion()", SEPOLIA_CRITICAL_TIMELOCK],
          dstChainId: LzChainId.sepolia,
        }
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip354;