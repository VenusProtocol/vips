import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { IRMs as ARBITRUMSEPOLIA_IRMs } from "../../multisig/proposals/arbitrumsepolia/vip-013";
import { IRMs as OPBNBTESTNET_IRMs } from "../../multisig/proposals/opbnbtestnet/vip-019";
import { IRMs as SEPOLIA_IRMs } from "../../multisig/proposals/sepolia/vip-052";

export const ARBITRUM_SEPOLIA_ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
export const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const OPBNBTESTNET_ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";

const { arbitrumsepolia, opbnbtestnet, sepolia } = NETWORK_ADDRESSES;

const vip350 = () => {
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
      // Grant Normal Timelock permissions
      ...SEPOLIA_IRMs.map(irm => {
        return {
          target: SEPOLIA_ACM,
          signature: "giveCallPermission(address,string,address)",
          params: [irm, "updateJumpRateModel(uint256,uint256,uint256,uint256)", sepolia.NORMAL_TIMELOCK],
          dstChainId: LzChainId.sepolia,
        };
      }),

      ...ARBITRUMSEPOLIA_IRMs.map(irm => {
        return {
          target: ARBITRUM_SEPOLIA_ACM,
          signature: "giveCallPermission(address,string,address)",
          params: [irm, "updateJumpRateModel(uint256,uint256,uint256,uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
          dstChainId: LzChainId.arbitrumsepolia,
        };
      }),

      ...OPBNBTESTNET_IRMs.map(irm => {
        return {
          target: OPBNBTESTNET_ACM,
          signature: "giveCallPermission(address,string,address)",
          params: [irm, "updateJumpRateModel(uint256,uint256,uint256,uint256)", opbnbtestnet.NORMAL_TIMELOCK],
          dstChainId: LzChainId.opbnbtestnet,
        };
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip350;
