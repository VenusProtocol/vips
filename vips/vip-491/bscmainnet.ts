import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const Pendle_Router = "0x888888888889758F76e7103c6CbF23ABbF58F946";

// BNB Chain
export const COMPTROLLER_LiquidStakedBNB = "0xd933909A4a2b7A4638903028f44D1d38ce27c352";
export const VToken_vPT_clisBNB_APR25_LiquidStakedBNB = "0xA537ACf381b12Bbb91C58398b66D1D220f1C77c8";

// Ethereum
export const VTreasury_Ethereum = "0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA";
export const Timelock_Ethereum = "0xd969E79406c35E80750aAae061D402Aab9325714";
export const Comptroller_Ethena = "0x562d2b6FF1dbf5f63E233662416782318cC081E4";
export const Comptroller_LiquidStakedETH = "0xF522cd0360EF8c2FF48B648d53EA1717Ec0F3Ac3";

export const VToken_vPT_USDe_27MAR2025_Ethena = "0x62D9E2010Cff87Bae05B91d5E04605ef864ABc3B";
export const VToken_vPT_sUSDE_27MAR2025_Ethena = "0xCca202a95E8096315E3F19E46e19E1b326634889";
export const VToken_vPT_weETH_26DEC2024_LiquidStakedETH = "0x76697f8eaeA4bE01C678376aAb97498Ee8f80D5C";
export const VToken_vsUSDe_Ethena = "0x0792b9c60C728C1D2Fd6665b3D7A08762a9b28e0";
export const VToken_vUSDC_Ethena = "0xa8e7f9473635a5CB79646f14356a9Fc394CA111A";
export const PT_weETH_26DEC2024_LiquidStakedETH = "0x6ee2b5E19ECBa773a352E5B21415Dc419A700d1d";
export const YT_weETH_26DEC2024_LiquidStakedETH = "0x129e6B5DBC0Ecc12F9e486C5BC9cDF1a6A80bc6A";
export const weETH_Address = "0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee";

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

export const vip491 = () => {
  const meta = {
    version: "v2",
    title: "VIP-491 Unwind PT Markets (BNB Chain and Ethereum)",
    description: "",
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
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
        dstChainId: LzChainId.ethereum,
      },
      {
        target: Comptroller_Ethena,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[VToken_vPT_USDe_27MAR2025_Ethena], [Actions.MINT, Actions.ENTER_MARKET], true],
        dstChainId: LzChainId.ethereum,
      },

      // --- Market: PT-sUSDE-MAR25 on Ethena
      {
        target: Comptroller_Ethena,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [VToken_vPT_sUSDE_27MAR2025_Ethena, parseUnits("0", 18), parseUnits("0.87", 18)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: Comptroller_Ethena,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[VToken_vPT_sUSDE_27MAR2025_Ethena], [Actions.MINT, Actions.ENTER_MARKET], true],
        dstChainId: LzChainId.ethereum,
      },

      // --- Market: sUSDE on Ethena
      {
        target: Comptroller_Ethena,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [VToken_vsUSDe_Ethena, parseUnits("0", 18), parseUnits("0.92", 18)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: Comptroller_Ethena,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[VToken_vsUSDe_Ethena], [Actions.MINT, Actions.BORROW, Actions.ENTER_MARKET], true],
        dstChainId: LzChainId.ethereum,
      },

      // // --- Market: USDC on Ethena
      {
        target: Comptroller_Ethena,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [VToken_vUSDC_Ethena, parseUnits("0", 18), parseUnits("0", 18)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: Comptroller_Ethena,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[VToken_vUSDC_Ethena], [Actions.MINT, Actions.BORROW, Actions.ENTER_MARKET], true],
        dstChainId: LzChainId.ethereum,
      },

      // --- Market: PT-weETH-DEC24 on Liquid Staked ETH
      {
        target: VTreasury_Ethereum,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [VToken_vPT_weETH_26DEC2024_LiquidStakedETH, parseUnits("1.79961879", 8), Timelock_Ethereum],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: VToken_vPT_weETH_26DEC2024_LiquidStakedETH,
        signature: "redeem(uint256)",
        params: [parseUnits("1.79961879", 8)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: PT_weETH_26DEC2024_LiquidStakedETH,
        signature: "approve(address,uint256)",
        params: [Pendle_Router, parseUnits("0.000000000179961879", 18)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: Pendle_Router,
        signature:
          "redeemPyToToken(address,address,uint256,(address,uint256,address,address,(uint8,address,bytes,bool)))",
        params: [
          VTreasury_Ethereum,
          YT_weETH_26DEC2024_LiquidStakedETH,
          parseUnits("0.000000000179961879", 18),
          [
            weETH_Address, // tokenOut: weETH
            "0",
            weETH_Address,
            "0x0000000000000000000000000000000000000000",
            [0, "0x0000000000000000000000000000000000000000", "0x", false],
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
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
        dstChainId: LzChainId.ethereum,
      },
      {
        target: Comptroller_LiquidStakedETH,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [VToken_vPT_weETH_26DEC2024_LiquidStakedETH, parseUnits("0", 18), parseUnits("0", 18)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: Comptroller_LiquidStakedETH,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[VToken_vPT_weETH_26DEC2024_LiquidStakedETH], [0]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: Comptroller_LiquidStakedETH,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[VToken_vPT_weETH_26DEC2024_LiquidStakedETH], [0]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: Comptroller_LiquidStakedETH,
        signature: "unlistMarket(address)",
        params: [VToken_vPT_weETH_26DEC2024_LiquidStakedETH],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip491;
