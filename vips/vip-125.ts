import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const vBUSD = "0x95c78222b3d6e262426483d42cfa53685a67ab9d";
const OLD_vTRX = "0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93";
const vSXP = "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0";
const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";

const BUSD_NEW_BORROW_CAP = parseUnits("80000000", 18); // 80 M

export const vip125 = () => {
  const meta = {
    version: "v2",
    title: "VIP-125 Borrow Caps Update",
    description: `

    The Findecci team has been diligently monitoring the liquidity of BUSD within the PancakeSwap V2 decentralized exchange (DEX) following the temporary pause in BUSD minting. 
    We have noticed a concerning trend of shrinking BUSD liquidity, raising potential risks for the Venus protocol. In this proposal, 
    we aim to address this issue by recommending a reduction in the borrow cap for BUSD on the Venus protocol from 130M to 80M. 
    This strategic adjustment will assist in safeguarding the protocol against unforeseen scenarios and mitigating potential risks.
    Moreover, it has come to our attention that the borrow caps for vSXP and vTRXOLD were inadvertently set to 0, which implies an infinite borrow limit. 
    Such an unintended behavior poses potential risks to the protocol's stability. 
    In this amendment, we propose setting the borrow caps of vSXP and vTRXOLD to 1, aligning them with a more appropriate and controlled limit.`,

    forDescription: "I agree that Venus Protocol should proceed with the Borrow Cap Updates",
    againstDescription: "I do not think that Venus Protocol should proceed with the Borrow Cap Updates",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Borrow Cap Updates or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [
          [OLD_vTRX, vSXP, vBUSD],
          [1, 1, BUSD_NEW_BORROW_CAP],
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
