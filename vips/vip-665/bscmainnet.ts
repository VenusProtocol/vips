import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

// Recipient (Finance) — same "Venus" wallet used in VIP-594
export const RECIPIENT = "0x5e7bb1f600e42bc227755527895a282f782555ec";

// Token addresses (BSC Mainnet)
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"; // BSC-bridged USDC, 18 decimals
export const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8"; // vUSDC Core Pool, 8 decimals
export const TOKEN_REDEEMER = "0xC53ffda840B51068C64b2E052a5715043f634bcd";

// Amounts
// Total to deliver to the finance recipient.
export const USDC_TOTAL = parseUnits("3100000", 18); // 3,100,000 USDC

// Source order: drain the treasury's idle (liquid) USDC first, then top up the shortfall from the
// Venus Core vUSDC supply position via the Token Redeemer.
// USDC_FROM_BALANCE is pinned to the treasury's liquid USDC balance (read on-chain). The treasury's
// USDC balance only ever decreases through a governance withdrawal (none is pending) and grows with
// accrued income, so withdrawing exactly this amount is always covered at execution time.
export const USDC_FROM_BALANCE = parseUnits("85988.501078736878394339", 18); // treasury liquid USDC
export const USDC_SHORTFALL = USDC_TOTAL.sub(USDC_FROM_BALANCE); // redeemed from vUSDC -> recipient

// vUSDC to move to the Token Redeemer to cover the shortfall.
// Exchange rate ~0.02655 USDC/vUSDC; vUSDC needed ~= USDC_SHORTFALL / rate. Over-provisioned by ~0.5%
// so redeemUnderlying(USDC_SHORTFALL) always succeeds. The rate only rises with accrued interest, so
// less vUSDC is required at execution; any leftover vUSDC (and stray underlying) is returned to the
// treasury via the receiver parameter.
export const VUSDC_AMOUNT = parseUnits("114094248.91060328", 8);

export const vip665 = () => {
  const meta = {
    version: "v2",
    title: "VIP-665 [BNB Chain] Withdraw 3.1M USDC from Treasury for Finance",
    description: `#### Summary

This proposal withdraws **3,100,000 USDC** from the Venus Treasury and transfers it to the finance recipient wallet ([0x5e7bb1f600e42bc227755527895a282f782555ec](https://bscscan.com/address/0x5e7bb1f600e42bc227755527895a282f782555ec)).

The Treasury's idle (liquid) USDC balance is far below 3.1M, so the request is fulfilled by first withdrawing the liquid USDC balance and then redeeming the remaining shortfall from the Treasury's Venus **Core-pool vUSDC** supply position via the **Token Redeemer**.

#### Description

The finance team requested a withdrawal of 3.1M USDC from the treasury. Because only a small portion of the treasury's USDC is held as an idle (liquid) balance, the shortfall is sourced from the treasury's earning vUSDC (Core pool) supply position — draining the non-earning liquid balance first and redeeming only the minimum needed from the supply position.

This VIP executes the following operations (all executed by the Normal Timelock, which owns both the Treasury and the Token Redeemer):

1. **Withdraw liquid USDC → recipient.** Transfer the treasury's liquid USDC balance (~85,988.50 USDC) directly to the finance recipient.
2. **Withdraw vUSDC → Token Redeemer.** Move ~114.09M vUSDC (~$3.03M, over-provisioned by ~0.5%) from the treasury to the Token Redeemer.
3. **Redeem the shortfall → recipient.** The Token Redeemer redeems exactly the shortfall (3,100,000 − liquid balance ≈ 3,014,011.50 USDC) and sends it to the finance recipient; any leftover vUSDC (and stray underlying) is returned to the treasury.

**Deterministic total:** the amount withdrawn from the liquid balance plus the amount redeemed from the supply position always equals exactly **3,100,000 USDC**, so the recipient receives exactly 3.1M USDC regardless of exchange-rate drift between authoring and execution.

#### Transfer Details

**From:** Venus Treasury ([0xF322942f644A996A617BD29c16bd7d231d9F35E9](https://bscscan.com/address/0xF322942f644A996A617BD29c16bd7d231d9F35E9))

**To:** Finance recipient ([0x5e7bb1f600e42bc227755527895a282f782555ec](https://bscscan.com/address/0x5e7bb1f600e42bc227755527895a282f782555ec))

**Operations:**

**Step 1:** Withdraw from treasury — ~85,988.50 USDC → recipient

**Step 2:** Withdraw from treasury — ~114.09M vUSDC → Token Redeemer

**Step 3:** Redeem vUSDC to USDC — ~3,014,011.50 USDC → recipient (leftover vUSDC/dust → treasury)

#### Technical Implementation

This VIP uses the **Token Redeemer** ([0xC53ffda840B51068C64b2E052a5715043f634bcd](https://bscscan.com/address/0xC53ffda840B51068C64b2E052a5715043f634bcd)) to convert vUSDC to USDC:

1. Withdraw the treasury's liquid USDC balance to the recipient.
2. Withdraw ~114.09M vUSDC from the treasury to the Token Redeemer.
3. Call \`redeemUnderlyingAndTransfer\`: redeems exactly the USDC shortfall, sends it to the recipient; any remaining vUSDC and stray underlying return to the treasury.

**vUSDC Exchange Rate:** ~0.02655 USDC per vUSDC (only increases over time via interest accrual), so the ~114.09M vUSDC provisioned will always cover the ~3.01M USDC shortfall at execution time.

#### Security and Additional Considerations

- **VIP execution simulation**: Simulated execution validates all transfers complete successfully with the correct amounts and recipients.
- **Balance verification**: Pre and post-transfer balance checks confirm the recipient nets exactly 3,100,000 USDC and the Token Redeemer is left with no residual USDC or vUSDC.
- **Deterministic amount**: \`USDC_FROM_BALANCE + USDC_SHORTFALL = 3,100,000 USDC\` by construction, so the total delivered is exact.

#### References

- [Treasury Contract](https://bscscan.com/address/0xF322942f644A996A617BD29c16bd7d231d9F35E9)
- [Token Redeemer Contract](https://bscscan.com/address/0xC53ffda840B51068C64b2E052a5715043f634bcd)
- [VIP-594 (Reference Implementation)](https://github.com/VenusProtocol/vips/blob/main/vips/vip-594/bscmainnet.ts)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Abstain from voting",
  };

  return makeProposal(
    [
      // Step 1: Withdraw the treasury's liquid USDC balance directly to the finance recipient.
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, USDC_FROM_BALANCE, RECIPIENT],
      },

      // Step 2: Withdraw vUSDC (over-provisioned) from the treasury to the Token Redeemer.
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [vUSDC, VUSDC_AMOUNT, TOKEN_REDEEMER],
      },

      // Step 3: Redeem exactly the USDC shortfall from vUSDC, send it to the recipient.
      // Any leftover vUSDC (and stray underlying) is returned to the treasury via the receiver param.
      {
        target: TOKEN_REDEEMER,
        signature: "redeemUnderlyingAndTransfer(address,address,uint256,address)",
        params: [vUSDC, RECIPIENT, USDC_SHORTFALL, bscmainnet.VTREASURY],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip665;
