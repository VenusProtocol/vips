import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { ethereum } = NETWORK_ADDRESSES;
export const DEFAULT_PROXY_ADMIN = "0x567e4cc5e085d09f66f836fa8279f38b4e5866b9";
export const CONVERTERS = [
  "0xaE39C38AF957338b3cEE2b3E5d825ea88df02EfE",
  "0x4f55cb0a24D5542a3478B0E284259A6B850B06BD",
  "0xcEB9503f10B781E30213c0b320bCf3b3cE54216E",
  "0xDcCDE673Cd8988745dA384A7083B0bd22085dEA0",
  "0xb8fD67f215117FADeF06447Af31590309750529D",
  "0x1FD30e761C3296fE36D9067b1e398FD97B4C0407",
];
export const SINGLE_TOKEN_CONVERTER_BEACON = "0x5C0b5D09388F2BA6441E74D40666C4d96e4527D1";
export const CONVERTER_NETWORK = "0x232CC47AECCC55C2CAcE4372f5B268b27ef7cac8";
export const PRIME = "0x14C4525f47A7f7C984474979c57a2Dccb8EACB39";
export const PLP = "0x8ba6aFfd0e7Bcd0028D1639225C84DdCf53D8872";
export const REWARD_DISTRIBUTORS = [
  "0x134bfDEa7e68733921Bc6A87159FB0d68aBc6Cf8",
  "0x76611EEA26aF8842281B56Bb742129E77133592F",
  "0x886767B62C7ACD601672607373048FFD96Cf27B2",
  "0x8473B767F68250F5309bae939337136a899E43F9",
  "0x5f65A7b60b4F91229B8484F80bc2EEc52758EAf9",
  "0x461dE281c453F447200D67C9Dd31b3046c8f49f8",
  "0x7A91bEd36D96E4e644d3A181c287E0fcf9E9cc98",
  "0xe72Aa7BaB160eaa2605964D2379AA56Cb4b9A1BB",
  "0xDCB0CfA130496c749738Acbe2d6aA06C7C320f06",
  "0x1e25CF968f12850003Db17E0Dba32108509C4359",
];
export const PSR = "0x8c8c8530464f7D95552A11eC31Adbd4dC4AC4d3E";
export const COMPTROLLER_BEACON = "0xAE2C3F21896c02510aA187BdA0791cDA77083708";
export const VTOKEN_BEACON = "0xfc08aADC7a1A93857f6296C3fb78aBA1d286533a";
export const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
export const POOL_REGISTRY = "0x61CAff113CCaf05FFc6540302c37adcf077C5179";
export const ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";

export const COMPTROLLERS = [
  "0x687a01ecF6d3907658f7A7c714749fAC32336D1B",
  "0x67aA3eCc5831a65A5Ba7be76BED3B5dc7DB60796",
  "0xF522cd0360EF8c2FF48B648d53EA1717Ec0F3Ac3",
];

export const VTOKENS = [
  "0x672208C10aaAA2F9A6719F449C4C8227bc0BC202",
  "0xd8AdD9B41D4E1cd64Edad8722AB0bA8D35536657",
  "0x4fAfbDc4F2a9876Bd1764827b26fb8dc4FD1dB95",
  "0x17142a05fe678e9584FA1d88EfAC1bF181bF7ABe",
  "0x13eB80FDBe5C5f4a7039728E258A6f05fb3B912b",
  "0x17C07e0c232f2f80DfDbd7a95b942D893A4C5ACb",
  "0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E",
  "0x8716554364f20BCA783cb2BAA744d39361fd1D8d",
  "0x7c8ff7d2A1372433726f879BD945fFb250B94c65",
  "0x2d499800239C4CD3012473Cb1EAE33562F0A6933",
  "0x30aD10Bd5Be62CAb37863C2BfcC6E8fb4fD85BDa",
  "0xA854D35664c658280fFf27B6eDC6C4195c3229B3",
  "0x76697f8eaeA4bE01C678376aAb97498Ee8f80D5C",
  "0xDB6C345f864883a8F4cae87852Ac342589E76D1B",
  "0xF9E9Fe17C00a8B96a8ac20c4E344C8688D7b947E",
  "0xc82780Db1257C788F262FBbDA960B3706Dfdcaf2",
  "0x4a240F0ee138697726C8a3E43eFE6Ac3593432CB",
  "0xb4933AF59868986316Ed37fa865C829Eba2df0C7",
  "0xEF26C64bC06A8dE4CA5D31f119835f9A1d9433b9",
];
export const XVS_STORE = "0x1Db646E1Ab05571AF99e47e8F909801e5C99d37B";
export const XVS_BRIDGE_ADMIN_PROXY = "0x9C6C95632A8FB3A74f2fB4B7FfC50B003c992b96";
export const XVS = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";
export const BOUND_VALIDATOR = "0x1Cd5f336A1d28Dff445619CC63d3A0329B4d8a58";
export const SFrxETHOracle = "0x5E06A5f48692E4Fff376fDfCA9E4C0183AAADCD1";

const vip073 = () => {
  return makeProposal([
    {
      target: DEFAULT_PROXY_ADMIN,
      signature: "transferOwnership(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },
    {
      target: SINGLE_TOKEN_CONVERTER_BEACON,
      signature: "transferOwnership(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },
    {
      target: CONVERTER_NETWORK,
      signature: "transferOwnership(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },
    ...CONVERTERS.map(converter => {
      return {
        target: converter,
        signature: "transferOwnership(address)",
        params: [ethereum.NORMAL_TIMELOCK],
      };
    }),
    {
      target: PRIME,
      signature: "transferOwnership(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },
    {
      target: PLP,
      signature: "transferOwnership(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },
    ...REWARD_DISTRIBUTORS.map(rewardDistributor => {
      return {
        target: rewardDistributor,
        signature: "transferOwnership(address)",
        params: [ethereum.NORMAL_TIMELOCK],
      };
    }),
    {
      target: PSR,
      signature: "transferOwnership(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },
    {
      target: COMPTROLLER_BEACON,
      signature: "transferOwnership(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },
    {
      target: VTOKEN_BEACON,
      signature: "transferOwnership(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },
    {
      target: POOL_REGISTRY,
      signature: "transferOwnership(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },
    ...COMPTROLLERS.map(comptroller => {
      return {
        target: comptroller,
        signature: "transferOwnership(address)",
        params: [ethereum.NORMAL_TIMELOCK],
      };
    }),
    ...VTOKENS.map(comptroller => {
      return {
        target: comptroller,
        signature: "transferOwnership(address)",
        params: [ethereum.NORMAL_TIMELOCK],
      };
    }),
    {
      target: ethereum.XVS_VAULT_PROXY,
      signature: "_setPendingAdmin(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },
    {
      target: XVS_STORE,
      signature: "setPendingAdmin(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "transferOwnership(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },
    {
      target: XVS,
      signature: "transferOwnership(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },
    {
      target: ethereum.RESILIENT_ORACLE,
      signature: "transferOwnership(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },
    {
      target: ethereum.CHAINLINK_ORACLE,
      signature: "transferOwnership(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },
    {
      target: ethereum.REDSTONE_ORACLE,
      signature: "transferOwnership(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },
    {
      target: BOUND_VALIDATOR,
      signature: "transferOwnership(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },
    {
      target: SFrxETHOracle,
      signature: "transferOwnership(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },
    {
      target: ethereum.VTREASURY,
      signature: "transferOwnership(address)",
      params: [ethereum.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip073;
