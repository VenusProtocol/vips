import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { makeProposal } from "../../../../src/utils";

interface CASE_COMMAND {
  name: string;
  rewardsDistributorOld: string;
  address: string;
  oldSupplySpeed: BigNumber;
  oldBorrowSpeed: BigNumber;
}

export const REWARDS_DISTRIBUTOR_CORE_OLD = "0x134bfDEa7e68733921Bc6A87159FB0d68aBc6Cf8";
export const REWARDS_DISTRIBUTOR_CORE_NEW = "0x886767B62C7ACD601672607373048FFD96Cf27B2";
export const REWARDS_DISTRIBUTOR_LST_OLD = "0x7A91bEd36D96E4e644d3A181c287E0fcf9E9cc98";
export const REWARDS_DISTRIBUTOR_LST_NEW = "0x1e25CF968f12850003Db17E0Dba32108509C4359";
export const XVS = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";

export const VFRAX_CORE = "0x4fAfbDc4F2a9876Bd1764827b26fb8dc4FD1dB95";
export const VSFRAX_CORE = "0x17142a05fe678e9584FA1d88EfAC1bF181bF7ABe";
export const VDAI_CORE = "0xd8AdD9B41D4E1cd64Edad8722AB0bA8D35536657";
export const VTUSD_CORE = "0x13eB80FDBe5C5f4a7039728E258A6f05fb3B912b";

export const VUSDC_CORE = "0x17C07e0c232f2f80DfDbd7a95b942D893A4C5ACb";
export const VUSDT_CORE = "0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E";
export const VWBTC_CORE = "0x8716554364f20BCA783cb2BAA744d39361fd1D8d";
export const VWETH_CORE = "0x7c8ff7d2A1372433726f879BD945fFb250B94c65";
export const VCRVUSD_CORE = "0x672208C10aaAA2F9A6719F449C4C8227bc0BC202";

export const VSFRXETH_LST = "0xF9E9Fe17C00a8B96a8ac20c4E344C8688D7b947E";

/*
REFERENCE VIP
https://github.com/VenusProtocol/vips/pull/277 - CASE A
https://github.com/VenusProtocol/vips/pull/301 - CASE B
https://github.com/VenusProtocol/vips/pull/302 - (PAUSED)
*/

export const XVS_TRANSFERRED_FRAX_SFRAX_CASE_A = parseUnits("4800", 18);
export const XVS_TRANSFERRED_FRAX_SFRAX_CASE_B = parseUnits("3600", 18);
export const XVS_TRANSFERRED_DAI_TUSD_OLD_CASE_B = parseUnits("2100", 18);
export const XVS_TRANSFERRED_LST_OLD = parseUnits("2400", 18);
export const XVS_AMOUNT_CORE_OLD = parseUnits("19946630223281754045521", 0);
export const XVS_AMOUNT_LST_OLD = parseUnits("19256300979232439022849", 0);
0;
// https://etherscan.io/tx/0x261395084b5f1a51d331c72ab2f836d10479b6fbb76b6b8b3094ec440e7de032
export const REWARD_START_BLOCK_CASE_A = parseUnits("19861441", 0);

// https://etherscan.io/tx/0x8eea38407bed27ae0acafd3bce96aefe0f28d4eaed39eef1fe8309daced86e08
export const REWARD_START_BLOCK_CASE_B = parseUnits("20063791", 0);

// https://etherscan.io/tx/0xd20a77569af4004f85a88de6cd49f7f288f8c412bca66620b8a88c131102b864
export const PAUSED_BLOCK_NUMBER = parseUnits("20435458", 0);

// https://etherscan.io/tx/0x8dfd2bf80e8485f5c8a98f908f6e0d47594ed99bea487d362317f45ea0442133
export const START_REWARDING_BLOCK_LST_OLD = parseUnits("20185343", 0);

export const LAST_REWARDING_BLOCK_CASE_D = parseUnits("20509441", 0);

// 4,800 XVS transferred
export const CASE_A_SPEEDS = [
  {
    name: "vFRAX",
    rewardsDistributorOld: REWARDS_DISTRIBUTOR_CORE_OLD,
    address: VFRAX_CORE,
    oldSupplySpeed: parseUnits("1481481481481481", 0),
    oldBorrowSpeed: parseUnits("2222222222222222", 0),
  },
  {
    name: "vsFRAX",
    rewardsDistributorOld: REWARDS_DISTRIBUTOR_CORE_OLD,
    address: VSFRAX_CORE,
    oldSupplySpeed: parseUnits("2222222222222222", 0),
    oldBorrowSpeed: parseUnits("1481481481481481", 0),
  },
];

// 3,600 XVS transferred
export const CASE_B_SPEEDS = [
  {
    name: "vFRAX",
    rewardsDistributorOld: REWARDS_DISTRIBUTOR_CORE_OLD,
    address: VFRAX_CORE,
    oldSupplySpeed: parseUnits("1111111111111111", 0),
    oldBorrowSpeed: parseUnits("1666666666666666", 0),
  },
  {
    name: "vsFRAX",
    rewardsDistributorOld: REWARDS_DISTRIBUTOR_CORE_OLD,
    address: VSFRAX_CORE,
    oldSupplySpeed: parseUnits("1111111111111111", 0),
    oldBorrowSpeed: parseUnits("1666666666666666", 0),
  },
];

// 2,100 XVS transferred
export const CORE_SPEEDS = [
  {
    name: "vDAI",
    rewardsDistributorOld: REWARDS_DISTRIBUTOR_CORE_OLD,
    address: VDAI_CORE,
    oldSupplySpeed: parseUnits("925925925925925", 0),
    oldBorrowSpeed: parseUnits("1388888888888888", 0),
  },
  {
    name: "vTUSD",
    rewardsDistributorOld: REWARDS_DISTRIBUTOR_CORE_OLD,
    address: VTUSD_CORE,
    oldSupplySpeed: parseUnits("370370370370370", 0),
    oldBorrowSpeed: parseUnits("555555555555555", 0),
  },
];

// 2,400 XVS transferred
export const LST_SPEEDS = [
  {
    name: "vSFRXETH",
    rewardsDistributorOld: REWARDS_DISTRIBUTOR_LST_OLD,
    address: VSFRXETH_LST,
    oldSupplySpeed: parseUnits("3703703703703703", 0),
    oldBorrowSpeed: parseUnits("0", 0),
  },
];

const calculateXVSReward = (startBlock: BigNumber, endBlock: BigNumber, CASE: CASE_COMMAND[]) => {
  const blockDelta = endBlock.sub(startBlock);
  let totalXVS = ethers.BigNumber.from(0);
  for (const config of CASE) {
    totalXVS = totalXVS.add(blockDelta.mul(config.oldBorrowSpeed.add(config.oldSupplySpeed)));
  }
  return totalXVS;
};

const XVS_FRAX_SFRAX_CASE_A = calculateXVSReward(REWARD_START_BLOCK_CASE_A, REWARD_START_BLOCK_CASE_B, CASE_A_SPEEDS);
const XVS_FRAX_SFRAX_CASE_B = calculateXVSReward(REWARD_START_BLOCK_CASE_B, PAUSED_BLOCK_NUMBER, CASE_B_SPEEDS);
const XVS_FOR_DAI_TUSD = XVS_TRANSFERRED_DAI_TUSD_OLD_CASE_B.sub(
  calculateXVSReward(REWARD_START_BLOCK_CASE_B, PAUSED_BLOCK_NUMBER, CORE_SPEEDS),
);

// Total XVS transferred - (REWARD_START_BLOCK_CASE_B - REWARD_START_BLOCK_CASE_A + PAUSED_BLOCK_NUMBER - REWARD_START_BLOCK_CASE_B) * (perBlockReward)
export const TOTAL_XVS_FOR_CORE_NEW = XVS_TRANSFERRED_FRAX_SFRAX_CASE_A.add(XVS_TRANSFERRED_FRAX_SFRAX_CASE_B)
  .sub(XVS_FRAX_SFRAX_CASE_A.add(XVS_FRAX_SFRAX_CASE_B))
  .add(XVS_FOR_DAI_TUSD);

export const TOTAL_XVS_FOR_LST_NEW = XVS_TRANSFERRED_LST_OLD.sub(
  calculateXVSReward(START_REWARDING_BLOCK_LST_OLD, PAUSED_BLOCK_NUMBER, LST_SPEEDS),
);

export const vip054 = () => {
  return makeProposal([
    {
      target: REWARDS_DISTRIBUTOR_CORE_OLD,
      signature: "grantRewardToken(address,uint256)",
      params: [REWARDS_DISTRIBUTOR_CORE_NEW, TOTAL_XVS_FOR_CORE_NEW],
    },
    {
      target: REWARDS_DISTRIBUTOR_LST_OLD,
      signature: "grantRewardToken(address,uint256)",
      params: [REWARDS_DISTRIBUTOR_LST_NEW, TOTAL_XVS_FOR_LST_NEW],
    },
  ]);
};
export default vip054;
