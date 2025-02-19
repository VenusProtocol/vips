import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { unichainsepolia } = NETWORK_ADDRESSES;

export const DEFAULT_PROXY_ADMIN = "";
export const ACM = "";
export const PRIME = "";
export const PLP = "";
export const REWARD_DISTRIBUTOR = "";
export const PSR = "";
export const COMPTROLLER_BEACON = "";
export const VTOKEN_BEACON = "";
export const POOL_REGISTRY = "";
export const XVS_STORE = "";
export const COMPTROLLER = "";
export const XVS_BRIDGE_ADMIN_PROXY = "";
export const XVS = "";
export const BOUND_VALIDATOR = "";

export const VTOKENS = ["", "", "", ""];

export const NTG = "";

export const vip010 = () => {
  return makeProposal([
    {
      target: DEFAULT_PROXY_ADMIN,
      signature: "transferOwnership(address)",
      params: [unichainsepolia.NORMAL_TIMELOCK],
    },
    {
      target: PRIME,
      signature: "transferOwnership(address)",
      params: [unichainsepolia.NORMAL_TIMELOCK],
    },
    {
      target: PLP,
      signature: "transferOwnership(address)",
      params: [unichainsepolia.NORMAL_TIMELOCK],
    },
    {
      target: REWARD_DISTRIBUTOR,
      signature: "transferOwnership(address)",
      params: [unichainsepolia.NORMAL_TIMELOCK],
    },
    {
      target: PSR,
      signature: "transferOwnership(address)",
      params: [unichainsepolia.NORMAL_TIMELOCK],
    },
    {
      target: COMPTROLLER_BEACON,
      signature: "transferOwnership(address)",
      params: [unichainsepolia.NORMAL_TIMELOCK],
    },
    {
      target: VTOKEN_BEACON,
      signature: "transferOwnership(address)",
      params: [unichainsepolia.NORMAL_TIMELOCK],
    },
    {
      target: POOL_REGISTRY,
      signature: "transferOwnership(address)",
      params: [unichainsepolia.NORMAL_TIMELOCK],
    },
    {
      target: COMPTROLLER,
      signature: "transferOwnership(address)",
      params: [unichainsepolia.NORMAL_TIMELOCK],
    },
    ...VTOKENS.map(vtoken => {
      return {
        target: vtoken,
        signature: "transferOwnership(address)",
        params: [unichainsepolia.NORMAL_TIMELOCK],
      };
    }),
    {
      target: unichainsepolia.XVS_VAULT_PROXY,
      signature: "_setPendingAdmin(address)",
      params: [unichainsepolia.NORMAL_TIMELOCK],
    },
    {
      target: XVS_STORE,
      signature: "setPendingAdmin(address)",
      params: [unichainsepolia.NORMAL_TIMELOCK],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "transferOwnership(address)",
      params: [unichainsepolia.NORMAL_TIMELOCK],
    },
    {
      target: XVS,
      signature: "transferOwnership(address)",
      params: [unichainsepolia.NORMAL_TIMELOCK],
    },
    {
      target: unichainsepolia.RESILIENT_ORACLE,
      signature: "transferOwnership(address)",
      params: [unichainsepolia.NORMAL_TIMELOCK],
    },
    {
      target: unichainsepolia.REDSTONE_ORACLE,
      signature: "transferOwnership(address)",
      params: [unichainsepolia.NORMAL_TIMELOCK],
    },
    {
      target: BOUND_VALIDATOR,
      signature: "transferOwnership(address)",
      params: [unichainsepolia.NORMAL_TIMELOCK],
    },
    {
      target: NTG,
      signature: "transferOwnership(address)",
      params: [unichainsepolia.NORMAL_TIMELOCK],
    },
    {
      target: unichainsepolia.VTREASURY,
      signature: "transferOwnership(address)",
      params: [unichainsepolia.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip010;
