import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

// For bridge purpose
export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const XVS_BRIDGE = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";
export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
export const ARBITRUM_TREASURY = "0x8a662ceAC418daeF956Bc0e6B2dd417c80CDA631";
export const ARBITRUM_XVS_RECEIVER = ethers.utils.defaultAbiCoder.encode(["address"], [ARBITRUM_TREASURY]);
export const BRIDGE_XVS_AMOUNT = parseUnits("15308", 18);
export const DEST_CHAIN_ID = 110;
export const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
export const BSC_TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";

export const vip368 = () => {
  const meta = {
    version: "v2",
    title: "VIP-368 [Arbitrum] Market Emission Adjustment",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
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
          ARBITRUM_XVS_RECEIVER,
          BRIDGE_XVS_AMOUNT,
          [BSC_TREASURY, ethers.constants.AddressZero, ADAPTER_PARAMS],
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

export default vip368;
