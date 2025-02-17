import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const CORE_COMPTROLLER = bscmainnet.UNITROLLER;

export const VTREASURY = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const XVS = "0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63";
export const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

export const VANGUARD_VANTAGE_TREASURY = "0xf645a387180F5F74b968305dF81d54EB328d21ca";
export const XVS_RECEIVER = "0xDF0F9AC301C9e7d35600C3d277e7076724c84497";

export const VANGUARD_VANTAGE_AMOUNT_USDT = parseUnits("98261", 18);
export const VANGUARD_VANTAGE_AMOUNT_WBNB = parseUnits("646.94", 18);
export const VANGUARD_VANTAGE_AMOUNT_XVS = parseUnits("22073", 18);
export const XVS_RECEIVER_AMOUNT = parseUnits("117335", 18);

export const vip454 = () => {
  const meta = {
    version: "v2",
    title: "VIP-454 Coverage for Vanguard/Stars Social Engineering Incident Lossage",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, VANGUARD_VANTAGE_AMOUNT_USDT, VANGUARD_VANTAGE_TREASURY],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [WBNB, VANGUARD_VANTAGE_AMOUNT_WBNB, VANGUARD_VANTAGE_TREASURY],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [XVS, VANGUARD_VANTAGE_AMOUNT_XVS, VANGUARD_VANTAGE_TREASURY],
      },
      {
        target: CORE_COMPTROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [XVS_RECEIVER, XVS_RECEIVER_AMOUNT],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip454;
