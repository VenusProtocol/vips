import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const RISK_FUND = "0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42";
export const BSCMAINNET_USDT = "0x55d398326f99059ff775485246999027b3197955";
export const BSCMAINNET_CORE_COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const VANGUARD_TREASURY = "0xf645a387180F5F74b968305dF81d54EB328d21ca";
export const USDT_TOKENS_AMOUNT = parseUnits("200000",18);

export const vip474 = () => {
  const meta = {
    version: "v2",
    title: "VIP-474",
    description: "Withdraw 200,000 USDT from the Risk Fund contract on BNB Chain, to the Vanguard Treasury contract",
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: RISK_FUND,
        signature: "sweepTokenFromPool(address,address,address,uint256)",
        params: [ BSCMAINNET_USDT, BSCMAINNET_CORE_COMPTROLLER, VANGUARD_TREASURY, USDT_TOKENS_AMOUNT],
      }
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip474;