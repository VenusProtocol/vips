import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { unichainsepolia } = NETWORK_ADDRESSES;

const ACM = "0x854C064EA6b503A97980F481FA3B7279012fdeDd";
export const PRIME_LIQUIDITY_PROVIDER = "0xDA4dcFBdC06A9947100a757Ee0eeDe88debaD586";
export const PRIME = "0x59b95BF96D6D5FA1adf1Bfd20848A9b25814317A";
export const POOL_REGISTRY = "0x9027cF782515F3184bbF7A6cD7a33052dc52E439";
export const COMPTROLLER_CORE = "0xFeD3eAA668a6179c9E5E1A84e3A7d6883F06f7c1";
const PRIME_POOL_ID = 0;

const vip006 = () => {
  return makeProposal([
    {
      target: PRIME,
      signature: "initializeV2(address)",
      params: [POOL_REGISTRY],
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
      params: [PRIME_LIQUIDITY_PROVIDER, "setTokensDistributionSpeed(address[],uint256[])", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME_LIQUIDITY_PROVIDER, "setMaxTokensDistributionSpeed(address[],uint256[])", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME_LIQUIDITY_PROVIDER, "setMaxLoopsLimit(uint256)", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME_LIQUIDITY_PROVIDER, "pauseFundsTransfer()", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME_LIQUIDITY_PROVIDER, "resumeFundsTransfer()", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "updateAlpha(uint128,uint128)", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "updateMultipliers(address,uint256,uint256)", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "setStakedAt(address[],uint256[])", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "addMarket(address,address,uint256,uint256)", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "setLimit(uint256,uint256)", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "setMaxLoopsLimit(uint256)", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "issue(bool,address[])", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "burn(address)", unichainsepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "togglePause()", unichainsepolia.GUARDIAN],
    },
    {
      target: PRIME_LIQUIDITY_PROVIDER,
      signature: "setPrimeToken(address)",
      params: [PRIME],
    },
    { target: unichainsepolia.XVS_VAULT_PROXY, signature: "resume()", params: [] },
    {
      target: unichainsepolia.XVS_VAULT_PROXY,
      signature: "setPrimeToken(address,address,uint256)",
      params: [PRIME, unichainsepolia.XVS, PRIME_POOL_ID],
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
      target: COMPTROLLER_CORE,
      signature: "setPrimeToken(address)",
      params: [PRIME],
    },
  ]);
};

export default vip006;
