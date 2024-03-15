import { ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const XVS_BRIDGE_ADMIN = "0x70d644877b7b73800E9073BCFCE981eAaB6Dbc21";
export const XVS_BRIDGE_SRC = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";
export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const ETHEREUM_TREASURY = "0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA";
export const BSC_TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";

export const RECEIVER_ADDRESS = ethers.utils.defaultAbiCoder.encode(["address"], [ETHEREUM_TREASURY]);
export const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
export const XVS_AMOUNT = parseUnits("166990", 18);
export const DEST_ENDPOINT_ID = 101;

export const TOKEN_REDEEMER = "0x67B10f3BC6B141D67c598C73CEe45E6635292Acd";
export const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
export const VETH = "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8";
export const VETH_AMOUNT = parseUnits("1453.28319", 8); // (close to 30 ETH, taking into account 1 ETH=48.442773 vETH)

export const vip213 = () => {
  const meta = {
    version: "v2",
    title: "VIP to transfer XVS to ethereum chain",
    description: ``,

    forDescription: "I agree that Venus Protocol should proceed with this transfer for XVS",
    againstDescription: "I do not think that Venus Protocol should proceed with this transfer for XVS",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this transfer for XVS",
  };

  return makeProposal(
    [
      {
        target: BSC_TREASURY,
        signature: "withdrawTreasuryBNB(uint256,address)",
        params: [parseUnits("0.5", 18), NORMAL_TIMELOCK],
        value: "0",
      },
      {
        target: COMPTROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [NORMAL_TIMELOCK, XVS_AMOUNT],
      },
      {
        target: XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE_SRC, XVS_AMOUNT],
      },
      {
        target: XVS_BRIDGE_SRC,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          NORMAL_TIMELOCK,
          DEST_ENDPOINT_ID,
          RECEIVER_ADDRESS,
          XVS_AMOUNT,
          [BSC_TREASURY, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: "500000000000000000",
      },
      {
        target: XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE_SRC, 0],
      },
      {
        target: BSC_TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [VETH, VETH_AMOUNT, TOKEN_REDEEMER],
      },
      {
        target: TOKEN_REDEEMER,
        signature: "redeemAndTransfer(address,address)",
        params: [VETH, COMMUNITY_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
