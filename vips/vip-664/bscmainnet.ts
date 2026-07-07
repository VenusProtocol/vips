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

// New XVS Vault reward speed: 1,837.9 XVS/day.
// BSC ≈ 0.75 s/block → 115,200 blocks/day (matches VIP-580's XVS vault speed).
// 1,837.9 / 115,200 = 0.015953993055555555 XVS per block.
export const NEW_XVS_VAULT_SPEED = parseUnits("0.015953993055555555", 18);

// ──────────────────────────────────────────────────────────────────────────
// Prime budget transfer
// ──────────────────────────────────────────────────────────────────────────
export const PRIME_LIQUIDITY_PROVIDER = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";

// United Stables (U) stablecoin, 18 decimals.
export const U = "0xcE24439F2D9C6a2289F741120FE202248B666666";

export const RECIPIENT = "0x080f8a0fb70f8f0f1b83c6178225a96cbe2be0de";

// 17,000 U (United Stables).
export const U_TO_SWEEP = parseUnits("17000", 18);

export const vip664 = () => {
  const meta = {
    version: "v2",
    title: "VIP-664 [BNB Chain] Q3 XVS Vault Rewards Adjustment and Prime Budget Transfer",
    description: `#### Summary

This proposal batches the Q3 XVS Vault rewards adjustment on BNB Chain together with a Prime budget transfer.

**Actions:**

1. **Fund the XVS Vault.** Transfer the entire XVS balance held by the [XVS Vault Treasury](https://bscscan.com/address/0x269ff7818DB317f60E386D2be0B259e1a324a40a) (~46,465.73 XVS) to the [XVS Store](https://bscscan.com/address/0x1e25CF968f12850003Db17E0Dba32108509C4359), replenishing the pool that pays XVS stakers.
2. **Adjust the XVS Vault reward speed to 1,837.9 XVS/day.** Update the XVS Vault reward speed on BNB Chain to reflect accumulated protocol buybacks.
3. **Prime budget transfer.** Transfer 17,000 U (United Stables) from the [Prime Liquidity Provider](https://bscscan.com/address/0x23c4F844ffDdC6161174eB32c770D4D8C07833F2) to the recipient address [0x080f8a0fb70f8f0f1b83c6178225a96cbe2be0de](https://bscscan.com/address/0x080f8a0fb70f8f0f1b83c6178225a96cbe2be0de).`,
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

      // 2. Set the XVS Vault reward speed to 1,837.9 XVS/day.
      {
        target: bscmainnet.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [bscmainnet.XVS, NEW_XVS_VAULT_SPEED],
      },

      // 3. Transfer 17,000 U from the Prime Liquidity Provider to the recipient.
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

export default vip664;
