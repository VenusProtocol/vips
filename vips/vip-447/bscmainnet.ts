import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { tokens } from "../vip-445/bsctestnet";

const { POOL_REGISTRY, RESILIENT_ORACLE } = NETWORK_ADDRESSES["ethereum"];

export const COMPTROLLER_CORE = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";

export const USDT_PRIME_CONVERTER = "0x4f55cb0a24D5542a3478B0E284259A6B850B06BD";
export const USDC_PRIME_CONVERTER = "0xcEB9503f10B781E30213c0b320bCf3b3cE54216E";
export const WBTC_PRIME_CONVERTER = "0xDcCDE673Cd8988745dA384A7083B0bd22085dEA0";
export const WETH_PRIME_CONVERTER = "0xb8fD67f215117FADeF06447Af31590309750529D";
export const XVS_VAULT_CONVERTER = "0x1FD30e761C3296fE36D9067b1e398FD97B4C0407";
export const BaseAssets = [
  "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT USDTTokenConverter BaseAsset
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC USDCTokenConverter BaseAsset
  "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC WBTCTokenConverter BaseAsset
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH WETHTokenConverter BaseAsset
  "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A", // XVS XVSTokenConverter BaseAsset
];
const CONVERSION_INCENTIVE = parseUnits("3", 14);
const ORACLE = "0x641817dE6c0E4f763C393AaD182E6C946e1a2e2b";

type Token = {
  address: string;
  decimals: number;
  symbol: string;
};

export const token = {
  address: "0xc56413869c6CDf96496f2b1eF801fEDBdFA7dDB0",
  decimals: 18,
  symbol: "yvWETH-1",
};

type Market = {
  vToken: {
    address: string;
    name: string;
    symbol: string;
    underlying: Token;
    decimals: number;
    exchangeRate: BigNumber;
    comptroller: string;
  };
  riskParameters: {
    collateralFactor: BigNumber;
    liquidationThreshold: BigNumber;
    supplyCap: BigNumber;
    borrowCap: BigNumber;
    reserveFactor: BigNumber;
    protocolSeizeShare: BigNumber;
  };
  initialSupply: {
    amount: BigNumber;
    vTokenReceiver: string;
  };
  interestRateModel: {
    address: string;
    base: string;
    multiplier: string;
    jump: string;
    kink: string;
  };
};

export const market: Market = {
  vToken: {
    address: "0xba3916302cBA4aBcB51a01e706fC6051AaF272A0",
    name: "Venus yvWETH-1 (Core)",
    symbol: "vyvWETH-1_Core",
    underlying: token,
    decimals: 8,
    exchangeRate: parseUnits("1.0000000008559240874742259986", 28),
    comptroller: COMPTROLLER_CORE,
  },
  riskParameters: {
    collateralFactor: parseUnits("0.5", 18),
    liquidationThreshold: parseUnits("0.6", 18),
    supplyCap: parseUnits("56", 18),
    borrowCap: parseUnits("0", 18),
    reserveFactor: parseUnits("0.1", 18),
    protocolSeizeShare: parseUnits("0.05", 18),
  },
  initialSupply: {
    amount: parseUnits("3.920893913355987542", 18),
    vTokenReceiver: "0x16388463d60FFE0661Cf7F1f31a7D658aC790ff7",
  },
  interestRateModel: {
    address: "0x322072b84434609ff64333A125516055B5B4405F",
    base: "0",
    multiplier: "0.15625",
    jump: "2.5",
    kink: "0.8",
  },
};

const vip447 = () => {
  const meta = {
    version: "v2",
    title: "VIP-447 [Ethereum] New yvWETH-1 market in the Core pool",
    description: `#### Summary

If passed, this VIP will add the [yvWETH-1](https://etherscan.io/address/0xc56413869c6CDf96496f2b1eF801fEDBdFA7dDB0) market to the Core pool on Ethereum, following the Community proposal “[Deploy Yearn Vaults as collateral on Venus - yvUSDC, yvUSDT, yvDAI, yvUSDS, yvWETH](https://community.venus.io/t/deploy-yearn-vaults-as-collateral-on-venus-yvusdc-yvusdt-yvdai-yvusds-yvweth/4705)” and [the associated snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xebbc39baf07596cab6cd0e0d36ffce9976c53b1f833a33ddb3c4b663721bd565).

It will also enable the conversions on the [Token Converters](https://docs-v4.venus.io/whats-new/token-converter) for the new market, and the markets added in the “[VIP-445 [Ethereum] New Yearn markets in the Core pool (yvUSDC-1, yvUSDT-1, yvUSDS-1)](https://app.venus.io/#/governance/proposal/445?chainId=56)”.

#### Description

**Risk parameters**

Following [Chaos Labs recommendations](https://community.venus.io/t/deploy-yearn-vaults-as-collateral-on-venus-yvusdc-yvusdt-yvdai-yvusds-yvweth/4705/7), the risk parameters for the new market are:

Underlying token: [yvWETH-1](https://etherscan.io/address/0xc56413869c6CDf96496f2b1eF801fEDBdFA7dDB0)

- Borrow cap: 0 yvWETH-1
- Supply cap: 56 yvWETH-1
- Collateral factor: 50%
- Liquidation threshold: 60%
- Reserve factor: 10%

Bootstrap liquidity (provided by the [Yearn.fi project](https://etherscan.io/address/0x16388463d60FFE0661Cf7F1f31a7D658aC790ff7)): 3.920893913355987542 yvWETH-1

The interest rate curve for the new market is not relevant because the asset is not borrowable, but these parameters will be set anyway:

- kink: 80%
- base (yearly): 0%
- multiplier (yearly): 15.625%
- jump multiplier (yearly): 250%

**Oracles configuration**

The [ResilientOracle](https://docs-v4.venus.io/risk/resilient-price-oracle) deployed to [Ethereum](https://etherscan.io/address/0xd2ce3fb018805ef92b8C5976cb31F84b4E295F94) is used for the new market, using under the hood the conversion rate yvWETH-1/WETH provided by the [ERC4626Oracle](https://github.com/VenusProtocol/oracle/pull/253).

- yvWETH-1. Onchain conversion rate yvWETH-1/WETH multiplied by the WETH/USD price considered by the ResilientOracle

#### Security and additional considerations

We applied the following security procedures for this VIP:

- **Audit**: Certik, Peckshield, Hacken and Code4rena have audited the market code. Certik has audited the ERC4626 Oracle.
- **VIP execution simulation**: in a simulation environment, validating the new market is properly added to the Core pool on Ethereum, with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same market has been deployed to Sepolia, and used in the Venus Protocol testnet deployment

**Audit reports**

- [Certik audit report](https://github.com/VenusProtocol/oracle/blob/b6d581ddac010a8a80ba4c6fe819c756568c4a92/audits/123_erc4626Oracle_certik_20250206.pdf) (2025/02/06)
- [Certik audit report](https://github.com/VenusProtocol/isolated-pools/blob/1d60500e28d4912601bac461870c754dd9e72341/audits/036_isolatedPools_certik_20230619.pdf) (2023/June/19)
- [Code4rena contest](https://code4rena.com/contests/2023-05-venus-protocol-isolated-pools) (2023/May/05)
- [Hacken audit report](https://github.com/VenusProtocol/isolated-pools/blob/c801e898e034e313e885c5d486ed27c15e7e2abf/audits/016_isolatedPools_hacken_20230426.pdf) (2023/April/26)
- [Peckshield audit report 1](https://github.com/VenusProtocol/isolated-pools/blob/c801e898e034e313e885c5d486ed27c15e7e2abf/audits/003_isolatedPools_peckshield_20230112.pdf) (2023/January/12)
- [Peckshield audit report 2](https://github.com/VenusProtocol/isolated-pools/blob/1d60500e28d4912601bac461870c754dd9e72341/audits/037_isolatedPools_peckshield_20230625.pdf) (2023/June/25)

#### Deployed contracts

Mainnet

- vyvWETH-1_Core: [0xba3916302cBA4aBcB51a01e706fC6051AaF272A0](https://etherscan.io/address/0xba3916302cBA4aBcB51a01e706fC6051AaF272A0)
- yvWETH-1_ERC4626Oracle: [0x641817dE6c0E4f763C393AaD182E6C946e1a2e2b](https://etherscan.io/address/0x641817dE6c0E4f763C393AaD182E6C946e1a2e2b)

Sepolia

- vyvWETH-1_Core: [0x271D914014Ac2CD8EB89a4e106Ac15a4e948eEE2](https://sepolia.etherscan.io/address/0x271D914014Ac2CD8EB89a4e106Ac15a4e948eEE2)
- yvWETH-1_ERC4626Oracle: [0x5eAE3fd56b39f1e5D497b4a5f0442E560FA6F13B](https://sepolia.etherscan.io/address/0x5eAE3fd56b39f1e5D497b4a5f0442E560FA6F13B)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/473)
- [VIP-445 [Ethereum] New Yearn markets in the Core pool (yvUSDC-1, yvUSDT-1, yvUSDS-1)](https://app.venus.io/#/governance/proposal/445?chainId=56)
- [Deployment to Sepolia](https://sepolia.etherscan.io/tx/0xc29900e9c5b889412eb2968a03fb777e57867838bab99d61db76ba902d598c21)
- [Documentation](https://docs-v4.venus.io/)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [token.address, [ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero], [true, false, false]],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: market.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["7200"],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: market.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, market.initialSupply.amount],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            market.vToken.address,
            market.riskParameters.collateralFactor,
            market.riskParameters.liquidationThreshold,
            market.initialSupply.amount,
            market.initialSupply.vTokenReceiver,
            market.riskParameters.supplyCap,
            market.riskParameters.borrowCap,
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: market.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, 0],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: COMPTROLLER_CORE,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[market.vToken.address], [2], true],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: USDT_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [
          BaseAssets[0],
          [...tokens.map((t: Token) => t.address), token.address],
          [...tokens.map(() => [CONVERSION_INCENTIVE, 1]), [CONVERSION_INCENTIVE, 1]],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: USDC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [
          BaseAssets[1],
          [...tokens.map((t: Token) => t.address), token.address],
          [...tokens.map(() => [CONVERSION_INCENTIVE, 1]), [CONVERSION_INCENTIVE, 1]],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: WBTC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [
          BaseAssets[2],
          [...tokens.map((t: Token) => t.address), token.address],
          [...tokens.map(() => [CONVERSION_INCENTIVE, 1]), [CONVERSION_INCENTIVE, 1]],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: WETH_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [
          BaseAssets[3],
          [...tokens.map((t: Token) => t.address), token.address],
          [...tokens.map(() => [CONVERSION_INCENTIVE, 1]), [CONVERSION_INCENTIVE, 1]],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: XVS_VAULT_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [
          BaseAssets[4],
          [...tokens.map((t: Token) => t.address), token.address],
          [...tokens.map(() => [CONVERSION_INCENTIVE, 1]), [CONVERSION_INCENTIVE, 1]],
        ],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip447;
