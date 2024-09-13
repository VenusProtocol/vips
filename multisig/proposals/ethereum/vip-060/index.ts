import { ethers } from "hardhat";

import { makeProposal } from "../../../../src/utils";

export const CORE_XVS_REWARDS_DISTRIBUTOR = "0x886767B62C7ACD601672607373048FFD96Cf27B2";
export const CURVE_XVS_REWARDS_DISTRIBUTOR = "0x461dE281c453F447200D67C9Dd31b3046c8f49f8";
export const LST_ETH_XVS_REWARDS_DISTRIBUTOR = "0x1e25CF968f12850003Db17E0Dba32108509C4359";
export const TREASURY = "0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA";
export const XVS = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";

export const BLOCKS_PER_MONTH = 216000;
export const CORE_vWETH_XVS_REWARDS_PER_MONTH = ethers.utils.parseEther("633");
export const CORE_vWBTC_XVS_REWARDS_PER_MONTH = ethers.utils.parseEther("1898");
export const CORE_vUSDT_XVS_REWARDS_PER_MONTH = ethers.utils.parseEther("2279");
export const CORE_vUSDC_XVS_REWARDS_PER_MONTH = ethers.utils.parseEther("2279");
export const LST_vWETH_XVS_REWARDS_PER_MONTH = ethers.utils.parseEther("12375");

export const CORE_XVS_REWARDS_DISTRIBUTOR_AMOUNT = ethers.utils.parseEther("28356");
export const LST_ETH_XVS_REWARDS_DISTRIBUTOR_AMOUNT = ethers.utils.parseEther("49500");

const commands = [
  {
    distributor: CORE_XVS_REWARDS_DISTRIBUTOR,
    vToken: "0x7c8ff7d2A1372433726f879BD945fFb250B94c65", // vWETH_CORE
    supplySpeed: CORE_vWETH_XVS_REWARDS_PER_MONTH.mul(40).div(100).div(BLOCKS_PER_MONTH), // 40%
    borrowSpeed: CORE_vWETH_XVS_REWARDS_PER_MONTH.mul(60).div(100).div(BLOCKS_PER_MONTH), // 60%
  },
  {
    distributor: CORE_XVS_REWARDS_DISTRIBUTOR,
    vToken: "0x8716554364f20BCA783cb2BAA744d39361fd1D8d", // vWBTC_CORE
    supplySpeed: CORE_vWBTC_XVS_REWARDS_PER_MONTH.mul(40).div(100).div(BLOCKS_PER_MONTH), // 40%
    borrowSpeed: CORE_vWBTC_XVS_REWARDS_PER_MONTH.mul(60).div(100).div(BLOCKS_PER_MONTH), // 60%
  },
  {
    distributor: CORE_XVS_REWARDS_DISTRIBUTOR,
    vToken: "0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E", // vUSDT_CORE
    supplySpeed: CORE_vUSDT_XVS_REWARDS_PER_MONTH.mul(40).div(100).div(BLOCKS_PER_MONTH), // 40%
    borrowSpeed: CORE_vUSDT_XVS_REWARDS_PER_MONTH.mul(60).div(100).div(BLOCKS_PER_MONTH), // 60%
  },
  {
    distributor: CORE_XVS_REWARDS_DISTRIBUTOR,
    vToken: "0x17C07e0c232f2f80DfDbd7a95b942D893A4C5ACb", // vUSDC_CORE
    supplySpeed: CORE_vUSDC_XVS_REWARDS_PER_MONTH.mul(40).div(100).div(BLOCKS_PER_MONTH), // 40%
    borrowSpeed: CORE_vUSDC_XVS_REWARDS_PER_MONTH.mul(60).div(100).div(BLOCKS_PER_MONTH), // 60%
  },
  {
    distributor: CORE_XVS_REWARDS_DISTRIBUTOR,
    vToken: "0x672208C10aaAA2F9A6719F449C4C8227bc0BC202", // vcrvUSD_CORE
    supplySpeed: "0",
    borrowSpeed: "0",
  },
  {
    distributor: CORE_XVS_REWARDS_DISTRIBUTOR,
    vToken: "0x4fAfbDc4F2a9876Bd1764827b26fb8dc4FD1dB95", // vFRAX_CORE
    supplySpeed: "0",
    borrowSpeed: "0",
  },
  {
    distributor: CORE_XVS_REWARDS_DISTRIBUTOR,
    vToken: "0x17142a05fe678e9584FA1d88EfAC1bF181bF7ABe", // vsFRAX_CORE
    supplySpeed: "0",
    borrowSpeed: "0",
  },
  {
    distributor: CORE_XVS_REWARDS_DISTRIBUTOR,
    vToken: "0x13eB80FDBe5C5f4a7039728E258A6f05fb3B912b", // vTUSD_CORE
    supplySpeed: "0",
    borrowSpeed: "0",
  },
  {
    distributor: CORE_XVS_REWARDS_DISTRIBUTOR,
    vToken: "0xd8AdD9B41D4E1cd64Edad8722AB0bA8D35536657", // vDAI_CORE
    supplySpeed: "0",
    borrowSpeed: "0",
  },
  {
    distributor: CURVE_XVS_REWARDS_DISTRIBUTOR,
    vToken: "0x30aD10Bd5Be62CAb37863C2BfcC6E8fb4fD85BDa", // vCRV_CURVE
    supplySpeed: "0",
    borrowSpeed: "0",
  },
  {
    distributor: CURVE_XVS_REWARDS_DISTRIBUTOR,
    vToken: "0x2d499800239C4CD3012473Cb1EAE33562F0A6933", // vcrvUSD_CURVE
    supplySpeed: "0",
    borrowSpeed: "0",
  },
  {
    distributor: LST_ETH_XVS_REWARDS_DISTRIBUTOR,
    vToken: "0xc82780Db1257C788F262FBbDA960B3706Dfdcaf2", // vWETH_LST
    supplySpeed: LST_vWETH_XVS_REWARDS_PER_MONTH.mul(30).div(100).div(BLOCKS_PER_MONTH), // 30%
    borrowSpeed: LST_vWETH_XVS_REWARDS_PER_MONTH.mul(70).div(100).div(BLOCKS_PER_MONTH), // 70%
  },
  {
    distributor: LST_ETH_XVS_REWARDS_DISTRIBUTOR,
    vToken: "0x4a240F0ee138697726C8a3E43eFE6Ac3593432CB", // vwstETH_LST
    supplySpeed: "0",
    borrowSpeed: "0",
  },
  {
    distributor: LST_ETH_XVS_REWARDS_DISTRIBUTOR,
    vToken: "0xF9E9Fe17C00a8B96a8ac20c4E344C8688D7b947E", // vsfrxETH_LST
    supplySpeed: "0",
    borrowSpeed: "0",
  }
]

export const vip060 = () => {
  return makeProposal([
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [XVS, CORE_XVS_REWARDS_DISTRIBUTOR_AMOUNT, CORE_XVS_REWARDS_DISTRIBUTOR],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [XVS, LST_ETH_XVS_REWARDS_DISTRIBUTOR_AMOUNT, LST_ETH_XVS_REWARDS_DISTRIBUTOR],
    },
    ...commands.map((command) => {
      return {
        target: command.distributor,
        signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
        params: [
          [command.vToken],
          [command.supplySpeed],
          [command.borrowSpeed],
        ],
      };
    })
  ]);
};

export default vip060;
