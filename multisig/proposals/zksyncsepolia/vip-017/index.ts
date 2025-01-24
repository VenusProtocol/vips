import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { zksyncsepolia } = NETWORK_ADDRESSES;

export const DEFAULT_PROXY_ADMIN = "0x18E44f588a4DcF2F7145d35A5C226e129040b6D3";
export const PRIME = "0x72b85930F7f8D00ACe5EAD10a315C17b8954FBcF";
export const PLP = "0x3407c349F80E4E9544c73ca1E9334CeEA7266517";
export const PSR = "0x5722B43BD91fAaDC4E7f384F4d6Fb32456Ec5ffB";
export const COMPTROLLER_BEACON = "0xf8bD27B4a4df30F6c2961663212f2200A8e5D5F3";
export const VTOKEN_BEACON = "0xA95B8eb3Be3CfFCf340A094574338010A4ffB2Ca";
export const POOL_REGISTRY = "0x1401404e6279BB8C06E5E3999eCA3e2008B46A76";
export const XVS_STORE = "0xf0DaEFE5f5df4170426F88757EcdF45430332d88";
export const COMPTROLLERS = ["0xC527DE08E43aeFD759F7c0e6aE85433923064669"];
export const XVS_BRIDGE_ADMIN_PROXY = "0x28cfE3f2D7D8944FAd162a058260ec922C19065E";
export const XVS = "0x3AeCac43A2ebe5D8184e650403bf9F656F9D1cfA";
export const BOUND_VALIDATOR = "0x0A4daBeF41C83Af7e30FfC33feC56ba769f3D24b";
export const VTOKENS = [
  "0x58b0b248BB11DCAA9336bBf8a81914201fD49461",
  "0xA266EfCC7D1a8F1AAd093446E3C0115467ea8b9C",
  "0x7Bfd185eF8380a72027bF65bFEEAb0242b147778",
  "0x9c2379ed8ab06B44328487f61873C7c44BD6E87D",
  "0x31eb7305f9fE281027028D0ba0d7f57ddA836d49",
  "0x92f4BD794303c0BD0791B350Be5531DB38414f47",
];
export const REWARD_DISTRIBUTORS = ["0x8EDd58DC2C8e38bfc17f07D6f5E8831d87a6962e"];

export const NTGs = ["0xC2bc5881f2c1ee08a1f0fee65Fbf2BB4C4DD81e9"];

const vip017 = () => {
  return makeProposal([
    ...REWARD_DISTRIBUTORS.map(rewardDistributor => {
      return {
        target: rewardDistributor,
        signature: "transferOwnership(address)",
        params: [zksyncsepolia.NORMAL_TIMELOCK],
      };
    }),
    {
      target: DEFAULT_PROXY_ADMIN,
      signature: "transferOwnership(address)",
      params: [zksyncsepolia.NORMAL_TIMELOCK],
    },
    {
      target: PRIME,
      signature: "transferOwnership(address)",
      params: [zksyncsepolia.NORMAL_TIMELOCK],
    },
    {
      target: PLP,
      signature: "transferOwnership(address)",
      params: [zksyncsepolia.NORMAL_TIMELOCK],
    },
    {
      target: PSR,
      signature: "transferOwnership(address)",
      params: [zksyncsepolia.NORMAL_TIMELOCK],
    },
    {
      target: COMPTROLLER_BEACON,
      signature: "transferOwnership(address)",
      params: [zksyncsepolia.NORMAL_TIMELOCK],
    },
    {
      target: VTOKEN_BEACON,
      signature: "transferOwnership(address)",
      params: [zksyncsepolia.NORMAL_TIMELOCK],
    },
    {
      target: POOL_REGISTRY,
      signature: "transferOwnership(address)",
      params: [zksyncsepolia.NORMAL_TIMELOCK],
    },
    ...COMPTROLLERS.map(comptroller => {
      return {
        target: comptroller,
        signature: "transferOwnership(address)",
        params: [zksyncsepolia.NORMAL_TIMELOCK],
      };
    }),
    ...VTOKENS.map(comptroller => {
      return {
        target: comptroller,
        signature: "transferOwnership(address)",
        params: [zksyncsepolia.NORMAL_TIMELOCK],
      };
    }),
    {
      target: zksyncsepolia.XVS_VAULT_PROXY,
      signature: "_setPendingAdmin(address)",
      params: [zksyncsepolia.NORMAL_TIMELOCK],
    },
    {
      target: XVS_STORE,
      signature: "setPendingAdmin(address)",
      params: [zksyncsepolia.NORMAL_TIMELOCK],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "transferOwnership(address)",
      params: [zksyncsepolia.NORMAL_TIMELOCK],
    },
    {
      target: XVS,
      signature: "transferOwnership(address)",
      params: [zksyncsepolia.NORMAL_TIMELOCK],
    },
    {
      target: zksyncsepolia.RESILIENT_ORACLE,
      signature: "transferOwnership(address)",
      params: [zksyncsepolia.NORMAL_TIMELOCK],
    },
    {
      target: zksyncsepolia.CHAINLINK_ORACLE,
      signature: "transferOwnership(address)",
      params: [zksyncsepolia.NORMAL_TIMELOCK],
    },
    {
      target: zksyncsepolia.REDSTONE_ORACLE,
      signature: "transferOwnership(address)",
      params: [zksyncsepolia.NORMAL_TIMELOCK],
    },
    {
      target: BOUND_VALIDATOR,
      signature: "transferOwnership(address)",
      params: [zksyncsepolia.NORMAL_TIMELOCK],
    },
    {
      target: zksyncsepolia.VTREASURY,
      signature: "transferOwnership(address)",
      params: [zksyncsepolia.NORMAL_TIMELOCK],
    },
    ...NTGs.map(ntg => {
      return {
        target: ntg,
        signature: "transferOwnership(address)",
        params: [zksyncsepolia.NORMAL_TIMELOCK],
      };
    }),
  ]);
};

export default vip017;
