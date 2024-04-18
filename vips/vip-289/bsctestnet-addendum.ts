import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const RESILIENT_ORACLE = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";
export const ankrBNB = "0x5269b7558D3d5E113010Ef1cFF0901c367849CC9";
export const TEMP_POOL_REGISTRY_IMP = "0x0012875a7395a293Adfc9b5cDC2Cfa352C4cDcD3";
export const ORIGINAL_POOL_REGISTRY_IMP = "0xed659A02c5f63f299C28F6A246143326b922e3d9";
export const PROXY_ADMIN = "0x7877ffd62649b6a1557b55d4c20fcbab17344c91";
export const POOL_REGISTRY = "0xC85491616Fa949E048F3aAc39fbf5b0703800667";
export const OLD_ankrBNB = "0x167F1F9EF531b3576201aa3146b13c57dbEda514";
export const COMPTROLLER_ADDRESS = "0x23a73971A6B9f6580c048B9CB188869B2A2aA2aD";
export const vankrBNB = "0xe507B30C41E9e375BCe05197c1e09fc9ee40c0f6";
export const TEMP_VTOKEN_IMP = "0xbd3AAd064295dcA0f45fab4C6A5adFb0D23a19D2";
export const VTOKEN_BEACON = "0xBF85A90673E61956f8c79b9150BAB7893b791bDd";
export const VTOKEN_IMP = "0xa60b28FDDaAB87240C3AF319892e7A4ad6FbF41F";

const vip289Addendum = () => {
  const meta = {
    version: "v2",
    title: "VIP-289 Set custom oracle for market DeFi ankrBNB and Upgrade Underlying",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [POOL_REGISTRY, TEMP_POOL_REGISTRY_IMP],
      },
      {
        target: POOL_REGISTRY,
        signature: "updateUnderlying(address,address,address,address)",
        params: [OLD_ankrBNB, ankrBNB, COMPTROLLER_ADDRESS, vankrBNB],
      },
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [POOL_REGISTRY, ORIGINAL_POOL_REGISTRY_IMP],
      },
      {
        target: VTOKEN_BEACON,
        signature: "upgradeTo(address)",
        params: [TEMP_VTOKEN_IMP],
      },
      {
        target: vankrBNB,
        signature: "updateUnderlying(address)",
        params: [ankrBNB],
      },
      {
        target: VTOKEN_BEACON,
        signature: "upgradeTo(address)",
        params: [VTOKEN_IMP],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip289Addendum;
