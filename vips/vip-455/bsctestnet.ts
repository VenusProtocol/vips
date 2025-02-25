import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { berachainbartio } = NETWORK_ADDRESSES;

export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const ACM_AGGREGATOR = "0x1ba10ca9a744131aD8428D719767816A693c3b71";
export const ACM = "0xEf368e4c1f9ACC9241E66CD67531FEB195fF7536";
export const PSR = "0xE4dD1B52c3D9d93d42B44cB77D769A9F73225012";
export const PRIME = "0x3AAEd911374A60856a205cEf545F5Af49969aAa7";
export const PRIME_LIQUIDITY_PROVIDER = "0x4039Ba7b3837FA9C2Ae95e59573f5CBfB4691c40";
export const COMPTROLLER_CORE = "0x854Ba54c41bE5e54408EDF432e28A195Bcd3E88d";

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
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [8],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: PRIME,
        signature: "initializeV2(address)",
        params: [berachainbartio.POOL_REGISTRY],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: PRIME,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "setPrimeToken(address)",
        params: [PRIME],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: berachainbartio.XVS_VAULT_PROXY,
        signature: "setPrimeToken(address,address,uint256)",
        params: [PRIME, berachainbartio.XVS, PRIME_POOL_ID],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: PRIME,
        signature: "setLimit(uint256,uint256)",
        params: [
          0, // irrevocable
          0, // revocable
        ],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "pauseFundsTransfer()",
        params: [],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: berachainbartio.XVS_VAULT_PROXY,
        signature: "resume()",
        params: [],
        dstChainId: LzChainId.berachainbartio,
      },
      {
        target: COMPTROLLER_CORE,
        signature: "setPrimeToken(address)",
        params: [PRIME],
        dstChainId: LzChainId.berachainbartio,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip453;
