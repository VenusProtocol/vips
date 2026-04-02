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

export const vip900 = () => {
  const meta = {
    version: "v2",
    title:
      "VIP-900 [BNB Chain] THE Token OTC Withdrawal, Q2 2026 XVS Vault Reward Distribution, and April 2026 Prime Reward Adjustment",
    description: `This proposal combines three operational actions on BNB Chain:

**(1) THE Token Withdrawal for OTC Sale**

Due to THE token's persistent illiquidity on BNB Chain, THE tokens held across protocol contracts (Treasury, RiskFundConverter, XVSVaultConverter, USDTPrimeConverter) will be withdrawn to the OTC wallet for OTC sale. This ensures the protocol can recover value from these holdings rather than leaving them stranded in illiquid positions. Note: ~5,809 THE in the PSR contract are excluded as PSR does not support sweepToken.

**(2) Q2 2026 XVS Vault Reward Distribution**

In accordance with [Tokenomics V4.1](https://docs-v4.venus.io/governance/tokenomics), this proposal redistributes XVS accumulated through protocol buybacks during Q3 2025 to XVS stakers for Q2 2026 (April 6 – July 5, 2026).

- Transfer **110,382 XVS** from the [XVS Vault Treasury](https://bscscan.com/address/0x269ff7818DB317f60E386D2be0B259e1a324a40a) to the [XVS Store](https://bscscan.com/address/0x1e25CF968f12850003Db17E0Dba32108509C4359).
- Set the XVS Vault reward speed to **1,846.606 XVS/day** (0.00962 XVS/block at 192,000 blocks/day), reflecting Q3 2025 buybacks and the base reward allocation of 308.7 XVS/day.

**(3) April 2026 Prime Reward Adjustment**

Allocate **$29,600 in Prime rewards** to **USDT suppliers on BNB Chain** for April 2026. This allocation is based on March 2026 reserves revenue ($164.3K total, $32.9K allocated to Prime at 20%), with a 10% buffer retained to safeguard against price fluctuations.

**Action:**

- Withdraw THE tokens from 4 protocol contracts to OTC wallet for OTC sale (PSR excluded)
- Transfer 110,382 XVS from XVS Vault Treasury to XVS Store
- Update XVS Vault reward speed to 0.00962 XVS/block
- Update Prime USDT distribution speed to 0.005138888888888889 USDT/block (~$29,600/month)`,
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

export default vip900;
