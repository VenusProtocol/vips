import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

const CHAINLINK_ORACLE = bscmainnet.CHAINLINK_ORACLE;

// SXP (Swipe) BEP20 on BNB Chain, 18 decimals.
export const SXP = "0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A";

// New direct price for SXP: 0.00046 USD, scaled to 1e18 (SXP has 18 decimals).
export const SXP_DIRECT_PRICE = parseUnits("0.00046", 18); // 460000000000000

const vip632 = () => {
  const meta = {
    version: "v2",
    title: "VIP-632 [BNB Chain] Set SXP Direct Price to 0.00046 USD",
    description: `#### Summary

This Critical VIP sets a fixed direct price of 0.00046 USD for the SXP market on the Venus Chainlink oracle, after Chainlink retired the SXP/USD price feed this week.

#### Description

SXP (Swipe) migrated and rebranded to Solar on a separate chain, and the SXP market on Venus BNB Chain has been paused for an extended period, holding only residual positions. Following the April 2026 delisting of Solar (SXP) from major venues, SXP liquidity has collapsed and its price has fallen to near zero. Chainlink has decided to retire the SXP/USD price feed, and switched it off this week. With the feed no longer reporting, the Venus oracle can no longer obtain a valid price for SXP, which can cause price reads to revert and block repayments and liquidations. This proposal sets a fixed direct price of 0.00046 USD on the Chainlink oracle, making it return a deterministic value for SXP independent of the retired feed. No other change is made and no risk parameters are modified.

#### Actions

This VIP performs the following action on BNB Chain:

1. **Set SXP direct price** — Calls setDirectPrice(${SXP}, ${SXP_DIRECT_PRICE.toString()}) on the Chainlink oracle (${CHAINLINK_ORACLE}), fixing the SXP price at 0.00046 USD (scaled to 1e18 for an 18-decimal asset).`,
    forDescription: "Execute the proposal",
    againstDescription: "Do not execute the proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: CHAINLINK_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [SXP, SXP_DIRECT_PRICE],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip632;
