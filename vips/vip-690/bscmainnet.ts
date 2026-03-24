import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

export const THE = "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11";
export const vTHE = "0x86e06EAfa6A1eA631Eab51DE500E3D474933739f";

// Target address for final THE transfer
export const TARGET_RECEIVER = "0x5e7bb1f600e42bc227755527895a282f782555ec";

// Bad debt accounts with THE borrows
export const BAD_DEBT_BORROWERS: string[] = [
  "0x737bc98f1d34e19539c074b8ad1169d5d45da619",
  "0x85ca0dff027102ea3fbf1c077524eab21d1f7927",
  "0xa72e1756426100c6207421471449e2ba9a917e86",
  "0x9958ed7f2441c208821ea14643224812a006d221",
  "0x6efee96287b5e1a2ef966e25bae15a54bde9b83e",
  "0x2c58d31559d65242cf7915a4fd89fcab9c96f7df",
  "0xdff9e1b12dfb7103231128940a19c2896f049de8",
  "0xa87f0d31846211ce417128a770c681fc342d3a74",
];

/**
 * Fetch live on-chain values for the VIP at the current (or forked) block.
 * Returns sweep amount, per-borrower debts, and total bad debt.
 */
export async function fetchVipValues() {
  const vTokenContract = new ethers.Contract(
    vTHE,
    ["function getCash() view returns (uint256)", "function borrowBalanceStored(address) view returns (uint256)"],
    ethers.provider,
  );

  const [cash, ...debts]: BigNumber[] = await Promise.all([
    vTokenContract.getCash(),
    ...BAD_DEBT_BORROWERS.map((borrower: string) => vTokenContract.borrowBalanceStored(borrower)),
  ]);

  const badDebtAccounts = BAD_DEBT_BORROWERS.map((borrower, i) => ({
    borrower,
    amount: debts[i],
  }));

  const totalBadDebt = debts.reduce((sum, debt) => sum.add(debt), BigNumber.from(0));

  return {
    sweepAmount: cash,
    badDebtAccounts,
    totalBadDebt,
  };
}

export const vipVPD854 = async () => {
  const { sweepAmount, badDebtAccounts, totalBadDebt } = await fetchVipValues();

  const meta = {
    version: "v2",
    title: "VIP-690 [BNB Chain] $THE Market Resume and Bad Debt Handling",
    description: `This VIP handles the recovery of the $THE market following the March 16 donation attack. The VIP performs the following steps:

1. **Sweep available THE liquidity from vTHE**: Call sweepTokenAndSync on the vTHE contract to withdraw all available liquidity (~2M THE) to the Normal Timelock.

2. **Repay THE bad debt**: Using the recovered THE tokens, repay the THE borrows for all 8 accounts with THE-denominated bad debt (totalling ~1,941,323.86 THE). The THE tokens flow back into the vTHE contract through repayBorrowBehalf.

3. **Second sweep**: After bad debt repayment, the THE liquidity flows back to vTHE. Call sweepTokenAndSync again to withdraw the remaining excess.

4. **Transfer remaining THE**: Transfer the recovered THE tokens to the designated address.

#### Bad Debt Accounts (THE)

| Account | THE Debt |
|---------|----------|
| 0x737b...a619 | 1,869,957.97 |
| 0x85ca...7927 | 54,367.63 |
| 0xa72e...7e86 | 11,592.99 |
| 0x9958...d221 | 2,773.70 |
| 0x6efe...b83e | 1,160.39 |
| 0x2c58...7df | 681.93 |
| 0xdff9...9de8 | 428.45 |
| 0xa87f...d3a74 | 360.81 |

#### References

- [THE Market Incident Post-Mortem](https://community.venus.io/t/the-market-incident-post-mortem/5712)
- [VIP-600 Inflation Attack Patch](https://app.venus.io/#/governance/proposal/600?chainId=56)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Step 1: Sweep all THE from vTHE to Normal Timelock
      {
        target: vTHE,
        signature: "sweepTokenAndSync(uint256)",
        params: [sweepAmount],
      },

      // Step 2: Approve vTHE to spend THE for bad debt repayment
      {
        target: THE,
        signature: "approve(address,uint256)",
        params: [vTHE, totalBadDebt],
      },

      // Step 3: Repay THE bad debt for each account
      ...badDebtAccounts.map(({ borrower, amount }) => ({
        target: vTHE,
        signature: "repayBorrowBehalf(address,uint256)",
        params: [borrower, amount],
      })),

      // Step 4: Reset approval
      {
        target: THE,
        signature: "approve(address,uint256)",
        params: [vTHE, 0],
      },

      // Step 5: Second sweep — THE flowed back into vTHE via repayBorrowBehalf
      {
        target: vTHE,
        signature: "sweepTokenAndSync(uint256)",
        params: [totalBadDebt],
      },

      // Step 6: Transfer remaining THE to target address
      {
        target: THE,
        signature: "transfer(address,uint256)",
        params: [TARGET_RECEIVER, sweepAmount],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vipVPD854;
