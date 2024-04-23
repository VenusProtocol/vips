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
export const USDC_AMOUNT = parseUnits("7587064.24", 18);
export const USDT_AMOUNT = parseUnits("377487.92", 18);
export const ETH_AMOUNT = parseUnits("126.6523", 18);

export const vip262 = () => {
  const meta = {
    version: "v2",
    title: "VIP-262 Treasury Management",
    description: `#### Summary

Following the community proposal for [Treasury Managment](https://community.venus.io/t/treasury-management-proposal/4134), and the [associated snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0xb58cdfa3dba5459e9279a06065033c327f239afb834b27e06c5474954e51b30d), this VIP, If approved, will supply 7,587,064.24 USDC, 377,487.92 USDT and 126.6523 ETH from the vTreausry to the Venus market.

These actions are projected to generate approximately $754,083 annual revenues considering market prices and conditions for Feb 27, 2024.

#### Description

This proposal aims to manage USDC, USDT, and ETH by taking advantage of the current market supply APYs in Venus. Due to some expected pending payments that will be proposed in the following VIP, the total amount supplied will be reduced by the following amounts:

- 32,500 USDC for Quantstamp for the retainer program.
- 63,500 USDT for Certik for the retainer program and community wallet refund.

More details will be provided in the following VIP, and funds will be used only if the VIP is approved.

With this, the total supplied amounts are as follows:

- 7,587,064.24 USDC
- 377,487.92 USDT
- 126.6523 ETH`,
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
      {
        target: USDC,
        signature: "approve(address,uint256)",
        params: [vUSDC, 0],
      },
      {
        target: USDT,
        signature: "approve(address,uint256)",
        params: [vUSDT, 0],
      },
      {
        target: ETH,
        signature: "approve(address,uint256)",
        params: [vETH, 0],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip262;
