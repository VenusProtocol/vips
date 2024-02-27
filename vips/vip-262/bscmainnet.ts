import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
export const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
export const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
export const vETH = "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8";
export const USDC_AMOUNT = parseUnits("7619561", 18);
export const USDT_AMOUNT = parseUnits("440000", 18);
export const ETH_AMOUNT = parseUnits("126", 18);

export const vip262 = () => {
  const meta = {
    version: "v2",
    title: "VIP-262: Treasury Management Proposal",
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
        params: [USDC, USDC_AMOUNT, NORMAL_TIMELOCK],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, USDT_AMOUNT, NORMAL_TIMELOCK],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [ETH, ETH_AMOUNT, NORMAL_TIMELOCK],
      },
      {
        target: USDC,
        signature: "approve(address,uint256)",
        params: [vUSDC, USDC_AMOUNT],
      },
      {
        target: USDT,
        signature: "approve(address,uint256)",
        params: [vUSDT, USDT_AMOUNT],
      },
      {
        target: ETH,
        signature: "approve(address,uint256)",
        params: [vETH, ETH_AMOUNT],
      },
      {
        target: vUSDC,
        signature: "mintBehalf(address,uint256)",
        params: [TREASURY, USDC_AMOUNT],
      },
      {
        target: vUSDT,
        signature: "mintBehalf(address,uint256)",
        params: [TREASURY, USDT_AMOUNT],
      },
      {
        target: vETH,
        signature: "mintBehalf(address,uint256)",
        params: [TREASURY, ETH_AMOUNT],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip262;
