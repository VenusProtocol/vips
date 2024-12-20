import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { basemainnet } = NETWORK_ADDRESSES;
export const DEFAULT_PROXY_ADMIN = "0x7B06EF6b68648C61aFE0f715740fE3950B90746B";
export const PRIME = "0xD2e84244f1e9Fca03Ff024af35b8f9612D5d7a30";
export const PLP = "0xcB293EB385dEFF2CdeDa4E7060974BB90ee0B208";
export const PSR = "0x3565001d57c91062367C3792B74458e3c6eD910a";
export const COMPTROLLER_BEACON = "0x1b6dE1C670db291bcbF793320a42dbBD858E67aC";
export const VTOKEN_BEACON = "0x87a6476510368c4Bfb70d04A3B0e5a881eC7f0d1";
export const ACM = "0x9E6CeEfDC6183e4D0DF8092A9B90cDF659687daB";
export const POOL_REGISTRY = "0xeef902918DdeCD773D4B422aa1C6e1673EB9136F";

export const COMPTROLLERS = ["0x0C7973F9598AA62f9e03B94E92C967fD5437426C"];
export const XVS_STORE = "0x11b084Cfa559a82AAC0CcD159dBea27899c7955A";
export const XVS_BRIDGE_ADMIN_PROXY = "0x6303FEcee7161bF959d65df4Afb9e1ba5701f78e";
export const XVS = "0xebB7873213c8d1d9913D8eA39Aa12d74cB107995";

export const VTOKENS = [
  "0x3cb752d175740043Ec463673094e06ACDa2F9a2e",
  "0xEB8A79bD44cF4500943bf94a2b4434c95C008599",
  "0x7bBd1005bB24Ec84705b04e1f2DfcCad533b6D72",
];
export const BOUND_VALIDATOR = "0x66dDE062D3DC1BB5223A0096EbB89395d1f11DB0";

const vip007 = () => {
  return makeProposal([
    {
      target: DEFAULT_PROXY_ADMIN,
      signature: "transferOwnership(address)",
      params: [basemainnet.NORMAL_TIMELOCK],
    },
    {
      target: PRIME,
      signature: "transferOwnership(address)",
      params: [basemainnet.NORMAL_TIMELOCK],
    },
    {
      target: PLP,
      signature: "transferOwnership(address)",
      params: [basemainnet.NORMAL_TIMELOCK],
    },
    {
      target: PSR,
      signature: "transferOwnership(address)",
      params: [basemainnet.NORMAL_TIMELOCK],
    },
    {
      target: COMPTROLLER_BEACON,
      signature: "transferOwnership(address)",
      params: [basemainnet.NORMAL_TIMELOCK],
    },
    {
      target: VTOKEN_BEACON,
      signature: "transferOwnership(address)",
      params: [basemainnet.NORMAL_TIMELOCK],
    },
    {
      target: POOL_REGISTRY,
      signature: "transferOwnership(address)",
      params: [basemainnet.NORMAL_TIMELOCK],
    },
    ...COMPTROLLERS.map(comptroller => {
      return {
        target: comptroller,
        signature: "transferOwnership(address)",
        params: [basemainnet.NORMAL_TIMELOCK],
      };
    }),
    ...VTOKENS.map(comptroller => {
      return {
        target: comptroller,
        signature: "transferOwnership(address)",
        params: [basemainnet.NORMAL_TIMELOCK],
      };
    }),
    {
      target: basemainnet.XVS_VAULT_PROXY,
      signature: "_setPendingAdmin(address)",
      params: [basemainnet.NORMAL_TIMELOCK],
    },
    {
      target: XVS_STORE,
      signature: "setPendingAdmin(address)",
      params: [basemainnet.NORMAL_TIMELOCK],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "transferOwnership(address)",
      params: [basemainnet.NORMAL_TIMELOCK],
    },
    {
      target: XVS,
      signature: "transferOwnership(address)",
      params: [basemainnet.NORMAL_TIMELOCK],
    },
    {
      target: basemainnet.RESILIENT_ORACLE,
      signature: "transferOwnership(address)",
      params: [basemainnet.NORMAL_TIMELOCK],
    },
    {
      target: basemainnet.CHAINLINK_ORACLE,
      signature: "transferOwnership(address)",
      params: [basemainnet.NORMAL_TIMELOCK],
    },
    {
      target: basemainnet.REDSTONE_ORACLE,
      signature: "transferOwnership(address)",
      params: [basemainnet.NORMAL_TIMELOCK],
    },
    {
      target: BOUND_VALIDATOR,
      signature: "transferOwnership(address)",
      params: [basemainnet.NORMAL_TIMELOCK],
    },
    {
      target: basemainnet.VTREASURY,
      signature: "transferOwnership(address)",
      params: [basemainnet.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip007;
