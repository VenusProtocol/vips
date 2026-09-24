import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

// ──────────────────────────────────────────────────────────────────────────
// XVS Vault distribution
// ──────────────────────────────────────────────────────────────────────────
export const XVS_VAULT_TREASURY = "0x269ff7818DB317f60E386D2be0B259e1a324a40a";
export const XVS_STORE = "0x1e25CF968f12850003Db17E0Dba32108509C4359";

// Entire XVS balance held by the XVS Vault Treasury, snapshotted at the
// simulation fork block (106561536). "Fund all available balance" — this
// sweeps the treasury's full XVS balance to the XVS Store. ~46,465.73 XVS.
export const XVS_FUND_AMOUNT = BigNumber.from("46465730038602167664988");

// Base Reward allocation granted from the Core Pool Comptroller (Unitroller) to
// the XVS Store via _grantXVS, mirroring the base-reward grant in VIP-612/VIP-607.
export const XVS_GRANT_AMOUNT = parseUnits("28091.7", 18); // 28,091.7 XVS

// New XVS Vault reward speed: 535 XVS/day.
// BSC ≈ 0.45 s/block → 192,000 blocks/day (repo convention, see VIP-607/612/618/629).
// 535 / 192,000 = 0.002786458333333333 XVS per block.
export const NEW_XVS_VAULT_SPEED = parseUnits("0.002786458333333333", 18);

// ──────────────────────────────────────────────────────────────────────────
// Prime budget transfer
// ──────────────────────────────────────────────────────────────────────────
export const PRIME_LIQUIDITY_PROVIDER = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";

// United Stables (U) stablecoin, 18 decimals.
export const U = "0xcE24439F2D9C6a2289F741120FE202248B666666";

export const RECIPIENT = "0x080f8a0fb70f8f0f1b83c6178225a96cbe2be0de";

// 17,000 U (United Stables).
export const U_TO_SWEEP = parseUnits("17000", 18);

export const vip641 = () => {
  const meta = {
    version: "v2",
    title: "VIP-641 [BNB Chain] XVS Vault Q3 2026 Rewards",
    description: `#### Summary

This proposal redistributes the Q2 2026 XVS buybacks to XVS Vault stakers on BNB Chain by transferring the buybacks to the XVS Store and updating the Vault reward speed. It also funds the fixed XVS Vault Base Reward allocation for Q3 2026, and repays the WBNB previously drawn to fund the XVS Vault, by withdrawing an equivalent amount of U from the Prime Liquidity Provider.

#### Description

Per [VIP-585](https://app.venus.io/#/governance/proposal/585?chainId=56), XVS Vault Rewards are distributed only on chains generating at least $50K in average monthly revenue over a rolling 6-month period; currently only BNB Chain qualifies. The rewards for this quarter draw on the Q2 2026 buybacks accumulated in the XVS Vault Treasury (~46,465.73 XVS) and a fixed base allocation of 308.7 XVS/day. Distributed over the 91-day period from 6 July to 5 October 2026, this sets an XVS Vault reward speed of 535 XVS/day (0.002786 XVS/block), for a projected Vault APR of ~2.14%. The XVS Converter holds no unconverted buyback allocation this quarter.

#### Actions

This VIP performs the following actions on BNB Chain:

1. **XVS Buyback Allocation** — Transfer ~46,465.73 XVS from the [XVS Vault Treasury](https://bscscan.com/address/0x269ff7818DB317f60E386D2be0B259e1a324a40a) to the [XVS Store](https://bscscan.com/address/0x1e25CF968f12850003Db17E0Dba32108509C4359).
2. **Fund XVS Vault Base Reward for Q3 2026** — Calls _grantXVS on the [Core Pool Comptroller](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384) to transfer 28,091.7 XVS (308.7 XVS/day × 91 days) to the [XVS Store](https://bscscan.com/address/0x1e25CF968f12850003Db17E0Dba32108509C4359), funding the fixed Base Reward allocation for the Q3 2026 period.
3. **XVS Vault Speed** — Set the XVS Vault reward speed to 0.002786 XVS/block (535 XVS/day) on the [XVSVault](https://bscscan.com/address/0x051100480289e704d20e9DB4804837068f3f9204) for the [XVS token](https://bscscan.com/address/0xcf6BB5389c92Bdda8a3747Ddb454cB7a64626C63).
4. **Treasury WBNB Repayment** — Calls sweepToken on the [PrimeLiquidityProvider](https://bscscan.com/address/0x23c4F844ffDdC6161174eB32c770D4D8C07833F2) to release 17,000 U (≈$17,000) to the recipient address [0x080f8a0fb70f8f0f1b83c6178225a96cbe2be0de](https://bscscan.com/address/0x080f8a0fb70f8f0f1b83c6178225a96cbe2be0de), in repayment of the WBNB previously drawn to fund the XVS Vault.

#### Voting options

- **For** — Execute the proposal
- **Against** — Do not execute the proposal
- **Abstain** — Indifferent to execution`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // 1. Fund the XVS Vault: move the treasury's full XVS balance to the XVS Store.
      {
        target: XVS_VAULT_TREASURY,
        signature: "fundXVSVault(uint256)",
        params: [XVS_FUND_AMOUNT],
      },

      // 2. Grant the base-reward XVS allocation from the Core Pool Comptroller to the XVS Store.
      {
        target: bscmainnet.UNITROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [XVS_STORE, XVS_GRANT_AMOUNT],
      },

      // 3. Set the XVS Vault reward speed to 535 XVS/day.
      {
        target: bscmainnet.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [bscmainnet.XVS, NEW_XVS_VAULT_SPEED],
      },

      // 4. Transfer 17,000 U from the Prime Liquidity Provider to the recipient.
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "sweepToken(address,address,uint256)",
        params: [U, RECIPIENT, U_TO_SWEEP],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip641;
