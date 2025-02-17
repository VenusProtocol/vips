import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const VTREASURY = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";

export const VANGUARD_VANTAGE_TREASURY = "0xf645a387180F5F74b968305dF81d54EB328d21ca";
export const VENUS_STARS_TREASURY = "0xd7ca847Aa074b28A1DfeFfd3B2C3f9780cA96e1D";

export const VANGUARD_VANTAGE_AMOUNT_USDT = parseUnits("393008", 18);
export const VENUS_STARS_AMOUNT_USDT = parseUnits("285614", 18);

export const vip453 = () => {
  const meta = {
    version: "v2",
    title: "VIP-453 Coverage for Vanguard/Stars Social Engineering Incident Lossage",
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
        params: [USDT, VANGUARD_VANTAGE_AMOUNT_USDT, VANGUARD_VANTAGE_TREASURY],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, VENUS_STARS_AMOUNT_USDT, VENUS_STARS_TREASURY],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip453;
