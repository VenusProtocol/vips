import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { opmainnet } = NETWORK_ADDRESSES;

export const DEFAULT_PROXY_ADMIN = "0xeaF9490cBEA6fF9bA1D23671C39a799CeD0DCED2";
export const PRIME = "0xE76d2173546Be97Fa6E18358027BdE9742a649f7";
export const PLP = "0x6412f6cd58D0182aE150b90B5A99e285b91C1a12";
export const PSR = "0x735ed037cB0dAcf90B133370C33C08764f88140a";
export const COMPTROLLER_BEACON = "0x64f9306496ccF7b7369d02d68D6abcA2Edfb871d";
export const VTOKEN_BEACON = "0xd550Bdfa9402e215De0BabCb99F7294BE0268367";
export const POOL_REGISTRY = "0x147780799840d541C1d7c998F0cbA996d11D62bb";
export const XVS_STORE = "0xFE548630954129923f63113923eF5373E10589d3";
export const COMPTROLLERS = ["0x5593FF68bE84C966821eEf5F0a988C285D5B7CeC"];
export const XVS_BRIDGE_ADMIN_PROXY = "0x3c307DF1Bf3198a2417d9CA86806B307D147Ddf7";
export const XVS = "0x4a971e87ad1F61f7f3081645f52a99277AE917cF";
export const BOUND_VALIDATOR = "0x37A04a1eF784448377a19F2b1b67cD40c09eA505";
export const VTOKENS = [
  "0x6b846E3418455804C1920fA4CC7a31A51C659A2D",
  "0x1C9406ee95B7af55F005996947b19F91B6D55b15",
  "0x37ac9731B0B02df54975cd0c7240e0977a051721",
  "0x9EfdCfC2373f81D3DF24647B1c46e15268884c46",
  "0x66d5AE25731Ce99D46770745385e662C8e0B4025",
];


export const NTGs = ["0x5B1b7465cfDE450e267b562792b434277434413c"];

const vip007 = () => {
  return makeProposal([
    {
      target: DEFAULT_PROXY_ADMIN,
      signature: "transferOwnership(address)",
      params: [opmainnet.NORMAL_TIMELOCK],
    },
    {
      target: PRIME,
      signature: "transferOwnership(address)",
      params: [opmainnet.NORMAL_TIMELOCK],
    },
    {
      target: PLP,
      signature: "transferOwnership(address)",
      params: [opmainnet.NORMAL_TIMELOCK],
    },
    {
      target: PSR,
      signature: "transferOwnership(address)",
      params: [opmainnet.NORMAL_TIMELOCK],
    },
    {
      target: COMPTROLLER_BEACON,
      signature: "transferOwnership(address)",
      params: [opmainnet.NORMAL_TIMELOCK],
    },
    {
      target: VTOKEN_BEACON,
      signature: "transferOwnership(address)",
      params: [opmainnet.NORMAL_TIMELOCK],
    },
    {
      target: POOL_REGISTRY,
      signature: "transferOwnership(address)",
      params: [opmainnet.NORMAL_TIMELOCK],
    },
    ...COMPTROLLERS.map(comptroller => {
      return {
        target: comptroller,
        signature: "transferOwnership(address)",
        params: [opmainnet.NORMAL_TIMELOCK],
      };
    }),
    ...VTOKENS.map(comptroller => {
      return {
        target: comptroller,
        signature: "transferOwnership(address)",
        params: [opmainnet.NORMAL_TIMELOCK],
      };
    }),
    {
      target: opmainnet.XVS_VAULT_PROXY,
      signature: "_setPendingAdmin(address)",
      params: [opmainnet.NORMAL_TIMELOCK],
    },
    {
      target: XVS_STORE,
      signature: "setPendingAdmin(address)",
      params: [opmainnet.NORMAL_TIMELOCK],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "transferOwnership(address)",
      params: [opmainnet.NORMAL_TIMELOCK],
    },
    {
      target: XVS,
      signature: "transferOwnership(address)",
      params: [opmainnet.NORMAL_TIMELOCK],
    },
    {
      target: opmainnet.RESILIENT_ORACLE,
      signature: "transferOwnership(address)",
      params: [opmainnet.NORMAL_TIMELOCK],
    },
    {
      target: opmainnet.CHAINLINK_ORACLE,
      signature: "transferOwnership(address)",
      params: [opmainnet.NORMAL_TIMELOCK],
    },
    {
      target: opmainnet.REDSTONE_ORACLE,
      signature: "transferOwnership(address)",
      params: [opmainnet.NORMAL_TIMELOCK],
    },
    {
      target: BOUND_VALIDATOR,
      signature: "transferOwnership(address)",
      params: [opmainnet.NORMAL_TIMELOCK],
    },
    {
      target: opmainnet.VTREASURY,
      signature: "transferOwnership(address)",
      params: [opmainnet.NORMAL_TIMELOCK],
    },
    ...NTGs.map(ntg => {
      return {
        target: ntg,
        signature: "transferOwnership(address)",
        params: [opmainnet.NORMAL_TIMELOCK],
      };
    }),
  ]);
};

export default vip007;
