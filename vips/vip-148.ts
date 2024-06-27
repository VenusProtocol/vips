import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const USDC = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d";
const USDT = "0x55d398326f99059ff775485246999027b3197955";
const PECKSHIELD_RECEIVER = "0x24ee02a67c64f66ca5bcf9352f6701b46dcedff1";
const CERTIK_RECEIVER = "0x4cf605b238e9c3c72d0faed64d12426e4a54ee12";
const FAIRYPROOF_RECEIVER = "0x083a394785f20b244e0697c08f0e01874fde801f";
const QUANTSTAMP_RECEIVER = "0xf6323183A6537CAC30b95f4fAd2a236e0CbED2E2";

export const vip148 = () => {
  const meta = {
    version: "v2",
    title: "VIP-148 Payments to auditors",
    description: `
    If passed this VIP will transfer following amounts:
      Quantstamp	Liquidator	July/12th - July/24th	Done	$10,000
      Quantstamp	PSM	July/26th - July/28th	Not started	$10,000
      Quantstamp	Diamond Comptroller	August/7th - August/16th	Not started	$30,000
      Peckshield	Automatic allocation of income	July/28th - August/7th	Not started	$18,000
      Peckshield	Venus Prime	August/9th - August/17th	Not started	$16,800
      Fairyproof	Venus Prime	July/28th - August/4th	Not started	$12,500
      Certik	Retainer program	August 2023	-	$19,000`,
    forDescription: "I agree that Venus Protocol should proceed with the payments",
    againstDescription: "I do not think that Venus Protocol should proceed with the payments",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the payments or not",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, parseUnits("50000", 18), QUANTSTAMP_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, parseUnits("34800", 18), PECKSHIELD_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("12500", 18), FAIRYPROOF_RECEIVER],
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
