import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

// Ethereum
export const Comptroller_Ethena = "0x562d2b6FF1dbf5f63E233662416782318cC081E4";
export const VToken_vPT_USDe_27MAR2025_Ethena = "0x62D9E2010Cff87Bae05B91d5E04605ef864ABc3B";
export const VToken_vPT_sUSDE_27MAR2025_Ethena = "0xCca202a95E8096315E3F19E46e19E1b326634889";
export const VToken_vsUSDe_Ethena = "0x0792b9c60C728C1D2Fd6665b3D7A08762a9b28e0";
export const VToken_vUSDC_Ethena = "0xa8e7f9473635a5CB79646f14356a9Fc394CA111A";

export const BNB_COMPTROLLERS = {
  BTC: "0x9DF11376Cf28867E2B0741348044780FbB7cb1d6",
  LiquidStakedETH: "0xBE609449Eb4D76AD8545f957bBE04b596E8fC529",
  Meme: "0x33B6fa34cd23e5aeeD1B112d5988B026b8A5567d",
  Stablecoins: "0x94c1495cD4c557f1560Cbd68EAB0d197e6291571",
  Tron: "0x23b4404E4E5eC5FF5a6FFb70B7d14E3FabF237B0",
  DeFi: "0x3344417c9360b963ca93A4e8305361AEde340Ab9",
  GameFi: "0x1b43ea8622e76627B81665B1eCeBB4867566B963",
};

export const ETHEREUM_COMPTROLLER = {
  Curve: "0x67aA3eCc5831a65A5Ba7be76BED3B5dc7DB60796",
  Core: "0x687a01ecF6d3907658f7A7c714749fAC32336D1B",
  LiquidStakedETH: "0xF522cd0360EF8c2FF48B648d53EA1717Ec0F3Ac3",
};

export const BNB_VTOKENS = {
  BTC: {
    vBTCB_BTC: "0x8F2AE20b25c327714248C95dFD3b02815cC82302", // CF already 0
    vPT_SolvBTC_BBN_27MAR2025_BTC: "0x02243F036897E3bE1cce1E540FA362fd58749149", // CF already 0, actions already paused
  },
  LiquidStakedETH: {
    vETH_LiquidStakedETH: "0xeCCACF760FEA7943C5b0285BD09F601505A29c05", // CF already 0
    vweETH_LiquidStakedETH: "0xc5b24f347254bD8cF8988913d1fd0F795274900F",
    vwstETH_LiquidStakedETH: "0x94180a3948296530024Ef7d60f60B85cfe0422c8",
  },
  Meme: {
    vBabyDoge_Meme: "0x52eD99Cd0a56d60451dD4314058854bc0845bbB5",
    vUSDT_Meme: "0x4a9613D06a241B76b81d3777FCe3DDd1F61D4Bd0",
  },
  Stablecoins: {
    vEURA_Stablecoins: "0x795DE779Be00Ea46eA97a28BDD38d9ED570BCF0F", // actions already paused
    vUSDD_Stablecoins: "0xc3a45ad8812189cAb659aD99E64B1376f6aCD035",
    vUSDT_Stablecoins: "0x5e3072305F9caE1c7A82F6Fe9E38811c74922c3B",
    vlisUSD_Stablecoins: "0xCa2D81AA7C09A1a025De797600A7081146dceEd9",
  },
  Tron: {
    vBTT_Tron: "0x49c26e12959345472E2Fd95E5f79F8381058d3Ee",
    vTRX_Tron: "0x836beb2cB723C498136e1119248436A645845F4E",
    vUSDD_Tron: "0xf1da185CCe5BeD1BeBbb3007Ef738Ea4224025F7",
    vUSDT_Tron: "0x281E5378f99A4bc55b295ABc0A3E7eD32Deba059",
    vWIN_Tron: "0xb114cfA615c828D88021a41bFc524B800E64a9D5",
  },
  DeFi: {
    vALPACA_DeFi: "0x02c5Fb0F26761093D297165e902e96D08576D344", // CL already 0, // Borrow and enter market already paused
    vankrBNB_DeFi: "0x53728FD51060a85ac41974C6C3Eb1DaE42776723", // CL already 0
    vUSDD_DeFi: "0xA615467caE6B9E0bb98BC04B4411d9296fd1dFa0",
  },
  GameFi: {
    vUSDD_GameFi: "0x9f2FD23bd0A5E08C5f2b9DD6CF9C96Bfb5fA515C",
  },
};

export const ETHEREUM_VTOKENS = {
  Curve: {
    vCRV_Curve: "0x30aD10Bd5Be62CAb37863C2BfcC6E8fb4fD85BDa",
    vcrvUSD_Curve: "0x2d499800239C4CD3012473Cb1EAE33562F0A6933",
  },
  Core: {
    vFRAX_Core: "0x4fAfbDc4F2a9876Bd1764827b26fb8dc4FD1dB95",
    vsFRAX_Core: "0x17142a05fe678e9584FA1d88EfAC1bF181bF7ABe",
    vyvUSDC_1_Core: "0xf87c0a64dc3a8622D6c63265FA29137788163879",
    vyvUSDS_1_Core: "0x520d67226Bc904aC122dcE66ed2f8f61AA1ED764",
    vyvUSDT_1_Core: "0x475d0C68a8CD275c15D1F01F4f291804E445F677",
    vyvWETH_1_Core: "0xba3916302cBA4aBcB51a01e706fC6051AaF272A0",
  },
  LiquidStakedETH: {
    vsfrxETH_LiquidStakedETH: "0xF9E9Fe17C00a8B96a8ac20c4E344C8688D7b947E",
  },
};

export const COLLATERAL_FACTOR = 0;

export const Actions = {
  MINT: 0,
  BORROW: 2,
  ENTER_MARKET: 7,
};

export const vip510 = () => {
  const meta = {
    version: "v2",
    title: "VIP-510 [BNB Chain] [Ethereum] Deprecate low activity markets and matured PT tokens",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: BNB_COMPTROLLERS.BTC,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[BNB_VTOKENS.BTC.vBTCB_BTC], [Actions.MINT, Actions.BORROW, Actions.ENTER_MARKET], true],
      },

      {
        target: BNB_COMPTROLLERS.DeFi,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [
          [BNB_VTOKENS.DeFi.vALPACA_DeFi, BNB_VTOKENS.DeFi.vankrBNB_DeFi, BNB_VTOKENS.DeFi.vUSDD_DeFi],
          [Actions.MINT, Actions.BORROW, Actions.ENTER_MARKET],
          true,
        ],
      },
      {
        target: BNB_COMPTROLLERS.DeFi,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [BNB_VTOKENS.DeFi.vUSDD_DeFi, COLLATERAL_FACTOR, parseUnits("0.7", 18)],
      },

      {
        target: BNB_COMPTROLLERS.GameFi,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[BNB_VTOKENS.GameFi.vUSDD_GameFi], [Actions.MINT, Actions.BORROW, Actions.ENTER_MARKET], true],
      },
      {
        target: BNB_COMPTROLLERS.GameFi,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [BNB_VTOKENS.GameFi.vUSDD_GameFi, COLLATERAL_FACTOR, parseUnits("0.7", 18)],
      },

      {
        target: BNB_COMPTROLLERS.LiquidStakedETH,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [
          [
            BNB_VTOKENS.LiquidStakedETH.vETH_LiquidStakedETH,
            BNB_VTOKENS.LiquidStakedETH.vweETH_LiquidStakedETH,
            BNB_VTOKENS.LiquidStakedETH.vwstETH_LiquidStakedETH,
          ],
          [Actions.MINT, Actions.BORROW, Actions.ENTER_MARKET],
          true,
        ],
      },
      {
        target: BNB_COMPTROLLERS.LiquidStakedETH,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [BNB_VTOKENS.LiquidStakedETH.vweETH_LiquidStakedETH, COLLATERAL_FACTOR, parseUnits("0.93", 18)],
      },
      {
        target: BNB_COMPTROLLERS.LiquidStakedETH,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [BNB_VTOKENS.LiquidStakedETH.vwstETH_LiquidStakedETH, COLLATERAL_FACTOR, parseUnits("0.93", 18)],
      },

      {
        target: BNB_COMPTROLLERS.Meme,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [
          [BNB_VTOKENS.Meme.vBabyDoge_Meme, BNB_VTOKENS.Meme.vUSDT_Meme],
          [Actions.MINT, Actions.BORROW, Actions.ENTER_MARKET],
          true,
        ],
      },
      {
        target: BNB_COMPTROLLERS.Meme,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [BNB_VTOKENS.Meme.vBabyDoge_Meme, COLLATERAL_FACTOR, parseUnits("0.4", 18)],
      },
      {
        target: BNB_COMPTROLLERS.Meme,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [BNB_VTOKENS.Meme.vUSDT_Meme, COLLATERAL_FACTOR, parseUnits("0.77", 18)],
      },

      {
        target: BNB_COMPTROLLERS.Stablecoins,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [
          [
            BNB_VTOKENS.Stablecoins.vEURA_Stablecoins,
            BNB_VTOKENS.Stablecoins.vUSDD_Stablecoins,
            BNB_VTOKENS.Stablecoins.vUSDT_Stablecoins,
            BNB_VTOKENS.Stablecoins.vlisUSD_Stablecoins,
          ],
          [Actions.MINT, Actions.BORROW, Actions.ENTER_MARKET],
          true,
        ],
      },
      {
        target: BNB_COMPTROLLERS.Stablecoins,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [BNB_VTOKENS.Stablecoins.vEURA_Stablecoins, COLLATERAL_FACTOR, parseUnits("0.8", 18)],
      },
      {
        target: BNB_COMPTROLLERS.Stablecoins,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [BNB_VTOKENS.Stablecoins.vUSDD_Stablecoins, COLLATERAL_FACTOR, parseUnits("0.8", 18)],
      },
      {
        target: BNB_COMPTROLLERS.Stablecoins,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [BNB_VTOKENS.Stablecoins.vUSDT_Stablecoins, COLLATERAL_FACTOR, parseUnits("0.8", 18)],
      },
      {
        target: BNB_COMPTROLLERS.Stablecoins,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [BNB_VTOKENS.Stablecoins.vlisUSD_Stablecoins, COLLATERAL_FACTOR, parseUnits("0.8", 18)],
      },

      {
        target: BNB_COMPTROLLERS.Tron,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [
          [
            BNB_VTOKENS.Tron.vBTT_Tron,
            BNB_VTOKENS.Tron.vTRX_Tron,
            BNB_VTOKENS.Tron.vUSDD_Tron,
            BNB_VTOKENS.Tron.vUSDT_Tron,
            BNB_VTOKENS.Tron.vWIN_Tron,
          ],
          [Actions.MINT, Actions.BORROW, Actions.ENTER_MARKET],
          true,
        ],
      },
      {
        target: BNB_COMPTROLLERS.Tron,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [BNB_VTOKENS.Tron.vBTT_Tron, COLLATERAL_FACTOR, parseUnits("0.5", 18)],
      },
      {
        target: BNB_COMPTROLLERS.Tron,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [BNB_VTOKENS.Tron.vTRX_Tron, COLLATERAL_FACTOR, parseUnits("0.5", 18)],
      },
      {
        target: BNB_COMPTROLLERS.Tron,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [BNB_VTOKENS.Tron.vUSDD_Tron, COLLATERAL_FACTOR, parseUnits("0.7", 18)],
      },
      {
        target: BNB_COMPTROLLERS.Tron,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [BNB_VTOKENS.Tron.vUSDT_Tron, COLLATERAL_FACTOR, parseUnits("0.8", 18)],
      },
      {
        target: BNB_COMPTROLLERS.Tron,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [BNB_VTOKENS.Tron.vWIN_Tron, COLLATERAL_FACTOR, parseUnits("0.5", 18)],
      },

      // ETHEREUM
      {
        target: Comptroller_Ethena,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [
          [
            VToken_vPT_USDe_27MAR2025_Ethena,
            VToken_vPT_sUSDE_27MAR2025_Ethena,
            VToken_vsUSDe_Ethena,
            VToken_vUSDC_Ethena,
          ],
          [Actions.MINT, Actions.BORROW, Actions.ENTER_MARKET],
          true,
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: Comptroller_Ethena,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [VToken_vPT_USDe_27MAR2025_Ethena, parseUnits("0", 18), parseUnits("0.88", 18)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: Comptroller_Ethena,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [VToken_vPT_sUSDE_27MAR2025_Ethena, parseUnits("0", 18), parseUnits("0.87", 18)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: Comptroller_Ethena,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [VToken_vsUSDe_Ethena, parseUnits("0", 18), parseUnits("0.92", 18)],
        dstChainId: LzChainId.ethereum,
      },

      {
        target: ETHEREUM_COMPTROLLER.Core,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [
          [
            ETHEREUM_VTOKENS.Core.vFRAX_Core,
            ETHEREUM_VTOKENS.Core.vsFRAX_Core,
            ETHEREUM_VTOKENS.Core.vyvUSDC_1_Core,
            ETHEREUM_VTOKENS.Core.vyvUSDS_1_Core,
            ETHEREUM_VTOKENS.Core.vyvUSDT_1_Core,
            ETHEREUM_VTOKENS.Core.vyvWETH_1_Core,
          ],
          [Actions.MINT, Actions.BORROW, Actions.ENTER_MARKET],
          true,
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_COMPTROLLER.Core,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [ETHEREUM_VTOKENS.Core.vFRAX_Core, COLLATERAL_FACTOR, parseUnits("0.8", 18)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_COMPTROLLER.Core,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [ETHEREUM_VTOKENS.Core.vsFRAX_Core, COLLATERAL_FACTOR, parseUnits("0.8", 18)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_COMPTROLLER.Core,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [ETHEREUM_VTOKENS.Core.vyvUSDC_1_Core, COLLATERAL_FACTOR, parseUnits("0.6", 18)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_COMPTROLLER.Core,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [ETHEREUM_VTOKENS.Core.vyvUSDS_1_Core, COLLATERAL_FACTOR, parseUnits("0.6", 18)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_COMPTROLLER.Core,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [ETHEREUM_VTOKENS.Core.vyvUSDT_1_Core, COLLATERAL_FACTOR, parseUnits("0.6", 18)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_COMPTROLLER.Core,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [ETHEREUM_VTOKENS.Core.vyvWETH_1_Core, COLLATERAL_FACTOR, parseUnits("0.6", 18)],
        dstChainId: LzChainId.ethereum,
      },

      {
        target: ETHEREUM_COMPTROLLER.Curve,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [
          [ETHEREUM_VTOKENS.Curve.vCRV_Curve, ETHEREUM_VTOKENS.Curve.vcrvUSD_Curve],
          [Actions.MINT, Actions.BORROW, Actions.ENTER_MARKET],
          true,
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_COMPTROLLER.Curve,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [ETHEREUM_VTOKENS.Curve.vCRV_Curve, COLLATERAL_FACTOR, parseUnits("0.5", 18)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_COMPTROLLER.Curve,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [ETHEREUM_VTOKENS.Curve.vcrvUSD_Curve, COLLATERAL_FACTOR, parseUnits("0.5", 18)],
        dstChainId: LzChainId.ethereum,
      },

      {
        target: ETHEREUM_COMPTROLLER.LiquidStakedETH,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [
          [ETHEREUM_VTOKENS.LiquidStakedETH.vsfrxETH_LiquidStakedETH],
          [Actions.MINT, Actions.BORROW, Actions.ENTER_MARKET],
          true,
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_COMPTROLLER.LiquidStakedETH,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [ETHEREUM_VTOKENS.LiquidStakedETH.vsfrxETH_LiquidStakedETH, COLLATERAL_FACTOR, parseUnits("0.93", 18)],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip510;
