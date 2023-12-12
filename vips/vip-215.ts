import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
const DESTINATION_ADDRESS = "0x6657911F7411765979Da0794840D671Be55bA273";
const BUSD_AMOUNT = "125281198522370512074148";

export const vip215 = () => {
  const meta = {
    version: "v2",
    title: "VIP-215 withdraw 100% of the BUSD funds from the Venus Treasury",
    description: `#### Summary

If passed this VIP will perform the following actions:

#### Details
`,

    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this proposal",
  };
  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [BUSD, BUSD_AMOUNT, DESTINATION_ADDRESS],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
