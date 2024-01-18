import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

export const VTREASURY = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";
export const PLP = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";

export const BTC = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";

export const BTC_AMOUNT = parseUnits("0.8837559297", 18);
export const ETH_AMOUNT = parseUnits("74.547052111", 18);
export const USDC_AMOUNT = parseUnits("224932.52", 18);
export const USDT_AMOUNT = parseUnits("300300.30", 18);

export const BTC_DISTRIBUTION_SPEED = "340955219791";
export const ETH_DISTRIBUTION_SPEED = "28760436771219";
export const USDC_DISTRIBUTION_SPEED = "86779521604938271";
export const USDT_DISTRIBUTION_SPEED = "115856597222222222";

export const vip238 = () => {
  const meta = {
    version: "v2",
    title: "VIP-XXX Prime Adjustment",
    description: `If passed, this VIP will follow the recommendations from the [Prime Adjustment Proposal](https://community.venus.io/t/prime-adjustment-proposal/4054) and transfer funds from the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9) to the [PrimeLiquidityProvider](https://bscscan.com/address/0x23c4F844ffDdC6161174eB32c770D4D8C07833F2) contract. These funds will be distributed among the Prime holders for the next 3 months.

The token amounts have been adjusted based on token prices for January 18 2024, block number: 35354264

- BTC: 0.8837559297
- ETH: 74.547052111
- USDC: 224,932.52
- USDT: 300,300.30`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [BTC, BTC_AMOUNT, PLP],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [ETH, ETH_AMOUNT, PLP],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, USDC_AMOUNT, PLP],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, USDT_AMOUNT, PLP],
      },
      {
        target: PLP,
        signature: "setTokensDistributionSpeed(address[],uint256[])",
        params: [
          [ETH, BTC, USDC, USDT],
          [ETH_DISTRIBUTION_SPEED, BTC_DISTRIBUTION_SPEED, USDC_DISTRIBUTION_SPEED, USDT_DISTRIBUTION_SPEED],
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
