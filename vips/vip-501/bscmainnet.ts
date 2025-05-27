import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const VTREASURY = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const USDT = "0x55d398326f99059ff775485246999027b3197955";

export const CERTIK = "0x4cf605b238e9c3c72d0faed64d12426e4a54ee12";
export const QUANTSTAMP = "0xd88139f832126b465a0d7A76be887912dc367016";
export const FAIRYPROOF = "0x060a08fff78aedba4eef712533a324272bf68119";

export const CERTIK_AMOUNT = parseUnits("35000", 18);
export const QUANTSTAMP_AMOUNT = parseUnits("32500", 18);
export const FAIRYPROOF_AMOUNT = parseUnits("5000", 18);

export const vip501 = () => {
  const meta = {
    version: "v2",
    title: "VIP-501 Payments issuance for audits and other expenses",
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
        params: [USDT, CERTIK_AMOUNT, CERTIK],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, QUANTSTAMP_AMOUNT, QUANTSTAMP],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, FAIRYPROOF_AMOUNT, FAIRYPROOF],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip501;
