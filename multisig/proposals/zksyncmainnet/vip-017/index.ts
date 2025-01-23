import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { zksyncmainnet } = NETWORK_ADDRESSES;

export const DEFAULT_PROXY_ADMIN = "0x8Ea1A989B036f7Ef21bb95CE4E7961522Ca00287";
export const PRIME = "0xdFe62Dcba3Ce0A827439390d7d45Af8baE599978";
export const PLP = "0x0EDE6d7fB474614C5D3d5a16581628bb96CB5dff";
export const PSR = "0xA1193e941BDf34E858f7F276221B4886EfdD040b";
export const COMPTROLLER_BEACON = "0x0221415aF47FD261dD39B72018423dADe5d937c5";
export const VTOKEN_BEACON = "0x53523537aa330640B80400EB8B309fF5896E7eb5";
export const POOL_REGISTRY = "0xFD96B926298034aed9bBe0Cca4b651E41eB87Bc4";
export const XVS_STORE = "0x84266F552756cBed893b1FFA85248cD99501e3ce";
export const COMPTROLLERS = ["0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1"];
export const XVS_BRIDGE_ADMIN_PROXY = "0x2471043F05Cc41A6051dd6714DC967C7BfC8F902";
export const XVS = "0xD78ABD81a3D57712a3af080dc4185b698Fe9ac5A";
export const BOUND_VALIDATOR = "0x51519cdCDDD05E2ADCFA108f4a960755D9d6ea8b";
export const VTOKENS = [
  "0x1aF23bD57c62A99C59aD48236553D0Dd11e49D2D",
  "0x84064c058F2EFea4AB648bB6Bd7e40f83fFDe39a",
  "0x69cDA960E3b20DFD480866fFfd377Ebe40bd0A46",
  "0xAF8fD83cFCbe963211FAaf1847F0F217F80B4719",
  "0x1Fa916C27c7C2c4602124A14C77Dbb40a5FF1BE8",
  "0x697a70779C1A03Ba2BD28b7627a902BFf831b616",
];
export const REWARD_DISTRIBUTORS = [
  "0x7C7846A74AB38A8d554Bc5f7652eCf8Efb58c894"
];

export const NTGs = ["0xeEDE4e1BDaC489BD851970bE3952B729C4238A68"];

const vip017 = () => {
  return makeProposal([
    ...REWARD_DISTRIBUTORS.map(rewardDistributor => {
      return {
        target: rewardDistributor,
        signature: "transferOwnership(address)",
        params: [zksyncmainnet.NORMAL_TIMELOCK],
      };
    }),
    {
      target: DEFAULT_PROXY_ADMIN,
      signature: "transferOwnership(address)",
      params: [zksyncmainnet.NORMAL_TIMELOCK],
    },
    {
      target: PRIME,
      signature: "transferOwnership(address)",
      params: [zksyncmainnet.NORMAL_TIMELOCK],
    },
    {
      target: PLP,
      signature: "transferOwnership(address)",
      params: [zksyncmainnet.NORMAL_TIMELOCK],
    },
    {
      target: PSR,
      signature: "transferOwnership(address)",
      params: [zksyncmainnet.NORMAL_TIMELOCK],
    },
    {
      target: COMPTROLLER_BEACON,
      signature: "transferOwnership(address)",
      params: [zksyncmainnet.NORMAL_TIMELOCK],
    },
    {
      target: VTOKEN_BEACON,
      signature: "transferOwnership(address)",
      params: [zksyncmainnet.NORMAL_TIMELOCK],
    },
    {
      target: POOL_REGISTRY,
      signature: "transferOwnership(address)",
      params: [zksyncmainnet.NORMAL_TIMELOCK],
    },
    ...COMPTROLLERS.map(comptroller => {
      return {
        target: comptroller,
        signature: "transferOwnership(address)",
        params: [zksyncmainnet.NORMAL_TIMELOCK],
      };
    }),
    ...VTOKENS.map(comptroller => {
      return {
        target: comptroller,
        signature: "transferOwnership(address)",
        params: [zksyncmainnet.NORMAL_TIMELOCK],
      };
    }),
    {
      target: zksyncmainnet.XVS_VAULT_PROXY,
      signature: "_setPendingAdmin(address)",
      params: [zksyncmainnet.NORMAL_TIMELOCK],
    },
    {
      target: XVS_STORE,
      signature: "setPendingAdmin(address)",
      params: [zksyncmainnet.NORMAL_TIMELOCK],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "transferOwnership(address)",
      params: [zksyncmainnet.NORMAL_TIMELOCK],
    },
    {
      target: XVS,
      signature: "transferOwnership(address)",
      params: [zksyncmainnet.NORMAL_TIMELOCK],
    },
    {
      target: zksyncmainnet.RESILIENT_ORACLE,
      signature: "transferOwnership(address)",
      params: [zksyncmainnet.NORMAL_TIMELOCK],
    },
    {
      target: zksyncmainnet.CHAINLINK_ORACLE,
      signature: "transferOwnership(address)",
      params: [zksyncmainnet.NORMAL_TIMELOCK],
    },
    {
      target: zksyncmainnet.REDSTONE_ORACLE,
      signature: "transferOwnership(address)",
      params: [zksyncmainnet.NORMAL_TIMELOCK],
    },
    {
      target: BOUND_VALIDATOR,
      signature: "transferOwnership(address)",
      params: [zksyncmainnet.NORMAL_TIMELOCK],
    },
    ...NTGs.map(ntg => {
      return {
        target: ntg,
        signature: "transferOwnership(address)",
        params: [zksyncmainnet.NORMAL_TIMELOCK],
      };
    }),
  ]);
};

export default vip017;
