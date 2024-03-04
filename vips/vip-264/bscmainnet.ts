import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

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
export const USDT_DEBT_BORROWER_1 = parseUnits("22652", 18);
export const TREASURY_VUSDT_WITHDRAW_AMOUNT = parseUnits("972134.78049127", 8); // 1 USDT=42.903432 vUSDT
export const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
export const TOKEN_REDEEMER = "0x67B10f3BC6B141D67c598C73CEe45E6635292Acd";

// For bridge purpose
export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const XVS_BRIDGE = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";
export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
export const ETHEREUM_TREASURY = "0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA";
export const ETHEREUM_XVS_RECEIVER = ethers.utils.defaultAbiCoder.encode(["address"], [ETHEREUM_TREASURY]);
export const BRIDGE_XVS_AMOUNT = parseUnits("1000", 18);
export const DEST_CHAIN_ID = 101;
export const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);

export const vip264 = () => {
  const meta = {
    version: "v2",
    title: "VIP-264 Repay BUSD debt on behalf borrower",
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

      {
        target: COMPTROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [NORMAL_TIMELOCK, BRIDGE_XVS_AMOUNT],
      },

      {
        target: XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE, BRIDGE_XVS_AMOUNT],
      },

      {
        target: XVS_BRIDGE,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          NORMAL_TIMELOCK,
          DEST_CHAIN_ID,
          ETHEREUM_XVS_RECEIVER,
          BRIDGE_XVS_AMOUNT,
          [NORMAL_TIMELOCK, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: parseUnits("0.5", 18).toString(),
      },

      {
        target: XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE, 0],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
