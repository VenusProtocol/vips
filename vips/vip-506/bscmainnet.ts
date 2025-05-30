import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const vBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
export const vBNB_ADMIN = "0x9A7890534d9d91d473F28cB97962d176e2B65f1d";
export const newRF = parseUnits("0.3", 18);

export const ARB_vUSDC_Core = "0x7D8609f8da70fF9027E9bc5229Af4F6727662707";
export const ARB_vUSDT_Core = "0xB9F9117d4200dC296F9AcD1e8bE1937df834a2fD";
export const BASE_vUSDC_Core = "0x3cb752d175740043Ec463673094e06ACDa2F9a2e";

export const BNB_vFDUSD_CORE = "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba";
export const BNB_vUSDC_CORE = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
export const BNB_vDAI_CORE = "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1";
export const BNB_vTUSD_CORE = "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E";
export const BNB_vUSDT_CORE = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
export const BNB_vUSDT_DeFi = "0x1D8bBDE12B6b34140604E18e9f9c6e14deC16854";
export const BNB_vUSDD_DeFi = "0xA615467caE6B9E0bb98BC04B4411d9296fd1dFa0";
export const BNB_vUSDT_GameFi = "0x4978591f17670A846137d9d613e333C38dc68A37";
export const BNB_vUSDD_GameFi = "0x9f2FD23bd0A5E08C5f2b9DD6CF9C96Bfb5fA515C";
export const BNB_vUSDT_Meme = "0x4a9613D06a241B76b81d3777FCe3DDd1F61D4Bd0";
export const BNB_vUSDT_Stablecoin = "0x5e3072305F9caE1c7A82F6Fe9E38811c74922c3B";
export const BNB_vUSDD_Stablecoin = "0xc3a45ad8812189cAb659aD99E64B1376f6aCD035";
export const BNB_vlisUSD_Stablecoin = "0xCa2D81AA7C09A1a025De797600A7081146dceEd9";
export const BNB_vUSDT_Tron = "0x281E5378f99A4bc55b295ABc0A3E7eD32Deba059";
export const BNB_vUSDD_Tron = "0xf1da185CCe5BeD1BeBbb3007Ef738Ea4224025F7";

export const ETH_vUSDS_Core = "0x0c6B19287999f1e31a5c0a44393b24B62D2C0468";
export const ETH_vUSDC_Core = "0x17C07e0c232f2f80DfDbd7a95b942D893A4C5ACb";
export const ETH_vcrvUSD_Core = "0x672208C10aaAA2F9A6719F449C4C8227bc0BC202";
export const ETH_vFRAX_Core = "0x17142a05fe678e9584FA1d88EfAC1bF181bF7ABe";
export const ETH_vDAI_Core = "0xd8AdD9B41D4E1cd64Edad8722AB0bA8D35536657";
export const ETH_vUSDT_Core = "0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E";
export const ETH_vTUSD_Core = "0x13eB80FDBe5C5f4a7039728E258A6f05fb3B912b";
export const ETH_vcrvUSD_Curve = "0x2d499800239C4CD3012473Cb1EAE33562F0A6933";
export const ETH_vUSDC_Ethena = "0xa8e7f9473635a5CB79646f14356a9Fc394CA111A";

export const OPBNB_vUSDT_Core = "0xb7a01Ba126830692238521a1aA7E7A7509410b8e";
export const OPBNB_vFDUSD_Core = "0x13B492B8A03d072Bab5C54AC91Dba5b830a50917";
export const UNI_vUSDC_Core = "0xB953f92B9f759d97d2F2Dec10A8A3cf75fcE3A95";
export const ZK_vUSDCe_Core = "0x1aF23bD57c62A99C59aD48236553D0Dd11e49D2D";
export const ZK_vUSDT_Core = "0x69cDA960E3b20DFD480866fFfd377Ebe40bd0A46";
export const ZK_vUSDC_Core = "0x84064c058F2EFea4AB648bB6Bd7e40f83fFDe39a";

export const ARB_vUSDC_Core_IRM = "0x35Caeb98849C5464Ee9F01C370729eb3775e5D57";
export const ARB_vUSDT_Core_IRM = "0x35Caeb98849C5464Ee9F01C370729eb3775e5D57";
export const BASE_vUSDC_Core_IRM = "0x453c1f3fC0354DBb10e27E3F13FB5b9D7A263DE4";

export const BNB_vFDUSD_CORE_IRM = "0x76cB08c25EF426F5444C28179D05F77cB1a6aBD0";
export const BNB_vUSDC_CORE_IRM = "0x31d20C36A4804AB30F04fB606555f545b2bAE3b3";
export const BNB_vDAI_CORE_IRM = "0x4eFbf2f6E63eCad12dE015E5be2a1094721633EE";
export const BNB_vTUSD_CORE_IRM = "0x4eFbf2f6E63eCad12dE015E5be2a1094721633EE";
export const BNB_vUSDT_CORE_IRM = "0x31d20C36A4804AB30F04fB606555f545b2bAE3b3";
export const BNB_vUSDT_DeFi_IRM = "0xB43F967B8C8F9c415e09C2984A7869c02b0DEd8B";
export const BNB_vUSDD_DeFi_IRM = "0xD63B54B8d187A0dDca4B9bcDe287923271409fb1";
export const BNB_vUSDT_GameFi_IRM = "0xB43F967B8C8F9c415e09C2984A7869c02b0DEd8B";
export const BNB_vUSDD_GameFi_IRM = "0xD63B54B8d187A0dDca4B9bcDe287923271409fb1";
export const BNB_vUSDT_Meme_IRM = "0x21868705cb097C3e12d90C8BBC8c2bDc75E3B1eB";
export const BNB_vUSDT_Stablecoin_IRM = "0x21868705cb097C3e12d90C8BBC8c2bDc75E3B1eB";
export const BNB_vUSDD_Stablecoin_IRM = "0xD63B54B8d187A0dDca4B9bcDe287923271409fb1";
export const BNB_vlisUSD_Stablecoin_IRM = "0xA4471c68bB3D3d9301D540552311680F5cC35228";
export const BNB_vUSDT_Tron_IRM = "0xB43F967B8C8F9c415e09C2984A7869c02b0DEd8B";
export const BNB_vUSDD_Tron_IRM = "0xD63B54B8d187A0dDca4B9bcDe287923271409fb1";

export const ETH_vUSDS_Core_IRM = "0x021206E942C9810734eE314CfdAd46920058f2b8";
export const ETH_vUSDC_Core_IRM = "0x2D5bF63B6E72bBf9e0222BbA3d170f45fc9549E7";
export const ETH_vcrvUSD_Core_IRM = "0x021206E942C9810734eE314CfdAd46920058f2b8";
export const ETH_vFRAX_Core_IRM = "0x021206E942C9810734eE314CfdAd46920058f2b8";
export const ETH_vDAI_Core_IRM = "0x021206E942C9810734eE314CfdAd46920058f2b8";
export const ETH_vUSDT_Core_IRM = "0x2D5bF63B6E72bBf9e0222BbA3d170f45fc9549E7";
export const ETH_vTUSD_Core_IRM = "0x021206E942C9810734eE314CfdAd46920058f2b8";
export const ETH_vcrvUSD_Curve_IRM = "0x021206E942C9810734eE314CfdAd46920058f2b8";
export const ETH_vUSDC_Ethena_IRM = "0x7616865b8eDeCF0D4Cb30a4CD3628590516542ba";

export const OPBNB_vUSDT_Core_IRM = "0xB58E6e7FAfC84A634fA80b4660fA0a72Ac527FDE";
export const OPBNB_vFDUSD_Core_IRM = "0xB58E6e7FAfC84A634fA80b4660fA0a72Ac527FDE";
export const UNI_vUSDC_Core_IRM = "0x683a772c1c525d4cA77074194471A02B62f15FF8";
export const ZK_vUSDCe_Core_IRM = "0xD7f9cba231205e3Fa2b3fdcceB317174Af271C0A";
export const ZK_vUSDT_Core_IRM = "0xD7f9cba231205e3Fa2b3fdcceB317174Af271C0A";
export const ZK_vUSDC_Core_IRM = "0xD7f9cba231205e3Fa2b3fdcceB317174Af271C0A";

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
      {
        target: vBNB_ADMIN,
        signature: "_setReserveFactor(uint256)",
        params: [newRF],
      },
      // ARB CORE
      {
        target: ARB_vUSDC_Core,
        signature: "setInterestRateModel(address)",
        params: [ARB_vUSDC_Core_IRM],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARB_vUSDT_Core,
        signature: "setInterestRateModel(address)",
        params: [ARB_vUSDT_Core_IRM],
        dstChainId: LzChainId.arbitrumone,
      },

      // BASE CORE POOL
      {
        target: BASE_vUSDC_Core,
        signature: "setInterestRateModel(address)",
        params: [BASE_vUSDC_Core_IRM],
        dstChainId: LzChainId.basemainnet,
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
        target: BNB_vDAI_CORE,
        signature: "_setInterestRateModel(address)",
        params: [BNB_vDAI_CORE_IRM],
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

      // BNB GameFi
      {
        target: BNB_vUSDT_GameFi,
        signature: "setInterestRateModel(address)",
        params: [BNB_vUSDT_GameFi_IRM],
      },

      // BNB Meme
      {
        target: BNB_vUSDT_Meme,
        signature: "setInterestRateModel(address)",
        params: [BNB_vUSDT_Meme_IRM],
      },

      // BNB STABLECOINS
      {
        target: BNB_vUSDT_Stablecoin,
        signature: "setInterestRateModel(address)",
        params: [BNB_vUSDT_Stablecoin_IRM],
      },

      // BNB TRON
      {
        target: BNB_vUSDT_Tron,
        signature: "setInterestRateModel(address)",
        params: [BNB_vUSDT_Tron_IRM],
      },

      // ETH CORE
      {
        target: ETH_vUSDS_Core,
        signature: "setInterestRateModel(address)",
        params: [ETH_vUSDS_Core_IRM],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETH_vUSDC_Core,
        signature: "setInterestRateModel(address)",
        params: [ETH_vUSDC_Core_IRM],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETH_vcrvUSD_Core,
        signature: "setInterestRateModel(address)",
        params: [ETH_vcrvUSD_Core_IRM],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETH_vFRAX_Core,
        signature: "setInterestRateModel(address)",
        params: [ETH_vFRAX_Core_IRM],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETH_vDAI_Core,
        signature: "setInterestRateModel(address)",
        params: [ETH_vDAI_Core_IRM],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETH_vUSDT_Core,
        signature: "setInterestRateModel(address)",
        params: [ETH_vUSDT_Core_IRM],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETH_vTUSD_Core,
        signature: "setInterestRateModel(address)",
        params: [ETH_vTUSD_Core_IRM],
        dstChainId: LzChainId.ethereum,
      },

      // ETH CURVE
      {
        target: ETH_vcrvUSD_Curve,
        signature: "setInterestRateModel(address)",
        params: [ETH_vcrvUSD_Curve_IRM],
        dstChainId: LzChainId.ethereum,
      },

      // ETH ETHENA
      {
        target: ETH_vUSDC_Ethena,
        signature: "setInterestRateModel(address)",
        params: [ETH_vUSDC_Ethena_IRM],
        dstChainId: LzChainId.ethereum,
      },

      // OPBNB CORE
      {
        target: OPBNB_vUSDT_Core,
        signature: "setInterestRateModel(address)",
        params: [OPBNB_vUSDT_Core_IRM],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: OPBNB_vFDUSD_Core,
        signature: "setInterestRateModel(address)",
        params: [OPBNB_vFDUSD_Core_IRM],
        dstChainId: LzChainId.opbnbmainnet,
      },

      // UNICHAIN CORE
      {
        target: UNI_vUSDC_Core,
        signature: "setInterestRateModel(address)",
        params: [UNI_vUSDC_Core_IRM],
        dstChainId: LzChainId.unichainmainnet,
      },

      // ZKSYNC CORE
      {
        target: ZK_vUSDCe_Core,
        signature: "setInterestRateModel(address)",
        params: [ZK_vUSDCe_Core_IRM],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZK_vUSDT_Core,
        signature: "setInterestRateModel(address)",
        params: [ZK_vUSDT_Core_IRM],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ZK_vUSDC_Core,
        signature: "setInterestRateModel(address)",
        params: [ZK_vUSDC_Core_IRM],
        dstChainId: LzChainId.zksyncmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip506;
