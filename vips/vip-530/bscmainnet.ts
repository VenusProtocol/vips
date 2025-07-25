import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

// BNB Chain
export const BTC_POOL_COMPTROLLER_BSC = "0x9DF11376Cf28867E2B0741348044780FbB7cb1d6";
export const vPT_SolvBTC_BBN_27MAR2025_BTC = "0x02243F036897E3bE1cce1E540FA362fd58749149";

// Ethereum
export const ETHENA_POOL_COMPTROLLER_ETH = "0x562d2b6FF1dbf5f63E233662416782318cC081E4";
export const CORE_POOL_COMPTROLLER_ETH = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";
export const LIQUID_STAKED_COMPTROLLER_ETH = "0xF522cd0360EF8c2FF48B648d53EA1717Ec0F3Ac3";
export const vsUSDe_Ethena = "0x0792b9c60C728C1D2Fd6665b3D7A08762a9b28e0";
export const vPT_sUSDE_27MAR2025_Ethena = "0xCca202a95E8096315E3F19E46e19E1b326634889";
export const vPT_USDe_27MAR2025_Ethena = "0x62D9E2010Cff87Bae05B91d5E04605ef864ABc3B";
export const vUSDC_Ethena = "0xa8e7f9473635a5CB79646f14356a9Fc394CA111A";
export const vrsETH_LiquidStakedETH = "0xDB6C345f864883a8F4cae87852Ac342589E76D1B";

export const Actions = {
  MINT: 0,
  REDEEM: 1,
  BORROW: 2,
  REPAY: 3,
  SEIZE: 4,
  LIQUIDATE: 5,
  TRANSFER: 6,
  ENTER_MARKET: 7,
  EXIT_MARKET: 8,
};

export const vip530 = () => {
  const meta = {
    version: "v2",
    title: "VIP-530",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: BTC_POOL_COMPTROLLER_BSC,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [
          [vPT_SolvBTC_BBN_27MAR2025_BTC],
          [Actions.REDEEM, Actions.REPAY, Actions.SEIZE, Actions.TRANSFER, Actions.LIQUIDATE, Actions.EXIT_MARKET],
          true,
        ],
      },
      {
        target: BTC_POOL_COMPTROLLER_BSC,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[vPT_SolvBTC_BBN_27MAR2025_BTC], [0]],
      },
      {
        target: BTC_POOL_COMPTROLLER_BSC,
        signature: "unlistMarket(address)",
        params: [vPT_SolvBTC_BBN_27MAR2025_BTC],
      },

      {
        target: ETHENA_POOL_COMPTROLLER_ETH,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [
          [vsUSDe_Ethena, vPT_sUSDE_27MAR2025_Ethena, vPT_USDe_27MAR2025_Ethena, vUSDC_Ethena],
          [Actions.REDEEM, Actions.REPAY, Actions.SEIZE, Actions.TRANSFER, Actions.LIQUIDATE, Actions.EXIT_MARKET],
          true,
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHENA_POOL_COMPTROLLER_ETH,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[vUSDC_Ethena], [0]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHENA_POOL_COMPTROLLER_ETH,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [
          [vsUSDe_Ethena, vPT_sUSDE_27MAR2025_Ethena, vPT_USDe_27MAR2025_Ethena, vUSDC_Ethena],
          [0, 0, 0, 0],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHENA_POOL_COMPTROLLER_ETH,
        signature: "unlistMarket(address)",
        params: [vsUSDe_Ethena],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHENA_POOL_COMPTROLLER_ETH,
        signature: "unlistMarket(address)",
        params: [vPT_sUSDE_27MAR2025_Ethena],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHENA_POOL_COMPTROLLER_ETH,
        signature: "unlistMarket(address)",
        params: [vPT_USDe_27MAR2025_Ethena],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHENA_POOL_COMPTROLLER_ETH,
        signature: "unlistMarket(address)",
        params: [vUSDC_Ethena],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: LIQUID_STAKED_COMPTROLLER_ETH,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [
          [vrsETH_LiquidStakedETH],
          [
            Actions.MINT,
            Actions.REDEEM,
            Actions.REPAY,
            Actions.SEIZE,
            Actions.TRANSFER,
            Actions.LIQUIDATE,
            Actions.ENTER_MARKET,
            Actions.EXIT_MARKET,
          ],
          true,
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: LIQUID_STAKED_COMPTROLLER_ETH,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[vrsETH_LiquidStakedETH], [0]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: LIQUID_STAKED_COMPTROLLER_ETH,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[vrsETH_LiquidStakedETH], [0]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: LIQUID_STAKED_COMPTROLLER_ETH,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vrsETH_LiquidStakedETH, 0, 0],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: LIQUID_STAKED_COMPTROLLER_ETH,
        signature: "unlistMarket(address)",
        params: [vrsETH_LiquidStakedETH],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip530;
