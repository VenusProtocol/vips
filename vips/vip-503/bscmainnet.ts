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

// underlying assets associated with the vTokens held by the Venus Treasury
export const PT_weETH_26DEC2024_expected = parseUnits("1.79961879253413783", 18);
export const weETH_expected = parseUnits("1.686015082188295918", 18);

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

export const vip503 = () => {
  const meta = {
    version: "v2",
    title: "VIP-503 [BNB Chain] [Ethereum] Deprecate matured PT tokens and Ethena pool",
    description: `#### Summary

If passed, this VIP will perform the following actions:

- Set Collateral Factor to zero and pause both supply and market entry operations, on the following markets, following the community proposal “[Implement Generalized Risk Policy for Matured PT Markets](https://community.venus.io/t/implement-generalized-risk-policy-for-matured-pt-markets/5050)”, published by Chaos Labs:
    - BNB Chain: [PT-clisBNB-APR25](https://app.venus.io/#/isolated-pools/pool/0xd933909A4a2b7A4638903028f44D1d38ce27c352/market/0xA537ACf381b12Bbb91C58398b66D1D220f1C77c8?chainId=56)
    - Ethereum:
        - [PT-USDe-MAR25](https://app.venus.io/#/isolated-pools/pool/0x562d2b6FF1dbf5f63E233662416782318cC081E4/market/0x62D9E2010Cff87Bae05B91d5E04605ef864ABc3B?chainId=1)
        - [PT-sUSDE-MAR25](https://app.venus.io/#/isolated-pools/pool/0x562d2b6FF1dbf5f63E233662416782318cC081E4/market/0xCca202a95E8096315E3F19E46e19E1b326634889?chainId=1)
        - [PT-weETH-DEC24](https://app.venus.io/#/isolated-pools/pool/0xF522cd0360EF8c2FF48B648d53EA1717Ec0F3Ac3/market/0x76697f8eaeA4bE01C678376aAb97498Ee8f80D5C?chainId=1)
- Set Collateral Factor to zero and pause both supply and market entry operations, on the following markets of the Ethena pool on Ethereum, following the community proposal “[[Proposal] Decommission the Ethena Isolated Pool on Ethereum and Explore USDe and sUSDe Integration in the Core Pool](https://community.venus.io/t/proposal-decommission-the-ethena-isolated-pool-on-ethereum-and-explore-usde-and-susde-integration-in-the-core-pool/5051)” and the associated [Chaos Labs recommendations](https://community.venus.io/t/proposal-decommission-the-ethena-isolated-pool-on-ethereum-and-explore-usde-and-susde-integration-in-the-core-pool/5051/6):
    - [sUSDe](https://app.venus.io/#/isolated-pools/pool/0x562d2b6FF1dbf5f63E233662416782318cC081E4/market/0x0792b9c60C728C1D2Fd6665b3D7A08762a9b28e0?chainId=1)
    - [USDC](https://app.venus.io/#/isolated-pools/pool/0x562d2b6FF1dbf5f63E233662416782318cC081E4/market/0xa8e7f9473635a5CB79646f14356a9Fc394CA111A?chainId=1)
- Remove the market PT-weETH-DEC24 from the Liquid Staked ETH pool, and redeem the bootstrap liquidity provided by the Venus Treasury in the [VIP-305](https://app.venus.io/#/governance/proposal/305?chainId=56)

#### Description

From a quantitative standpoint, once a PT reaches maturity, all financial risk is effectively transferred to the underlying asset. At this stage, the PT functions purely as a wrapper, redeemable 1:1 for the underlying during liquidations. Since no new PTs can be issued after maturity—only redeemed—the asset loses its yield-bearing properties and its functionality becomes minimal. Consequently, the total supply is expected to decline toward zero over time.

After reviewing the current state of the [Ethena isolated pool on Ethereum](https://app.venus.io/#/isolated-pools/pool/0x562d2b6FF1dbf5f63E233662416782318cC081E4?chainId=1), Chaos Labs concurs that the markets can be safely deprecated. The review confirms there is only one active supplier, no borrowing activity, and the Pendle assets associated with the pool have already matured. Deprecating these inactive markets aligns with protocol efficiency goals, reducing unnecessary complexity and freeing resources for more impactful allocations.

In a different VIP, two new markets for sUSDe and USDe will be added to the Core pool on Ethereum.

The [PT-weETH-DEC24 tokens](https://etherscan.io/address/0x6ee2b5e19ecba773a352e5b21415dc419a700d1d) withdrawn from the Venus markets will be redeemed on Pendle, recovering 1.68 [weETH tokens](https://etherscan.io/address/0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee), that will be transferred to the [Venus Treasury on Ethereum](https://etherscan.io/address/0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA).

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **No changes in the code**. This VIP doesn’t include any upgrades or changes in the codebase, only execution of privilege functions.
- **VIP execution simulation**: in a simulation environment, validating the execution of the described plan

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/552)
- Execution on testnet ([BNB Chain](https://testnet.bscscan.com/tx/0x3b1499df8c05a5608135600c125dddd17dde6da561742ee1de46ff7c8d448d32), [Sepolia](https://sepolia.etherscan.io/tx/0x657092af973f1598e5e4dcaad3155fc05f63ea5758de34ee361f226cedb07189))
- Policy to deprecate Pendle PT markets, proposed by Chaos Labs: [Implement Generalized Risk Policy for Matured PT Markets](https://community.venus.io/t/implement-generalized-risk-policy-for-matured-pt-markets/5050)
- [[Proposal] Decommission the Ethena Isolated Pool on Ethereum and Explore USDe and sUSDe Integration in the Core Pool](https://community.venus.io/t/proposal-decommission-the-ethena-isolated-pool-on-ethereum-and-explore-usde-and-susde-integration-in-the-core-pool/5051), and [Chaos Labs recommendation](https://community.venus.io/t/proposal-decommission-the-ethena-isolated-pool-on-ethereum-and-explore-usde-and-susde-integration-in-the-core-pool/5051/6)`,
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
        params: [[VToken_vsUSDe_Ethena], [Actions.MINT, Actions.ENTER_MARKET], true],
        dstChainId: LzChainId.ethereum,
      },

      // // --- Market: USDC on Ethena
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
        params: [Pendle_Router, PT_weETH_26DEC2024_expected],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: Pendle_Router,
        signature:
          "redeemPyToToken(address,address,uint256,(address,uint256,address,address,(uint8,address,bytes,bool)))",
        params: [
          VTreasury_Ethereum,
          YT_weETH_26DEC2024_LiquidStakedETH,
          PT_weETH_26DEC2024_expected,
          [
            weETH_Address, // tokenOut: weETH
            weETH_expected, // minimum amount expected to be withdrawn
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

export default vip503;
