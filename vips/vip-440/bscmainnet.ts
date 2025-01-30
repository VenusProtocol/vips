import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { POOL_REGISTRY, VTREASURY, RESILIENT_ORACLE, NORMAL_TIMELOCK } = NETWORK_ADDRESSES["ethereum"];

export const BaseAssets = [
  "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT USDTPrimeConverter BaseAsset
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC USDCPrimeConverter BaseAsset
  "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC WBTCPrimeConverter BaseAsset
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH WETHPrimeConverter BaseAsset
  "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A", // XVS XVSPrimeConverter BaseAsset
];

export const CONVERTER_NETWORK = "0x232CC47AECCC55C2CAcE4372f5B268b27ef7cac8";
export const USDT_PRIME_CONVERTER = "0x4f55cb0a24D5542a3478B0E284259A6B850B06BD";
export const USDC_PRIME_CONVERTER = "0xcEB9503f10B781E30213c0b320bCf3b3cE54216E";
export const WBTC_PRIME_CONVERTER = "0xDcCDE673Cd8988745dA384A7083B0bd22085dEA0";
export const WETH_PRIME_CONVERTER = "0xb8fD67f215117FADeF06447Af31590309750529D";
export const XVS_VAULT_CONVERTER = "0x1FD30e761C3296fE36D9067b1e398FD97B4C0407";

export const COMPTROLLER = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";
export const sUSDS_ERC4626_ORACLE = "0xDC4861F5Ad18bD584Eab322cc6706e632E9D1c94";
export const sUSDS = "0xa3931d71877C0E7a3148CB7Eb4463524FEc27fbD";
export const vsUSDS = "0xE36Ae842DbbD7aE372ebA02C8239cd431cC063d6";
export const VTOKEN_RECEIVER = "0x9c489E4efba90A67299C1097a8628e233C33BB7B";

export const CONVERSION_INCENTIVE = parseUnits("0.0001", 18);

const vip440 = () => {
  const meta = {
    version: "v2",
    title: "VIP-440 [Ethereum] New sUSDS market in the Core pool",
    description: `#### Summary

If passed, this VIP will add a market for [sUSDS](https://etherscan.io/address/0xa3931d71877c0e7a3148cb7eb4463524fec27fbd) to the Core pool on Ethereum, following the Community proposal “[sUSDS [Saving USDS] as collateral on Venus Protocol Ethereum Core Pool](https://community.venus.io/t/susds-saving-usds-as-collateral-on-venus-protocol-ethereum-core-pool/4776)” and [the associated snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0x75f126ead30c4273933a9fa0e89638a8656c79de595181e883f2b2b0dd6c6f03).

#### Description

**Risk parameters**

Following [Chaos Labs recommendations](https://community.venus.io/t/susds-saving-usds-as-collateral-on-venus-protocol-ethereum-core-pool/4776/9), the risk parameters for the new market are:

Underlying token: [sUSDS](https://etherscan.io/address/0xa3931d71877c0e7a3148cb7eb4463524fec27fbd)

- Borrow cap: 0 sUSDS
- Supply cap: 30,000,000 sUSDS
- Collateral factor: 73%
- Liquidation threshold: 75%
- Reserve factor: 10%

Bootstrap liquidity: 10,000 sUSDS provided by the [SKY Treasury](https://etherscan.io/address/0x9c489E4efba90A67299C1097a8628e233C33BB7B).

The interest rate curve for the new market is not relevant because the asset is not borrowable, but these parameters will be set anyway:

- kink: 80%
- base (yearly): 0%
- multiplier (yearly): 15.625%
- jump multiplier (yearly): 250%

**Oracles configuration**

The [ResilientOracle](https://docs-v4.venus.io/risk/resilient-price-oracle) deployed to [Ethereum](https://etherscan.io/address/0xd2ce3fb018805ef92b8C5976cb31F84b4E295F94) is used for USDS, using under the hood the conversion rate for sUSDS/USDS provided by the [ERC4626Oracle](https://etherscan.io/address/0xDC4861F5Ad18bD584Eab322cc6706e632E9D1c94), and the USDS/USD price provided by Chainlink ([feed](https://etherscan.io/address/0xfF30586cD0F29eD462364C7e81375FC0C71219b1)).

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, validating the new market is properly added to the Core pool on Ethereum, with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same market has been deployed to Sepolia, and used in the Venus Protocol testnet deployment

#### Deployed contracts

Mainnet

- vsUSDS_Core: [0xE36Ae842DbbD7aE372ebA02C8239cd431cC063d6](https://etherscan.io/address/0xE36Ae842DbbD7aE372ebA02C8239cd431cC063d6)
- sUSDS_ERC4626Oracle: [0xDC4861F5Ad18bD584Eab322cc6706e632E9D1c94](https://etherscan.io/address/0xDC4861F5Ad18bD584Eab322cc6706e632E9D1c94)

Testnet

- vsUSDS_Core: [0x083a24648614df4b72EFD4e4C81141C044dBB253](https://sepolia.etherscan.io/address/0x083a24648614df4b72EFD4e4C81141C044dBB253)
- sUSDS_ERC4626Oracle: [0x386C41A4Ff2e4da2C5CC6B1A13fD34A98B48C51d](https://sepolia.etherscan.io/address/0x386C41A4Ff2e4da2C5CC6B1A13fD34A98B48C51d)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/469)
- [Deployment to Sepolia](https://sepolia.etherscan.io/tx/0x6b0fedeb12c9a1026862b7de1be02f978c3dfe1c19004585bbcb54fefecce8dc)
- [Documentation](https://docs-v4.venus.io/)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Oracle config
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            sUSDS,
            [sUSDS_ERC4626_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },

      // VSUSDS market
      {
        target: vsUSDS,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["7200"],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: vsUSDS,
        signature: "setReserveFactor(uint256)",
        params: [parseUnits("0.1", 18)],
        dstChainId: LzChainId.ethereum,
      },

      {
        target: VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [sUSDS, parseUnits("10000", 18), NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: sUSDS,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, parseUnits("10000", 18)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            vsUSDS,
            parseUnits("0.73", 18),
            parseUnits("0.75", 18),
            parseUnits("10000", 18),
            VTOKEN_RECEIVER,
            parseUnits("30000000", 18),
            parseUnits("0", 18),
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: sUSDS,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, 0],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: vsUSDS,
        signature: "setProtocolSeizeShare(uint256)",
        params: [parseUnits("0.05", 18)],
        dstChainId: LzChainId.ethereum,
      },

      {
        target: COMPTROLLER,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[vsUSDS], [2], true],
        dstChainId: LzChainId.ethereum,
      },

      // set converters
      {
        target: USDT_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[0], [sUSDS], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: USDC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[1], [sUSDS], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: WBTC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[2], [sUSDS], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: WETH_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[3], [sUSDS], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: XVS_VAULT_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[4], [sUSDS], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip440;
