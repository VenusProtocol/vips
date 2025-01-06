import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { arbitrumsepolia } = NETWORK_ADDRESSES;
export const DEFAULT_PROXY_ADMIN = "0xA78A1Df376c3CEeBC5Fab574fe6EdDbbF76fd03e";
export const PRIME = "0xadb04ac4942683bc41e27d18234c8dc884786e89";
export const PLP = "0xe82c2c10f55d3268126c29ec813dc6f086904694";
export const REWARD_DISTRIBUTORS = ["0x6c65135d102e2Dfa1b0852351cF9b2cbc1788972"];
export const PSR = "0x09267d30798B59c581ce54E861A084C6FC298666";
export const COMPTROLLER_BEACON = "0x12Dcb8D9F1eE7Ad7410F5B36B07bcC7891ab4cEf";
export const VTOKEN_BEACON = "0x74ae9919F5866cE148c81331a5FCdE71b81c4056";
export const ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
export const POOL_REGISTRY = "0xf93Df3135e0D555185c0BC888073374cA551C5fE";

export const COMPTROLLERS = [
  "0x006D44b6f5927b3eD83bD0c1C36Fb1A3BaCaC208",
  "0x3D04F926b2a165BBa17FBfccCCB61513634fa5e4",
];
export const XVS_STORE = "0x4e909DA6693215dC630104715c035B159dDb67Dd";
export const XVS_BRIDGE_ADMIN_PROXY = "0xc94578caCC89a29B044a0a1D54d20d48A645E5C8";
export const XVS = "0x877Dc896e7b13096D3827872e396927BbE704407";
export const CONVERTERS = [
  "0x309b71a417dA9CfA8aC47e6038000B1739d9A3A6",
  "0xFC0ec257d3ec4D673cB4e2CD3827C202e75fd0be",
  "0xE88ed530597bc8D50e8CfC0EecAAFf6A93248C74",
  "0x3089F46caf6611806caA39Ffaf672097156b893a",
  "0x0d1e90c1F86CD1c1dF514B493c5985B3FD9CD6C8",
  "0x99942a033454Cef6Ffb2843886C8b2E658E7D5fd",
];
export const SINGLE_TOKEN_CONVERTER_BEACON = "0xC77D0F75f1e4e3720DA1D2F5D809F439125a2Fd4";
export const CONVERTER_NETWORK = "0x9dD63dC8DADf90B67511939C00607484567B0D7A";

export const VTOKENS = [
  "0x49FB90A5815904649C44B87001a160C1301D6a2C",
  "0x807dCB6946dDF4C5C6446B1B07ACd248B08F45e2",
  "0xdEFbf0F9Ab6CdDd0a1FdDC894b358D0c0a39B052",
  "0xd9d1e754464eFc7493B177d2c7be04816E089b4C",
  "0x292Ec2b45C549Bc2c6B31937dBd511beaAEabea8",
  "0xd7057250b439c0849377bB6C3263eb8f9cf49d98",
  "0x75f841b14305935D8D7E806f249D9FA52EF1550B",
  "0x253515E19e8b888a4CA5a0a3363B712402ce4046",
];
export const BOUND_VALIDATOR = "0xfe6bc1545Cc14C131bacA97476D6035ffcC0b889";
export const NTGs = ["0x196b19C2037863409C65CbF63592ae2a3CD2Dc2C", "0x63cEE24b12648E36d708163587aC17a777096a47"];

const vip020 = () => {
  return makeProposal([
    {
      target: DEFAULT_PROXY_ADMIN,
      signature: "transferOwnership(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: SINGLE_TOKEN_CONVERTER_BEACON,
      signature: "transferOwnership(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: CONVERTER_NETWORK,
      signature: "transferOwnership(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },
    ...CONVERTERS.map(converter => {
      return {
        target: converter,
        signature: "transferOwnership(address)",
        params: [arbitrumsepolia.NORMAL_TIMELOCK],
      };
    }),
    {
      target: PRIME,
      signature: "transferOwnership(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: PLP,
      signature: "transferOwnership(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },
    ...REWARD_DISTRIBUTORS.map(rewardDistributor => {
      return {
        target: rewardDistributor,
        signature: "transferOwnership(address)",
        params: [arbitrumsepolia.NORMAL_TIMELOCK],
      };
    }),
    {
      target: PSR,
      signature: "transferOwnership(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: COMPTROLLER_BEACON,
      signature: "transferOwnership(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: VTOKEN_BEACON,
      signature: "transferOwnership(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: POOL_REGISTRY,
      signature: "transferOwnership(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },
    ...COMPTROLLERS.map(comptroller => {
      return {
        target: comptroller,
        signature: "transferOwnership(address)",
        params: [arbitrumsepolia.NORMAL_TIMELOCK],
      };
    }),
    ...VTOKENS.map(comptroller => {
      return {
        target: comptroller,
        signature: "transferOwnership(address)",
        params: [arbitrumsepolia.NORMAL_TIMELOCK],
      };
    }),
    {
      target: arbitrumsepolia.XVS_VAULT_PROXY,
      signature: "_setPendingAdmin(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: XVS_STORE,
      signature: "setPendingAdmin(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "transferOwnership(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: XVS,
      signature: "transferOwnership(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.RESILIENT_ORACLE,
      signature: "transferOwnership(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.CHAINLINK_ORACLE,
      signature: "transferOwnership(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.REDSTONE_ORACLE,
      signature: "transferOwnership(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: BOUND_VALIDATOR,
      signature: "transferOwnership(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.VTREASURY,
      signature: "transferOwnership(address)",
      params: [arbitrumsepolia.NORMAL_TIMELOCK],
    },
    ...NTGs.map(ntg => {
      return {
        target: ntg,
        signature: "transferOwnership(address)",
        params: [arbitrumsepolia.NORMAL_TIMELOCK],
      };
    }),
  ]);
};

export default vip020;
