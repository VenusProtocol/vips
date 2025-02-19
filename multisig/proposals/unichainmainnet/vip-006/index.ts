import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { unichainmainnet } = NETWORK_ADDRESSES;

const ACM = "0x1f12014c497a9d905155eB9BfDD9FaC6885e61d0";
export const PRIME_LIQUIDITY_PROVIDER = "0x045a45603E1b073F444fe3Be7d5C7e0a5035afB7";
export const PRIME = "0x600aFf613d40D87C8Fe90Cb2e78e8e6667c0C872";
export const COMPTROLLER_CORE = "0xe22af1e6b78318e1Fe1053Edbd7209b8Fc62c4Fe";

const PRIME_POOL_ID = 0;

const vip006 = () => {
  return makeProposal([
    {
      target: PRIME,
      signature: "initializeV2(address)",
      params: [unichainmainnet.POOL_REGISTRY],
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
      params: [PRIME_LIQUIDITY_PROVIDER, "setTokensDistributionSpeed(address[],uint256[])", unichainmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [
        PRIME_LIQUIDITY_PROVIDER,
        "setMaxTokensDistributionSpeed(address[],uint256[])",
        unichainmainnet.GUARDIAN,
      ],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME_LIQUIDITY_PROVIDER, "setMaxLoopsLimit(uint256)", unichainmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME_LIQUIDITY_PROVIDER, "pauseFundsTransfer()", unichainmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME_LIQUIDITY_PROVIDER, "resumeFundsTransfer()", unichainmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "updateAlpha(uint128,uint128)", unichainmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "updateMultipliers(address,uint256,uint256)", unichainmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "setStakedAt(address[],uint256[])", unichainmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "addMarket(address,address,uint256,uint256)", unichainmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "setLimit(uint256,uint256)", unichainmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "setMaxLoopsLimit(uint256)", unichainmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "issue(bool,address[])", unichainmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "burn(address)", unichainmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PRIME, "togglePause()", unichainmainnet.GUARDIAN],
    },
    {
      target: PRIME_LIQUIDITY_PROVIDER,
      signature: "setPrimeToken(address)",
      params: [PRIME],
    },
    {
      target: unichainmainnet.XVS_VAULT_PROXY,
      signature: "setPrimeToken(address,address,uint256)",
      params: [PRIME, unichainmainnet.XVS, PRIME_POOL_ID],
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
      target: unichainmainnet.XVS_VAULT_PROXY,
      signature: "resume()",
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
