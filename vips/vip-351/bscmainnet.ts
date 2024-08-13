import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { PLP as ARBITRUMONE_PLP, PRIME as ARBITRUMONE_PRIME } from "../../multisig/proposals/arbitrumone/vip-010";
import { PLP as ETHEREUM_PLP, PRIME as ETHEREUM_PRIME } from "../../multisig/proposals/ethereum/vip-053";

export const ARBITRUMONE_ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";

export const ARBITRUM_ONE_FASTTRACK_TIMELOCK = "0x2286a9B2a5246218f2fC1F380383f45BDfCE3E04";
export const ETHEREUM_FASTTRACK_TIMELOCK = "0x8764F50616B62a99A997876C2DEAaa04554C5B2E";

const vip351 = () => {
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
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_PRIME, "updateAlpha(uint128,uint128)", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_PRIME, "updateMultipliers(address,uint256,uint256)", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_PRIME, "setStakedAt(address[],uint256[])", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_PRIME, "addMarket(address,address,uint256,uint256)", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_PRIME, "setLimit(uint256,uint256)", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_PRIME, "setMaxLoopsLimit(uint256)", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_PRIME, "issue(bool,address[])", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_PRIME, "burn(address)", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_PRIME, "togglePause()", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_PLP, "setTokensDistributionSpeed(address[],uint256[])", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_PLP, "setMaxTokensDistributionSpeed(address[],uint256[])", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_PLP, "setMaxLoopsLimit(uint256)", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_PLP, "pauseFundsTransfer()", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_PLP, "resumeFundsTransfer()", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ARBITRUMONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMONE_PRIME, "updateAlpha(uint128,uint128)", ARBITRUM_ONE_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUMONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMONE_PRIME, "updateMultipliers(address,uint256,uint256)", ARBITRUM_ONE_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUMONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMONE_PRIME, "setStakedAt(address[],uint256[])", ARBITRUM_ONE_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUMONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMONE_PRIME, "addMarket(address,address,uint256,uint256)", ARBITRUM_ONE_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUMONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMONE_PRIME, "setLimit(uint256,uint256)", ARBITRUM_ONE_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUMONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMONE_PRIME, "setMaxLoopsLimit(uint256)", ARBITRUM_ONE_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUMONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMONE_PRIME, "issue(bool,address[])", ARBITRUM_ONE_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUMONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMONE_PRIME, "burn(address)", ARBITRUM_ONE_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUMONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMONE_PRIME, "togglePause()", ARBITRUM_ONE_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUMONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMONE_PLP, "setTokensDistributionSpeed(address[],uint256[])", ARBITRUM_ONE_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUMONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          ARBITRUMONE_PLP,
          "setMaxTokensDistributionSpeed(address[],uint256[])",
          ARBITRUM_ONE_FASTTRACK_TIMELOCK,
        ],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUMONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMONE_PLP, "setMaxLoopsLimit(uint256)", ARBITRUM_ONE_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUMONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMONE_PLP, "pauseFundsTransfer()", ARBITRUM_ONE_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUMONE_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMONE_PLP, "resumeFundsTransfer()", ARBITRUM_ONE_FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip351;
