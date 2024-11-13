import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const BSC_VETH_LST_IRM = "0x49a06B82b3c907AB140879F73f1d8dE262962c30";
export const BSC_vETH_CORE_IRM = "0x3aa125788FC6b9F801772baEa887aA40328015e9";
export const BSC_vETH_CORE = "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8";
export const BSC_vETH_LST = "0xeCCACF760FEA7943C5b0285BD09F601505A29c05";

export const ARBITRUM_vETH_CORE = "0x68a34332983f4Bf866768DD6D6E638b02eF5e1f0";
export const ARBITRUM_vETH_LST = "0x39D6d13Ea59548637104E40e729E4aABE27FE106";
export const ARBITRUM_IRM = "0x425dde630be832195619a06175ba45C827Dd3DCa";

export const ETHEREUM_vETH_CORE = "0x7c8ff7d2A1372433726f879BD945fFb250B94c65";
export const ETHEREUM_vETH_LST = "0xc82780Db1257C788F262FBbDA960B3706Dfdcaf2";
export const ETHEREUM_IRM = "0x2F81dAA9de0fD60fb9B105Cfc5b67A31Fda547b6";

export const OPBNB_vETH_CORE = "0x509e81eF638D489936FA85BC58F52Df01190d26C";
export const OPBNB_IRM = "0x0d75544019e3015eEbF61F26595D08d60f3aC841";

const vip392 = () => {
  const meta = {
    version: "v2",
    title: "VIP-392",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: BSC_vETH_CORE,
        signature: "_setInterestRateModel(address)",
        params: [BSC_vETH_CORE_IRM],
      },
      {
        target: BSC_vETH_LST,
        signature: "setInterestRateModel(address)",
        params: [BSC_VETH_LST_IRM],
      },
      {
        target: ARBITRUM_vETH_CORE,
        signature: "setInterestRateModel(address)",
        params: [ARBITRUM_IRM],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_vETH_LST,
        signature: "setInterestRateModel(address)",
        params: [ARBITRUM_IRM],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ETHEREUM_vETH_CORE,
        signature: "setInterestRateModel(address)",
        params: [ETHEREUM_IRM],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_vETH_LST,
        signature: "setInterestRateModel(address)",
        params: [ETHEREUM_IRM],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: OPBNB_vETH_CORE,
        signature: "setInterestRateModel(address)",
        params: [OPBNB_IRM],
        dstChainId: LzChainId.opbnbmainnet,
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip392;
