import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { ethereum } = NETWORK_ADDRESSES;

const LBTC = "0x8236a87084f8B84306f72007F36F2618A5634494";
const LBTC_VTOKEN = "0x25C20e6e110A1cE3FEbaCC8b7E48368c7b2F0C91";
const CORE_POOL_COMPTROLLER = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";
const REDUCE_RESERVES_BLOCK_DELTA = "7200";

const { POOL_REGISTRY, REDSTONE_ORACLE, RESILIENT_ORACLE, VTREASURY, NORMAL_TIMELOCK } = ethereum;

export const marketSpec = {
  vToken: {
    address: LBTC_VTOKEN,
    name: "Venus LBTC (Core)",
    symbol: "vLBTC_Core",
    underlying: {
      address: LBTC,
      decimals: 8,
      symbol: "LBTC",
    },
    decimals: 8,
    exchangeRate: parseUnits("1", 18),
    comptroller: CORE_POOL_COMPTROLLER,
  },
  interestRateModel: {
    address: "0xD9a049512ABaA7073D02a398ceD1B92371bff622", // JumpRateModelV2_base0bps_slope900bps_jump20000bps_kink4500bps
    base: "0",
    multiplier: "0.09",
    jump: "2",
    kink: "0.45",
  },
  initialSupply: {
    amount: parseUnits("0.106", 8),
    vTokenReceiver: "0xCb09Ab3F6254437d225Ed3CABEBe0949782E2372",
  },
  riskParameters: {
    supplyCap: parseUnits("450", 8),
    borrowCap: parseUnits("45", 8),
    collateralFactor: parseUnits("0.735", 18),
    liquidationThreshold: parseUnits("0.785", 18),
    reserveFactor: parseUnits("0.2", 18),
    protocolSeizeShare: parseUnits("0.05", 18),
  },
};

const LBTC_ONE_JUMP_REDSTONE_ORACLE = "0x3c8C488d65F2AFDe15F285eAAF4B153C4d35A944";
export const LBTC_REDSTONE_FEED = "0xb415eAA355D8440ac7eCB602D3fb67ccC1f0bc81";
const MAX_STALE_PERIOD = 26 * 3600; // heartbeat of 24 hours + 2 hours margin

export const CONVERSION_INCENTIVE = 1e14;

export const USDT_PRIME_CONVERTER = "0x4f55cb0a24D5542a3478B0E284259A6B850B06BD";
export const USDC_PRIME_CONVERTER = "0xcEB9503f10B781E30213c0b320bCf3b3cE54216E";
export const WBTC_PRIME_CONVERTER = "0xDcCDE673Cd8988745dA384A7083B0bd22085dEA0";
export const WETH_PRIME_CONVERTER = "0xb8fD67f215117FADeF06447Af31590309750529D";
export const XVS_VAULT_CONVERTER = "0x1FD30e761C3296fE36D9067b1e398FD97B4C0407";
const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const WBTC = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const XVS = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";
export const converterBaseAssets = {
  [USDT_PRIME_CONVERTER]: USDT,
  [USDC_PRIME_CONVERTER]: USDC,
  [WBTC_PRIME_CONVERTER]: WBTC,
  [WETH_PRIME_CONVERTER]: WETH,
  [XVS_VAULT_CONVERTER]: XVS,
};

enum ConversionAccessibility {
  NONE = 0,
  ALL = 1,
  ONLY_FOR_CONVERTERS = 2,
  ONLY_FOR_USERS = 3,
}

export const vip402 = () => {
  const meta = {
    version: "v2",
    title: "VIP-402 [Ethereum] New LBTC market in the Core pool",
    description: `#### Summary

If passed, following the Community proposal “[Proposal: List Lombard’s LBTC on Venus Core Pool](https://community.venus.io/t/proposal-list-lombards-lbtc-on-venus-core-pool/4686)” and [the associated snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x52e69ceb6f4c6496f61e003d7f210f9188ea28e317d982bf806452785e36c2d3), this VIP adds a market for [LBTC](https://etherscan.io/address/0x8236a87084f8B84306f72007F36F2618A5634494) into the Core pool on Ethereum.

#### Description

#### Risk parameters

Following [Chaos Labs recommendations](https://community.venus.io/t/proposal-list-lombards-lbtc-on-venus-core-pool/4686/8), the risk parameters for the new market are:

Underlying token: [LBTC](https://etherscan.io/address/0x8236a87084f8B84306f72007F36F2618A5634494)

- Borrow cap: 45
- Supply cap: 450
- Collateral factor: 73.5%
- Liquidation threshold: 78.5%
- Reserve factor: 20%

Bootstrap liquidity: 0.1 LBTC provided by [Lombard](https://etherscan.io/address/0xCb09Ab3F6254437d225Ed3CABEBe0949782E2372) and 0.006 LBTC provided by the [Venus Treasury](https://etherscan.io/address/0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA).

Interest rate curve for the new market:

- kink: 45%
- base (yearly): 0%
- multiplier (yearly): 9%
- jump multiplier (yearly): 200%

#### Oracles configuration

The [ResilientOracle](https://docs-v4.venus.io/risk/resilient-price-oracle) deployed to [Ethereum](https://etherscan.io/address/0xd2ce3fb018805ef92b8C5976cb31F84b4E295F94) is used for LBTC, using under the hood the market price for LBTC/BTC provided by RedStone ([feed](https://etherscan.io/address/0xb415eAA355D8440ac7eCB602D3fb67ccC1f0bc81)), and the WBTC/USD price provided by the ResilientOracle.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation:** in a simulation environment, validating the new market is properly added to the Core pool on Ethereum, with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet:** the same market has been deployed to Sepolia, and used in the Venus Protocol testnet deployment

The bootstrap liquidity is available on the [Venus Treasury on Ethereum](https://etherscan.io/address/0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA). If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x43ca005267e6c7807eb34e689521533639ffc7a8ef4c581480f6ae3a4937ae04) multisig transaction will be executed to withdraw those funds, allowing Governance to supply them to the new LBTC market.

#### Deployed contracts

- Mainnet vLBTC_Core: [0x25C20e6e110A1cE3FEbaCC8b7E48368c7b2F0C91](https://etherscan.io/address/0x25C20e6e110A1cE3FEbaCC8b7E48368c7b2F0C91)
- Testnet vLBTC_Core: [0x315F064cF5B5968fE1655436e1856F3ca558d395](https://sepolia.etherscan.io/address/0x315F064cF5B5968fE1655436e1856F3ca558d395)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/434)
- [Deployment to Sepolia](https://sepolia.etherscan.io/tx/0x1a62bddd52e82d97dfe43316d941f65c9d2f137ae7cead23a9139c284cfc4570)
- [Documentation](https://docs-v4.venus.io/)
`,
    forDescription: "Process to configure and launch the new market",
    againstDescription: "Defer configuration and launch of the new market",
    abstainDescription: "No opinion on the matter",
  };

  return makeProposal(
    [
      // Configure Oracle
      {
        target: REDSTONE_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[marketSpec.vToken.underlying.address, LBTC_REDSTONE_FEED, MAX_STALE_PERIOD]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            marketSpec.vToken.underlying.address,
            [LBTC_ONE_JUMP_REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },

      // Add Market
      {
        target: marketSpec.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, marketSpec.initialSupply.amount],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: marketSpec.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: [REDUCE_RESERVES_BLOCK_DELTA],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            marketSpec.vToken.address,
            marketSpec.riskParameters.collateralFactor,
            marketSpec.riskParameters.liquidationThreshold,
            marketSpec.initialSupply.amount,
            NORMAL_TIMELOCK,
            marketSpec.riskParameters.supplyCap,
            marketSpec.riskParameters.borrowCap,
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: marketSpec.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, 0],
        dstChainId: LzChainId.ethereum,
      },

      {
        target: marketSpec.vToken.address,
        signature: "transfer(address,uint256)",
        params: [marketSpec.initialSupply.vTokenReceiver, parseUnits("0.1", 8)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: marketSpec.vToken.address,
        signature: "transfer(address,uint256)",
        params: [VTREASURY, parseUnits("0.006", 8)],
        dstChainId: LzChainId.ethereum,
      },

      // Configure converters
      ...Object.entries(converterBaseAssets).map(([converter, baseAsset]: [string, string]) => ({
        target: converter,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [
          baseAsset,
          [marketSpec.vToken.underlying.address],
          [[CONVERSION_INCENTIVE, ConversionAccessibility.ALL]],
        ],
        dstChainId: LzChainId.ethereum,
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip402;
