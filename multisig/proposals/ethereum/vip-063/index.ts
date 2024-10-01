import { makeProposal } from "../../../../src/utils";
import {
  CURRENT_WETH_LT,
  INTEREST_RATE_MODEL_base0bps_slope300bps_jump8000bps_kink9000bps,
  LIQUID_STAKED_ETH_COMPTROLLER,
  NINETY_PERCENT_CF,
  vwETH,
} from "../../../../vips/vip-377/bscmainnet";

export const vip063 = () => {
  return makeProposal([
    {
      target: LIQUID_STAKED_ETH_COMPTROLLER,
      signature: "setCollateralFactor(address,uint256,uint256)",
      params: [vwETH, NINETY_PERCENT_CF, CURRENT_WETH_LT],
    },
    {
      target: vwETH,
      signature: "setInterestRateModel(address)",
      params: [INTEREST_RATE_MODEL_base0bps_slope300bps_jump8000bps_kink9000bps],
    },
  ]);
};

export default vip063;
