import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";

export const CERTIK_RECEIVER = "0x4cf605b238e9c3c72d0faed64d12426e4a54ee12";
export const QUANTSTAMP_RECEIVER = "0xd88139f832126b465a0d7A76be887912dc367016";
export const FAIRYPROOF_RECEIVER = "0x060a08fff78aedba4eef712533a324272bf68119";
export const CANTINA_RECEIVER = "0x3Dcb7CFbB431A11CAbb6f7F2296E2354f488Efc2";

export const CERTIK_USDT_AMOUNT = parseUnits("19000", 18);
export const QUANTSTAMP_USDC_AMOUNT = parseUnits("32500", 18);
export const FAIRYPROOF_USDT_AMOUNT = parseUnits("6000", 18);
export const CANTINA_USDC_AMOUNT = parseUnits("85000", 18);

export const vip278 = () => {
  const meta = {
    version: "v2",
    title: "VIP-278",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, CERTIK_USDT_AMOUNT, CERTIK_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, QUANTSTAMP_USDC_AMOUNT, QUANTSTAMP_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, FAIRYPROOF_USDT_AMOUNT, FAIRYPROOF_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, CANTINA_USDC_AMOUNT, CANTINA_RECEIVER],
      }
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip278;
