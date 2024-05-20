import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { ethereum } = NETWORK_ADDRESSES;

export const PENDLE_ORACLE = "0xA1eA3cB0FeA73a6c53aB07CcC703Dc039D8EAFb4";
export const PTweETH = "0x6ee2b5E19ECBa773a352E5B21415Dc419A700d1d";
export const VTREASURY = "0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA";
export const vPTweETH = "0x76697f8eaeA4bE01C678376aAb97498Ee8f80D5C";
export const COMPTROLLER = "0xF522cd0360EF8c2FF48B648d53EA1717Ec0F3Ac3";
export const INITIAL_SUPPLY = parseUnits("1.799618792392372642", 18);
export const REDUCE_RESERVES_BLOCK_DELTA = 7200;

export const vip029 = () => {
  return makeProposal([
    // Configure Oracle
    {
      target: ethereum.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [PTweETH, [PENDLE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero], [true, false, false]],
      ],
    },

    // Add Market
    {
      target: VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [PTweETH, INITIAL_SUPPLY, ethereum.NORMAL_TIMELOCK],
    },
    {
      target: PTweETH,
      signature: "approve(address,uint256)",
      params: [ethereum.POOL_REGISTRY, 0],
    },
    {
      target: PTweETH,
      signature: "approve(address,uint256)",
      params: [ethereum.POOL_REGISTRY, INITIAL_SUPPLY],
    },
    {
      target: vPTweETH,
      signature: "setReduceReservesBlockDelta(uint256)",
      params: [REDUCE_RESERVES_BLOCK_DELTA],
    },
    {
      target: ethereum.POOL_REGISTRY,
      signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
      params: [
        [
          vPTweETH,
          "750000000000000000",
          "800000000000000000",
          INITIAL_SUPPLY,
          VTREASURY,
          "1200000000000000000000",
          "0",
        ],
      ],
    },
    {
      target: COMPTROLLER,
      signature: "setActionsPaused(address[],uint8[],bool)",
      params: [[vPTweETH], [2], true],
    },
  ]);
};

export default vip029;
