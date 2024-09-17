import { ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { opsepolia, bsctestnet } = NETWORK_ADDRESSES;

export const XVS_BRIDGE_ADMIN = "0xB164Cb262328Ca44a806bA9e3d4094931E658513";
export const XVS_BRIDGE_SRC = "0x0E132cd94fd70298b747d2b4D977db8d086e5fD0";

export const RECEIVER_ADDRESS = ethers.utils.defaultAbiCoder.encode(["address"], [opsepolia.VTREASURY]);
export const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
export const XVS_AMOUNT = parseUnits("8600", 18);
export const DEST_CHAIN_ID = 10232;

export const vip366 = () => {
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
        target: bsctestnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [bsctestnet.XVS, XVS_AMOUNT, bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE_SRC, 0],
      },
      {
        target: bsctestnet.XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE_SRC, XVS_AMOUNT],
      },
      {
        target: XVS_BRIDGE_SRC,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          bsctestnet.NORMAL_TIMELOCK,
          DEST_CHAIN_ID,
          RECEIVER_ADDRESS,
          XVS_AMOUNT,
          [bsctestnet.NORMAL_TIMELOCK, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: "300000000000000000",
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip366;
