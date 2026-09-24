import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

// Recipients
export const ALLEZ_LAB_RECIPIENT = "0x1757564C8C9a2c3cbE12620ea21B97d6E149F98e"; // Allez Labs
export const VENUS_RECIPIENT = "0x5e7bb1f600e42bc227755527895a282f782555ec"; // Venus

// Token Addresses (BSC Mainnet)
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8"; // vUSDC Core Pool
export const TOKEN_REDEEMER = "0xC53ffda840B51068C64b2E052a5715043f634bcd";

// Transfer Amounts
export const USDT_TO_ALLEZ = parseUnits("70000", 18); // 70,000 USDT to Allez Labs
export const USDC_TO_VENUS = parseUnits("1400000", 18); // 1,400,000 USDC to Venus
export const USDC_TO_TREASURY = parseUnits("600000", 18); // 600,000 USDC back to treasury

// vUSDC: withdraw ~76M vUSDC (~2M USD worth) from treasury, redeem to 2M USDC
// Exchange rate: ~0.0263 USDC per vUSDC (rate only increases over time via interest accrual)
export const VUSDC_AMOUNT = parseUnits("75989995.23280643", 8);
export const USDC_REDEEM_AMOUNT = parseUnits("2000000", 18); // = USDC_TO_VENUS + USDC_TO_TREASURY

export const vip594 = () => {
  const meta = {
    version: "v2",
    title: "VIP-594 [BNB Chain] Transfer of Funds for Allez Labs and Operational Expenses",
    description: `#### Summary

This proposal consists of two main actions:

1. **Venus Treasury Redemption**: The Venus Treasury will redeem roughly $2,000,000 worth vUSDC into 2,000,000 USDC. Only 1,400,000 USDC will be transferred out to the Venus Recipient wallet. The remaining 600,000 USDC will be retained in the Venus Treasury for future use.

2. **Fund Distribution**: 70,000 USDT will be transferred to Allez Labs to complete the remaining Q1 payment for risk management services. The 1,400,000 USDC transferred to the Venus Recipient wallet will support ongoing operational expenses required to maintain and grow the protocol.

#### Description

As outlined in the [prior proposal](https://venus.io/#/governance/proposal/540?chainId=56), Allez Labs was engaged to provide risk management services for Venus Protocol. The first month payment of $35,000 USDT has already been settled off-chain. This proposal completes the remaining $70,000 USDT payment for the remainder of Q1.

Future operational fund withdrawals are expected to occur on a quarterly basis, with the exact amounts determined closer to each transfer and proposed through separate VIPs.

This VIP executes the following operations:

1. **70,000 USDT** direct transfer to Allez Labs (remaining Q1 payment for risk management services)
2. **~75.99M vUSDC** withdrawal from treasury to Token Redeemer
3. Redeem vUSDC for **2,000,000 USDC** via Token Redeemer (sent to Normal Timelock)
4. Transfer **1,400,000 USDC** from timelock to Venus Recipient wallet
5. Transfer **600,000 USDC** from timelock back to treasury

The Venus Recipient wallet will receive **$1.4M in USDC** for operational expenses. Allez Labs receives **$70K in USDT**. The treasury retains **$600K USDC** from the redemption.

#### Transfer Details

**From:** Venus Treasury ([0xF322942f644A996A617BD29c16bd7d231d9F35E9](https://bscscan.com/address/0xF322942f644A996A617BD29c16bd7d231d9F35E9))

**Operations:**

**Step 1:** Direct transfer — 70,000 USDT → Allez Labs

**Step 2:** Withdraw from treasury — ~75.99M vUSDC → Token Redeemer

**Step 3:** Redeem vUSDC to USDC — 2,000,000 USDC → Normal Timelock

**Step 4:** Transfer USDC — 1,400,000 USDC → Venus

**Step 5:** Transfer USDC — 600,000 USDC → Treasury

#### Technical Implementation

This VIP uses the **Token Redeemer** ([0xC53ffda840B51068C64b2E052a5715043f634bcd](https://bscscan.com/address/0xC53ffda840B51068C64b2E052a5715043f634bcd)) to convert vUSDC to USDC:

1. Withdraw ~76M vUSDC from treasury to Token Redeemer
2. Call redeemUnderlyingAndTransfer: redeems exactly 2M USDC, sends to Normal Timelock; any remaining vUSDC dust returns to treasury
3. Timelock distributes: 1.4M USDC to Venus recipient, 600K USDC back to treasury

Since redeemUnderlying returns exactly 2M USDC and the split is 1.4M + 600K = 2M, all amounts are deterministic with no approximation.

**vUSDC Exchange Rate:** ~0.0263 USDC per vUSDC (only increases over time via interest accrual, so 76M vUSDC will always cover 2M USDC at execution time)

If approved, this VIP will:
- Complete the remaining payment to Allez Labs for Q1 risk management services
- Allocate operational funds to support the continued development and upkeep of Venus Protocol
- Establish a framework for quarterly operational fund withdrawals, with future allocations proposed via separate VIPs

#### Security and Additional Considerations

- **VIP execution simulation**: Simulated execution validates all transfers complete successfully with correct amounts and recipients
- **Balance verification**: Pre and post-transfer balance checks ensure accuracy
- **Deterministic amounts**: redeemUnderlying guarantees exactly 2M USDC; 1.4M + 600K = 2M with zero dust
- **Treasury net effect**: loses ~76M vUSDC + 70K USDT, gains 600K USDC; net outflow is ~$1.47M

#### References

- [Community Proposal](https://community.venus.io/t/transfer-of-funds-for-allez-labs-and-operational-expenses/5178)
- [Treasury Contract](https://bscscan.com/address/0xF322942f644A996A617BD29c16bd7d231d9F35E9)
- [Token Redeemer Contract](https://bscscan.com/address/0xC53ffda840B51068C64b2E052a5715043f634bcd)
- [VIP-475 (Reference Implementation)](https://github.com/VenusProtocol/vips/blob/main/vips/vip-475/bscmainnet.ts)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Abstain from voting",
  };

  return makeProposal(
    [
      // Step 1: Transfer 70,000 USDT to Allez Labs
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, USDT_TO_ALLEZ, ALLEZ_LAB_RECIPIENT],
      },

      // Step 2: Withdraw ~76M vUSDC from treasury to Token Redeemer
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [vUSDC, VUSDC_AMOUNT, TOKEN_REDEEMER],
      },

      // Step 3: Redeem exactly 2M USDC worth of vUSDC, send to Normal Timelock
      // Any remaining vUSDC dust returns to treasury via receiver param
      {
        target: TOKEN_REDEEMER,
        signature: "redeemUnderlyingAndTransfer(address,address,uint256,address)",
        params: [vUSDC, bscmainnet.NORMAL_TIMELOCK, USDC_REDEEM_AMOUNT, bscmainnet.VTREASURY],
      },

      // Step 4: Transfer 1.4M USDC from timelock to Venus recipient
      {
        target: USDC,
        signature: "transfer(address,uint256)",
        params: [VENUS_RECIPIENT, USDC_TO_VENUS],
      },

      // Step 5: Transfer 600K USDC from timelock back to treasury
      {
        target: USDC,
        signature: "transfer(address,uint256)",
        params: [bscmainnet.VTREASURY, USDC_TO_TREASURY],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip594;
