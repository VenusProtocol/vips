import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

const CHAINLINK_ORACLE = bscmainnet.CHAINLINK_ORACLE; // 0x1B2103441A0A108daD8848D8F5d790e4D402921F

// Deprecated Isolated-Pool underlyings whose Chainlink feeds are dead (all 18 decimals, verified on-chain).
export const ALPACA = "0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F"; // vALPACA_DeFi underlying
export const BSW = "0x965F527D9159dCe6288a2219DB51fc6Eef120dD1"; // vBSW_DeFi underlying
export const WIN = "0xaeF0d72a118ce24feE3cD1d43d383897D05B4e99"; // vWIN_Tron underlying

// Direct prices, scaled to 1e18 (each underlying has 18 decimals), from the VDB-51 remediation doc.
export const ALPACA_DIRECT_PRICE = parseUnits("0.00061993", 18); // 619930000000000
export const BSW_DIRECT_PRICE = parseUnits("0.00030540", 18); // 305400000000000
export const WIN_DIRECT_PRICE = parseUnits("0.00003034", 18); // 30340000000000

export const vip655 = () => {
  const meta = {
    version: "v2",
    title: "VIP-655 [BNB Chain] Set direct prices on ALPACA, BSW and WIN",
    description: `#### Summary

This proposal sets fixed direct prices on the Venus Chainlink oracle for three deprecated BNB Chain
Isolated-Pool markets whose underlying Chainlink feeds are no longer reporting: ALPACA and BSW (DeFi
pool) and WIN (Tron pool). It is the oracle remediation step following the opBNB/Optimism/Unichain +
Isolated-Pools deprecation executed in VIP-634 / VIP-635, and does not modify any risk parameters.

#### Description

The deprecation of these markets set their collateral factor, liquidation threshold, supply cap and
borrow cap to 0 (100% reserve factor, push-out interest-rate model). With the CFs at 0 these prices
grant **no** new borrowing power — restoring a price only makes the residual balances valuable and,
crucially, **computable** again.

The underlying Chainlink feeds for ALPACA, BSW and WIN have been retired, so
\`ResilientOracle.getUnderlyingPrice\` currently reverts for vALPACA, vBSW and vWIN. Because these
tokens sit in the entered-markets set of accounts in the DeFi and Tron Isolated Pools, that revert
propagates into full-account liquidity reads and blocks the pending account heals. In particular it
blocks the \`healAccount\` of the DeFi-pool bad-debt wallet
\`0x3eb982d680eb56b148fb20347711aac8f2283099\` (≈ 4,897 USDT of unrepayable borrow against
now-worthless ALPACA collateral), and it prevents the ≈ $4.2K of live third-party WIN supply from
being valued.

Each affected market prices from the Chainlink oracle as its only (MAIN) source, with no PIVOT or
FALLBACK configured, so setting a direct price on the Chainlink oracle is sufficient to make
\`getUnderlyingPrice\` return a deterministic value again.

The Normal Timelock already holds \`setDirectPrice(address,uint256)\` on the Chainlink oracle
(verified on-chain), so no Access Control Manager grant is required.

#### Actions

This VIP performs the following actions on the Venus Chainlink oracle
(${CHAINLINK_ORACLE}) on BNB Chain:

1. **Set ALPACA direct price** — \`setDirectPrice(${ALPACA}, ${ALPACA_DIRECT_PRICE.toString()})\`,
   fixing ALPACA at 0.00061993 USD (scaled to 1e18 for an 18-decimal asset).
2. **Set BSW direct price** — \`setDirectPrice(${BSW}, ${BSW_DIRECT_PRICE.toString()})\`,
   fixing BSW at 0.00030540 USD (scaled to 1e18 for an 18-decimal asset).
3. **Set WIN direct price** — \`setDirectPrice(${WIN}, ${WIN_DIRECT_PRICE.toString()})\`,
   fixing WIN at 0.00003034 USD (scaled to 1e18 for an 18-decimal asset).

#### Voting options

- **For** — Execute this proposal
- **Against** — Do not execute this proposal
- **Abstain** — Indifferent to execution`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: CHAINLINK_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [ALPACA, ALPACA_DIRECT_PRICE],
      },
      {
        target: CHAINLINK_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [BSW, BSW_DIRECT_PRICE],
      },
      {
        target: CHAINLINK_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [WIN, WIN_DIRECT_PRICE],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip655;
