import { ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const XVS_BRIDGE_ADMIN = "0x5D08D49A2e43aC4c72C60754d1550BA12e846d66";
export const XVS_BRIDGE_SRC = "0x963cAbDC5bb51C1479ec94Df44DE2EC1a49439E3";
export const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
export const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const TREASURY = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";
export const XVS = "0xB9e0E753630434d7863528cc73CB7AC638a7c8ff";

export const RECEIVER_ADDRESS = ethers.utils.defaultAbiCoder.encode(["address"], [TREASURY]);
export const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
export const XVS_AMOUNT = parseUnits("5000", 18);
export const DEST_CHAIN_ID = 10161;

export const vip213Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP to transfer XVS to destination chain",
    description: ``,

    forDescription: "I agree that Venus Protocol should proceed with this transfer for XVS",
    againstDescription: "I do not think that Venus Protocol should proceed with this transfer for XVS",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this transfer for XVS",
  };

  return makeProposal(
    [
      {
        target: XVS_BRIDGE_ADMIN,
        signature: "setWhitelist(address,bool)",
        params: [NORMAL_TIMELOCK, true],
      },
      {
        target: COMPTROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [NORMAL_TIMELOCK, XVS_AMOUNT],
      },
      {
        target: XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE_SRC, 0],
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
          DEST_CHAIN_ID,
          RECEIVER_ADDRESS,
          XVS_AMOUNT,
          [NORMAL_TIMELOCK, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: "3000000000000000",
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
