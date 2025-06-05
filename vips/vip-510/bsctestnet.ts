import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const BNB_COMPTROLLERS = {
  BTC: "0xfE87008bf29DeCACC09a75FaAc2d128367D46e7a",
  LiquidStakedETH: "0xC7859B809Ed5A2e98659ab5427D5B69e706aE26b",
  Meme: "0x92e8E3C202093A495e98C10f9fcaa5Abe288F74A",
  Stablecoins: "0x10b57706AD2345e590c2eA4DC02faef0d9f5b08B",
  Tron: "0x11537D023f489E4EF0C7157cc729C7B69CbE0c97",
  DeFi: "0x23a73971A6B9f6580c048B9CB188869B2A2aA2aD",
  GameFi: "0x1F4f0989C51f12DAcacD4025018176711f3Bf289",
};

export const ETHEREUM_COMPTROLLER = {
  Curve: "0xD298182D3ACb43e98e32757FF09C91F203e9E67E",
  Core: "0x7Aa39ab4BcA897F403425C9C6FDbd0f882Be0D70",
  LiquidStakedETH: "0xd79CeB8EF8188E44b7Eb899094e8A3A4d7A1e236",
};

export const BNB_VTOKENS = {
  BTC: {
    vBTCB_BTC: "0x138500e8502f32f004F79507143E4FaaCA03E26d", // already C.F = 0, L.T = 0
    vPT_SolvBTC_BBN_27MAR2025_BTC: "0xf3bF150A7D3d42E8C712e2461102593Dc50266Bb", // BORROW already paused
  },

  LiquidStakedETH: {
    vETH_LiquidStakedETH: "0x46D49adF48172d2e79d813A3f4F27aB61724B01e", // already C.F = 0, L.T = 0
    vweETH_LiquidStakedETH: "0x4BD7EfB423f06fa033404FBd0935A2097918084d",
    vwstETH_LiquidStakedETH: "0x16eb5Ce6d186B49709dD588518CD545985096Ff5",
  },
  Meme: {
    vBabyDoge_Meme: "0x73d2F6e0708599a4eA70F6A0c55A4C59196a101c",
    vUSDT_Meme: "0x3AF2bE7AbEF0f840b196D99d79F4B803a5dB14a1",
  },
  Stablecoins: {
    vEURA_Stablecoins: "0x4E1D35166776825402d50AfE4286c500027211D1",
    vlisUSD_StableCoins: "0x170d3b2da05cc2124334240fB34ad1359e34C562",
    vUSDD_StableCoins: "0x899dDf81DfbbF5889a16D075c352F2b959Dd24A4",
    vUSDT_StableCoins: "0x3338988d0beb4419Acb8fE624218754053362D06",
  },
  Tron: {
    vBTT_Tron: "0x47793540757c6E6D84155B33cd8D9535CFdb9334",
    vTRX_Tron: "0x410286c43a525E1DCC7468a9B091C111C8324cd1",
    vUSDD_Tron: "0xD804F74fe21290d213c46610ab171f7c2EeEBDE7",
    vUSDT_Tron: "0x712774CBFFCBD60e9825871CcEFF2F917442b2c3",
    vWIN_Tron: "0xEe543D5de2Dbb5b07675Fc72831A2f1812428393",
  },
  DeFi: {
    vALPACA_DeFi: "0xb7caC5Ef82cb7f9197ee184779bdc52c5490C02a",
    vUSDD_DeFi: "0xa109DE0abaeefC521Ec29D89eA42E64F37A6882E",
    vankrBNB_DeFi: "0xe507B30C41E9e375BCe05197c1e09fc9ee40c0f6", // already C.F = 0, L.T = 0
  },
  GameFi: {
    vUSDD_GameFi: "0xdeDf3B2bcF25d0023115fd71a0F8221C91C92B1a",
  },
};

export const ETHEREUM_VTOKENS = {
  Curve: {
    vCRV_Curve: "0x9Db62c5BBc6fb79416545FcCBDB2204099217b78",
    vcrvUSD_Curve: "0xc7be132027e191636172798B933202E0f9CAD548",
  },
  Core: {
    vFRAX_Core: "0x33942B932159A67E3274f54bC4082cbA4A704340",
    vsFRAX_Core: "0x18995825f033F33fa30CF59c117aD21ff6BdB48c",
    vyvUSDC_1_Core: "0x4bC731477aF00ea83C5eCbAc31E1E9fF85eD8A1e", // BORROW already paused
    vyvUSDS_1_Core: "0x5e2fB6a1e1570eB61360E87Da44979cb932090B0", // BORROW already paused
    vyvUSDT_1_Core: "0x9Ec91759d4EBaDE3109cCAD1B7AE199a02312c10", // BORROW already paused
    vyvWETH_1_Core: "0x271D914014Ac2CD8EB89a4e106Ac15a4e948eEE2", // BORROW already paused
  },
  LiquidStakedETH: {
    vsfrxETH_LiquidStakedETH: "0x83F63118dcAAdAACBFF36D78ffB88dd474309e70",
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
    title: "VIP-510",
    description: `Deprecation of Low-Activity Markets from bnb and ethereum testnet`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // BTC Pool
      {
        target: BNB_COMPTROLLERS.BTC,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [
          [BNB_VTOKENS.BTC.vPT_SolvBTC_BBN_27MAR2025_BTC, BNB_VTOKENS.BTC.vBTCB_BTC],
          [Actions.MINT, Actions.BORROW, Actions.ENTER_MARKET],
          true,
        ],
      },
      {
        target: BNB_COMPTROLLERS.BTC,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [BNB_VTOKENS.BTC.vPT_SolvBTC_BBN_27MAR2025_BTC, COLLATERAL_FACTOR, parseUnits("0.85", 18)],
      },

      // Liquid Staked ETH Pool
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

      // Meme Pool
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

      // Stablecoin Pool
      {
        target: BNB_COMPTROLLERS.Stablecoins,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [
          [
            BNB_VTOKENS.Stablecoins.vEURA_Stablecoins,
            BNB_VTOKENS.Stablecoins.vlisUSD_StableCoins,
            BNB_VTOKENS.Stablecoins.vUSDD_StableCoins,
            BNB_VTOKENS.Stablecoins.vUSDT_StableCoins,
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
        params: [BNB_VTOKENS.Stablecoins.vlisUSD_StableCoins, COLLATERAL_FACTOR, parseUnits("0.7", 18)],
      },
      {
        target: BNB_COMPTROLLERS.Stablecoins,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [BNB_VTOKENS.Stablecoins.vUSDD_StableCoins, COLLATERAL_FACTOR, parseUnits("0.7", 18)],
      },
      {
        target: BNB_COMPTROLLERS.Stablecoins,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [BNB_VTOKENS.Stablecoins.vUSDT_StableCoins, COLLATERAL_FACTOR, parseUnits("0.88", 18)],
      },

      // Tron Pool
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
        params: [BNB_VTOKENS.Tron.vBTT_Tron, COLLATERAL_FACTOR, parseUnits("0.3", 18)],
      },
      {
        target: BNB_COMPTROLLERS.Tron,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [BNB_VTOKENS.Tron.vTRX_Tron, COLLATERAL_FACTOR, parseUnits("0.3", 18)],
      },
      {
        target: BNB_COMPTROLLERS.Tron,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [BNB_VTOKENS.Tron.vUSDD_Tron, COLLATERAL_FACTOR, parseUnits("0.7", 18)],
      },
      {
        target: BNB_COMPTROLLERS.Tron,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [BNB_VTOKENS.Tron.vUSDT_Tron, COLLATERAL_FACTOR, parseUnits("0.88", 18)],
      },
      {
        target: BNB_COMPTROLLERS.Tron,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [BNB_VTOKENS.Tron.vWIN_Tron, COLLATERAL_FACTOR, parseUnits("0.3", 18)],
      },

      // DeFi Pool
      {
        target: BNB_COMPTROLLERS.DeFi,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [
          [BNB_VTOKENS.DeFi.vALPACA_DeFi, BNB_VTOKENS.DeFi.vUSDD_DeFi, BNB_VTOKENS.DeFi.vankrBNB_DeFi],
          [Actions.MINT, Actions.BORROW, Actions.ENTER_MARKET],
          true,
        ],
      },
      {
        target: BNB_COMPTROLLERS.DeFi,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [BNB_VTOKENS.DeFi.vALPACA_DeFi, COLLATERAL_FACTOR, parseUnits("0.3", 18)],
      },
      {
        target: BNB_COMPTROLLERS.DeFi,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [BNB_VTOKENS.DeFi.vUSDD_DeFi, COLLATERAL_FACTOR, parseUnits("0.7", 18)],
      },

      // GameFi Pool
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

      // Curve Pool
      {
        target: ETHEREUM_COMPTROLLER.Curve,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [
          [ETHEREUM_VTOKENS.Curve.vCRV_Curve, ETHEREUM_VTOKENS.Curve.vcrvUSD_Curve],
          [Actions.MINT, Actions.BORROW, Actions.ENTER_MARKET],
          true,
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ETHEREUM_COMPTROLLER.Curve,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [ETHEREUM_VTOKENS.Curve.vCRV_Curve, COLLATERAL_FACTOR, parseUnits("0.65", 18)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ETHEREUM_COMPTROLLER.Curve,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [ETHEREUM_VTOKENS.Curve.vcrvUSD_Curve, COLLATERAL_FACTOR, parseUnits("0.8", 18)],
        dstChainId: LzChainId.sepolia,
      },

      // Core Pool
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
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ETHEREUM_COMPTROLLER.Core,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [ETHEREUM_VTOKENS.Core.vFRAX_Core, COLLATERAL_FACTOR, parseUnits("0.8", 18)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ETHEREUM_COMPTROLLER.Core,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [ETHEREUM_VTOKENS.Core.vsFRAX_Core, COLLATERAL_FACTOR, parseUnits("0.8", 18)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ETHEREUM_COMPTROLLER.Core,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [ETHEREUM_VTOKENS.Core.vyvUSDC_1_Core, COLLATERAL_FACTOR, parseUnits("0.6", 18)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ETHEREUM_COMPTROLLER.Core,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [ETHEREUM_VTOKENS.Core.vyvUSDS_1_Core, COLLATERAL_FACTOR, parseUnits("0.6", 18)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ETHEREUM_COMPTROLLER.Core,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [ETHEREUM_VTOKENS.Core.vyvUSDT_1_Core, COLLATERAL_FACTOR, parseUnits("0.6", 18)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ETHEREUM_COMPTROLLER.Core,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [ETHEREUM_VTOKENS.Core.vyvWETH_1_Core, COLLATERAL_FACTOR, parseUnits("0.6", 18)],
        dstChainId: LzChainId.sepolia,
      },
      // Liquid Staked ETH Pool for sepolia
      {
        target: ETHEREUM_COMPTROLLER.LiquidStakedETH,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [
          [ETHEREUM_VTOKENS.LiquidStakedETH.vsfrxETH_LiquidStakedETH],
          [Actions.MINT, Actions.BORROW, Actions.ENTER_MARKET],
          true,
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ETHEREUM_COMPTROLLER.LiquidStakedETH,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [ETHEREUM_VTOKENS.LiquidStakedETH.vsfrxETH_LiquidStakedETH, COLLATERAL_FACTOR, parseUnits("0.93", 18)],
        dstChainId: LzChainId.sepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip510;
