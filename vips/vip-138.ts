import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const USDC = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d";
const USDT = "0x55d398326f99059ff775485246999027b3197955";
const PECKSHIELD_RECEIVER = "0x24ee02a67c64f66ca5bcf9352f6701b46dcedff1";
const CERTIK_RECEIVER = "0x4cf605b238e9c3c72d0faed64d12426e4a54ee12";
const FAIRYPROOF_RECEIVER = "0x083a394785f20b244e0697c08f0e01874fde801f";
const OZ_RECEIVER = "0x5e101FCa7a2BAB7877972bc85A1a07A2606A31B9";

export const vip138 = () => {
  const meta = {
    version: "v2",
    title: "VIP-138 Repay BTC debt on behalf",
    description: `
    If passed this VIP will perform the following actions:
      ● Transfer 18,000 USDC to Peckshield for the Diamond Comptroller audit
      ● Transfer 6,000 USDC to Peckshield for the Oracle upgrade audit
      ● Transfer 19,000 USDT to Certik for the retainer program
      ● Transfer 20,000 USDT to Fairyproof for the Automatic income allocation audit
      ● Transfer 277,200 USDC to OpenZeppelin for the security partnership`,
    forDescription: "I agree that Venus Protocol should proceed with the payments",
    againstDescription: "I do not think that Venus Protocol should proceed with the payments",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the payments or not",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, parseUnits("18000", 18), PECKSHIELD_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, parseUnits("6000", 18), PECKSHIELD_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("19000", 18), CERTIK_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("20000", 18), FAIRYPROOF_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, parseUnits("277200", 18), OZ_RECEIVER],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
