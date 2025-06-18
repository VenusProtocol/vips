import { NETWORK_ADDRESSES, ZERO_ADDRESS } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet, sepolia, unichainsepolia, arbitrumsepolia, opsepolia, basesepolia, opbnbtestnet, zksyncsepolia } =
  NETWORK_ADDRESSES;

export const ERC4626_FACTORY_BNB = "0x07fcd489aef6a3EEAA9e8adE4361Fe5CC5BF30f7";
export const ERC4626_FACTORY_SEPOLIA = "0xbf76e9429BA565220d77831A9eC3606434e2106e";
export const ERC4626_FACTORY_OPBNB = "0x3dEDBD90EFC6E2257887FF36842337dF0739B8A1";
export const ERC4626_FACTORY_BASE = "0xD13c5527d1a2a8c2cC9c9eb260AC4D9D811a02a4";
export const ERC4626_FACTORY_ARBITRUM = "0xC6C8249a0B44973673f3Af673e530B85038a0480";
export const ERC4626_FACTORY_OPTIMISM = "0xc66c4058A8524253C22a9461Df6769CE09F7d61e";
export const ERC4626_FACTORY_UNICHAIN = "0x1365820B9ba3B1b5601208437a5A24192a12C1fB";
export const ERC4626_FACTORY_ZKSYNC = "0xa30dcc21B8393A4031cD6364829CDfE2b6D7B283";

export const PSR_BNB = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";
export const PSR_SEPOLIA = "0xbea70755cc3555708ca11219adB0db4C80F6721B";
export const PSR_OPBNB = "0xc355dEb1A9289f8C58CFAa076EEdBf51F3A8Da7F";
export const PSR_BASE = "0x4Ae3D77Ece08Ec3E5f5842B195f746bd3bCb8d73";
export const PSR_ARBITRUM = "0x09267d30798B59c581ce54E861A084C6FC298666";
export const PSR_OPTIMISM = "0x0F021c29283c47DF8237741dD5a0aA22952aFc88";
export const PSR_UNICHAIN = "0xcCcFc9B37A5575ae270352CC85D55C3C52a646C0";
export const PSR_ZKSYNC = "0x5722B43BD91fAaDC4E7f384F4d6Fb32456Ec5ffB";

export const PSR_BNB_NEW_IMPLEMENTATION = "0xC23631E757d15680a8686D97Cf200625ad30c826";
export const PSR_SEPOLIA_NEW_IMPLEMENTATION = "0x0Bb458A710333A3f3a6DD689136A999238E7341D";
export const PSR_OPBNB_NEW_IMPLEMENTATION = "0x87fe63539af70B0634f1f831A194BD0C97CffAfF";
export const PSR_BASE_NEW_IMPLEMENTATION = "0x4f43F45066A371F38Bb9257c3A9d6a5036665F23";
export const PSR_ARBITRUM_NEW_IMPLEMENTATION = "0x032032F7A2F990D4946398FCc5f5B6E715C2298A";
export const PSR_OPTIMISM_NEW_IMPLEMENTATION = "0xC27D48Be9B4c544B976dF5028b78E22720F58C99";
export const PSR_UNICHAIN_NEW_IMPLEMENTATION = "0x2Ffcb190F3C7d5F8626262d450e151018D23524c";
export const PSR_ZKSYNC_NEW_IMPLEMENTATION = "0x2c138F31F91404D9A96B3D3e887fB5aBA287D2a0";

export const ACM_BNB = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
export const ACM_SEPOLIA = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const ACM_OPBNB = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";
export const ACM_BASE = "0x724138223D8F76b519fdE715f60124E7Ce51e051";
export const ACM_ARBITRUM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
export const ACM_OPTIMISM = "0x1652E12C8ABE2f0D84466F0fc1fA4286491B3BC1";
export const ACM_UNICHAIN = "0x854C064EA6b503A97980F481FA3B7279012fdeDd";
export const ACM_ZKSYNC = "0xD07f543d47c3a8997D6079958308e981AC14CD01";

export const PROXY_ADMIN_BNB = "0x7877ffd62649b6a1557b55d4c20fcbab17344c91";
export const PROXY_ADMIN_BASE = "0xB85dD19112c4BF1240FeD0f26E8D0b0576a82546";
export const PROXY_ADMIN_ARBITRUM = "0xA78A1Df376c3CEeBC5Fab574fe6EdDbbF76fd03e";
export const PROXY_ADMIN_SEPOLIA = "0x01435866babd91311b1355cf3af488cca36db68e";
export const PROXY_ADMIN_OPBNB = "0xB1281ADC816fba7df64B798D7A0BC4bd2a6d42f4";
export const PROXY_ADMIN_OPTIMISM = "0xa9aaf2A1cCf2C3a87997942abaA740887cC89241";
export const PROXY_ADMIN_UNICHAIN = "0x256735eFdfDf135bD6991854e0065909e57804aa";
export const PROXY_ADMIN_ZKSYNC = "0x18E44f588a4DcF2F7145d35A5C226e129040b6D3";

export const vip517 = () => {
  const meta = {
    version: "v2",
    title: "VIP-517",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with the Vault Upgrades",
    againstDescription: "I do not think that Venus Protocol should proceed with the Vault Upgrades",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Vault Upgrades or not",
  };

  return makeProposal(
    [
      // bsctestnet
      {
        target: ERC4626_FACTORY_BNB,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: ACM_BNB,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_BNB, "setRewardRecipient(address)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: ACM_BNB,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_BNB, "setMaxLoopsLimit(uint256)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: ACM_BNB,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setRewardRecipient(address)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: ACM_BNB,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setMaxLoopsLimit(uint256)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: ERC4626_FACTORY_BNB,
        signature: "setRewardRecipient(address)",
        params: [PSR_BNB],
      },
      {
        target: PROXY_ADMIN_BNB,
        signature: "upgrade(address,address)",
        params: [PSR_BNB, PSR_BNB_NEW_IMPLEMENTATION],
      },
      // sepolia
      {
        target: ERC4626_FACTORY_SEPOLIA,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ACM_SEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_SEPOLIA, "setRewardRecipient(address)", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ACM_SEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_SEPOLIA, "setMaxLoopsLimit(uint256)", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ACM_SEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setRewardRecipient(address)", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ACM_SEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setMaxLoopsLimit(uint256)", sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ERC4626_FACTORY_SEPOLIA,
        signature: "setRewardRecipient(address)",
        params: [PSR_SEPOLIA],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: PROXY_ADMIN_SEPOLIA,
        signature: "upgrade(address,address)",
        params: [PSR_SEPOLIA, PSR_SEPOLIA_NEW_IMPLEMENTATION],
        dstChainId: LzChainId.sepolia,
      },
      // unichainsepolia
      {
        target: ERC4626_FACTORY_UNICHAIN,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: ACM_UNICHAIN,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_UNICHAIN, "setRewardRecipient(address)", unichainsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: ACM_UNICHAIN,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_UNICHAIN, "setMaxLoopsLimit(uint256)", unichainsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: ACM_UNICHAIN,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setRewardRecipient(address)", unichainsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: ACM_UNICHAIN,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setMaxLoopsLimit(uint256)", unichainsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: ERC4626_FACTORY_UNICHAIN,
        signature: "setRewardRecipient(address)",
        params: [PSR_UNICHAIN],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: PROXY_ADMIN_UNICHAIN,
        signature: "upgrade(address,address)",
        params: [PSR_UNICHAIN, PSR_UNICHAIN_NEW_IMPLEMENTATION],
        dstChainId: LzChainId.unichainsepolia,
      },
      // arbitrumsepolia
      {
        target: ERC4626_FACTORY_ARBITRUM,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ACM_ARBITRUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_ARBITRUM, "setRewardRecipient(address)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ACM_ARBITRUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_ARBITRUM, "setMaxLoopsLimit(uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ACM_ARBITRUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setRewardRecipient(address)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ACM_ARBITRUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setMaxLoopsLimit(uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ERC4626_FACTORY_ARBITRUM,
        signature: "setRewardRecipient(address)",
        params: [PSR_ARBITRUM],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: PROXY_ADMIN_ARBITRUM,
        signature: "upgrade(address,address)",
        params: [PSR_ARBITRUM, PSR_ARBITRUM_NEW_IMPLEMENTATION],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      // opsepolia
      {
        target: ERC4626_FACTORY_OPTIMISM,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: ACM_OPTIMISM,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_OPTIMISM, "setRewardRecipient(address)", opsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: ACM_OPTIMISM,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_OPTIMISM, "setMaxLoopsLimit(uint256)", opsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: ACM_OPTIMISM,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setRewardRecipient(address)", opsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: ACM_OPTIMISM,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setMaxLoopsLimit(uint256)", opsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: ERC4626_FACTORY_OPTIMISM,
        signature: "setRewardRecipient(address)",
        params: [PSR_OPTIMISM],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: PROXY_ADMIN_OPTIMISM,
        signature: "upgrade(address,address)",
        params: [PSR_OPTIMISM, PSR_OPTIMISM_NEW_IMPLEMENTATION],
        dstChainId: LzChainId.opsepolia,
      },
      // opbnbtestnet
      {
        target: ERC4626_FACTORY_OPBNB,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: ACM_OPBNB,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_OPBNB, "setRewardRecipient(address)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: ACM_OPBNB,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_OPBNB, "setMaxLoopsLimit(uint256)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: ACM_OPBNB,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setRewardRecipient(address)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: ACM_OPBNB,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setMaxLoopsLimit(uint256)", opbnbtestnet.NORMAL_TIMELOCK],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: ERC4626_FACTORY_OPBNB,
        signature: "setRewardRecipient(address)",
        params: [PSR_OPBNB],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: PROXY_ADMIN_OPBNB,
        signature: "upgrade(address,address)",
        params: [PSR_OPBNB, PSR_OPBNB_NEW_IMPLEMENTATION],
        dstChainId: LzChainId.opbnbtestnet,
      },
      // basesepolia
      {
        target: ERC4626_FACTORY_BASE,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: ACM_BASE,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_BASE, "setRewardRecipient(address)", basesepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: ACM_BASE,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_BASE, "setMaxLoopsLimit(uint256)", basesepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: ACM_BASE,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setRewardRecipient(address)", basesepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: ACM_BASE,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setMaxLoopsLimit(uint256)", basesepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: ERC4626_FACTORY_BASE,
        signature: "setRewardRecipient(address)",
        params: [PSR_BASE],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: PROXY_ADMIN_BASE,
        signature: "upgrade(address,address)",
        params: [PSR_BASE, PSR_BASE_NEW_IMPLEMENTATION],
        dstChainId: LzChainId.basesepolia,
      },
      // zksyncsepolia
      {
        target: ERC4626_FACTORY_ZKSYNC,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: ACM_ZKSYNC,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_ZKSYNC, "setRewardRecipient(address)", zksyncsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: ACM_ZKSYNC,
        signature: "giveCallPermission(address,string,address)",
        params: [ERC4626_FACTORY_ZKSYNC, "setMaxLoopsLimit(uint256)", zksyncsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: ACM_ZKSYNC,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setRewardRecipient(address)", zksyncsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: ACM_ZKSYNC,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setMaxLoopsLimit(uint256)", zksyncsepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: ERC4626_FACTORY_ZKSYNC,
        signature: "setRewardRecipient(address)",
        params: [PSR_ZKSYNC],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: PROXY_ADMIN_ZKSYNC,
        signature: "upgrade(address,address)",
        params: [PSR_ZKSYNC, PSR_ZKSYNC_NEW_IMPLEMENTATION],
        dstChainId: LzChainId.zksyncsepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip517;
