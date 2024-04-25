import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { sepolia } = NETWORK_ADDRESSES;

export const PENDLE_ORACLE = "0xAF83f9C9d849B6FF3A33da059Bf14A0E85493eb4";
export const PTweETH = "0x56107201d3e4b7Db92dEa0Edb9e0454346AEb8B5";
export const VTREASURY = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";
export const vPTweETH = "0x3AF2bE7AbEF0f840b196D99d79F4B803a5dB14a1";
export const COMPTROLLER = "0xd79CeB8EF8188E44b7Eb899094e8A3A4d7A1e236";
export const INITIAL_SUPPLY = parseUnits("1.799618792392372642", 18);

export const MOCK_PENDLE_PT_ORACLE = "0xF5B307640435D38A5A8eE8b6665d24Bb098F11db";
export const AMOUNT_FOR_SHARE = parseUnits("1.035397719468640492", 18);
export const PTweETH_MARKET = "0x0000000000000000000000000000000000000001";
export const TWAP_DURATION = 1800;
export const EXCHANGE_RATE = parseUnits("0.953250807232573837", 18);

export const vip023 = () => {
  return makeProposal([
    // Configure Oracle
    {
      target: sepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [PTweETH, [PENDLE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero], [true, false, false]],
      ],
    },
    {
      target: MOCK_PENDLE_PT_ORACLE,
      signature: "setPtToAssetRate(address,uint32,uint256)",
      params: [PTweETH_MARKET, TWAP_DURATION, EXCHANGE_RATE],
    },

    // Add Market
    {
      target: PTweETH,
      signature: "faucet(uint256)",
      params: [INITIAL_SUPPLY],
    },
    {
      target: PTweETH,
      signature: "transfer(address,uint256)",
      params: [VTREASURY, INITIAL_SUPPLY],
    },
    {
      target: VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [PTweETH, INITIAL_SUPPLY, sepolia.NORMAL_TIMELOCK],
      value: "0",
    },
    {
      target: PTweETH,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, 0],
      value: "0",
    },
    {
      target: PTweETH,
      signature: "approve(address,uint256)",
      params: [sepolia.POOL_REGISTRY, INITIAL_SUPPLY],
      value: "0",
    },
    {
      target: vPTweETH,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: ["7200"],
    },
    {
      target: sepolia.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          vPTweETH,
          "750000000000000000",
          "800000000000000000",
          INITIAL_SUPPLY,
          VTREASURY,
          "3750000000000000000000",
          "375000000000000000000",
        ],
      ],
    },
  ]);
};

export default vip023;
