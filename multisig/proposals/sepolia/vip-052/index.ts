import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { sepolia } = NETWORK_ADDRESSES;

const weETHs_ONE_JUMP_REDSTONE_ORACLE = "0x0EC39B9846539699A5c2371f324ba46865804988";
export const weETHs = "0xE233527306c2fa1E159e251a2E5893334505A5E0";

export const vip052 = () => {
  return makeProposal([
    // Configure Oracle
    {
      target: sepolia.REDSTONE_ORACLE,
      signature: "setDirectPrice(address,uint256)",
      params: [weETHs, parseUnits("1", 18)],
    },
    {
      target: sepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          weETHs,
          [weETHs_ONE_JUMP_REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
          [true, false, false],
        ],
      ],
    },
  ]);
};

export default vip052;
