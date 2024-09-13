import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

// For bridge purpose
export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const XVS_BRIDGE = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";
export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
export const ETHEREUM_TREASURY = "0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA";
export const ETHEREUM_XVS_RECEIVER = ethers.utils.defaultAbiCoder.encode(["address"], [ETHEREUM_TREASURY]);
export const BRIDGE_XVS_AMOUNT = parseUnits("77856", 18);
export const DEST_CHAIN_ID = 101;
export const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

export const vip364 = () => {
  const meta = {
    version: "v2",
    title: "VIP-364",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
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

export default vip364;
