import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { sepolia } = NETWORK_ADDRESSES;

export const MOCK_ACCOUNTANT = "0x04d7B1244Ff052319D154E627004EaE5b7a05FCf";
export const ACCOUNTANT_ORACLE = "0x64672DD083F847893F307fe85c6f9C122F2EE3EB";
const RATE = "1004263421125944312";
export const weETHs = "0xE233527306c2fa1E159e251a2E5893334505A5E0";


export const vip052 = () => {
  return makeProposal([
    // Configure Oracle
    {
      target: MOCK_ACCOUNTANT,
      signature: "setRate(uint256)",
      params: [RATE],
    },
    {
      target: sepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          weETHs,
          [ACCOUNTANT_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
          [true, false, false],
        ],
      ],
    },
  ]);
};

export default vip052;
