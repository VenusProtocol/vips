import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const VTUSD_OLD = "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3";
export const TUSD_OLD = "0x14016E85a25aeb13065688cAFB43044C2ef86784";
export const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const VBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
export const BORROWER_1 = "0x0f2577cCB1e895eD1e8BFd4e709706595831e78A";
export const BORROWER_2 = "0x5CF9f8a81eb9a3eFf4C72326903B27782eb47Be2";
export const BORROWER_3 = "0xbd043882d36b6def4c30f20c613cfa70d3af8bb7";
export const TUSD_OLD_DEBT_BORROWER_1 = parseUnits("131748.1702", 18);
export const TUSD_OLD_DEBT_BORROWER_2 = parseUnits("12482.2791", 18); // ~0.0001
export const BNB_DEBT_BORROWER_3 = parseUnits("232.0791", 18);
export const USDT_DEBT_BORROWER_1 = parseUnits("22680.5", 18);
export const TREASURY_VUSDT_WITHDRAW_AMOUNT = parseUnits("972325.034704", 8); // 1 USDT=42.869584 vUSDT
export const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
export const TOKEN_REDEEMER = "0x67B10f3BC6B141D67c598C73CEe45E6635292Acd";

export const vip266 = () => {
  const meta = {
    version: "v2",
    title: "VIP-266: Partial shortfall repayment",
    description: `Following [VIP-260](https://app.venus.io/#/governance/proposal/260?chainId=56), if passed, this VIP will repay the debt for the following accounts, using the funds from the vTreasury:

- Repay 131,748.1702 TUSD(OLD) for account: [0x0f2577cCB1e895eD1e8BFd4e709706595831e78A](https://debank.com/profile/0x0f2577ccb1e895ed1e8bfd4e709706595831e78a)
- Repay 12,482.2791 TUSD(OLD) for account: [0x5CF9f8a81eb9a3eFf4C72326903B27782eb47Be2](https://debank.com/profile/0x5CF9f8a81eb9a3eFf4C72326903B27782eb47Be2)
- Repay 232.0791 BNB for account: [0xbd043882d36b6def4c30f20c613cfa70d3af8bb7](https://debank.com/profile/0xbd043882d36b6def4c30f20c613cfa70d3af8bb7)

The USDT repayment will require an additional step, due to [VIP-262 Treasury Managment](https://app.venus.io/#/governance/proposal/262?chainId=56)

- Reedem vUSDT tokens equivalent to 22,680.5 USDT from the Venus USDT market. The value in USDT of these vUSDT will be greater than 22,680.5 USDT when the VIP is executed (vToken value is always growing)
- 22,680.5 USDT for account: [0x0f2577cCB1e895eD1e8BFd4e709706595831e78A](https://debank.com/profile/0x0f2577ccb1e895ed1e8bfd4e709706595831e78a)

The total estimated repayment amount is: $263,610 considering token prices for March 4, 2024.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [TUSD_OLD, TUSD_OLD_DEBT_BORROWER_1.add(TUSD_OLD_DEBT_BORROWER_2), NORMAL_TIMELOCK],
      },

      {
        target: TREASURY,
        signature: "withdrawTreasuryBNB(uint256,address)",
        params: [BNB_DEBT_BORROWER_3, NORMAL_TIMELOCK],
      },

      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [VUSDT, TREASURY_VUSDT_WITHDRAW_AMOUNT, TOKEN_REDEEMER],
      },

      {
        target: TUSD_OLD,
        signature: "approve(address,uint256)",
        params: [VTUSD_OLD, TUSD_OLD_DEBT_BORROWER_1.add(TUSD_OLD_DEBT_BORROWER_2)],
      },

      {
        target: VTUSD_OLD,
        signature: "repayBorrowBehalf(address,uint256)",
        params: [BORROWER_1, TUSD_OLD_DEBT_BORROWER_1],
      },

      {
        target: VTUSD_OLD,
        signature: "repayBorrowBehalf(address,uint256)",
        params: [BORROWER_2, TUSD_OLD_DEBT_BORROWER_2],
      },

      {
        target: VBNB,
        signature: "repayBorrowBehalf(address)",
        params: [BORROWER_3],
        value: BNB_DEBT_BORROWER_3.toString(),
      },

      {
        target: TOKEN_REDEEMER,
        signature: "redeemUnderlyingAndRepayBorrowBehalf(address,address,uint256,address)",
        params: [VUSDT, BORROWER_1, USDT_DEBT_BORROWER_1, TREASURY],
      },

      {
        target: TUSD_OLD,
        signature: "approve(address,uint256)",
        params: [VTUSD_OLD, 0],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip266;
