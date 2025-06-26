import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

// BNB Chain
export const COMPTROLLER_Core = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const VToken_vPT_sUSDE_26JUN2025 = "0x9e4E5fed5Ac5B9F732d0D850A615206330Bf1866";

// Ethereum
export const VTreasury_Ethereum = "0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA";
export const Timelock_Ethereum = "0xd969E79406c35E80750aAae061D402Aab9325714";
export const Comptroller_LiquidStakedETH = "0xF522cd0360EF8c2FF48B648d53EA1717Ec0F3Ac3";

export const VToken_vPT_weETH_26DEC2024_LiquidStakedETH = "0x76697f8eaeA4bE01C678376aAb97498Ee8f80D5C";
export const PT_weETH_26DEC2024_LiquidStakedETH = "0x6ee2b5E19ECBa773a352E5B21415Dc419A700d1d";

// underlying assets associated with the vTokens held by the Venus Treasury
export const PT_weETH_26DEC2024_expected = parseUnits("1.799618792534137830", 18);

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

export const vip525 = () => {
  const meta = {
    version: "v2",
    title: "VIP-525 [BNB Chain] [Ethereum]",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // === BNB Chain ===
      // --- Market: PT_sUSDE_26JUN2025 on Liquid Staked BNB
      {
        target: COMPTROLLER_Core,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[VToken_vPT_sUSDE_26JUN2025], [Actions.MINT, Actions.ENTER_MARKET], true],
      },

      // === Ethereum ===
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
        signature: "transfer(address,uint256)",
        params: [VTreasury_Ethereum, PT_weETH_26DEC2024_expected],
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

export default vip525;
