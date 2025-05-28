import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const ARB_vUSDC_Core = "0xd9d1e754464eFc7493B177d2c7be04816E089b4C";
export const ARB_vUSDT_Core = "0xdEFbf0F9Ab6CdDd0a1FdDC894b358D0c0a39B052";
export const BASE_vUSDC_Core = "0xA31D67c056Aadc2501535f2776bF1157904f810e";

export const BNB_vFDUSD_CORE = "0xF06e662a00796c122AaAE935EC4F0Be3F74f5636";
export const BNB_vUSDC_CORE = "0xD5C4C2e2facBEB59D0216D0595d63FcDc6F9A1a7";
export const BNB_vTUSD_CORE = "0xEFAACF73CE2D38ED40991f29E72B12C74bd4cf23";
export const BNB_vUSDT_CORE = "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A";
export const BNB_vUSDT_DeFi = "0x80CC30811e362aC9aB857C3d7875CbcCc0b65750";
export const BNB_vUSDD_DeFi = "0xa109DE0abaeefC521Ec29D89eA42E64F37A6882E";
export const BNB_vUSDT_GameFi = "0x0bFE4e0B8A2a096A27e5B18b078d25be57C08634";
export const BNB_vUSDD_GameFi = "0xdeDf3B2bcF25d0023115fd71a0F8221C91C92B1a";
export const BNB_vUSDT_Meme = "0x3AF2bE7AbEF0f840b196D99d79F4B803a5dB14a1";
export const BNB_vUSDT_Stablecoin = "0x3338988d0beb4419Acb8fE624218754053362D06";
export const BNB_vUSDD_Stablecoin = "0x899dDf81DfbbF5889a16D075c352F2b959Dd24A4";
export const BNB_vlisUSD_Stablecoin = "0x170d3b2da05cc2124334240fB34ad1359e34C562";
export const BNB_vUSDT_Tron = "0x712774CBFFCBD60e9825871CcEFF2F917442b2c3";
export const BNB_vUSDD_Tron = "0xD804F74fe21290d213c46610ab171f7c2EeEBDE7";

export const SEPOLIA_vUSDS_Core = "0x459C6a6036e2094d1764a9ca32939b9820b2C8e0";
export const SEPOLIA_vUSDC_Core = "0xF87bceab8DD37489015B426bA931e08A4D787616";
export const SEPOLIA_vcrvUSD_Core = "0xA09cFAd2e138fe6d8FF62df803892cbCb79ED082";
export const SEPOLIA_vFRAX_Core = "0x33942B932159A67E3274f54bC4082cbA4A704340";
export const SEPOLIA_vDAI_Core = "0xfe050f628bF5278aCfA1e7B13b59fF207e769235";
export const SEPOLIA_vUSDT_Core = "0x19252AFD0B2F539C400aEab7d460CBFbf74c17ff";
export const SEPOLIA_vTUSD_Core = "0xE23A1fC1545F1b072308c846a38447b23d322Ee2";
export const SEPOLIA_vcrvUSD_Curve = "0xc7be132027e191636172798B933202E0f9CAD548";
export const SEPOLIA_vUSDC_Ethena = "0x466fe60aE3d8520e49D67e3483626786Ba0E6416";

export const OPBNB_vUSDT_Core = "0xe3923805f6E117E51f5387421240a86EF1570abC";
export const UNI_vUSDC_Core = "0x0CA7edfcCF5dbf8AFdeAFB2D918409d439E3320A";
export const ZK_vUSDCe_Core = "0x58b0b248BB11DCAA9336bBf8a81914201fD49461";
export const ZK_vUSDT_Core = "0x7Bfd185eF8380a72027bF65bFEEAb0242b147778";
export const ZK_vUSDC_Core = "0xA266EfCC7D1a8F1AAd093446E3C0115467ea8b9C";

export const ARB_vUSDC_Core_IRM = "0x7cA8600A56281565eC0153F6Db625d4e60235013";
export const ARB_vUSDT_Core_IRM = "0x7cA8600A56281565eC0153F6Db625d4e60235013";
export const BASE_vUSDC_Core_IRM = "0x95F1F1F03116603d7F9f89Da889120dd5a46F1FE";

export const BNB_vFDUSD_CORE_IRM = "0xaE81cA4E6eA7f7E72165dc68dBa2A0B1465E3B1f";
export const BNB_vUSDC_CORE_IRM = "0x0e072E068851279b4573A3e445FA259d9d47f03C";
export const BNB_vTUSD_CORE_IRM = "0xb1993AA3E9ee53D37096C58a4B86A8B1B6ED2F8e";
export const BNB_vUSDT_CORE_IRM = "0x0e072E068851279b4573A3e445FA259d9d47f03C";
export const BNB_vUSDT_DeFi_IRM = "0xd01558355C7E0f1682587a0573b14E11e24A5A49";
export const BNB_vUSDD_DeFi_IRM = "0x0f6e54a0cDE8e09d3035aF966eBa96EE2ba29D30";
export const BNB_vUSDT_GameFi_IRM = "0xd01558355C7E0f1682587a0573b14E11e24A5A49";
export const BNB_vUSDD_GameFi_IRM = "0x0f6e54a0cDE8e09d3035aF966eBa96EE2ba29D30";
export const BNB_vUSDT_Meme_IRM = "0x7A4cA9C3C5E6bB9B5C8E9577f3398743A2Ee025B";
export const BNB_vUSDT_Stablecoin_IRM = "0x7A4cA9C3C5E6bB9B5C8E9577f3398743A2Ee025B";
export const BNB_vUSDD_Stablecoin_IRM = "0x2D6Bb68e0126540ff6CCE4F68bb8981E29757540";
export const BNB_vlisUSD_Stablecoin_IRM = "0xc57C685Ec58c8C4b56432a6bad337B680558ffd9";
export const BNB_vUSDT_Tron_IRM = "0xd01558355C7E0f1682587a0573b14E11e24A5A49";
export const BNB_vUSDD_Tron_IRM = "0x0f6e54a0cDE8e09d3035aF966eBa96EE2ba29D30";

export const SEPOLIA_vUSDS_Core_IRM = "0x8E09246751bcf2F621694881bd0E55d681f061c3";
export const SEPOLIA_vUSDC_Core_IRM = "0x08C5378b4E47183c4c02d5226e2751F1043b7100";
export const SEPOLIA_vcrvUSD_Core_IRM = "0x148b1343CCb5b015F529213a933949C9b6cd7992";
export const SEPOLIA_vFRAX_Core_IRM = "0x8E09246751bcf2F621694881bd0E55d681f061c3";
export const SEPOLIA_vDAI_Core_IRM = "0x8E09246751bcf2F621694881bd0E55d681f061c3";
export const SEPOLIA_vUSDT_Core_IRM = "0x08C5378b4E47183c4c02d5226e2751F1043b7100";
export const SEPOLIA_vTUSD_Core_IRM = "0x8E09246751bcf2F621694881bd0E55d681f061c3";
export const SEPOLIA_vcrvUSD_Curve_IRM = "0x148b1343CCb5b015F529213a933949C9b6cd7992";
export const SEPOLIA_vUSDC_Ethena_IRM = "0x4769da696C52369EbB4bB6e8C646fdd4e31E155F";

export const OPBNB_vUSDT_Core_IRM = "0x28EDBbeF282e1B500Ae82D0a1A01A2093157D8c7";
export const UNI_vUSDC_Core_IRM = "0x871C80dd0d165307eEeeCF6B0aC0a3Af91B90FE4";
export const ZK_vUSDCe_Core_IRM = "0xad9Be61CEdcEf76Dd45843Aa2C303A98512F0bAD";
export const ZK_vUSDT_Core_IRM = "0xad9Be61CEdcEf76Dd45843Aa2C303A98512F0bAD";
export const ZK_vUSDC_Core_IRM = "0x73cF3585bE170f3813E1C26eBc0fd9042daCFB30";

const vip506 = () => {
  const meta = {
    version: "v2",
    title: "VIP-506 Update IR of stablecoins",
    description: `VIP-506 Update IR of stablecoins, Chaos Labs - Stablecoin Interest Rate Curve Adjustment - 23/05/25`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // ARB CORE
      {
        target: ARB_vUSDC_Core,
        signature: "setInterestRateModel(address)",
        params: [ARB_vUSDC_Core_IRM],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: ARB_vUSDT_Core,
        signature: "setInterestRateModel(address)",
        params: [ARB_vUSDT_Core_IRM],
        dstChainId: LzChainId.arbitrumsepolia,
      },

      // BASE CORE POOL
      {
        target: BASE_vUSDC_Core,
        signature: "setInterestRateModel(address)",
        params: [BASE_vUSDC_Core_IRM],
        dstChainId: LzChainId.basesepolia,
      },

      // BNB CORE
      {
        target: BNB_vFDUSD_CORE,
        signature: "_setInterestRateModel(address)",
        params: [BNB_vFDUSD_CORE_IRM],
      },
      {
        target: BNB_vUSDC_CORE,
        signature: "_setInterestRateModel(address)",
        params: [BNB_vUSDC_CORE_IRM],
      },
      {
        target: BNB_vTUSD_CORE,
        signature: "_setInterestRateModel(address)",
        params: [BNB_vTUSD_CORE_IRM],
      },
      {
        target: BNB_vUSDT_CORE,
        signature: "_setInterestRateModel(address)",
        params: [BNB_vUSDT_CORE_IRM],
      },

      // BNB DeFI
      {
        target: BNB_vUSDT_DeFi,
        signature: "setInterestRateModel(address)",
        params: [BNB_vUSDT_DeFi_IRM],
      },
      {
        target: BNB_vUSDD_DeFi,
        signature: "setInterestRateModel(address)",
        params: [BNB_vUSDD_DeFi_IRM],
      },

      // BNB GameFi
      {
        target: BNB_vUSDT_GameFi,
        signature: "setInterestRateModel(address)",
        params: [BNB_vUSDT_GameFi_IRM],
      },
      {
        target: BNB_vUSDD_GameFi,
        signature: "setInterestRateModel(address)",
        params: [BNB_vUSDD_GameFi_IRM],
      },

      // BNB Meme
      {
        target: BNB_vUSDT_Meme,
        signature: "setInterestRateModel(address)",
        params: [BNB_vUSDT_Meme_IRM],
      },

      // BNB Stablecoin
      {
        target: BNB_vUSDT_Stablecoin,
        signature: "setInterestRateModel(address)",
        params: [BNB_vUSDT_Stablecoin_IRM],
      },
      {
        target: BNB_vUSDD_Stablecoin,
        signature: "setInterestRateModel(address)",
        params: [BNB_vUSDD_Stablecoin_IRM],
      },
      {
        target: BNB_vlisUSD_Stablecoin,
        signature: "setInterestRateModel(address)",
        params: [BNB_vlisUSD_Stablecoin_IRM],
      },

      // BNB TRON
      {
        target: BNB_vUSDT_Tron,
        signature: "setInterestRateModel(address)",
        params: [BNB_vUSDT_Tron_IRM],
      },
      {
        target: BNB_vUSDD_Tron,
        signature: "setInterestRateModel(address)",
        params: [BNB_vUSDD_Tron_IRM],
      },

      // SEPOLIA CORE
      {
        target: SEPOLIA_vUSDS_Core,
        signature: "setInterestRateModel(address)",
        params: [SEPOLIA_vUSDS_Core_IRM],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_vUSDC_Core,
        signature: "setInterestRateModel(address)",
        params: [SEPOLIA_vUSDC_Core_IRM],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_vcrvUSD_Core,
        signature: "setInterestRateModel(address)",
        params: [SEPOLIA_vcrvUSD_Core_IRM],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_vFRAX_Core,
        signature: "setInterestRateModel(address)",
        params: [SEPOLIA_vFRAX_Core_IRM],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_vDAI_Core,
        signature: "setInterestRateModel(address)",
        params: [SEPOLIA_vDAI_Core_IRM],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_vUSDT_Core,
        signature: "setInterestRateModel(address)",
        params: [SEPOLIA_vUSDT_Core_IRM],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: SEPOLIA_vTUSD_Core,
        signature: "setInterestRateModel(address)",
        params: [SEPOLIA_vTUSD_Core_IRM],
        dstChainId: LzChainId.sepolia,
      },

      // SEPOLIA CURVE
      {
        target: SEPOLIA_vcrvUSD_Curve,
        signature: "setInterestRateModel(address)",
        params: [SEPOLIA_vcrvUSD_Curve_IRM],
        dstChainId: LzChainId.sepolia,
      },

      // SEPOLIA ETHENA
      {
        target: SEPOLIA_vUSDC_Ethena,
        signature: "setInterestRateModel(address)",
        params: [SEPOLIA_vUSDC_Ethena_IRM],
        dstChainId: LzChainId.sepolia,
      },

      // OPBNB CORE
      {
        target: OPBNB_vUSDT_Core,
        signature: "setInterestRateModel(address)",
        params: [OPBNB_vUSDT_Core_IRM],
        dstChainId: LzChainId.opbnbtestnet,
      },

      // UNICHAIN CORE
      {
        target: UNI_vUSDC_Core,
        signature: "setInterestRateModel(address)",
        params: [UNI_vUSDC_Core_IRM],
        dstChainId: LzChainId.unichainsepolia,
      },

      // ZKSYNC CORE
      {
        target: ZK_vUSDCe_Core,
        signature: "setInterestRateModel(address)",
        params: [ZK_vUSDCe_Core_IRM],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: ZK_vUSDT_Core,
        signature: "setInterestRateModel(address)",
        params: [ZK_vUSDT_Core_IRM],
        dstChainId: LzChainId.zksyncsepolia,
      },
      {
        target: ZK_vUSDC_Core,
        signature: "setInterestRateModel(address)",
        params: [ZK_vUSDC_Core_IRM],
        dstChainId: LzChainId.zksyncsepolia,
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip506;
