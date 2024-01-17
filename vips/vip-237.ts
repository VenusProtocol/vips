import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const USDT = "0x55d398326f99059ff775485246999027b3197955";
const CERTIK_RECEIVER = "0x4cf605b238e9c3c72d0faed64d12426e4a54ee12";
const CHAOS_LABS_RECEIVER = "0xfb1912af5b9d3fb678f801bf764e98f1c217ef35";

export const vip237 = () => {
  const meta = {
    version: "v2",
    title: "VIP-237 Certik Audit Payment",
    description: `
    If passed this VIP will perform the following actions:
      ● Transfer 19,000 USDT to Certik for the audits
    `,
    forDescription: "I agree that Venus Protocol should proceed with the payments",
    againstDescription: "I do not think that Venus Protocol should proceed with the payments",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the payments or not",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("19000", 18), CERTIK_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("130000", 18), CHAOS_LABS_RECEIVER],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
