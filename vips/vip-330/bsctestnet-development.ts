import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { arbitrumsepolia, sepolia, opbnbtestnet } = NETWORK_ADDRESSES;

export const SEPOLIA_OMNICHAIN_GOVERNANCE_EXECUTOR = sepolia.OMNICHAIN_GOVERNANCE_EXECUTOR;
export const SEPOLIA_NORMAL_TIMELOCK = "0xc332F7D8D5eA72cf760ED0E1c0485c8891C6E0cF";
export const SEPOLIA_OMNICHAIN_EXECUTOR_OWNER = "0xf964158C67439D01e5f17F0A3F39DfF46823F27A";
export const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";

export const OPBNBTESTNET_OMNICHAIN_GOVERNANCE_EXECUTOR = opbnbtestnet.OMNICHAIN_GOVERNANCE_EXECUTOR;
export const OPBNBTESTNET_NORMAL_TIMELOCK = "0x1c4e015Bd435Efcf4f58D82B0d0fBa8fC4F81120";
export const OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER = "0x4F570240FF6265Fbb1C79cE824De6408F1948913";
export const OPBNBTESTNET_ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";

export const ARBITRUMSEPOLIA_OMNICHAIN_GOVERNANCE_EXECUTOR = arbitrumsepolia.OMNICHAIN_GOVERNANCE_EXECUTOR;
export const ARBITRUMSEPOLIA_NORMAL_TIMELOCK = "0x794BCA78E606f3a462C31e5Aba98653Efc1322F8";
export const ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER = "0xfCA70dd553b7dF6eB8F813CFEA6a9DD039448878";
export const ARBITRUMSEPOLIA_ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";

const SEPOLIA_CHAIN_ID = LzChainId.sepolia;
const OPBNBTESTNET_CHAIN_ID = LzChainId.opbnbtestnet;
const ARBITRUMSEPOLIA_CHAIN_ID = LzChainId.arbitrumsepolia;

const vip330 = () => {
  const meta = {
    version: "v2",
    title: "VIP-330 Fake permissions on remote networks",
    description: `Fake permissions on remote networks`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: SEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [SEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setSendVersion(uint16)", SEPOLIA_NORMAL_TIMELOCK],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [OPBNBTESTNET_OMNICHAIN_EXECUTOR_OWNER, "setSendVersion(uint16)", OPBNBTESTNET_NORMAL_TIMELOCK],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: ARBITRUMSEPOLIA_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ARBITRUMSEPOLIA_OMNICHAIN_EXECUTOR_OWNER, "setSendVersion(uint16)", ARBITRUMSEPOLIA_NORMAL_TIMELOCK],
        dstChainId: ARBITRUMSEPOLIA_CHAIN_ID,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip330;
