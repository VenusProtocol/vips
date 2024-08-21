import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { sepolia } = NETWORK_ADDRESSES;

export const MOCK_ACCOUNTANT = "0x04d7B1244Ff052319D154E627004EaE5b7a05FCf";
export const ACCOUNTANT_ORACLE = "0x64672DD083F847893F307fe85c6f9C122F2EE3EB";
const RATE = "1004263421125944312";
export const weETHs = "0xE233527306c2fa1E159e251a2E5893334505A5E0";
const INITIAL_SUPPLY = parseUnits("10.009201470952191487", 18);
export const SUPPLY_CAP = parseUnits("180", 18);
export const BORROW_CAP = parseUnits("0", 18);
const CF = parseUnits("0.8", 18);
const LT = parseUnits("0.85", 18);
export const vweETHs = "0xB3A201887396F57bad3fF50DFd02022fE1Fd1774";
export const LIQUID_STAKED_COMPTROLLER = "0xd79CeB8EF8188E44b7Eb899094e8A3A4d7A1e236";

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
        [weETHs, [ACCOUNTANT_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero], [true, false, false]],
      ],
    },

    // Add Market
    {
      target: weETHs,
      signature: "faucet(uint256)",
      params: [INITIAL_SUPPLY],
    },
    {
      target: weETHs,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
    },
    {
      target: weETHs,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, INITIAL_SUPPLY],
    },
    {
      target: vweETHs,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["7200"],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [[vweETHs, CF, LT, INITIAL_SUPPLY, sepolia.VTREASURY, SUPPLY_CAP, BORROW_CAP]],
    },
    {
      target: vweETHs,
      signature: "setProtocolSeizeShare(uint256)",
      params: [parseUnits("0.01", 18)],
    },
    {
      target: LIQUID_STAKED_COMPTROLLER,
      signature: "setActionsPaused(address[],uint8[],bool)",
      params: [[vweETHs], [2], true],
    },
  ]);
};

export default vip052;
