import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const XVS_BRIDGE_ADMIN = "0xB164Cb262328Ca44a806bA9e3d4094931E658513";
export const XVS_BRIDGE_SRC = "0x0E132cd94fd70298b747d2b4D977db8d086e5fD0";
export const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
export const XVS = "0xB9e0E753630434d7863528cc73CB7AC638a7c8ff";
export const VTREASURY = "0x8b293600c50d6fbdc6ed4251cc75ece29880276f";

export const ARBITRUM_SEPOLIA_VTREASURY = "0x4e7ab1fD841E1387Df4c91813Ae03819C33D5bdB";

export const RECEIVER_ADDRESS = ethers.utils.defaultAbiCoder.encode(["address"], [ARBITRUM_SEPOLIA_VTREASURY]);
export const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
export const XVS_AMOUNT = parseUnits("5000", 18);
export const DEST_CHAIN_ID = 10231;

const vip323 = () => {
  const meta = {
    version: "v2",
    title: "VIP-323 Bootstrap XVS liquidity for the Arbitrum Sepolia rewards",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [XVS, XVS_AMOUNT, NORMAL_TIMELOCK],
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
        value: "100000000000000000",
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip323;
