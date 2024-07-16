import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../../src/utils";

export const BLOCKS_PER_YEAR = BigNumber.from(2628000); // assuming a block is mined every 12 seconds
export const BLOCKS_IN_30_DAYS = BLOCKS_PER_YEAR.mul(30).div(365);

export const CORE_vWETH = "0x7c8ff7d2A1372433726f879BD945fFb250B94c65";
export const CORE_vWBTC = "0x8716554364f20BCA783cb2BAA744d39361fd1D8d";
export const CORE_vUSDT = "0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E";
export const CORE_vUSDC = "0x17C07e0c232f2f80DfDbd7a95b942D893A4C5ACb";
export const CORE_vcrvUSD = "0x672208C10aaAA2F9A6719F449C4C8227bc0BC202";

export const CURVE_vCRV = "0x30aD10Bd5Be62CAb37863C2BfcC6E8fb4fD85BDa";
export const CURVE_vcrvUSD = "0x2d499800239C4CD3012473Cb1EAE33562F0A6933";
export const LST_vWETH = "0xc82780Db1257C788F262FBbDA960B3706Dfdcaf2";
export const LST_vwstETH = "0x4a240F0ee138697726C8a3E43eFE6Ac3593432CB";

export const OLD_CORE_XVS_DISTRIBUTOR = "0x134bfDEa7e68733921Bc6A87159FB0d68aBc6Cf8";
export const OLD_CURVE_XVS_DISTRIBUTOR = "0x8473B767F68250F5309bae939337136a899E43F9";
export const OLD_LST_XVS_DISTRIBUTOR = "0x7A91bEd36D96E4e644d3A181c287E0fcf9E9cc98";

export const CORE_XVS_DISTRIBUTOR = "0x886767B62C7ACD601672607373048FFD96Cf27B2";
export const CURVE_XVS_DISTRIBUTOR = "0x461dE281c453F447200D67C9Dd31b3046c8f49f8";
export const LST_XVS_DISTRIBUTOR = "0x1e25CF968f12850003Db17E0Dba32108509C4359";

export const CORE_COMPTROLLER = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";
export const CURVE_COMPTROLLER = "0x67aA3eCc5831a65A5Ba7be76BED3B5dc7DB60796";
export const LST_COMPTROLLER = "0xF522cd0360EF8c2FF48B648d53EA1717Ec0F3Ac3";

export const TREASURY = "0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA";
export const XVS = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";

export const CORE_SPEEDS = [
  {
    name: "vWETH",
    address: CORE_vWETH,
    reward: parseUnits("1125", 18),
    supplySpeedPercentage: 40,
    borrowSpeedPercentage: 60,
  },
  {
    name: "vWBTC",
    address: CORE_vWBTC,
    reward: parseUnits("3375", 18),
    supplySpeedPercentage: 40,
    borrowSpeedPercentage: 60,
  },
  {
    name: "vUSDT",
    address: CORE_vUSDT,
    reward: parseUnits("3375", 18),
    supplySpeedPercentage: 40,
    borrowSpeedPercentage: 60,
  },
  {
    name: "vUSDC",
    address: CORE_vUSDC,
    reward: parseUnits("3375", 18),
    supplySpeedPercentage: 40,
    borrowSpeedPercentage: 60,
  },
  {
    name: "vcrvUSD",
    address: CORE_vcrvUSD,
    reward: parseUnits("1500", 18),
    supplySpeedPercentage: 40,
    borrowSpeedPercentage: 60,
  },
];

export const CURVE_SPEEDS = [
  {
    name: "vCRV",
    address: CURVE_vCRV,
    reward: parseUnits("375", 18),
    supplySpeedPercentage: 40,
    borrowSpeedPercentage: 60,
    distributor: CURVE_XVS_DISTRIBUTOR,
  },
  {
    name: "vcrvUSD",
    address: CURVE_vcrvUSD,
    reward: parseUnits("375", 18),
    supplySpeedPercentage: 40,
    borrowSpeedPercentage: 60,
    distributor: CURVE_XVS_DISTRIBUTOR,
  },
];

export const LST_SPEEDS = [
  {
    name: "vWETH",
    address: LST_vWETH,
    reward: parseUnits("18333", 18),
    supplySpeedPercentage: 30,
    borrowSpeedPercentage: 70,
    distributor: LST_XVS_DISTRIBUTOR,
  },
  {
    name: "vwstETH",
    address: LST_vwstETH,
    reward: parseUnits("3600", 18),
    supplySpeedPercentage: 100,
    borrowSpeedPercentage: 0,
    distributor: LST_XVS_DISTRIBUTOR,
  },
];

const getSupplySpeedPerBlock = ({
  reward,
  supplySpeedPercentage,
}: {
  reward: BigNumber;
  supplySpeedPercentage: number;
}) => {
  return reward.mul(supplySpeedPercentage).div(100).div(BLOCKS_IN_30_DAYS);
};

const getBorrowSpeedPerBlock = ({
  reward,
  borrowSpeedPercentage,
}: {
  reward: BigNumber;
  borrowSpeedPercentage: number;
}) => {
  return reward.mul(borrowSpeedPercentage).div(100).div(BLOCKS_IN_30_DAYS);
};

export const TOTAL_XVS_FOR_CORE = parseUnits("29571", 18);
export const TOTAL_XVS_FOR_CURVE = parseUnits("1739", 18);
export const TOTAL_XVS_FOR_LST = parseUnits("50870", 18);

export const vip042 = () => {
  return makeProposal([
    {
      target: CORE_XVS_DISTRIBUTOR,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: CURVE_XVS_DISTRIBUTOR,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: LST_XVS_DISTRIBUTOR,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: CORE_COMPTROLLER,
      signature: "addRewardsDistributor(address)",
      params: [CORE_XVS_DISTRIBUTOR],
    },
    {
      target: CURVE_COMPTROLLER,
      signature: "addRewardsDistributor(address)",
      params: [CURVE_XVS_DISTRIBUTOR],
    },
    {
      target: LST_COMPTROLLER,
      signature: "addRewardsDistributor(address)",
      params: [LST_XVS_DISTRIBUTOR],
    },
    {
      target: OLD_CORE_XVS_DISTRIBUTOR,
      signature: "grantRewardToken(address,uint256)",
      params: [CORE_XVS_DISTRIBUTOR, TOTAL_XVS_FOR_CORE],
    },
    {
      target: OLD_CURVE_XVS_DISTRIBUTOR,
      signature: "grantRewardToken(address,uint256)",
      params: [CURVE_XVS_DISTRIBUTOR, TOTAL_XVS_FOR_CURVE],
    },
    {
      target: OLD_LST_XVS_DISTRIBUTOR,
      signature: "grantRewardToken(address,uint256)",
      params: [LST_XVS_DISTRIBUTOR, TOTAL_XVS_FOR_LST],
    },
    {
      target: CORE_XVS_DISTRIBUTOR,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [
        CORE_SPEEDS.map(({ address }) => address),
        CORE_SPEEDS.map(getSupplySpeedPerBlock),
        CORE_SPEEDS.map(getBorrowSpeedPerBlock),
      ],
      value: "0",
    },
    {
      target: CURVE_XVS_DISTRIBUTOR,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [
        CURVE_SPEEDS.map(({ address }) => address),
        CURVE_SPEEDS.map(getSupplySpeedPerBlock),
        CURVE_SPEEDS.map(getBorrowSpeedPerBlock),
      ],
      value: "0",
    },
    {
      target: LST_XVS_DISTRIBUTOR,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [
        LST_SPEEDS.map(({ address }) => address),
        LST_SPEEDS.map(getSupplySpeedPerBlock),
        LST_SPEEDS.map(getBorrowSpeedPerBlock),
      ],
      value: "0",
    },
  ]);
};

export default vip042;
