import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { ethereum } = NETWORK_ADDRESSES;

export const COMPTROLLER_BEACON = "0xAE2C3F21896c02510aA187BdA0791cDA77083708";
export const VTOKEN_BEACON = "0xfc08aADC7a1A93857f6296C3fb78aBA1d286533a";
export const ETHEREUM_ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
export const POOL_REGISTRY = "0x61CAff113CCaf05FFc6540302c37adcf077C5179";

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
];

const vip053 = () => {
  return makeProposal([
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
  ]);
};

export default vip053;
