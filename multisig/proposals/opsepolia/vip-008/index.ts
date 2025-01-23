import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { opsepolia } = NETWORK_ADDRESSES;

export const DEFAULT_PROXY_ADMIN = "0xa9aaf2A1cCf2C3a87997942abaA740887cC89241";
export const ACM = "0x1652E12C8ABE2f0D84466F0fc1fA4286491B3BC1";
export const PRIME = "0x54dEb59698c628be5EEd5AD41Fd825Eb3Be89704";
export const PLP = "0xE3EC955b94D197a8e4081844F3f25F81047A9AF5";
export const PSR = "0x0F021c29283c47DF8237741dD5a0aA22952aFc88";
export const COMPTROLLER_BEACON = "0x38f5dF439ff02CCC45eA5837128E9328C3338A90";
export const VTOKEN_BEACON = "0x77C3435DD7D40fA0435e8cCAD4051f2904471ca3";
export const POOL_REGISTRY = "0x6538C861C7A6997602311342657b9143dD9E8152";
export const XVS_STORE = "0xE888FA54b32BfaD3cE0e3C7D566EFe809a6A0143";
export const COMPTROLLERS = ["0x59d10988974223B042767aaBFb6D926863069535"];
export const XVS_BRIDGE_ADMIN_PROXY = "0x6bBcB95eCF9BEc9AE91d5Ad227783e3913145321";
export const XVS = "0x789482e37218f9b26d8D9115E356462fA9A37116";
export const BOUND_VALIDATOR = "0x482469F1DA6Ec736cacF6361Ec41621f811A6800";
export const VTOKENS = [
  "0x49cceCdd0b399C1b13260452893A3A835bDad5DC",
  "0x2419606690B08060ebFd7581e0a6Ae45f1915ee9",
  "0xC23D18536E7069f924B3717B2710CA6A09e53ea9",
  "0x6149eFAd7671f496C900B3BeC16Ba31Aed60BE4b",
  "0x4E610626BeF901EEE22D558b2ed19e6f7B87cf51",
];
export const REWARD_DISTRIBUTORS = ["0x24139Dad3fe87Ee718ff9c2A8E0C4188578ba9aF"];
export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

export const NTGs = ["0x521f59b2670bcc70961FB2edD4F62c3f3B1E7f6b"];

const vip008 = () => {
  return makeProposal([
    {
      target: DEFAULT_PROXY_ADMIN,
      signature: "transferOwnership(address)",
      params: [opsepolia.NORMAL_TIMELOCK],
    },
    {
      target: PRIME,
      signature: "transferOwnership(address)",
      params: [opsepolia.NORMAL_TIMELOCK],
    },
    {
      target: PLP,
      signature: "transferOwnership(address)",
      params: [opsepolia.NORMAL_TIMELOCK],
    },
    {
      target: PSR,
      signature: "transferOwnership(address)",
      params: [opsepolia.NORMAL_TIMELOCK],
    },
    {
      target: COMPTROLLER_BEACON,
      signature: "transferOwnership(address)",
      params: [opsepolia.NORMAL_TIMELOCK],
    },
    {
      target: VTOKEN_BEACON,
      signature: "transferOwnership(address)",
      params: [opsepolia.NORMAL_TIMELOCK],
    },
    {
      target: POOL_REGISTRY,
      signature: "transferOwnership(address)",
      params: [opsepolia.NORMAL_TIMELOCK],
    },
    ...COMPTROLLERS.map(comptroller => {
      return {
        target: comptroller,
        signature: "transferOwnership(address)",
        params: [opsepolia.NORMAL_TIMELOCK],
      };
    }),
    ...VTOKENS.map(comptroller => {
      return {
        target: comptroller,
        signature: "transferOwnership(address)",
        params: [opsepolia.NORMAL_TIMELOCK],
      };
    }),
    {
      target: opsepolia.XVS_VAULT_PROXY,
      signature: "_setPendingAdmin(address)",
      params: [opsepolia.NORMAL_TIMELOCK],
    },
    {
      target: XVS_STORE,
      signature: "setPendingAdmin(address)",
      params: [opsepolia.NORMAL_TIMELOCK],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "transferOwnership(address)",
      params: [opsepolia.NORMAL_TIMELOCK],
    },
    {
      target: XVS,
      signature: "transferOwnership(address)",
      params: [opsepolia.NORMAL_TIMELOCK],
    },
    {
      target: opsepolia.RESILIENT_ORACLE,
      signature: "transferOwnership(address)",
      params: [opsepolia.NORMAL_TIMELOCK],
    },
    {
      target: opsepolia.CHAINLINK_ORACLE,
      signature: "transferOwnership(address)",
      params: [opsepolia.NORMAL_TIMELOCK],
    },
    {
      target: BOUND_VALIDATOR,
      signature: "transferOwnership(address)",
      params: [opsepolia.NORMAL_TIMELOCK],
    },
    {
      target: opsepolia.VTREASURY,
      signature: "transferOwnership(address)",
      params: [opsepolia.NORMAL_TIMELOCK],
    },
    ...NTGs.map(ntg => {
      return {
        target: ntg,
        signature: "transferOwnership(address)",
        params: [opsepolia.NORMAL_TIMELOCK],
      };
    }),
    ...REWARD_DISTRIBUTORS.map(rewardDistributor => {
      return {
        target: rewardDistributor,
        signature: "transferOwnership(address)",
        params: [opsepolia.NORMAL_TIMELOCK],
      };
    }),
  ]);
};

export default vip008;
