import { BigNumber } from "ethers";
import { makeProposal } from "../../../../src/utils";
import { parseUnits } from "ethers/lib/utils";

export const BLOCKS_PER_YEAR = BigNumber.from(2628000); // assuming a block is mined every 12 seconds
export const BLOCKS_IN_30_DAYS = BLOCKS_PER_YEAR.mul(30).div(365);

export const CORE_vwETH = "0x7c8ff7d2A1372433726f879BD945fFb250B94c65";
export const CORE_vWBTC = "0x8716554364f20BCA783cb2BAA744d39361fd1D8d";
export const CORE_vUSDT = "0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E";
export const CORE_vUSDC = "0x17C07e0c232f2f80DfDbd7a95b942D893A4C5ACb";
export const CORE_vcrvUSD = "0x672208C10aaAA2F9A6719F449C4C8227bc0BC202";
export const CORE_vFRAX = "0x4fAfbDc4F2a9876Bd1764827b26fb8dc4FD1dB95";
export const CORE_vsFRAX = "0x17142a05fe678e9584FA1d88EfAC1bF181bF7ABe";
export const CORE_vTUSD = "0x13eB80FDBe5C5f4a7039728E258A6f05fb3B912b";
export const CORE_vDAI = "0xd8AdD9B41D4E1cd64Edad8722AB0bA8D35536657";
export const CURVE_vCRV = "0x30aD10Bd5Be62CAb37863C2BfcC6E8fb4fD85BDa";
export const CURVE_vcrvUSD = "0x2d499800239C4CD3012473Cb1EAE33562F0A6933";
export const LST_vwETH = "0xc82780Db1257C788F262FBbDA960B3706Dfdcaf2";
export const LST_vwstETH = "0x4a240F0ee138697726C8a3E43eFE6Ac3593432CB";
export const LST_vweETH = "0xb4933AF59868986316Ed37fa865C829Eba2df0C7";

export const CORE_XVS_DISTRIBUTOR = "0x134bfDEa7e68733921Bc6A87159FB0d68aBc6Cf8";
export const CURVE_XVS_DISTRIBUTOR = "0x8473B767F68250F5309bae939337136a899E43F9";
export const LST_XVS_DISTRIBUTOR = "0x7A91bEd36D96E4e644d3A181c287E0fcf9E9cc98";

export const SPEEDS = [
  {
    name: "vweETH",
    address: CORE_vwETH,
    reward: parseUnits("1125", 18),
    supplySpeedPercentage: 40,
    borrowSpeedPercentage: 60,
    distributor: CORE_XVS_DISTRIBUTOR,
  },
  {
    name: "vWBTC",
    address: CORE_vWBTC,
    reward: parseUnits("3375", 18),
    supplySpeedPercentage: 40,
    borrowSpeedPercentage: 60,
    distributor: CORE_XVS_DISTRIBUTOR,
  },
  {
    name: "vUSDT",
    address: CORE_vUSDT,
    reward: parseUnits("3375", 18),
    supplySpeedPercentage: 40,
    borrowSpeedPercentage: 60,
    distributor: CORE_XVS_DISTRIBUTOR,
  },
  {
    name: "vUSDC",
    address: CORE_vUSDC,
    reward: parseUnits("3375", 18),
    supplySpeedPercentage: 40,
    borrowSpeedPercentage: 60,
    distributor: CORE_XVS_DISTRIBUTOR,
  },
  {
    name: "vcrvUSD",
    address: CORE_vcrvUSD,
    reward: parseUnits("1500", 18),
    supplySpeedPercentage: 40,
    borrowSpeedPercentage: 60,
    distributor: CORE_XVS_DISTRIBUTOR,
  },
  {
    name: "vFRAX",
    address: CORE_vFRAX,
    reward: parseUnits("600", 18),
    supplySpeedPercentage: 40,
    borrowSpeedPercentage: 60,
    distributor: CORE_XVS_DISTRIBUTOR,
  },
  {
    name: "vsFRAX",
    address: CORE_vsFRAX,
    reward: parseUnits("600", 18),
    supplySpeedPercentage: 40,
    borrowSpeedPercentage: 60,
    distributor: CORE_XVS_DISTRIBUTOR,
  },
  {
    name: "vTUSD",
    address: CORE_vTUSD,
    reward: parseUnits("200", 18),
    supplySpeedPercentage: 40,
    borrowSpeedPercentage: 60,
    distributor: CORE_XVS_DISTRIBUTOR,
  },
  {
    name: "vDAI",
    address: CORE_vDAI,
    reward: parseUnits("500", 18),
    supplySpeedPercentage: 40,
    borrowSpeedPercentage: 60,
    distributor: CORE_XVS_DISTRIBUTOR,
  },
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
  {
    name: "vWETH",
    address: LST_vwETH,
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
  {
    name: "vweETH",
    address: LST_vweETH,
    reward: parseUnits("0", 18),
    supplySpeedPercentage: 40,
    borrowSpeedPercentage: 60,
    distributor: LST_XVS_DISTRIBUTOR,
  },
]

const commands = SPEEDS.map((speed) => {
  const totalAmount = speed.reward;
  const supplyAmount = totalAmount.mul(speed.supplySpeedPercentage).div(100);
  const supplySpeed = supplyAmount.div(BLOCKS_IN_30_DAYS);
  const borrowAmount = totalAmount.mul(speed.borrowSpeedPercentage).div(100);
  const borrowSpeed = borrowAmount.div(BLOCKS_IN_30_DAYS);

  return {
    target: speed.distributor,
    signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
    params: [
      [speed.address],
      [supplySpeed],
      [borrowSpeed],
    ],
    value: "0",
  };
});

export const vip035 = () => {
  return makeProposal([
    ...commands
  ]);
};

export default vip035;
