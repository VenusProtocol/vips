import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const DEVIATION_SENTINEL = "0x9245d72712548707809D66848e63B8E2B169F3c1";
export const VETH_CORE = "0x162D005F0Fff510E54958Cfc5CF32A3180A84aab";
export const VWBNB_CORE = "0xd9E77847ec815E56ae2B9E69596C69b6972b0B1C";

const Action = {
  MINT: 0,
  BORROW: 2,
};

export const NEW_CF = "800000000000000000";
export const LT = "800000000000000000";

export const vip900TestnetAddendum2 = () => {
  const meta = {
    version: "v2",
    title: "VIP-900 Addendum 2: Unpause Mint and Update CF for vETH_Core and vWBNB_Core on BSC Testnet",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[VETH_CORE, VWBNB_CORE], [Action.MINT, Action.MINT], false],
      },

      {
        target: COMPTROLLER,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[VETH_CORE, VWBNB_CORE], [Action.BORROW, Action.BORROW], false],
      },

      {
        target: COMPTROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [VETH_CORE, NEW_CF, LT],
      },

      {
        target: COMPTROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [VWBNB_CORE, NEW_CF, LT],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip900TestnetAddendum2;
