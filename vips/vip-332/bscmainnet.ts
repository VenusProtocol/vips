import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const ETHEREUM_CRITICAL_TIMELOCK = "0xeB9b85342c34F65af734C7bd4a149c86c472bC00";
const ETHEREUM_FASTTRACK_TIMELOCK = "0x8764F50616B62a99A997876C2DEAaa04554C5B2E";
export const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
const ETHEREUM_XVS = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";

const OPBNBMAINNET_FASTTRACK_TIMELOCK = "0xEdD04Ecef0850e834833789576A1d435e7207C0d";
const OPBNBMAINNET_CRITICAL_TIMELOCK = "0xA7DD2b15B24377296F11c702e758cd9141AB34AA";
export const OPBNBMAINNET_ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
const OPBNBMAINNET_XVS = "0x3E2e61F1c075881F3fB8dd568043d8c221fd5c61";

const ARBITRUM_FASTTRACK_TIMELOCK = "0x2286a9B2a5246218f2fC1F380383f45BDfCE3E04";
const ARBITRUM_CRITICAL_TIMELOCK = "0x181E4f8F21D087bF02Ea2F64D5e550849FBca674";
export const ARBITRUM_ACM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
const ARBITRUM_XVS = "0xc1Eb7689147C81aC840d4FF0D298489fc7986d52";

const ETHEREUM_CHAIN_ID = LzChainId.ethereum;
const OPBNBMAINNET_CHAIN_ID = LzChainId.opbnbmainnet;
const ARBITRUM_CHAIN_ID = LzChainId.arbitrumone;

const { arbitrumone, ethereum, opbnbmainnet } = NETWORK_ADDRESSES;

const vip331 = () => {
  const meta = {
    version: "v2",
    title: "VIP-332 XVS permissions given to all Timelocks",
    description: `### Description`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      // Permissions given to Normal Timelock
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS, "migrateMinterTokens(address,address)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS, "setMintCap(address,uint256)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS, "updateBlacklist(address,bool)", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS, "pause()", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS, "unpause()", arbitrumone.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS, "migrateMinterTokens(address,address)", ethereum.NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS, "setMintCap(address,uint256)", ethereum.NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS, "updateBlacklist(address,bool)", ethereum.NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS, "pause()", ethereum.NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS, "unpause()", ethereum.NORMAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS, "migrateMinterTokens(address,address)", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS, "setMintCap(address,uint256)", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS, "updateBlacklist(address,bool)", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS, "pause()", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS, "unpause()", opbnbmainnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },

      // Permissions given to Fasttrack Timelock
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS, "migrateMinterTokens(address,address)", ARBITRUM_FASTTRACK_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS, "setMintCap(address,uint256)", ARBITRUM_FASTTRACK_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS, "updateBlacklist(address,bool)", ARBITRUM_FASTTRACK_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS, "pause()", ARBITRUM_FASTTRACK_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS, "unpause()", ARBITRUM_FASTTRACK_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },

      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS, "migrateMinterTokens(address,address)", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS, "setMintCap(address,uint256)", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS, "updateBlacklist(address,bool)", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS, "pause()", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS, "unpause()", ETHEREUM_FASTTRACK_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },

      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS, "migrateMinterTokens(address,address)", OPBNBMAINNET_FASTTRACK_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS, "setMintCap(address,uint256)", OPBNBMAINNET_FASTTRACK_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS, "updateBlacklist(address,bool)", OPBNBMAINNET_FASTTRACK_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS, "pause()", OPBNBMAINNET_FASTTRACK_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS, "unpause()", OPBNBMAINNET_FASTTRACK_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },

      // Permission given to Critical Timelock
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS, "migrateMinterTokens(address,address)", ARBITRUM_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS, "setMintCap(address,uint256)", ARBITRUM_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS, "updateBlacklist(address,bool)", ARBITRUM_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS, "pause()", ARBITRUM_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ARBITRUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_XVS, "unpause()", ARBITRUM_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS, "migrateMinterTokens(address,address)", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS, "setMintCap(address,uint256)", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS, "updateBlacklist(address,bool)", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS, "pause()", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: ETHEREUM_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ETHEREUM_XVS, "unpause()", ETHEREUM_CRITICAL_TIMELOCK],
        dstChainId: ETHEREUM_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS, "migrateMinterTokens(address,address)", OPBNBMAINNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS, "setMintCap(address,uint256)", OPBNBMAINNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS, "updateBlacklist(address,bool)", OPBNBMAINNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS, "pause()", OPBNBMAINNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
      {
        target: OPBNBMAINNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBMAINNET_XVS, "unpause()", OPBNBMAINNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBMAINNET_CHAIN_ID,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip331;
