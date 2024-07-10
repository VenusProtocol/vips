import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const SEPOLIA_FASTTRACK_TIMELOCK = "0x7F043F43Adb392072a3Ba0cC9c96e894C6f7e182";
const SEPOLIA_CRITICAL_TIMELOCK = "0xA24A7A65b8968a749841988Bd7d05F6a94329fDe";
export const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
const SEPOLIA_XVS = "0x66ebd019E86e0af5f228a0439EBB33f045CBe63E";

const OPBNBTESTNET_FASTTRACK_TIMELOCK = "0xB2E6268085E75817669479b22c73C2AfEaADF7A6";
const OPBNBTESTNET_CRITICAL_TIMELOCK = "0xBd06aCDEF38230F4EdA0c6FD392905Ad463e42E3";
export const OPBNBTESTNET_ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";
const OPBNBTESTNET_XVS = "0xc2931B1fEa69b6D6dA65a50363A8D75d285e4da9";

const ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK = "0x14642991184F989F45505585Da52ca6A6a7dD4c8";
const ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK = "0x0b32Be083f7041608E023007e7802430396a2123";
export const ARBITRUM_SEPOLIA_ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
const ARBITRUM_SEPOLIA_XVS = "0x877Dc896e7b13096D3827872e396927BbE704407";

const SEPOLIA_CHAIN_ID = LzChainId.sepolia;
const OPBNBTESTNET_CHAIN_ID = LzChainId.opbnbtestnet;
const ARBITRUM_SEPOLIA_CHAIN_ID = LzChainId.arbitrumsepolia;

const { arbitrumsepolia, sepolia, opbnbtestnet } = NETWORK_ADDRESSES;

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
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_XVS, "migrateMinterTokens(address,address)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_XVS, "setMintCap(address,uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_XVS, "updateBlacklist(address,bool)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_XVS, "pause()", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_XVS, "unpause()", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS, "migrateMinterTokens(address,address)", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS, "setMintCap(address,uint256)", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS, "updateBlacklist(address,bool)", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS, "pause()", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS, "unpause()", sepolia.NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS, "migrateMinterTokens(address,address)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS, "setMintCap(address,uint256)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS, "updateBlacklist(address,bool)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS, "pause()", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS, "unpause()", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },

      // Permissions given to Fasttrack Timelock
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_XVS, "migrateMinterTokens(address,address)", ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_XVS, "setMintCap(address,uint256)", ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_XVS, "updateBlacklist(address,bool)", ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_XVS, "pause()", ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_XVS, "unpause()", ARBITRUM_SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },

      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS, "migrateMinterTokens(address,address)", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS, "setMintCap(address,uint256)", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS, "updateBlacklist(address,bool)", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS, "pause()", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS, "unpause()", SEPOLIA_FASTTRACK_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },

      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS, "migrateMinterTokens(address,address)", OPBNBTESTNET_FASTTRACK_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS, "setMintCap(address,uint256)", OPBNBTESTNET_FASTTRACK_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS, "updateBlacklist(address,bool)", OPBNBTESTNET_FASTTRACK_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS, "pause()", OPBNBTESTNET_FASTTRACK_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS, "unpause()", OPBNBTESTNET_FASTTRACK_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },

      // Permission given to Critical Timelock
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_XVS, "migrateMinterTokens(address,address)", ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_XVS, "setMintCap(address,uint256)", ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_XVS, "updateBlacklist(address,bool)", ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_XVS, "pause()", ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: ARBITRUM_SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUM_SEPOLIA_XVS, "unpause()", ARBITRUM_SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS, "migrateMinterTokens(address,address)", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS, "setMintCap(address,uint256)", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS, "updateBlacklist(address,bool)", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS, "pause()", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_XVS, "unpause()", SEPOLIA_CRITICAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS, "migrateMinterTokens(address,address)", OPBNBTESTNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS, "setMintCap(address,uint256)", OPBNBTESTNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS, "updateBlacklist(address,bool)", OPBNBTESTNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS, "pause()", OPBNBTESTNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_XVS, "unpause()", OPBNBTESTNET_CRITICAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip331;
