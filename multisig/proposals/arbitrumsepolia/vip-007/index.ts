import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

const ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
export const XVS_VAULT_PROXY = "0xC431A15F5359CdF230c9Bd6b11B538bC2aE2C52B";
export const PRIME_LIQUIDITY_PROVIDER = "0xE82c2c10F55D3268126C29ec813dC6F086904694";
export const PRIME = "0x3fE7B9757F1377DEc82f0111aAa45b6B23FD646C";
export const XVS = "0x47fA6E9F717c9eB081c4734FfB5a1EcD70508891";

export const POOL_REGISTRY = "0xEcFa4d4FcBB76A19EB90F947CCCd5c29375bD3Bd";
export const COMPTROLLER_CORE = "0x5e5221f13b50Bc93f0DdD995911360807f48892e";

const PRIME_POOL_ID = 0;

const vip007 = () => {
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
      params: [
        PRIME_LIQUIDITY_PROVIDER,
        "setTokensDistributionSpeed(address[],uint256[])",
        arbitrumsepolia.NORMAL_TIMELOCK,
      ],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        PRIME_LIQUIDITY_PROVIDER,
        "setMaxTokensDistributionSpeed(address[],uint256[])",
        arbitrumsepolia.NORMAL_TIMELOCK,
      ],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME_LIQUIDITY_PROVIDER, "setMaxLoopsLimit(uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME_LIQUIDITY_PROVIDER, "pauseFundsTransfer()", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME_LIQUIDITY_PROVIDER, "resumeFundsTransfer()", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "updateAlpha(uint128,uint128)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "updateMultipliers(address,uint256,uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "setStakedAt(address[],uint256[])", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "addMarket(address,address,uint256,uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "setLimit(uint256,uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "setMaxLoopsLimit(uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "issue(bool,address[])", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "burn(address)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "togglePause()", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: PRIME_LIQUIDITY_PROVIDER,
      signature: "setPrimeToken(address)",
      params: [PRIME],
    },
    {
      target: COMPTROLLER_CORE,
      signature: "setPrimeToken(address)",
      params: [PRIME],
    },
    {
      target: XVS_VAULT_PROXY,
      signature: "setPrimeToken(address,address,uint256)",
      params: [PRIME, XVS, PRIME_POOL_ID],
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
  ]);
};

export default vip007;
