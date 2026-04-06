import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;

export const vBNB = "0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c";
export const NEW_CF = parseUnits("0", 18);
export const CURRENT_LT = parseUnits("0.8", 18); // unchanged

export const vip663 = () => {
  const meta = {
    version: "v2",
    title: "VIP-663 [BNB Chain Testnet] Set vBNB Collateral Factor to 0",
    description: `#### Summary

If passed, this VIP will set the **Collateral Factor (CF)** of the **vBNB** market in the Core Pool on BNB Chain Testnet to **0**, while keeping the **Liquidation Threshold (LT)** unchanged at **80%**.

#### Motivation

Setting CF to 0 disables the ability to open new borrows backed by BNB as collateral. Keeping LT at its current value ensures existing borrowers using BNB as collateral remain in their current health state and are not forced into liquidation by this change.

#### Proposed Changes

- **vBNB Collateral Factor** — Current: 80%, Proposed: 0%
- **vBNB Liquidation Threshold** — Current: 80%, Proposed: 80% (unchanged)

#### Conclusion

This update prevents new borrows from being opened against BNB collateral while preserving the safety of existing positions.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: bsctestnet.UNITROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vBNB, NEW_CF, CURRENT_LT],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip663;
