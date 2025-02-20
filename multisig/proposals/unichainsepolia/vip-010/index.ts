import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { unichainsepolia } = NETWORK_ADDRESSES;

export const DEFAULT_PROXY_ADMIN = "0x256735eFdfDf135bD6991854e0065909e57804aa";
export const ACM = "0x854C064EA6b503A97980F481FA3B7279012fdeDd";
export const PRIME = "0x59b95BF96D6D5FA1adf1Bfd20848A9b25814317A";
export const PLP = "0xDA4dcFBdC06A9947100a757Ee0eeDe88debaD586";
export const REWARD_DISTRIBUTOR = "0xeE51109E032595D2943397C73d8d5D0982C0E00D";
export const PSR = "0xcCcFc9B37A5575ae270352CC85D55C3C52a646C0";
export const COMPTROLLER_BEACON = "0x1f5f89b3C53b0b07dc0E7EF80864842E41Df480a";
export const VTOKEN_BEACON = "0x123AC6429C00333D5b2E140e54d9037E154b27E4";
export const POOL_REGISTRY = "0x9027cF782515F3184bbF7A6cD7a33052dc52E439";
export const XVS_STORE = "0xeE012BeFEa825a21b6346EF0f78249740ca2569b";
export const COMPTROLLER = "0xFeD3eAA668a6179c9E5E1A84e3A7d6883F06f7c1";
export const XVS_BRIDGE_ADMIN_PROXY = "0xc570c62bbECCd0a63408de95d9418ad7b89Ff63F";
export const XVS = "0xC0e51E865bc9Fed0a32Cc0B2A65449567Bc5c741";
export const BOUND_VALIDATOR = "0x51C9F57Ffc0A4dD6d135aa3b856571F5A4e4C6CB";

export const VTOKENS = [
  "0x0CA7edfcCF5dbf8AFdeAFB2D918409d439E3320A",
  "0x2d8814e1358D71B6B271295893F7409E3127CBBf",
  "0x3dEAcBe87e4B6333140a46aBFD12215f4130B132",
  "0x7d39496Ac9FdA5a336CB2A96FD5Eaa022Fd6Fb05",
];

export const NTG = "0x148C41b07A5c1f289CFB57C2F40d5EEF8ab30DB1";

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
