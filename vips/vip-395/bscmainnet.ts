import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { ethereum } = NETWORK_ADDRESSES;

const PUFETH = "0xD9A442856C234a39a81a089C06451EBAa4306a72";
const PUFETH_VTOKEN = "0xE0ee5dDeBFe0abe0a4Af50299D68b74Cec31668e";
const LST_ETH_COMPTROLLER = "0xF522cd0360EF8c2FF48B648d53EA1717Ec0F3Ac3";
const REDUCE_RESERVES_BLOCK_DELTA = "7200";

const { POOL_REGISTRY, REDSTONE_ORACLE, RESILIENT_ORACLE } = ethereum;

export const marketSpec = {
  vToken: {
    address: PUFETH_VTOKEN,
    name: "Venus pufETH (Liquid Staked ETH)",
    symbol: "vpufETH_LiquidStakedETH",
    underlying: {
      address: PUFETH,
      decimals: 18,
      symbol: "pufETH",
    },
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: LST_ETH_COMPTROLLER,
  },
  interestRateModel: {
    address: "0xDaFA3B350288cEb448e0E03077D932f8EF561391",
    base: "0",
    multiplier: "0.045",
    jump: "2",
    kink: "0.45",
  },
  initialSupply: {
    amount: parseUnits("5", 18),
    vTokenReceiver: "0x495aeBf595D4C641af21A2a021C983C6565CA1A2",
  },
  riskParameters: {
    supplyCap: parseUnits("3000", 18),
    borrowCap: parseUnits("300", 18),
    collateralFactor: parseUnits("0.8", 18),
    liquidationThreshold: parseUnits("0.85", 18),
    reserveFactor: parseUnits("0.2", 18),
    protocolSeizeShare: parseUnits("0.01", 18),
  },
};

const PUFETH_ONE_JUMP_REDSTONE_ORACLE = "0xAaE18CEBDF55bbbbf5C70c334Ee81D918be728Bc";
export const PUFETH_REDSTONE_FEED = "0x76A495b0bFfb53ef3F0E94ef0763e03cE410835C";
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

export const vip395 = () => {
  const meta = {
    version: "v2",
    title: "VIP-395 [Ethereum] New pufETH market in the Liquid Staked ETH pool",
    description: `#### Summary

If passed, following the Community proposal “[Proposal for Listing pufETH on Venus](https://community.venus.io/t/proposal-for-listing-pufeth-on-venus/4572)” and [the associated snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0xea592b48d56f18309e713e5faa8776b1191172175091af365f3bf3853f5536a6), this VIP adds a market for [pufETH](https://etherscan.io/address/0xD9A442856C234a39a81a089C06451EBAa4306a72) into the Liquid Staked ETH pool on Ethereum.

#### Description

#### Risk parameters

Following [Chaos Labs recommendations](https://community.venus.io/t/proposal-for-listing-pufeth-on-venus/4572/8), the risk parameters for the new market are:

Underlying token: [pufETH](https://etherscan.io/address/0xD9A442856C234a39a81a089C06451EBAa4306a72)

- Borrow cap: 3,000
- Supply cap: 300
- Collateral factor: 80%
- Liquidation threshold: 85%
- Reserve factor: 20%

Bootstrap liquidity: 5 pufETH - provided by [Puffer Finance](https://etherscan.io/address/0x495aeBf595D4C641af21A2a021C983C6565CA1A2).

Interest rate curve for the new market:

- kink: 45%
- base (yearly): 0%
- multiplier (yearly): 4.5%
- jump multiplier (yearly): 200%

#### Oracles configuration

The [ResilientOracle](https://docs-v4.venus.io/risk/resilient-price-oracle) deployed to [Ethereum](https://etherscan.io/address/0xd2ce3fb018805ef92b8C5976cb31F84b4E295F94) is used for pufETH, using under the hood the market price for pufETH/ETH provided by RedStone ([feed](https://etherscan.io/address/0x76A495b0bFfb53ef3F0E94ef0763e03cE410835C)), and the ETH/USD price provided by the ResilientOracle.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation:** in a simulation environment, validating the new market is properly added to the Liquid Staked ETH pool on Ethereum, with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet:** the same market has been deployed to Sepolia, and used in the Venus Protocol testnet deployment

The bootstrap liquidity is available on the [Venus Treasury on Ethereum](https://etherscan.io/address/0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA). If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x25e0dbb5234ea065c8679f298abb1b2998f08b314e34d3bd3237c5c724c96ea0) multisig transaction will be executed to withdraw those funds, allowing Governance to supply them to the new pufETH market.

#### Deployed contracts

- Mainnet vpufETH_LiquidStakedETH: [0xE0ee5dDeBFe0abe0a4Af50299D68b74Cec31668e](https://etherscan.io/address/0xE0ee5dDeBFe0abe0a4Af50299D68b74Cec31668e)
- Testnet vpufETH_LiquidStakedETH: [0x1E4d64B7c6f1F71969E5137B5Ee8cBa9Ab9c9356](https://sepolia.etherscan.io/address/0x1E4d64B7c6f1F71969E5137B5Ee8cBa9Ab9c9356)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/401)
- [Deployment to Sepolia](https://sepolia.etherscan.io/tx/0x7c27c86bbabc084c2cb30c46c4acebbe849974eebf25318455f7dad6fac2065f)
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
        params: [[marketSpec.vToken.underlying.address, PUFETH_REDSTONE_FEED, MAX_STALE_PERIOD]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            marketSpec.vToken.underlying.address,
            [PUFETH_ONE_JUMP_REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
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
            marketSpec.initialSupply.vTokenReceiver,
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
        signature: "setProtocolSeizeShare(uint256)",
        params: [marketSpec.riskParameters.protocolSeizeShare],
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

export default vip395;
