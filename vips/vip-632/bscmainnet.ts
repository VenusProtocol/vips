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
    title: "VIP-632 Set SXP direct price to 0.00046 USD",
    description: `#### Summary

If passed, this VIP will set the direct price of SXP to 0.00046 USD on the Chainlink oracle.

#### Description

This VIP calls \`setDirectPrice(${SXP}, ${SXP_DIRECT_PRICE.toString()})\` on the Chainlink oracle (\`${CHAINLINK_ORACLE}\`), fixing the SXP price at 0.00046 USD (scaled to 1e18 for an 18-decimal asset).`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
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
