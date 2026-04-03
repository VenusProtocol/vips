import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

// -------------------------------------------------------
// Part A: THE Token Withdrawal
// -------------------------------------------------------
export const THE = "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11";
export const OTC_WALLET = "0x5e7bb1f600e42bc227755527895a282f782555ec";
export const RISK_FUND_CONVERTER = "0xA5622D276CcbB8d9BBE3D1ffd1BB11a0032E53F0";
export const XVS_VAULT_CONVERTER = "0xd5b9AE835F4C59272032B3B954417179573331E0";
export const USDT_PRIME_CONVERTER = "0xD9f101AA67F3D72662609a2703387242452078C3";

export const THE_AMOUNT_TREASURY = parseUnits("1555897.757296354509715841", 18);
export const THE_AMOUNT_RISK_FUND_CONVERTER = parseUnits("494524.778581486569340203", 18);
export const THE_AMOUNT_XVS_VAULT_CONVERTER = parseUnits("378706.534208351568523680", 18);
export const THE_AMOUNT_USDT_PRIME_CONVERTER = parseUnits("4134.951547843396807519", 18);

// -------------------------------------------------------
// Part B: XVS Vault Reward Distribution (Q2 2026)
// -------------------------------------------------------
export const BSC_XVS_VAULT_TREASURY = "0x269ff7818DB317f60E386D2be0B259e1a324a40a";
export const BSC_XVS_STORE = "0x1e25CF968f12850003Db17E0Dba32108509C4359";
export const BSC_XVS_AMOUNT = parseUnits("110382", 18);
/// 1,846.606 XVS/day at 192,000 blocks/day = 0.00962 XVS/block
export const BSC_SPEED = parseUnits("0.00962", 18);

// -------------------------------------------------------
// Part C: Prime Reward Adjustment (Apr 2026)
// -------------------------------------------------------
export const PRIME_LIQUIDITY_PROVIDER = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
/// $29,600 / 30 days / 192,000 blocks = 0.005138888888888889 USDT/block
export const NEW_PRIME_SPEED_FOR_USDT = parseUnits("0.005138888888888889", 18);

export const vip607 = () => {
  const meta = {
    version: "v2",
    title: "VIP-607 [BNB Chain] Apr Prime Allocation, Q2 XVS Vault Rewards & THE Token Withdrawal",
    description: `#### Summary

This VIP bundles three protocol actions on BNB Chain:

1. **Adjust Prime Rewards allocation for April 2026**, distributing $29.6K in rewards exclusively to USDT suppliers.
2. **Redistribute Q1 2026 XVS Buybacks** to XVS Vault stakers by transferring 110,382 XVS to the XVS Store and updating the reward speed to 1,846.6 XVS/day.
3. **Withdraw all THE tokens** (~2.43M THE) from five protocol contracts and transfer to the Finance Team for OTC liquidation.

#### Description

#### 1. [BNB Chain] Prime Rewards Allocation — April 2026

**Context**

In March 2026, Venus generated [$164.3K](https://dune.com/embeds/6134575/9816247) in reserves revenue on BNB Chain. Of this, [$32.9K](https://dune.com/embeds/6134575/9816247) (20%) is allocated to Prime and will be distributed as rewards in April 2026. This allocation is retroactive, redistributing revenue generated through March 2026.

**Proposed Allocation**

- Allocate **$29.6K in Prime rewards**, while maintaining a 10% buffer for market price fluctuations and to avoid full depletion.
- Rewards directed exclusively to the **USDT stablecoin supply side**, with speeds adjusted to allocate the full $29.6K to USDT suppliers.
- Starting May, we are considering introducing U as a second Prime reward market, with a tentative 50/50 split between USDT and U supply. The final split will be reviewed based on U market performance and reserve contribution at that time.
- Focusing rewards on the supply side helps strengthen liquidity and create conditions for lower borrow rates. In contrast, rewarding both sides tends to create arbitrage opportunities, artificially inflating activity and driving up borrow rates for other users.

**Analysis**

- Overall USDT supply declined from $260.8M to $232.5M (-10.9%), and borrowing declined from $150.8M to $125.8M (-16.6%), reflecting broader market contraction in March.
- Prime user supply remained resilient at $56.5M (-0.6%), outperforming the overall market by ~10 percentage points.
- USDT reserve revenue decreased from $44.0K to $38.0K (-13.7%), reflecting lower borrow activity. The market remains the primary revenue contributor and continues to justify its dominant share of Prime rewards.

#### 2. [BNB Chain] Q2 XVS Buyback & Vault Reward Adjustment

**Context**

This action redistributes Q1 2026 XVS Buybacks to XVS stakers, in accordance with [Tokenomics V4.1](https://docs-v4.venus.io/governance/tokenomics), by transferring the buybacks to the XVS Store and adjusting the reward speed on BNB Chain.

Per [VIP-585](https://app.venus.io/#/governance/proposal/585?chainId=56), Prime Rewards and XVS Vault Rewards are only distributed on chains that generate at least $50K in average monthly revenue over a rolling 6-month period. Currently, only BNB Chain meets this threshold.

**Q1 2026 Protocol Fees (BNB Chain)**

- Reserves: $583,709
- Liquidation Fees: $1,772,149
- Total: $2,355,858

**Tokenomics Allocations**

- XVS Buybacks: $471,172 (110,382 XVS converted)
- Venus Prime: $116,742
- Treasury: $1,296,773
- Risk Fund: $471,172

**Q2 2026 XVS Vault Rewards**

The XVS available for Vault Rewards will come from:

1. **XVS Buybacks** accumulated throughout Q1 in the XVS Vault Treasury.
2. Any **spare XVS** remaining in the XVS Store (assuming 06-Apr-26 execution date).
3. A **fixed Base Reward allocation** of 308.7 XVS/day on **BNB Chain only.**

Any Buyback allocation in the XVS Converter that has not yet been converted to XVS ($4,813 remaining) will not be taken into account in the Rewards distribution this quarter.

**Actions**

- Transfer **110,382 XVS** from the [XVS Vault Treasury](https://bscscan.com/address/0x269ff7818DB317f60E386D2be0B259e1a324a40a) to the [XVS Store](https://bscscan.com/address/0x1e25CF968f12850003Db17E0Dba32108509C4359).
- Set the new XVS Vault reward speed to **1,846.606 XVS/day** (0.00962 XVS/block), which includes Q1 buybacks + 308.7 XVS/day Base Rewards.

#### 3. [BNB Chain] Withdraw THE from Protocol Contracts

**Context**

Following the THE market incident, on-chain liquidity for THE has deteriorated significantly. The token converters are unable to swap THE into useful assets at reasonable rates, and the situation is unlikely to improve. Leaving these tokens idle in the contracts means their value will continue to erode over time.

**THE Balances (queried 2026-04-02)**

- Treasury (0xf322942f644a996a617bd29c16bd7d231d9f35e9): 1,553,573.82 THE
- RiskFundConverter (0xA5622D276CcbB8d9BBE3D1ffd1BB11a0032E53F0): 493,362.81 THE
- XVSVaultConverter (0xd5b9AE835F4C59272032B3B954417179573331E0): 377,544.57 THE
- ProtocolShareReserve (0xCa01D5A9A248a830E9D93231e791B1afFed7c446): 5,809.84 THE (been released to rest four)
- USDTPrimeConverter (0xD9f101AA67F3D72662609a2703387242452078C3): 2,972.98 THE
- **Total: 2,433,264.02 THE**

**Actions**

- Withdraw THE from Treasury, RiskFundConverter, XVSVaultConverter, ProtocolShareReserve, and USDTPrimeConverter
- Transfer all THE to the Finance Team for OTC liquidation on a best-effort basis
- Proceeds will be allocated toward protocol operational expenses

#### References

- [Tokenomics V4.1](https://docs-v4.venus.io/governance/tokenomics)
- [VIP-585: Cessation of BNB Burn and Reward Distribution Eligibility](https://app.venus.io/#/governance/proposal/585?chainId=56)
- [Venus Prime Dashboard](https://dune.com/xvslove_team/venus-prime)

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
      // ════════════════════════════════════════════════════════
      // Part A: THE Token Withdrawals
      // ════════════════════════════════════════════════════════
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [THE, THE_AMOUNT_TREASURY, OTC_WALLET],
      },
      // Grant Normal Timelock permission to call sweepToken on converters
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_FUND_CONVERTER, "sweepToken(address,address,uint256)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [XVS_VAULT_CONVERTER, "sweepToken(address,address,uint256)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [USDT_PRIME_CONVERTER, "sweepToken(address,address,uint256)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: RISK_FUND_CONVERTER,
        signature: "sweepToken(address,address,uint256)",
        params: [THE, OTC_WALLET, THE_AMOUNT_RISK_FUND_CONVERTER],
      },
      {
        target: XVS_VAULT_CONVERTER,
        signature: "sweepToken(address,address,uint256)",
        params: [THE, OTC_WALLET, THE_AMOUNT_XVS_VAULT_CONVERTER],
      },
      {
        target: USDT_PRIME_CONVERTER,
        signature: "sweepToken(address,address,uint256)",
        params: [THE, OTC_WALLET, THE_AMOUNT_USDT_PRIME_CONVERTER],
      },

      // ════════════════════════════════════════════════════════
      // Part B: XVS Vault Reward Distribution (Q2 2026)
      // ════════════════════════════════════════════════════════
      {
        target: BSC_XVS_VAULT_TREASURY,
        signature: "fundXVSVault(uint256)",
        params: [BSC_XVS_AMOUNT],
      },
      {
        target: bscmainnet.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [bscmainnet.XVS, BSC_SPEED],
      },

      // ════════════════════════════════════════════════════════
      // Part C: Prime Reward Adjustment (Apr 2026)
      // ════════════════════════════════════════════════════════
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "setTokensDistributionSpeed(address[],uint256[])",
        params: [[USDT], [NEW_PRIME_SPEED_FOR_USDT]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip607;
