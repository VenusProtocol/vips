import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { opbnbmainnet } = NETWORK_ADDRESSES;
export const DEFAULT_PROXY_ADMIN = "0xF77bD1D893F67b3EB2Cd256239c98Ba3F238fb52";
export const PSR = "0xA2EDD515B75aBD009161B15909C19959484B0C1e";
export const COMPTROLLER_BEACON = "0x11C3e19236ce17729FC66b74B537de00C54d44e7";
export const VTOKEN_BEACON = "0xfeD1d3a13597c5aBc893Af41ED5cb17e64c847c7";
export const ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
export const POOL_REGISTRY = "0x345a030Ad22e2317ac52811AC41C1A63cfa13aEe";

export const COMPTROLLERS = ["0xD6e3E2A1d8d95caE355D15b3b9f8E5c2511874dd"];

export const VTOKENS = [
  "0xED827b80Bd838192EA95002C01B5c6dA8354219a",
  "0x509e81eF638D489936FA85BC58F52Df01190d26C",
  "0x13B492B8A03d072Bab5C54AC91Dba5b830a50917",
  "0xb7a01Ba126830692238521a1aA7E7A7509410b8e",
  "0x53d11cB8A0e5320Cd7229C3acc80d1A0707F2672",
];
export const XVS_STORE = "0xc3279442a5aCaCF0A2EcB015d1cDDBb3E0f3F775";
export const XVS_BRIDGE_ADMIN_PROXY = "0x52fcE05aDbf6103d71ed2BA8Be7A317282731831";
export const XVS = "0x3E2e61F1c075881F3fB8dd568043d8c221fd5c61";
export const BOUND_VALIDATOR = "0xd1f80C371C6E2Fa395A5574DB3E3b4dAf43dadCE";

export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

const vip021 = () => {
  return makeProposal([
    {
      target: DEFAULT_PROXY_ADMIN,
      signature: "transferOwnership(address)",
      params: [opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: PSR,
      signature: "transferOwnership(address)",
      params: [opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: COMPTROLLER_BEACON,
      signature: "transferOwnership(address)",
      params: [opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: VTOKEN_BEACON,
      signature: "transferOwnership(address)",
      params: [opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: POOL_REGISTRY,
      signature: "transferOwnership(address)",
      params: [opbnbmainnet.NORMAL_TIMELOCK],
    },
    ...COMPTROLLERS.map(comptroller => {
      return {
        target: comptroller,
        signature: "transferOwnership(address)",
        params: [opbnbmainnet.NORMAL_TIMELOCK],
      };
    }),
    ...VTOKENS.map(comptroller => {
      return {
        target: comptroller,
        signature: "transferOwnership(address)",
        params: [opbnbmainnet.NORMAL_TIMELOCK],
      };
    }),
    {
      target: opbnbmainnet.XVS_VAULT_PROXY,
      signature: "_setPendingAdmin(address)",
      params: [opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: XVS_STORE,
      signature: "setPendingAdmin(address)",
      params: [opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "transferOwnership(address)",
      params: [opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: XVS,
      signature: "transferOwnership(address)",
      params: [opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: opbnbmainnet.RESILIENT_ORACLE,
      signature: "transferOwnership(address)",
      params: [opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: opbnbmainnet.BINANCE_ORACLE,
      signature: "transferOwnership(address)",
      params: [opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: BOUND_VALIDATOR,
      signature: "transferOwnership(address)",
      params: [opbnbmainnet.NORMAL_TIMELOCK],
    },
    {
      target: opbnbmainnet.VTREASURY,
      signature: "transferOwnership(address)",
      params: [opbnbmainnet.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip021;
