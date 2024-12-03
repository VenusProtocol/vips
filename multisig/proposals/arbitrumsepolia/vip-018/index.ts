import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

export const COMPTROLLER_CORE = "0x006D44b6f5927b3eD83bD0c1C36Fb1A3BaCaC208";
export const COMPTROLLER_LST = "0x3D04F926b2a165BBa17FBfccCCB61513634fa5e4";
export const PRIME = "0xAdB04AC4942683bc41E27d18234C8DC884786E89";
export const PLP = "0xE82c2c10F55D3268126C29ec813dC6F086904694";

export const USDT = "0xf3118a17863996B9F2A073c9A66Faaa664355cf8";
export const USDC = "0x86f096B1D970990091319835faF3Ee011708eAe8";
export const WBTC = "0xFb8d93FD3Cf18386a5564bb5619cD1FdB130dF7D";
export const WETH = "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73";
export const PRIME_NEW_IMPLEMENTATION = "0x507866eCb585275E006D9098867a0e9B08C11CCe"; // contains the setter for the pool registry address
export const PRIME_OLD_IMPLEMENTATION = "0x255EFC81Ba715FA7C2C27bdd983A3CeF9BB07fEf";
export const PROXY_ADMIN = "0xA78A1Df376c3CEeBC5Fab574fe6EdDbbF76fd03e";

const vip018 = () => {
  return makeProposal([
    {
      target: PROXY_ADMIN,
      signature: "upgrade(address,address)",
      params: [PRIME, PRIME_NEW_IMPLEMENTATION],
    },
    {
      target: PRIME,
      signature: "setPoolRegistry(address)",
      params: [arbitrumsepolia.POOL_REGISTRY],
    },
    {
      target: PROXY_ADMIN,
      signature: "upgrade(address,address)",
      params: [PRIME, PRIME_OLD_IMPLEMENTATION],
    },
    {
      target: COMPTROLLER_CORE,
      signature: "setPrimeToken(address)",
      params: [PRIME],
    },
    {
      target: COMPTROLLER_LST,
      signature: "setPrimeToken(address)",
      params: [PRIME],
    },
    {
      target: PLP,
      signature: "initializeTokens(address[])",
      params: [[WETH, WBTC, USDC, USDT]],
    },
  ]);
};

export default vip018;
