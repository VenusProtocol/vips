import { ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const XVS_BRIDGE_ADMIN = "0xB164Cb262328Ca44a806bA9e3d4094931E658513";
export const XVS_BRIDGE_SRC = "0x0E132cd94fd70298b747d2b4D977db8d086e5fD0";
export const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
export const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const SEPOLIA_TREASURY = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";
export const XVS = "0xB9e0E753630434d7863528cc73CB7AC638a7c8ff";

export const RECEIVER_ADDRESS = ethers.utils.defaultAbiCoder.encode(["address"], [SEPOLIA_TREASURY]);
export const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
export const XVS_AMOUNT = parseUnits("75750", 18);
export const DEST_CHAIN_ID = 10161;

export const vip272 = () => {
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
        value: "300000000000000000",
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip272;
