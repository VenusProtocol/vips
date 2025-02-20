import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { unichainmainnet } = NETWORK_ADDRESSES;

export const DEFAULT_PROXY_ADMIN = "0x78e9fff2ab8daAB8559070d897C399E5e1C5074c";
export const ACM = "0x1f12014c497a9d905155eB9BfDD9FaC6885e61d0";
export const PRIME = "0x600aFf613d40D87C8Fe90Cb2e78e8e6667c0C872";
export const PLP = "0x045a45603E1b073F444fe3Be7d5C7e0a5035afB7";
export const REWARD_DISTRIBUTOR = "0x4630B71C1BD27c99DD86aBB2A18C50c3F75C88fb";
export const PSR = "0x0A93fBcd7B53CE6D335cAB6784927082AD75B242";
export const COMPTROLLER_BEACON = "0xE57824ffF03fB19D7f93139A017a7E70f6F25166";
export const VTOKEN_BEACON = "0x42c1Efb9Dd9424c5ac8e6EcEa4eb03940c4a15Fc";
export const POOL_REGISTRY = "0x0C52403E16BcB8007C1e54887E1dFC1eC9765D7C";
export const XVS_STORE = "0x0ee4b35c2cEAb19856Bf35505F81608d12B2a7Bb";
export const COMPTROLLER = "0xe22af1e6b78318e1Fe1053Edbd7209b8Fc62c4Fe";
export const XVS_BRIDGE_ADMIN_PROXY = "0x2EAaa880f97C9B63d37b39b0b316022d93d43604";
export const XVS = "0x81908BBaad3f6fC74093540Ab2E9B749BB62aA0d";
export const BOUND_VALIDATOR = "0xfdaA5dEEA7850997dA8A6E2F2Ab42E60F1011C19";

export const VTOKENS = ["0xB953f92B9f759d97d2F2Dec10A8A3cf75fcE3A95", "0xc219BC179C7cDb37eACB03f993f9fDc2495e3374"];

export const NTG = "0x4441aE3bCEd3210edbA35d0F7348C493E79F1C52";

export const vip010 = () => {
  return makeProposal([
    {
      target: DEFAULT_PROXY_ADMIN,
      signature: "transferOwnership(address)",
      params: [unichainmainnet.NORMAL_TIMELOCK],
    },
    {
      target: PRIME,
      signature: "transferOwnership(address)",
      params: [unichainmainnet.NORMAL_TIMELOCK],
    },
    {
      target: PLP,
      signature: "transferOwnership(address)",
      params: [unichainmainnet.NORMAL_TIMELOCK],
    },
    {
      target: REWARD_DISTRIBUTOR,
      signature: "transferOwnership(address)",
      params: [unichainmainnet.NORMAL_TIMELOCK],
    },
    {
      target: PSR,
      signature: "transferOwnership(address)",
      params: [unichainmainnet.NORMAL_TIMELOCK],
    },
    {
      target: COMPTROLLER_BEACON,
      signature: "transferOwnership(address)",
      params: [unichainmainnet.NORMAL_TIMELOCK],
    },
    {
      target: VTOKEN_BEACON,
      signature: "transferOwnership(address)",
      params: [unichainmainnet.NORMAL_TIMELOCK],
    },
    {
      target: POOL_REGISTRY,
      signature: "transferOwnership(address)",
      params: [unichainmainnet.NORMAL_TIMELOCK],
    },
    {
      target: COMPTROLLER,
      signature: "transferOwnership(address)",
      params: [unichainmainnet.NORMAL_TIMELOCK],
    },
    ...VTOKENS.map(vtoken => {
      return {
        target: vtoken,
        signature: "transferOwnership(address)",
        params: [unichainmainnet.NORMAL_TIMELOCK],
      };
    }),
    {
      target: unichainmainnet.XVS_VAULT_PROXY,
      signature: "_setPendingAdmin(address)",
      params: [unichainmainnet.NORMAL_TIMELOCK],
    },
    {
      target: XVS_STORE,
      signature: "setPendingAdmin(address)",
      params: [unichainmainnet.NORMAL_TIMELOCK],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "transferOwnership(address)",
      params: [unichainmainnet.NORMAL_TIMELOCK],
    },
    {
      target: XVS,
      signature: "transferOwnership(address)",
      params: [unichainmainnet.NORMAL_TIMELOCK],
    },
    {
      target: unichainmainnet.RESILIENT_ORACLE,
      signature: "transferOwnership(address)",
      params: [unichainmainnet.NORMAL_TIMELOCK],
    },
    {
      target: unichainmainnet.REDSTONE_ORACLE,
      signature: "transferOwnership(address)",
      params: [unichainmainnet.NORMAL_TIMELOCK],
    },
    {
      target: BOUND_VALIDATOR,
      signature: "transferOwnership(address)",
      params: [unichainmainnet.NORMAL_TIMELOCK],
    },
    {
      target: NTG,
      signature: "transferOwnership(address)",
      params: [unichainmainnet.NORMAL_TIMELOCK],
    },
    {
      target: unichainmainnet.VTREASURY,
      signature: "transferOwnership(address)",
      params: [unichainmainnet.NORMAL_TIMELOCK],
    },
  ]);
};

export default vip010;
