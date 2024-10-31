import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";
import { NORMAL_TIMELOCK } from "src/vip-framework";

const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const BNB_AMOUNT = parseUnits("5", 18);

export const ARBITRUM_ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const OPBNBMAINNET_ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
export const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";

export const ARBITRUM_ACM_AGGREGATOR = "0x74AFeA28456a683b8fF907699Ff77138edef00f3";
export const OPBNBMAINNET_ACM_AGGREGATOR = "0x6dB5e303289fea2E83F7d442470210045592AD93";
export const ETHEREUM_ACM_AGGREGATOR = "0xb78772bed6995551b64e54Cdb8e09800d86C73ee";

export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

const vip371 = () => {
  const meta = {
    version: "v2",
    title: "VIP-371 grant Timelocks and revoke permissions for Guardian in Arbitrum, opBNB and Ethereum",
    description: `### Description`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBNB(uint256,address)",
        params: [BNB_AMOUNT, NORMAL_TIMELOCK],
        value: "0",
      },
      {
        target: ARBITRUM_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ARBITRUM_ACM_AGGREGATOR],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [0],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ACM_AGGREGATOR,
        signature: "executeRevokePermissions(uint256)",
        params: [0],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ARBITRUM_ACM_AGGREGATOR],
        dstChainId: LzChainId.arbitrumone,
      },

      {
        target: OPBNBMAINNET_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, OPBNBMAINNET_ACM_AGGREGATOR],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [0],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM_AGGREGATOR,
        signature: "executeRevokePermissions(uint256)",
        params: [0],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, OPBNBMAINNET_ACM_AGGREGATOR],
        dstChainId: LzChainId.opbnbmainnet,
      },

      {
        target: ETHEREUM_ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ETHEREUM_ACM_AGGREGATOR],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [0],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [1],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM_AGGREGATOR,
        signature: "executeRevokePermissions(uint256)",
        params: [0],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ETHEREUM_ACM_AGGREGATOR],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip371;
