import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const COMPTROLLER_CORE = "0xe22af1e6b78318e1Fe1053Edbd7209b8Fc62c4Fe";
export const UNI = "0x8f187aA05619a017077f5308904739877ce9eA21";
export const VUNI_CORE = "0x67716D6Bf76170Af816F5735e14c4d44D0B05eD2";
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
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: COMPTROLLER_CORE,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[VUNI_CORE], [parseUnits("2000000", 18)]],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: COMPTROLLER_CORE,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [VUNI_CORE, COLLATERAL_FACTOR, LIQUIDATION_THRESHOLD],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: VUNI_CORE,
        signature: "setReserveFactor(uint256)",
        params: [RESERVE_FACTOR],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: VUNI_CORE,
        signature: "setInterestRateModel(address)",
        params: [newInterestRateModel],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: COMPTROLLER_CORE,
        signature: "setLiquidationIncentive(uint256)",
        params: [LIQUIDATION_INCENTIVE],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: COMPTROLLER_CORE,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[VUNI_CORE], [2], false],
        dstChainId: LzChainId.unichainmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip502;
