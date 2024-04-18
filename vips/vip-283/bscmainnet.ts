import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const XVS_VAULT_TREASURY = "0x269ff7818DB317f60E386D2be0B259e1a324a40a";
export const VTREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
export const XVS_VAULT = "0x051100480289e704d20e9DB4804837068f3f9204";

export const XVS_FOR_XVS_STORE = parseUnits("72905.06", 18);
export const XVS_FOR_V_TREASURY = parseUnits("21789.17", 18);
export const XVS_DISTRIBUTION_SPEED = parseUnits("0.063888888888888888", 18); // 1,840 XVS/day

const vip283 = () => {
  const meta = {
    version: "v2",
    title: "VIP-283 Quarterly XVS Buyback and Funds Allocation",
    description: `#### Summary

This VIP outlines the protocol’s Quarterly Buyback and Funds Allocation strategy as per our [Tokenomics](https://docs-v4.venus.io/governance/tokenomics), emphasizing the following key aspects for Q1 2024:

- **Protocol Reserves:** $9,732,402.01
- **Liquidation Fees:** $3,409,574.96
- **Total:** $13,141,976.97
- **Total Buyback Amount**: $1,284,790.89 (72,905.06 XVS)

The following actions will be executed in this VIP:

- Transfer **$383,986 (21,789.17 XVS)** from the [XVS Vault Treasury](https://debank.com/profile/0x269ff7818DB317f60E386D2be0B259e1a324a40a) to the [vTreasury](https://debank.com/profile/0xf322942f644a996a617bd29c16bd7d231d9f35e9) for the reimbursement of the Q4 2023 protocol reserves buyback allocation.
- Transfer **$1,284,790.89 (72,905.06 XVS)** to the [XVS Store](https://debank.com/profile/0x1e25CF968f12850003Db17E0Dba32108509C4359) for vault reward distribution.
- Set the new daily emission rate to **1,840 XVS**. This change is estimated to increase the vault APY from 8.45% to 9.55%.

*Note: All token prices and amounts will be calculated for Mar-31-2024 11:59:59 PM +UTC, block number 37463959.*

#### Context

Due to the deployment dates of the [income allocator](https://docs-v4.venus.io/whats-new/automatic-income-allocation) and [token converters](https://docs-v4.venus.io/whats-new/token-converter), it's important to consider the following for the buyback calculation:

1 . **Deployment of Automatic Income Allocator and Token Converters:**
- **[Q4 2023:](https://app.venus.io/#/governance/proposal/231?chainId=56)** Protocol reserves for Q4 2023 were not used for the previous buyback and were kept in the [Protocol Share Reserve Contract (PSR)](https://debank.com/profile/0xCa01D5A9A248a830E9D93231e791B1afFed7c446) due to the pending deployment of token converters. Instead, treasury funds were used to cover the protocol reserve buyback allocation.
- **Q1 2024:** With the [converters](https://docs-v4.venus.io/deployed-contracts/token-converters) now deployed, the total value in the [XVS Vault Treasury](https://debank.com/profile/0x269ff7818DB317f60E386D2be0B259e1a324a40a) includes revenues from both Q4 2023 and Q1 2024. **A sum of $436,557 from [Q4's buyback](https://app.venus.io/#/governance/proposal/231?chainId=56) is to be returned to the [vTreasury](https://debank.com/profile/0xf322942f644a996a617bd29c16bd7d231d9f35e9)** to cover the protocol reserve buyback allocation.

2 . **Management of Liquidation Fees:**
- **Pre-[VIP 258](https://app.venus.io/#/governance/proposal/258?chainId=56):** Liquidation fees were added to the [vTreasury](https://debank.com/profile/0xf322942f644a996a617bd29c16bd7d231d9f35e9) as vtokens.
- **Post-[VIP 258](https://app.venus.io/#/governance/proposal/258?chainId=56):** Liquidation fees were now redeemed to underlying tokens and sent to the [vTreasury](https://debank.com/profile/0xf322942f644a996a617bd29c16bd7d231d9f35e9).
- **Post-[VIP 265](https://app.venus.io/#/governance/proposal/265?chainId=56):** Liquidation fees now go through the entire income allocation process, fees are redeemed to underlying tokens and are sent to the Protocol Share Reserve contract, from where they are distributed based on our tokenomics to the converters, and once converted, to their corresponding final destination.

**With this considered, the total buyback amount for this quarter is the following:**

- Balance of the [XVS Vault Treasury](https://debank.com/profile/0x269ff7818DB317f60E386D2be0B259e1a324a40a).
    - $1,668,776.89 (94,694.23 XVS)
- Q4 2023 Protocol reserve buyback allocation to be reimbursed.
    - $436,557 (24,772.29 XVS)
- Liquidation fees prior to VIP 265 to be converted to XVS.
    - $52,571 (2,983.13 XVS)
- The vTreasury reimbursement will be the total amount reimbursed minus liquidation fees, optimizing operations and avoiding unnecessary conversions.
    - $383,986 (21,789.17 XVS)
- Total Buyback Amount.
    - **$1,284,790.89 (72,905.06 XVS)**

It is important to note that not all protocol reserves and liquidation fees generated in Q1 2024 have been converted by the XVS token converter. This pending amount will be considered for the following quarterly buyback.

**Protocol Reserves:**

- BNB: 13,696.52 ($8,311,980.40)
- USDT: 789,229.34 ($789,253.02)
- USDC: 395,912.63 ($395,951.83)
- ETH: 37.38 ($136,375.12)
- BTC: 0.47 ($33,589.27)
- Others: ($65,252.37)
- **Total: $9,732,402.01**

**Liquidation Fees:**

- ETH: 567.45 ($2,070,112.71)
- BTC: 12.04 ($858,599.51)
- BNB: 516.84 ($313,655.35)
- USDT: 16,988.44 ($16,988.95)
- USDC: 13,025.88 ($13,027.17)
- Others: ($137,191.27)
- **Total: $3,409,574.96**

**XVS Vault Daily Emission Speed:**

The 72,905 XVS, along with the 93,450 XVS from [XVS Vault Base Rewards](https://docs-v4.venus.io/governance/tokenomics#xvs-vault-base-rewards), results in a total of 166,355 to be distributed over 90 days. With this, the daily emissions will increase from 1,440 to 1,840, increasing the vault APY from 8.45% to an estimated 9.55%.`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: XVS_VAULT_TREASURY,
        signature: "fundXVSVault(uint256)",
        params: [XVS_FOR_XVS_STORE],
      },
      {
        target: XVS_VAULT,
        signature: "setRewardAmountPerBlock(address,uint256)",
        params: [XVS, XVS_DISTRIBUTION_SPEED],
      },
      {
        target: XVS_VAULT_TREASURY,
        signature: "sweepToken(address,address,uint256)",
        params: [XVS, VTREASURY, XVS_FOR_V_TREASURY],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip283;
