import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { POOL_REGISTRY, VTREASURY, NORMAL_TIMELOCK, CHAINLINK_ORACLE, RESILIENT_ORACLE } =
  NETWORK_ADDRESSES["arbitrumone"];

export const COMPTROLLER_CORE = "0x317c1A5739F39046E20b08ac9BeEa3f10fD43326";
export const CHAINLINK_STALE_PERIOD = 26 * 60 * 60; // 26 hours
export const gmWETH_CHAINLINK_FEED = "0xfB3264D1129824933a52374c2C1696F4470D041e";

export const USDT_PRIME_CONVERTER = "0x435Fac1B002d5D31f374E07c0177A1D709d5DC2D";
export const USDC_PRIME_CONVERTER = "0x6553C9f9E131191d4fECb6F0E73bE13E229065C6";
export const WBTC_PRIME_CONVERTER = "0xF91369009c37f029aa28AF89709a352375E5A162";
export const WETH_PRIME_CONVERTER = "0x4aCB90ddD6df24dC6b0D50df84C94e72012026d0";
export const XVS_VAULT_CONVERTER = "0x9c5A7aB705EA40876c1B292630a3ff2e0c213DB1";
export const BaseAssets = [
  "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // USDT USDTTokenConverter BaseAsset
  "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC USDCTokenConverter BaseAsset
  "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", // WBTC WBTCTokenConverter BaseAsset
  "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // WETH WETHTokenConverter BaseAsset
  "0xc1Eb7689147C81aC840d4FF0D298489fc7986d52", // XVS XVSTokenConverter BaseAsset
];
const CONVERSION_INCENTIVE = parseUnits("0.0001", 18);

export const REFUND_ADDRESS = "0xe1f7c5209938780625E354dc546E28397F6Ce174";
export const REFUND_AMOUNT = parseUnits("11000", 18);
export const REFUND_TOKEN = "0x450bb6774Dd8a756274E0ab4107953259d2ac541";

type Token = {
  address: string;
  decimals: number;
  symbol: string;
};

export const token = {
  address: "0x70d95587d40A2caf56bd97485aB3Eec10Bee6336",
  decimals: 18,
  symbol: "GM",
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
    address: "0x9bb8cEc9C0d46F53b4f2173BB2A0221F66c353cC",
    name: "Venus gmWETH-USDC (Core)",
    symbol: "vgmWETH-USDC_Core",
    underlying: token,
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_CORE,
  },
  riskParameters: {
    collateralFactor: parseUnits("0.55", 18),
    liquidationThreshold: parseUnits("0.6", 18),
    supplyCap: parseUnits("2000000", 18),
    borrowCap: parseUnits("0", 18),
    reserveFactor: parseUnits("0.25", 18),
    protocolSeizeShare: parseUnits("0.05", 18),
  },
  initialSupply: {
    amount: parseUnits("6000", 18),
    vTokenReceiver: "0xe1f7c5209938780625E354dc546E28397F6Ce174",
  },
  interestRateModel: {
    address: "0x425dde630be832195619a06175ba45C827Dd3DCa",
    base: "0",
    multiplier: "0.03",
    jump: "4.5",
    kink: "0.9",
  },
};

const vip434 = (overrides: { chainlinkStalePeriod?: number }) => {
  const meta = {
    version: "v2",
    title: "VIP-434 [Arbitrum] New gmETH market in the Core pool",
    description: `#### Summary

If passed, following the Community proposal “[Add gmETH on Venus Protocol](https://community.venus.io/t/add-gmeth-on-venus-protocol/4767)” and [the associated snapshot](https://snapshot.org/#/s:venus-xvs.eth/proposal/0x84e11121a9bf417ae20261798c0f30f8a2da050002db20a4e46a62ffa3dd8346), this VIP adds a market for [gmETH (WETH-USDC)](https://arbiscan.io/address/0x70d95587d40A2caf56bd97485aB3Eec10Bee6336) into the Core pool on Arbitrum one.

Moreover, this VIP would transfer 11,000 [gmETH (WETH-WETH)](https://arbiscan.io/address/0x450bb6774Dd8a756274E0ab4107953259d2ac541) tokens from the [Venus Treasury](https://arbiscan.io/address/0x8a662ceac418daef956bc0e6b2dd417c80cda631) to the [GMX.io](https://arbiscan.io/address/0xe1f7c5209938780625E354dc546E28397F6Ce174) project. They [provided these tokens](https://arbiscan.io/tx/0x881d12517bee1b9e86553977985036ac87d3875b341d0ef2ca11952c10927704), but they are now unnecessary to launch the new market.

#### Description

**Risk parameters**

Following [Chaos Labs recommendations](https://community.venus.io/t/add-gmeth-on-venus-protocol/4767/7), the risk parameters for the new market are:

Underlying token: [gmETH (WETH-USDC)](https://arbiscan.io/address/0x70d95587d40A2caf56bd97485aB3Eec10Bee6336)

- Borrow cap: 0 gmETH (WETH-USDC)
- Supply cap: 2,000,000 gmETH (WETH-USDC)
- Collateral factor: 55%
- Liquidation threshold: 60%
- Reserve factor: - (not relevant because the asset won’t be borrowable)

Bootstrap liquidity: 6,000 gmETH (WETH-USDC) provided by [GMX.io](https://arbiscan.io/address/0xe1f7c5209938780625E354dc546E28397F6Ce174).

The interest rate curve for the new market is not relevant because the asset is not borrowable, but these parameters will be set anyway:

- kink: 90%
- base (yearly): 0%
- multiplier (yearly): 3%
- jump multiplier (yearly): 450%

#### Oracles configuration

The [ResilientOracle](https://docs-v4.venus.io/risk/resilient-price-oracle) deployed to [Arbitrum one](https://arbiscan.io/address/0xd55A98150e0F9f5e3F6280FC25617A5C93d96007) is used for gmETH (WETH-USDC), using under the hood the Chainlink price ([feed](https://arbiscan.io/address/0xfB3264D1129824933a52374c2C1696F4470D041e)).

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, validating the new market is properly added to the Core pool on Arbitrum one, with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same market has been deployed to Arbitrum sepolia, and used in the Venus Protocol testnet deployment

#### Deployed contracts

Mainnet

- vgmWETH-USDC_Core: [0x9bb8cEc9C0d46F53b4f2173BB2A0221F66c353cC](https://arbiscan.io/address/0x9bb8cEc9C0d46F53b4f2173BB2A0221F66c353cC)

Sepolia

- vgmWETH-USDC_Core: [0x4A80b19Cd8BbBd14c425fB17F8E06c6B60801d63](https://arbiscan.io/address/0x4A80b19Cd8BbBd14c425fB17F8E06c6B60801d63)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/468)
- [Deployment to Arbitrum Sepolia](https://sepolia.arbiscan.io/tx/0x155de4290f1cbe187680d81440469b51563dbf2087331390eac7e30b75dd4d21)
- [Documentation](https://docs-v4.venus.io/)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  const chainlinkStalePeriod = overrides?.chainlinkStalePeriod || CHAINLINK_STALE_PERIOD;

  return makeProposal(
    [
      {
        target: CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[token.address, gmWETH_CHAINLINK_FEED, chainlinkStalePeriod]],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            token.address,
            [CHAINLINK_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.arbitrumone,
      },

      {
        target: market.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["86400"],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: market.vToken.address,
        signature: "setReserveFactor(uint256)",
        params: [market.riskParameters.reserveFactor],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [market.vToken.underlying.address, market.initialSupply.amount, NORMAL_TIMELOCK],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: market.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, market.initialSupply.amount],
        dstChainId: LzChainId.arbitrumone,
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
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: market.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, 0],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: market.vToken.address,
        signature: "setProtocolSeizeShare(uint256)",
        params: [market.riskParameters.protocolSeizeShare],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: USDT_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[0], [market.vToken.underlying.address], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: USDC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[1], [market.vToken.underlying.address], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: WBTC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[2], [market.vToken.underlying.address], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: WETH_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[3], [market.vToken.underlying.address], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: XVS_VAULT_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[4], [market.vToken.underlying.address], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: COMPTROLLER_CORE,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[market.vToken.address], [2], true],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [REFUND_TOKEN, REFUND_AMOUNT, REFUND_ADDRESS],
        dstChainId: LzChainId.arbitrumone,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip434;
