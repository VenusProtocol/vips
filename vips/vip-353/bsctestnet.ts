import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { CONVERTERS as SEPOLIA_CONVERTERS } from "../../multisig/proposals/sepolia/vip-052";

export const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const SEPOLIA_FASTTRACK_TIMELOCK = "0x7F043F43Adb392072a3Ba0cC9c96e894C6f7e182";
export const SEPOLIA_CRITICAL_TIMELOCK = "0xA24A7A65b8968a749841988Bd7d05F6a94329fDe";

const { sepolia } = NETWORK_ADDRESSES;

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
      ...SEPOLIA_CONVERTERS.map(converter => {
        return {
          target: SEPOLIA_ACM,
          signature: "giveCallPermission(address,string,address)",
          params: [converter, "pauseConversion()", sepolia.NORMAL_TIMELOCK],
          dstChainId: LzChainId.sepolia,
        };
      }),

      // Grant permissions to fast track timelock
      ...SEPOLIA_CONVERTERS.map(converter => {
        return {
          target: SEPOLIA_ACM,
          signature: "giveCallPermission(address,string,address)",
          params: [converter, "pauseConversion()", SEPOLIA_FASTTRACK_TIMELOCK],
          dstChainId: LzChainId.sepolia,
        };
      }),

      // Grant permissions to critical timelock
      ...SEPOLIA_CONVERTERS.map(converter => {
        return {
          target: SEPOLIA_ACM,
          signature: "giveCallPermission(address,string,address)",
          params: [converter, "pauseConversion()", SEPOLIA_CRITICAL_TIMELOCK],
          dstChainId: LzChainId.sepolia,
        };
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip353;
