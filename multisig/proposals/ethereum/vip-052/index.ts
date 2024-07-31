import { makeProposal } from "../../../../src/utils";

export const REWARDS_DISTRIBUTOR_CORE_OLD = "0x134bfDEa7e68733921Bc6A87159FB0d68aBc6Cf8";
export const REWARDS_DISTRIBUTOR_CORE_NEW = "0x886767B62C7ACD601672607373048FFD96Cf27B2";
export const REWARDS_DISTRIBUTOR_CURVE_NEW = "0x461dE281c453F447200D67C9Dd31b3046c8f49f8";
export const REWARDS_DISTRIBUTOR_LST_OLD = "0x7A91bEd36D96E4e644d3A181c287E0fcf9E9cc98";
export const REWARDS_DISTRIBUTOR_LST_NEW = "0x1e25CF968f12850003Db17E0Dba32108509C4359";

export const VDAI_CORE = "0xd8AdD9B41D4E1cd64Edad8722AB0bA8D35536657";
export const VFRAX_CORE = "0x4fAfbDc4F2a9876Bd1764827b26fb8dc4FD1dB95";
export const VTUSD_CORE = "0x13eB80FDBe5C5f4a7039728E258A6f05fb3B912b";
export const VUSDC_CORE = "0x17C07e0c232f2f80DfDbd7a95b942D893A4C5ACb";
export const VUSDT_CORE = "0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E";
export const VWBTC_CORE = "0x8716554364f20BCA783cb2BAA744d39361fd1D8d";
export const VWETH_CORE = "0x7c8ff7d2A1372433726f879BD945fFb250B94c65";
export const VSFRAX_CORE = "0x17142a05fe678e9584FA1d88EfAC1bF181bF7ABe";
export const VCRVUSD_CORE = "0x672208C10aaAA2F9A6719F449C4C8227bc0BC202";

export const VCRVUSD_CURVE = "0x2d499800239C4CD3012473Cb1EAE33562F0A6933";
export const VCRV_CURVE = "0x30aD10Bd5Be62CAb37863C2BfcC6E8fb4fD85BDa";

export const VSFRXETH_LST = "0xF9E9Fe17C00a8B96a8ac20c4E344C8688D7b947E";
export const VWSTETH_LST = "0x4a240F0ee138697726C8a3E43eFE6Ac3593432CB";
export const VWETH_LST = "0xc82780Db1257C788F262FBbDA960B3706Dfdcaf2";

export const vip052 = () => {
  return makeProposal([
    {
      target: REWARDS_DISTRIBUTOR_CORE_OLD,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [
        [VFRAX_CORE, VSFRAX_CORE, VDAI_CORE, VTUSD_CORE],
        ["0", "0", "0", "0"],
        ["0", "0", "0", "0"],
      ],
    },
    {
      target: REWARDS_DISTRIBUTOR_LST_OLD,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [[VSFRXETH_LST], ["0"], ["0"]],
    },
    {
      target: REWARDS_DISTRIBUTOR_CORE_NEW,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [
        [VCRVUSD_CORE, VUSDC_CORE, VUSDT_CORE, VWBTC_CORE, VWETH_CORE, VFRAX_CORE, VSFRAX_CORE, VDAI_CORE, VTUSD_CORE],
        [
          "1388888888888888",
          "5625000000000000",
          "5625000000000000",
          "4687500000000000",
          "1562499999999999",
          "555555555555555",
          "555555555555555",
          "462962962962962",
          "185185185185185",
        ],
        [
          "2083333333333333",
          "8437500000000000",
          "8437500000000000",
          "7031250000000000",
          "2343750000000000",
          "833333333333333",
          "833333333333333",
          "694444444444444",
          "277777777777777",
        ],
      ],
    },
    {
      target: REWARDS_DISTRIBUTOR_CURVE_NEW,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [
        [VCRVUSD_CURVE, VCRV_CURVE],
        ["347222222222222", "347222222222222"],
        ["520833333333333", "520833333333333"],
      ],
    },
    {
      target: REWARDS_DISTRIBUTOR_LST_NEW,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [
        [VWETH_LST, VWSTETH_LST, VSFRXETH_LST],
        ["22916250000000000", "8333333333333333", "1851851851851851"],
        ["53471250000000000", "0", "0"],
      ],
    },
  ]);
};

export default vip052;
