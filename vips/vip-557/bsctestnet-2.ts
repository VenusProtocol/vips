import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { CORE_MARKETS } from "./bsctestnet";

export const vip557Testnet2 = () => {
  const meta = {
    version: "v2",
    title: "VIP-557 flash loan fee update",
    description: "Update flash loan fee and protocol share for all core markets on BSC Testnet.",
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };
  return makeProposal(
    [
      // Set flash loan fee to 0.3% and protocol share to 30%
      ...CORE_MARKETS.map(vToken => ({
        target: vToken.address,
        signature: "setFlashLoanFeeMantissa(uint256,uint256)",
        params: [parseUnits("0.003", 18), parseUnits("0.3", 18)], // 0.3% fee, 30% protocol share
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip557Testnet2;
