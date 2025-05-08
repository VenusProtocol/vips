import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const COMPTROLLER_CORE = "0xFeD3eAA668a6179c9E5E1A84e3A7d6883F06f7c1";
export const UNI = "0x873A6C4B1e3D883920541a0C61Dc4dcb772140b3";
export const VUNI_CORE = "0xaE43aAd383b93FCeE5d3e0dD2d40b6e94639c642";
export const RESERVE_FACTOR = parseUnits("0.25", 18);
export const COLLATERAL_FACTOR = parseUnits("0.50", 18);
export const LIQUIDATION_THRESHOLD = parseUnits("0.55", 18);
export const LIQUIDATION_INCENTIVE = parseUnits("1.1", 18);
export const newInterestRateModel = "0x5C7D8858a25778d992eE803Ce79F1eff60c1d9D1";

const vip502 = () => {
  const meta = {
    version: "v2",
    title: "Update the risk parameters of the UNI market in Core pool",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Market configurations
      {
        target: COMPTROLLER_CORE,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[VUNI_CORE], [parseUnits("4000000", 18)]],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: COMPTROLLER_CORE,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[VUNI_CORE], [parseUnits("2000000", 18)]],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: COMPTROLLER_CORE,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [VUNI_CORE, COLLATERAL_FACTOR, LIQUIDATION_THRESHOLD],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: VUNI_CORE,
        signature: "setInterestRateModel(address)",
        params: [newInterestRateModel],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: COMPTROLLER_CORE,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[VUNI_CORE], [2], false],
        dstChainId: LzChainId.unichainsepolia,
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip502;
