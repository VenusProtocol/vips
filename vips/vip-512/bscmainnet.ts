import { BigNumber, BigNumberish } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const ethereum = NETWORK_ADDRESSES.ethereum;
export const tBTC_Chainlink_Feed_ETH = "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c";
export const tBTC_Stale_Period_ETH = 6000; // 100 minutes in seconds
export const COMPTROLLER_CORE_ETH = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";
export const tBTC_ETH = "0x18084fbA666a33d37592fA2633fD49a74DD93a88";

// Converters
export const USDT_ETH = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const USDC_ETH = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const WBTC_ETH = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
const WETH_ETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const XVS_ETH = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";
export const USDT_PRIME_CONVERTER_ETH = "0x4f55cb0a24D5542a3478B0E284259A6B850B06BD";
export const USDC_PRIME_CONVERTER_ETH = "0xcEB9503f10B781E30213c0b320bCf3b3cE54216E";
export const WBTC_PRIME_CONVERTER_ETH = "0xDcCDE673Cd8988745dA384A7083B0bd22085dEA0";
export const WETH_PRIME_CONVERTER_ETH = "0xb8fD67f215117FADeF06447Af31590309750529D";
export const XVS_VAULT_CONVERTER_ETH = "0x1FD30e761C3296fE36D9067b1e398FD97B4C0407";

export const converterBaseAssetsEth = {
  [USDT_PRIME_CONVERTER_ETH]: USDT_ETH,
  [USDC_PRIME_CONVERTER_ETH]: USDC_ETH,
  [WBTC_PRIME_CONVERTER_ETH]: WBTC_ETH,
  [WETH_PRIME_CONVERTER_ETH]: WETH_ETH,
  [XVS_VAULT_CONVERTER_ETH]: XVS_ETH,
};
export const CONVERSION_INCENTIVE_ETH = 3e14;

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

const configureConvertersEth = (fromAssets: string[], incentive: BigNumberish = CONVERSION_INCENTIVE_ETH) => {
  enum ConversionAccessibility {
    NONE = 0,
    ALL = 1,
    ONLY_FOR_CONVERTERS = 2,
    ONLY_FOR_USERS = 3,
  }

  return Object.entries(converterBaseAssetsEth).map(([converter, baseAsset]: [string, string]) => {
    const conversionConfigs = fromAssets.map(() => [incentive, ConversionAccessibility.ALL]);
    return {
      target: converter,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [baseAsset, fromAssets, conversionConfigs],
      dstChainId: LzChainId.ethereum,
    };
  });
};

export const tBTCMarketSpec = {
  vToken: {
    address: "0x5e35C312862d53FD566737892aDCf010cb4928F7",
    name: "Venus tBTC (Core)",
    symbol: "vtBTC_Core",
    underlying: tBTC_ETH,
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_CORE_ETH,
  },
  riskParameters: {
    collateralFactor: parseUnits("0.75", 18),
    liquidationThreshold: parseUnits("0.78", 18),
    supplyCap: parseUnits("120", 18),
    borrowCap: parseUnits("60", 18),
    reserveFactor: parseUnits("0.25", 18),
    protocolSeizeShare: parseUnits("0.05", 18),
  },
  initialSupply: {
    amount: parseUnits("0.24", 18),
    vTokensToBurn: parseUnits("0.0009615", 8), // Approximately $100
    vTokenReceiver: "0x71E47a4429d35827e0312AA13162197C23287546",
  },
  interestRateModel: {
    address: "0x8a7F7b9f5DD2366E4Caaeb0362726531B86B711E",
    base: "0",
    multiplier: "0.15",
    jump: "3",
    kink: "0.45",
  },
};

export const vip512 = (maxStalePeriod?: number) => {
  const meta = {
    version: "v2",
    title: "VIP-512 [Ethereum] Add tBTC market to the Core pool",
    description: `#### Summary

If passed, this VIP will add a market for [tBTC](https://etherscan.io/address/0x18084fbA666a33d37592fA2633fD49a74DD93a88) to the Core pool on Ethereum, following the Community proposal [Proposal: List Threshold Network’s tBTC on Venus Core Pool](https://community.venus.io/t/proposal-list-threshold-network-s-tbtc-on-venus-core-pool/4893) ([snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xd6032874b555ef01878df224a60506b7eeffd5c33113d0e1bfc3c775687214f4))

This VIP includes the fixed commands, previously proposed in [VIP-508](https://app.venus.io/#/governance/proposal/508?chainId=56), considering the new Oracle contract, with the new Cached Prices feature.

#### Description

**Risk parameters for tBTC**

Following [Chaos Labs recommendations](https://community.venus.io/t/proposal-list-threshold-network-s-tbtc-on-venus-core-pool/4893/5), the risk parameters for the new market are:

Underlying token: [tBTC](https://etherscan.io/address/0x18084fbA666a33d37592fA2633fD49a74DD93a88)

- Borrow cap: 120 tBTC
- Supply cap: 60 tBTC
- Collateral factor: 75%
- Liquidation threshold: 78%
- Reserve factor: 25%

Bootstrap liquidity: 0.24 tBTC provided by the [Threshold Network](https://etherscan.io/tx/0x4af8b55c15b0b5d620e9448710a2f0fc3129f2c9adbf18bfbc35bbfe3215556f) Treasury.

Interest rate curve for the new market:

- kink: 45%
- base (yearly): 0%
- multiplier (yearly): 15%
- jump multiplier (yearly): 300%

**Oracles configuration for tBTC**

The [ResilientOracle](https://docs-v4.venus.io/risk/resilient-price-oracle) deployed to [Ethereum](https://etherscan.io/address/0xd2ce3fb018805ef92b8C5976cb31F84b4E295F94) is used for tBTC, using under the hood the Chainlink price for BTC/USD ([feed](https://etherscan.io/address/0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c)), following the [Chaos Labs recommendations](https://community.venus.io/t/proposal-list-threshold-network-s-tbtc-on-venus-core-pool/4893/5#pricing-10).

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, validating that the new market is properly added to the Core pool on Ethereum, with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same market has been deployed to testnet, and used in the Venus Protocol testnet deployment

#### Deployed contracts

vtBTC contract:

- Ethereum: [0x5e35C312862d53FD566737892aDCf010cb4928F7](https://etherscan.io/address/0x5e35C312862d53FD566737892aDCf010cb4928F7)
- Sepolia: [0x834078D691d431aAdC80197f7a61239F9F89547b](https://sepolia.etherscan.io/address/0x834078D691d431aAdC80197f7a61239F9F89547b)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/572)
- [Deployment of tBTC to Sepolia](https://sepolia.etherscan.io/tx/0x9521b61bbda816061b436d13a2dd4c4fb56f2140b4ca9dc7190fcf0597092a9f)
- [Documentation](https://docs-v4.venus.io/)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Configure Oracle
      {
        target: ethereum.CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[tBTCMarketSpec.vToken.underlying, tBTC_Chainlink_Feed_ETH, maxStalePeriod || tBTC_Stale_Period_ETH]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            tBTCMarketSpec.vToken.underlying,
            [ethereum.CHAINLINK_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      // Market config
      {
        target: tBTCMarketSpec.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["7200"],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [tBTCMarketSpec.vToken.underlying, tBTCMarketSpec.initialSupply.amount, ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: tBTCMarketSpec.vToken.underlying,
        signature: "approve(address,uint256)",
        params: [ethereum.POOL_REGISTRY, 0],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: tBTCMarketSpec.vToken.underlying,
        signature: "approve(address,uint256)",
        params: [ethereum.POOL_REGISTRY, tBTCMarketSpec.initialSupply.amount],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            tBTCMarketSpec.vToken.address,
            tBTCMarketSpec.riskParameters.collateralFactor, // CF
            tBTCMarketSpec.riskParameters.liquidationThreshold, // LT
            tBTCMarketSpec.initialSupply.amount, // initial supply
            ethereum.NORMAL_TIMELOCK, // vToken receiver
            tBTCMarketSpec.riskParameters.supplyCap, // supply cap
            tBTCMarketSpec.riskParameters.borrowCap, // borrow cap
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: tBTCMarketSpec.vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, tBTCMarketSpec.initialSupply.vTokensToBurn],
        dstChainId: LzChainId.ethereum,
      },
      (() => {
        const vTokensMinted = convertAmountToVTokens(
          tBTCMarketSpec.initialSupply.amount,
          tBTCMarketSpec.vToken.exchangeRate,
        );
        const vTokensRemaining = vTokensMinted.sub(tBTCMarketSpec.initialSupply.vTokensToBurn);
        return {
          target: tBTCMarketSpec.vToken.address,
          signature: "transfer(address,uint256)",
          params: [tBTCMarketSpec.initialSupply.vTokenReceiver, vTokensRemaining],
          dstChainId: LzChainId.ethereum,
        };
      })(),
      ...configureConvertersEth([tBTCMarketSpec.vToken.underlying]),
      {
        target: ethereum.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [USDT_ETH, parseUnits("100", 6), tBTCMarketSpec.initialSupply.vTokenReceiver],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip512;
