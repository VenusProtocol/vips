import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;

export const vETH = "0x162D005F0Fff510E54958Cfc5CF32A3180A84aab";
export const vUSDT = "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A";

export const vETH_NEW_CF = parseUnits("0.79", 18);
export const vUSDT_NEW_CF = parseUnits("0.8", 18);

// Both markets keep their current Liquidation Threshold of 80%; the E-mode
// setCollateralFactor overload takes the LT as a parameter, so it is passed
// through unchanged so that only the Collateral Factor moves.
export const CURRENT_LT = parseUnits("0.8", 18);

export const vip664 = () => {
  const meta = {
    version: "v2",
    title: "VIP-664 [BNB Chain Testnet] Update Core Pool Collateral Factors (vETH, vUSDT)",
    description: `#### Summary

If passed, this VIP will update the **Collateral Factor (CF)** of two markets in the Core Pool on BNB Chain Testnet, while keeping their **Liquidation Threshold (LT)** unchanged at **80%**:

- **vETH** — CF from **0%** to **79%**
- **vUSDT** — CF from **75%** to **80%**

#### Motivation

Raising the Collateral Factor increases the borrowing power that suppliers of these assets receive. Setting the vETH CF above 0 re-enables using vETH as collateral to open new borrows, and raising the vUSDT CF gives vUSDT suppliers additional borrowing power. Keeping each market's Liquidation Threshold unchanged ensures existing positions are not affected by this change.

#### Proposed Changes

- **vETH Collateral Factor** — Current: 0%, Proposed: 79%
- **vETH Liquidation Threshold** — Current: 80%, Proposed: 80% (unchanged)
- **vUSDT Collateral Factor** — Current: 75%, Proposed: 80%
- **vUSDT Liquidation Threshold** — Current: 80%, Proposed: 80% (unchanged)

#### Conclusion

This update increases borrowing power for vETH and vUSDT suppliers while preserving the current liquidation safety parameters of both markets.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: bsctestnet.UNITROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vETH, vETH_NEW_CF, CURRENT_LT],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vUSDT, vUSDT_NEW_CF, CURRENT_LT],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip664;
