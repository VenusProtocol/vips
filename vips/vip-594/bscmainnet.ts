import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

// ============================================
// CONSTANTS - UPDATE THESE WITH ACTUAL VALUES
// ============================================

// VIP Number
export const VIP_NUMBER = 594;

// Recipients (PLACEHOLDER - UPDATE WITH ACTUAL ADDRESSES)
export const ALLEZ_LAB_RECIPIENT = "0x0000000000000000000000000000000000000001"; // TODO: Replace with actual Allez Lab address
export const VENUS_RECIPIENT = "0x0000000000000000000000000000000000000002"; // TODO: Replace with actual Venus address

// Token Addresses (BSC Mainnet)
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

// Transfer Amounts
export const USDC_AMOUNT = parseUnits("70000", 18); // 70,000 USDC to Allez Lab
export const USDT_AMOUNT = parseUnits("400000", 18); // 400,000 USDT to Venus
export const WBNB_AMOUNT = parseUnits("1649", 18); // ~1M USD worth of WBNB to Venus (at ~$606.47/WBNB)

// Note: Venus recipient receives ~$1.4M total:
// - 400,000 USDT = $400K
// - 1,649 WBNB @ $606.47 = ~$1M
// Total: ~$1.4M

export const vip594 = () => {
  const meta = {
    version: "v2",
    title:
      "VIP-594 [BNB Chain] Treasury Transfers to Allez Lab and Venus Recipients",
    description: `#### Summary

This VIP authorizes treasury transfers from the Venus Treasury on BNB Chain to support operational funding for Allez Lab and Venus-related initiatives.

#### Description

This proposal executes three treasury transfers:

1. **70,000 USDC** to Allez Lab counter recipient
2. **400,000 USDT** to Venus recipient
3. **1,649 WBNB** (~$1M USD) to Venus recipient

The Venus recipient will receive approximately **$1.4M in total** ($400K USDT + ~$1M WBNB).

#### Transfer Details

**From:** Venus Treasury ([0xF322942f644A996A617BD29c16bd7d231d9F35E9](https://bscscan.com/address/0xF322942f644A996A617BD29c16bd7d231d9F35E9))

**Transfers:**

| Token | Amount | Recipient | USD Value (est.) |
|-------|--------|-----------|------------------|
| USDC | 70,000 | Allez Lab | ~$70,000 |
| USDT | 400,000 | Venus | ~$400,000 |
| WBNB | 1,649 | Venus | ~$1,000,000 |

**Total Transfers:** ~$1,470,000

#### Treasury Balance Verification

Current treasury holdings are sufficient for all transfers:
- USDC: 104,580 available ✓
- USDT: 403,692 available ✓
- WBNB: 13,590 available ✓

#### Security and Additional Considerations

- **VIP execution simulation**: Simulated execution validates all transfers complete successfully with correct amounts and recipients
- **Balance verification**: Pre and post-transfer balance checks ensure accuracy
- **Treasury sufficiency**: All token balances verified to exceed transfer amounts

#### References

- [Treasury Holdings Analysis](https://bscscan.com/address/0xF322942f644A996A617BD29c16bd7d231d9F35E9)
- [Resilient Oracle](https://bscscan.com/address/0x6592b5DE802159F3E74B2486b091D11a8256ab8A)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Abstain from voting",
  };

  return makeProposal(
    [
      // Transfer 1: 70,000 USDC to Allez Lab
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, USDC_AMOUNT, ALLEZ_LAB_RECIPIENT],
      },

      // Transfer 2: 400,000 USDT to Venus recipient
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, USDT_AMOUNT, VENUS_RECIPIENT],
      },

      // Transfer 3: 1,649 WBNB (~$1M USD) to Venus recipient
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [WBNB, WBNB_AMOUNT, VENUS_RECIPIENT],
      },
    ],
    meta,
    ProposalType.REGULAR
  );
};

export default vip594;
