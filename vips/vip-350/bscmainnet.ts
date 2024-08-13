import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { IRMs as ARBITRUMONE_IRMs } from "../../multisig/proposals/arbitrumone/vip-010";
import { IRMs as ETHEREUM_IRMs } from "../../multisig/proposals/ethereum/vip-053";
import { IRMs as OPBNBMAINNET_IRMs } from "../../multisig/proposals/opbnbmainnet/vip-020";

export const ARBITRUMONE_ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
export const OPBNBMAINNET_ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";

const { arbitrumone, ethereum, opbnbmainnet } = NETWORK_ADDRESSES;

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
      ...ETHEREUM_IRMs.map(irm => {
        return {
          target: ETHEREUM_ACM,
          signature: "giveCallPermission(address,string,address)",
          params: [irm, "updateJumpRateModel(uint256,uint256,uint256,uint256)", ethereum.NORMAL_TIMELOCK],
          dstChainId: LzChainId.ethereum,
        };
      }),

      ...ARBITRUMONE_IRMs.map(irm => {
        return {
          target: ARBITRUMONE_ACM,
          signature: "giveCallPermission(address,string,address)",
          params: [irm, "updateJumpRateModel(uint256,uint256,uint256,uint256)", arbitrumone.NORMAL_TIMELOCK],
          dstChainId: LzChainId.arbitrumone,
        };
      }),

      ...OPBNBMAINNET_IRMs.map(irm => {
        return {
          target: OPBNBMAINNET_ACM,
          signature: "giveCallPermission(address,string,address)",
          params: [irm, "updateJumpRateModel(uint256,uint256,uint256,uint256)", opbnbmainnet.GUARDIAN],
          dstChainId: LzChainId.opbnbmainnet,
        };
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip350;
