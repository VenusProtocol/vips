import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

export const THE = "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11";
export const vTHE = "0x86e06EAfa6A1eA631Eab51DE500E3D474933739f";
export const TARGET_RECEIVER = "0x5e7bb1f600e42bc227755527895a282f782555ec";

// TODO: Replace with deployed helper contract address
export const THE_BAD_DEBT_HELPER = "0x0000000000000000000000000000000000000000";

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

export const vipVPD854 = () => {
  const meta = {
    version: "v2",
    title: "VIP-690 [BNB Chain] $THE Market Resume and Bad Debt Handling",
    description: `This VIP handles the recovery of the $THE market following the March 16 donation attack. It uses a helper contract (THEBadDebtHelper) to read live on-chain values at execution time, ensuring accurate repayment amounts regardless of interest accrual during the timelock delay.

The VIP performs the following steps:

1. **Set helper as pending admin of vTHE**: Allow the helper contract to temporarily become admin.

2. **Execute helper**: The helper atomically:
   - Accepts admin of vTHE
   - Sweeps all available THE liquidity from vTHE (live balance)
   - Repays THE bad debt for all 8 accounts using live borrow balances
   - Performs a second sweep to recover THE that flowed back via repayments
   - Transfers all remaining THE to the designated receiver
   - Sets timelock back as pending admin of vTHE

3. **Reclaim admin**: Timelock accepts admin of vTHE, restoring normal governance control.

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
      // Step 1: Set helper as pending admin of vTHE
      {
        target: vTHE,
        signature: "_setPendingAdmin(address)",
        params: [THE_BAD_DEBT_HELPER],
      },

      // Step 2: Helper accepts admin, sweeps, repays bad debt, transfers remainder, hands admin back
      {
        target: THE_BAD_DEBT_HELPER,
        signature: "execute()",
        params: [],
      },

      // Step 3: Timelock reclaims admin of vTHE
      {
        target: vTHE,
        signature: "_acceptAdmin()",
        params: [],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vipVPD854;
