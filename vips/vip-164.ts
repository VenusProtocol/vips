import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const USDC = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d";
export const USDT = "0x55d398326f99059ff775485246999027b3197955";
export const PECKSHIELD_RECEIVER = "0x24ee02a67c64f66ca5bcf9352f6701b46dcedff1";
export const CERTIK_RECEIVER = "0x4cf605b238e9c3c72d0faed64d12426e4a54ee12";
export const FAIRYPROOF_RECEIVER = "0x060a08fff78aedba4eef712533a324272bf68119";
export const QUANTSTAMP_RECEIVER = "0xf6323183A6537CAC30b95f4fAd2a236e0CbED2E2";

export const vip164 = () => {
  const meta = {
    version: "v2",
    title: "VIP-164 Security Audits Payments",
    description: `
    If passed this VIP will perform the following actions:
      ● Transfer 45,000 USDC to Quantstamp for the Automatic Income Allocation audit
      ● Transfer 30,000 USDC to Quantstamp for the Venus Prime audit
      ● Transfer 10,000 USDT to Fairyproof for the Token Converter audit
      ● Transfer 12,000 USDC to Peckshield for the Token Converter audit
      ● Transfer 19,000 USDT to Certik for the retainer program`,
    forDescription: "I agree that Venus Protocol should proceed with the payments",
    againstDescription: "I do not think that Venus Protocol should proceed with the payments",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the payments or not",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, parseUnits("45000", 18), QUANTSTAMP_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, parseUnits("30000", 18), QUANTSTAMP_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("10000", 18), FAIRYPROOF_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, parseUnits("12000", 18), PECKSHIELD_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("19000", 18), CERTIK_RECEIVER],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
