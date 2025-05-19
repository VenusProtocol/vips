import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { sepolia } = NETWORK_ADDRESSES;

// BNB Chain
export const COMPTROLLER_LiquidStakedBNB = "0x596B11acAACF03217287939f88d63b51d3771704";
export const VToken_vPT_clisBNB_APR25_LiquidStakedBNB = "0x7C4890D673985CE22A4D38761473f190e434c956";

// Ethereum
export const VTreasury_Ethereum = sepolia.VTREASURY;
export const Timelock_Ethereum = sepolia.NORMAL_TIMELOCK;
export const Comptroller_Ethena = "0x05Cdc6c3dceA796971Db0d9edDbC7C56f2176D1c";
export const Comptroller_LiquidStakedETH = "0xd79CeB8EF8188E44b7Eb899094e8A3A4d7A1e236";

export const VToken_vPT_USDe_27MAR2025_Ethena = "0xf2C00a9C3314f7997721253c49276c8531a30803";
export const VToken_vPT_sUSDE_27MAR2025_Ethena = "0x6c87587b1813eAf5571318E2139048b04eAaFf97";
export const VToken_vPT_weETH_26DEC2024_LiquidStakedETH = "0x3AF2bE7AbEF0f840b196D99d79F4B803a5dB14a1";
export const VToken_vsUSDe_Ethena = "0x643a2BE96e7675Ca34bcceCB33F4f0fECA1ba9fC";
export const VToken_vUSDC_Ethena = "0x466fe60aE3d8520e49D67e3483626786Ba0E6416";
export const PT_weETH_26DEC2024_LiquidStakedETH = "0x56107201d3e4b7Db92dEa0Edb9e0454346AEb8B5";
export const weETH_Address = "0x3b8b6E96e57f0d1cD366AaCf4CcC68413aF308D0";

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

const vip500 = () => {
  const meta = {
    version: "v2",
    title: "[sepolia] New sUSDe and USDe market in the Core pool",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // === BNB Chain ===
      // --- Market: PT-clisBNB-APR25 on Liquid Staked BNB
      {
        target: COMPTROLLER_LiquidStakedBNB,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [VToken_vPT_clisBNB_APR25_LiquidStakedBNB, parseUnits("0", 18), parseUnits("0.85", 18)],
      },
      {
        target: COMPTROLLER_LiquidStakedBNB,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[VToken_vPT_clisBNB_APR25_LiquidStakedBNB], [Actions.MINT, Actions.ENTER_MARKET], true],
      },

      // === Ethereum ===
      // --- Market: PT-USDe-MAR25 on Ethena
      {
        target: Comptroller_Ethena,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [VToken_vPT_USDe_27MAR2025_Ethena, parseUnits("0", 18), parseUnits("0.88", 18)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: Comptroller_Ethena,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[VToken_vPT_USDe_27MAR2025_Ethena], [Actions.MINT, Actions.ENTER_MARKET], true],
        dstChainId: LzChainId.sepolia,
      },

      // --- Market: PT-sUSDE-MAR25 on Ethena
      {
        target: Comptroller_Ethena,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [VToken_vPT_sUSDE_27MAR2025_Ethena, parseUnits("0", 18), parseUnits("0.87", 18)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: Comptroller_Ethena,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[VToken_vPT_sUSDE_27MAR2025_Ethena], [Actions.MINT, Actions.ENTER_MARKET], true],
        dstChainId: LzChainId.sepolia,
      },

      // --- Market: sUSDE on Ethena
      {
        target: Comptroller_Ethena,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [VToken_vsUSDe_Ethena, parseUnits("0", 18), parseUnits("0.92", 18)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: Comptroller_Ethena,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[VToken_vsUSDe_Ethena], [Actions.MINT, Actions.ENTER_MARKET], true],
        dstChainId: LzChainId.sepolia,
      },

      // // --- Market: USDC on Ethena
      {
        target: Comptroller_Ethena,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[VToken_vUSDC_Ethena], [Actions.MINT, Actions.BORROW, Actions.ENTER_MARKET], true],
        dstChainId: LzChainId.sepolia,
      },

      // --- Market: PT-weETH-DEC24 on Liquid Staked ETH
      {
        target: Comptroller_LiquidStakedETH,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [
          [VToken_vPT_weETH_26DEC2024_LiquidStakedETH],
          [
            Actions.MINT,
            Actions.REDEEM,
            Actions.BORROW,
            Actions.REPAY,
            Actions.SEIZE,
            Actions.TRANSFER,
            Actions.LIQUIDATE,
            Actions.ENTER_MARKET,
            Actions.EXIT_MARKET,
          ],
          true,
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: Comptroller_LiquidStakedETH,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [VToken_vPT_weETH_26DEC2024_LiquidStakedETH, parseUnits("0", 18), parseUnits("0", 18)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: Comptroller_LiquidStakedETH,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[VToken_vPT_weETH_26DEC2024_LiquidStakedETH], [0]],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: Comptroller_LiquidStakedETH,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[VToken_vPT_weETH_26DEC2024_LiquidStakedETH], [0]],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: Comptroller_LiquidStakedETH,
        signature: "unlistMarket(address)",
        params: [VToken_vPT_weETH_26DEC2024_LiquidStakedETH],
        dstChainId: LzChainId.sepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip500;
