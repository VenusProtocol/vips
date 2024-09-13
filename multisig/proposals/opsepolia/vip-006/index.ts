import { NETWORK_ADDRESSES } from "src/networkAddresses";

import { makeProposal } from "../../../../src/utils";

const { opsepolia } = NETWORK_ADDRESSES;

export const ACM = "0x1652E12C8ABE2f0D84466F0fc1fA4286491B3BC1";
export const PRIME_LIQUIDITY_PROVIDER = "0xE3EC955b94D197a8e4081844F3f25F81047A9AF5";
export const PRIME = "0x54dEb59698c628be5EEd5AD41Fd825Eb3Be89704";

const PRIME_POOL_ID = 0;

const vip006 = () => {
  return makeProposal([
    {
      target: PRIME,
      signature: "initializeV2(address)",
      params: [opsepolia.POOL_REGISTRY],
    },
    {
      target: PRIME_LIQUIDITY_PROVIDER,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: PRIME,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME_LIQUIDITY_PROVIDER, "setTokensDistributionSpeed(address[],uint256[])", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME_LIQUIDITY_PROVIDER, "setMaxTokensDistributionSpeed(address[],uint256[])", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME_LIQUIDITY_PROVIDER, "setMaxLoopsLimit(uint256)", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME_LIQUIDITY_PROVIDER, "pauseFundsTransfer()", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME_LIQUIDITY_PROVIDER, "resumeFundsTransfer()", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "updateAlpha(uint128,uint128)", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "updateMultipliers(address,uint256,uint256)", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "setStakedAt(address[],uint256[])", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "addMarket(address,address,uint256,uint256)", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "setLimit(uint256,uint256)", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "setMaxLoopsLimit(uint256)", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "issue(bool,address[])", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "burn(address)", opsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "togglePause()", opsepolia.GUARDIAN],
    },
    {
      target: PRIME_LIQUIDITY_PROVIDER,
      signature: "setPrimeToken(address)",
      params: [PRIME],
    },
    {
      target: opsepolia.XVS_VAULT_PROXY,
      signature: "setPrimeToken(address,address,uint256)",
      params: [PRIME, opsepolia.XVS, PRIME_POOL_ID],
    },
    {
      target: PRIME,
      signature: "setLimit(uint256,uint256)",
      params: [
        0, // irrevocable
        0, // revocable
      ],
    },
    {
      target: PRIME_LIQUIDITY_PROVIDER,
      signature: "pauseFundsTransfer()",
      params: [],
    },
    {
      target: opsepolia.XVS_VAULT_PROXY,
      signature: "resume()",
      params: [],
    },
  ]);
};

export default vip006;
