import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { berachainbepolia } = NETWORK_ADDRESSES;

export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const ACM_AGGREGATOR = "0x1EAA596ad8101bb321a5999e509A61747893078B";
export const ACM = "0x243313C1cC198FF80756ed2ef14D9dcd94Ee762b";
export const PSR = "0xC081DF6860E7E537b0330cD6c1b6529378838D5e";
export const PRIME = "0x6C3cB3CacBDEB37aAa3Ff12d18D19C49FA82f425";
export const PRIME_LIQUIDITY_PROVIDER = "0x6c680DE00C8D57c14f0ec23Bd16b41d04961E1Cf";
export const COMPTROLLER_CORE = "0x2cAD397672BD86269E0fD41E4c61D91974e78FD0";

const PRIME_POOL_ID = 0;

const vip453 = () => {
  const meta = {
    version: "v2",
    title: "VIP-4539",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [3],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: PRIME,
        signature: "initializeV2(address)",
        params: [berachainbepolia.POOL_REGISTRY],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: PRIME,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "setPrimeToken(address)",
        params: [PRIME],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: berachainbepolia.XVS_VAULT_PROXY,
        signature: "setPrimeToken(address,address,uint256)",
        params: [PRIME, berachainbepolia.XVS, PRIME_POOL_ID],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: PRIME,
        signature: "setLimit(uint256,uint256)",
        params: [
          0, // irrevocable
          0, // revocable
        ],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "pauseFundsTransfer()",
        params: [],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: berachainbepolia.XVS_VAULT_PROXY,
        signature: "resume()",
        params: [],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: COMPTROLLER_CORE,
        signature: "setPrimeToken(address)",
        params: [PRIME],
        dstChainId: LzChainId.berachainbepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip453;
