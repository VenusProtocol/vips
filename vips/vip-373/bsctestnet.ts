import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const SEPOLIA_ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const SEPOLIA_FASTTRACK_TIMELOCK = "0x7F043F43Adb392072a3Ba0cC9c96e894C6f7e182";
export const SEPOLIA_CRITICAL_TIMELOCK = "0xA24A7A65b8968a749841988Bd7d05F6a94329fDe";
export const ARBITRUM_SEPOLIA_ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
export const OPBNBTESTNET_ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";

export const ARBITRUM_SEPOLIA_XVS_STORE = "0x4e909DA6693215dC630104715c035B159dDb67Dd";
export const SEPOLIA_XVS_STORE = "0x03B868C7858F50900fecE4eBc851199e957b5d3D";
export const OPBNBTESTNET_XVS_STORE = "0x06473fB3f7bF11e2E8EfEcC95aC55ABEFCb2e0A0";

export const SEPOLIA_XVS_BRIDGE_ADMIN = "0xd3c6bdeeadB2359F726aD4cF42EAa8B7102DAd9B";
export const OPBNBTESTNET_XVS_BRIDGE_ADMIN = "0x19252AFD0B2F539C400aEab7d460CBFbf74c17ff";
export const ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN = "0xc94578caCC89a29B044a0a1D54d20d48A645E5C8";

const SEPOLIA_CHAIN_ID = LzChainId.sepolia;
const OPBNBTESTNET_CHAIN_ID = LzChainId.opbnbtestnet;
const ARBITRUM_SEPOLIA_CHAIN_ID = LzChainId.arbitrumsepolia;

export const ARBITRUM_SEPOLIA_BOUND_VALIDATOR = "0xfe6bc1545Cc14C131bacA97476D6035ffcC0b889";
export const SEPOLIA_BOUND_VALIDATOR = "0x60c4Aa92eEb6884a76b309Dd8B3731ad514d6f9B";
export const OPBNBTESTNET_BOUND_VALIDATOR = "0x049537Bb065e6253e9D8D08B45Bf6b753657A746";
export const SEPOLIA_sFrxETH_ORACLE = "0x61EB836afA467677e6b403D504fe69D6940e7996";

export const ARBITRUMSEPOLIA_ACM_AGGREGATOR = "0x4fCbfE445396f31005b3Fd2F6DE2A986d6E2dCB5";
export const OPBNBTESTNET_ACM_AGGREGATOR = "0xbDd501dB1B0D6aab299CE69ef5B86C8578947AD0";
export const SEPOLIA_ACM_AGGREGATOR = "0x0653830c55035d678e1287b2d4550519fd263d0e";

export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

const { arbitrumsepolia, sepolia, opbnbtestnet } = NETWORK_ADDRESSES;

const vip373 = () => {
  const meta = {
    version: "v2",
    title: "VIP-332 accept ownership & give permissions to Normal Timelock",
    description: `### Description`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: arbitrumsepolia.XVS_VAULT_PROXY,
        signature: "_acceptAdmin()",
        params: [],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: sepolia.XVS_VAULT_PROXY,
        signature: "_acceptAdmin()",
        params: [],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: opbnbtestnet.XVS_VAULT_PROXY,
        signature: "_acceptAdmin()",
        params: [],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: ARBITRUM_SEPOLIA_XVS_STORE,
        signature: "acceptAdmin()",
        params: [],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: SEPOLIA_XVS_STORE,
        signature: "acceptAdmin()",
        params: [],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: OPBNBTESTNET_XVS_STORE,
        signature: "acceptAdmin()",
        params: [],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: ARBITRUM_SEPOLIA_CHAIN_ID,
      },
      {
        target: OPBNBTESTNET_XVS_BRIDGE_ADMIN,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: OPBNBTESTNET_CHAIN_ID,
      },
      {
        target: SEPOLIA_XVS_BRIDGE_ADMIN,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: SEPOLIA_CHAIN_ID,
      },
      {
        target: arbitrumsepolia.CHAINLINK_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARBITRUM_SEPOLIA_BOUND_VALIDATOR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: arbitrumsepolia.REDSTONE_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: arbitrumsepolia.RESILIENT_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: opbnbtestnet.BINANCE_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: opbnbtestnet.RESILIENT_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_BOUND_VALIDATOR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbtestnet,
      },

      {
        target: sepolia.CHAINLINK_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.sepolia,
      },

      {
        target: sepolia.REDSTONE_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sepolia.RESILIENT_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_BOUND_VALIDATOR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_sFrxETH_ORACLE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: arbitrumsepolia.VTREASURY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: opbnbtestnet.VTREASURY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbtestnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip373;
