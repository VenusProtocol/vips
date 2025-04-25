import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";
import { NORMAL_TIMELOCK } from "src/vip-framework";

const { bscmainnet } = NETWORK_ADDRESSES;

export const VBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";

export const TOKEN_REDEEMER = "0xC53ffda840B51068C64b2E052a5715043f634bcd";
export const BNB_EXPLOITER = "0x489A8756C18C0b8B24EC2a2b9FF3D4d447F79BEc";
export const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
export const RISK_FUND_CONVERTER = "0xA5622D276CcbB8d9BBE3D1ffd1BB11a0032E53F0";

// Temporary policy facet
export const TEMP_POLICY_FACET = "0xeAeDCf8872AB651640f376e221289a583968e10F";

export const POLICY_FACET = "0x93e7Ff7c87B496aE76fFb22d437c9d46461A9B51";

const FUNCTION_SELECTORS = [
  "0xead1a8a0",
  "0xda3d454c",
  "0x5c778605",
  "0x5ec88c79",
  "0x4e79238f",
  "0x5fc7e71e",
  "0x47ef3b3b",
  "0x4ef4c3e1",
  "0x41c728b9",
  "0xeabe7d91",
  "0x51dff989",
  "0x24008a62",
  "0x1ededc91",
  "0xd02f7351",
  "0x6d35bf91",
  "0xbdcdc258",
  "0x6a56947e",
];

export const BNB_EXPLOITER_VTOKEN_BALANCE = BigNumber.from("1104498890317941");
export const NINETY_PERCENT_VTOKENS = BNB_EXPLOITER_VTOKEN_BALANCE.mul(90).div(100);
const TEN_PERCENT_VTOKENS = BigNumber.from(BNB_EXPLOITER_VTOKEN_BALANCE.sub(NINETY_PERCENT_VTOKENS));
const EXCHANGE_RATE = BigNumber.from("247725788703045398268882984");
export const TEN_PERCENT_UNDERLYING = EXCHANGE_RATE.mul(TEN_PERCENT_VTOKENS).div(parseUnits("1", 18)); // 27361285872565036699362.4

export const vip490 = () => {
  const meta = {
    version: "v2",
    title: "",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[])",
        params: [[[TEMP_POLICY_FACET, 1, FUNCTION_SELECTORS]]],
      },

      // Seize VBNB and transfer them to Token Redeemer
      {
        target: VBNB,
        signature: "seize(address,address,uint256)",
        params: [bscmainnet.NORMAL_TIMELOCK, BNB_EXPLOITER, BNB_EXPLOITER_VTOKEN_BALANCE],
      },

      // Restoring original Impl
      {
        target: bscmainnet.UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[])",
        params: [[[POLICY_FACET, 1, FUNCTION_SELECTORS]]],
      },

      // Burn 90% of VBNB
      {
        target: VBNB,
        signature: "transfer(address,uint256)",
        params: [TOKEN_REDEEMER, NINETY_PERCENT_VTOKENS],
      },
      {
        target: TOKEN_REDEEMER,
        signature: "redeemAndTransfer(address,address)",
        params: [VBNB, ethers.constants.AddressZero],
      },

      // Transfer 10% VBNB to Risk fund through Risk fund converter
      {
        target: VBNB,
        signature: "transfer(address,uint256)",
        params: [TOKEN_REDEEMER, TEN_PERCENT_VTOKENS],
      },
      {
        target: TOKEN_REDEEMER,
        signature: "redeemUnderlyingAndTransfer(address,address,uint256,address)",
        params: [VBNB, bscmainnet.NORMAL_TIMELOCK, TEN_PERCENT_UNDERLYING, NORMAL_TIMELOCK],
      },

      {
        target: WBNB,
        signature: "deposit()",
        params: [],
        value: TEN_PERCENT_UNDERLYING.toString(),
      },
      {
        target: WBNB,
        signature: "transfer(address,uint256)",
        params: [RISK_FUND_CONVERTER, TEN_PERCENT_UNDERLYING],
      },
      {
        target: RISK_FUND_CONVERTER,
        signature: "setPoolsAssetsDirectTransfer(address[],address[][],bool[][])",
        params: [[bscmainnet.UNITROLLER], [[WBNB]], [[true]]],
      },

      {
        target: RISK_FUND_CONVERTER,
        signature: "updateAssetsState(address,address)",
        params: [bscmainnet.UNITROLLER, WBNB],
      },
      {
        target: RISK_FUND_CONVERTER,
        signature: "setPoolsAssetsDirectTransfer(address[],address[][],bool[][])",
        params: [[bscmainnet.UNITROLLER], [[WBNB]], [[false]]],
      },
      {
        target: TOKEN_REDEEMER,
        signature: "redeemAndTransfer(address,address)",
        params: [VBNB, bscmainnet.NORMAL_TIMELOCK],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip490;
