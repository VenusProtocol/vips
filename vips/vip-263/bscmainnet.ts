import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

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
export const USDT_DEBT_BORROWER_1 = parseUnits("1330", 18); // TBR
export const TREASURY_USDT_REDEEM_AMOUNT = parseUnits("1330", 18); // TBR
export const TREASURY_VUSDT_WITHDRAW_AMOUNT = parseUnits("57845.42049285", 8); // TBR
export const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

export const vip263 = () => {
  const meta = {
    version: "v2",
    title: "VIP-263 Repay BUSD debt on behalf borrower",
    description: `#### Summary

    Normal VIP, performing some repayments of bad debt in the Core pool, using funds from the VTreasury:
    * Repay 131,748.1702 TUSD(OLD) on behalf of account: 0x0f2577cCB1e895eD1e8BFd4e709706595831e78A
    * Repay 12,482.2792 TUSD(OLD) on behalf of account: 0x5CF9f8a81eb9a3eFf4C72326903B27782eb47Be2
    * Repay 232.0791 BNB on behalf of the account: 0xbd043882d36b6def4c30f20c613cfa70d3af8bb7

    Moreover, we want to repay a USDT bad debt, using part of the investment done by the VTreasury on the USDT market. This repayment
    will require an additional step, due to VIP-262 Treasury Managment
    * Reedem 22,700 USDT from the Venus USDT market. (the redeemed value is larger to the debt to compensate for the borrow APY
      increase during the execution of this VIP)
      Repay 22,592.7081 USDT on behalf of the account: 0x0f2577cCB1e895eD1e8BFd4e709706595831e78A`,
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
        params: [VUSDT, TREASURY_VUSDT_WITHDRAW_AMOUNT, NORMAL_TIMELOCK],
      },

      {
        target: VUSDT,
        signature: "redeemUnderlying(uint256)",
        params: [TREASURY_USDT_REDEEM_AMOUNT],
      },

      {
        target: TUSD_OLD,
        signature: "approve(address,uint256)",
        params: [VTUSD_OLD, TUSD_OLD_DEBT_BORROWER_1.add(TUSD_OLD_DEBT_BORROWER_2)],
      },

      {
        target: USDT,
        signature: "approve(address,uint256)",
        params: [VUSDT, USDT_DEBT_BORROWER_1],
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
        target: VUSDT,
        signature: "repayBorrowBehalf(address,uint256)",
        params: [BORROWER_1, USDT_DEBT_BORROWER_1],
      },

      {
        target: TUSD_OLD,
        signature: "approve(address,uint256)",
        params: [VTUSD_OLD, 0],
      },

      {
        target: USDT,
        signature: "approve(address,uint256)",
        params: [VUSDT, 0],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
