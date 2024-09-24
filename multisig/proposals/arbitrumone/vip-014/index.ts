import { ethers } from "hardhat";

import { makeProposal } from "../../../../src/utils";

export const CORE_XVS_REWARDS_DISTRIBUTOR = "0x53b488baA4052094495b6De9E5505FE1Ee3EAc7a";
export const LST_ETH_XVS_REWARDS_DISTRIBUTOR = "0x6204Bae72dE568384Ca4dA91735dc343a0C7bD6D";
export const TREASURY = "0x8a662ceAC418daeF956Bc0e6B2dd417c80CDA631";
export const XVS = "0xc1Eb7689147C81aC840d4FF0D298489fc7986d52";

export const BLOCKS_PER_MONTH = 2592000;
export const CORE_vARB_XVS_REWARDS_PER_MONTH = ethers.utils.parseEther("319");
export const CORE_vETH_XVS_REWARDS_PER_MONTH = ethers.utils.parseEther("319");
export const CORE_vBTC_XVS_REWARDS_PER_MONTH = ethers.utils.parseEther("638");
export const CORE_vUSDT_XVS_REWARDS_PER_MONTH = ethers.utils.parseEther("638");
export const CORE_vUSDC_XVS_REWARDS_PER_MONTH = ethers.utils.parseEther("638");

export const CORE_XVS_REWARDS_DISTRIBUTOR_AMOUNT = ethers.utils.parseEther("10208");
export const LST_ETH_XVS_REWARDS_DISTRIBUTOR_AMOUNT = ethers.utils.parseEther("5100");

export const commands = [
  {
    distributor: CORE_XVS_REWARDS_DISTRIBUTOR,
    vToken: "0xAeB0FEd69354f34831fe1D16475D9A83ddaCaDA6", // vARB_CORE
    supplySpeed: CORE_vARB_XVS_REWARDS_PER_MONTH.mul(40).div(100).div(BLOCKS_PER_MONTH), // 40%
    borrowSpeed: CORE_vARB_XVS_REWARDS_PER_MONTH.mul(60).div(100).div(BLOCKS_PER_MONTH), // 60%
  },
  {
    distributor: CORE_XVS_REWARDS_DISTRIBUTOR,
    vToken: "0x68a34332983f4Bf866768DD6D6E638b02eF5e1f0", // vETH_CORE
    supplySpeed: CORE_vETH_XVS_REWARDS_PER_MONTH.mul(40).div(100).div(BLOCKS_PER_MONTH), // 40%
    borrowSpeed: CORE_vETH_XVS_REWARDS_PER_MONTH.mul(60).div(100).div(BLOCKS_PER_MONTH), // 60%
  },
  {
    distributor: CORE_XVS_REWARDS_DISTRIBUTOR,
    vToken: "0xaDa57840B372D4c28623E87FC175dE8490792811", // vBTC_CORE
    supplySpeed: CORE_vBTC_XVS_REWARDS_PER_MONTH.mul(40).div(100).div(BLOCKS_PER_MONTH), // 40%
    borrowSpeed: CORE_vBTC_XVS_REWARDS_PER_MONTH.mul(60).div(100).div(BLOCKS_PER_MONTH), // 60%
  },
  {
    distributor: CORE_XVS_REWARDS_DISTRIBUTOR,
    vToken: "0xB9F9117d4200dC296F9AcD1e8bE1937df834a2fD", // vUSDT_CORE
    supplySpeed: CORE_vUSDT_XVS_REWARDS_PER_MONTH.mul(40).div(100).div(BLOCKS_PER_MONTH), // 40%
    borrowSpeed: CORE_vUSDT_XVS_REWARDS_PER_MONTH.mul(60).div(100).div(BLOCKS_PER_MONTH), // 60%
  },
  {
    distributor: CORE_XVS_REWARDS_DISTRIBUTOR,
    vToken: "0x7D8609f8da70fF9027E9bc5229Af4F6727662707", // vUSDC_CORE
    supplySpeed: CORE_vUSDC_XVS_REWARDS_PER_MONTH.mul(40).div(100).div(BLOCKS_PER_MONTH), // 40%
    borrowSpeed: CORE_vUSDC_XVS_REWARDS_PER_MONTH.mul(60).div(100).div(BLOCKS_PER_MONTH), // 60%
  },
];

export const vip014 = () => {
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
    ...commands.map(command => {
      return {
        target: command.distributor,
        signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
        params: [[command.vToken], [command.supplySpeed], [command.borrowSpeed]],
      };
    }),
  ]);
};

export default vip014;
