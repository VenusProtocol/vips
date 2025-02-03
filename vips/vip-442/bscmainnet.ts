import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { POOL_REGISTRY, VTREASURY, CHAINLINK_ORACLE, RESILIENT_ORACLE, NORMAL_TIMELOCK } = NETWORK_ADDRESSES["ethereum"];

export const BAL = "0xba100000625a3754423978a60c9317c58a424e3D";
export const vBAL = "0x0Ec5488e4F8f319213a14cab188E01fB8517Faa8";
const BAL_CHAINLINK_FEED = "0xdF2917806E30300537aEB49A7663062F4d1F2b5F";
const STALE_PERIOD_26H = 26 * 60 * 60;
export const VTOKEN_RECEIVER = "0x36cc7B13029B5DEe4034745FB4F24034f3F2ffc6";

export const CONVERSION_INCENTIVE = 3e14;

export const BaseAssets = [
  "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT USDTPrimeConverter BaseAsset
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC USDCPrimeConverter BaseAsset
  "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC WBTCPrimeConverter BaseAsset
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH WETHPrimeConverter BaseAsset
  "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A", // XVS XVSPrimeConverter BaseAsset
];

export const USDT_PRIME_CONVERTER = "0x4f55cb0a24D5542a3478B0E284259A6B850B06BD";
export const USDC_PRIME_CONVERTER = "0xcEB9503f10B781E30213c0b320bCf3b3cE54216E";
export const WBTC_PRIME_CONVERTER = "0xDcCDE673Cd8988745dA384A7083B0bd22085dEA0";
export const WETH_PRIME_CONVERTER = "0xb8fD67f215117FADeF06447Af31590309750529D";
export const XVS_VAULT_CONVERTER = "0x1FD30e761C3296fE36D9067b1e398FD97B4C0407";

const vip442 = (chainlinkStalePeriod?: number) => {
  const meta = {
    version: "v2",
    title: "VIP-442 [Ethereum] New BAL market in the Core pool",
    description: `#### Summary

If passed, this VIP will add a market for [BAL](https://etherscan.io/address/0xba100000625a3754423978a60c9317c58a424e3D) to the Core pool on Ethereum, following the Community proposal “[List Balancers BAL token on Venus Core Pool (Ethereum Mainnet)](https://community.venus.io/t/list-balancers-bal-token-on-venus-core-pool-ethereum-mainnet/4699)” and [the associated snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0x6881440d0bfb8794fe2bede3556543ccaca33bebed195808bb1ab460003b993a).

Moreover, it will fund the [Normal Timelock](https://bscscan.com/address/0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396) with 5 BNB from the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9), used to send cross-chain messages by the Omnichain Governance.

#### Description

**Risk parameters**

Following [Chaos Labs recommendations](https://community.venus.io/t/list-balancers-bal-token-on-venus-core-pool-ethereum-mainnet/4699/6), the risk parameters for the new market are:

Underlying token: [BAL](https://etherscan.io/address/0xba100000625a3754423978a60c9317c58a424e3D)

- Borrow cap: 700,000 BAL
- Supply cap: 1,500,000 BAL
- Collateral factor: 57%
- Liquidation threshold: 59%
- Reserve factor: 20%

Bootstrap liquidity: 4,000 BAL provided by [the Balancer Community](https://etherscan.io/address/0x36cc7b13029b5dee4034745fb4f24034f3f2ffc6).

Interest rate curve for the new market:

- kink: 45%
- base (yearly): 0%
- multiplier (yearly): 9%
- jump multiplier (yearly): 300%

**Oracles configuration**

The [ResilientOracle](https://docs-v4.venus.io/risk/resilient-price-oracle) deployed to [Ethereum](https://etherscan.io/address/0xd2ce3fb018805ef92b8C5976cb31F84b4E295F94) is used for BAL, using under the hood the BAL/USD price provided by Chainlink ([feed](https://etherscan.io/address/0xdF2917806E30300537aEB49A7663062F4d1F2b5F)).

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, validating the new market is properly added to the Core pool on Ethereum, with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same market has been deployed to Sepolia, and used in the Venus Protocol testnet deployment

#### Deployed contracts

Mainnet

- vBAL_Core: [0x0Ec5488e4F8f319213a14cab188E01fB8517Faa8](https://etherscan.io/address/0x0Ec5488e4F8f319213a14cab188E01fB8517Faa8)

Testnet

- vBAL_Core: [0xD4B82B7B7CdedB029e0E58AC1B6a04F6616BEd40](https://sepolia.etherscan.io/address/0xD4B82B7B7CdedB029e0E58AC1B6a04F6616BEd40)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/472)
- [Deployment to Sepolia](https://sepolia.etherscan.io/tx/0xfe2b728357cae54a5df24dbf030be7155fba6c0c0414aacfd339d83aad0ea2be)
- [Documentation](https://docs-v4.venus.io/)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Refuel NT on BSC
      {
        target: NETWORK_ADDRESSES.bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBNB(uint256,address)",
        params: [parseUnits("5", 18), NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK],
      },

      // Oracle config
      {
        target: CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[BAL, BAL_CHAINLINK_FEED, chainlinkStalePeriod || STALE_PERIOD_26H]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [BAL, [CHAINLINK_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero], [true, false, false]],
        ],
        dstChainId: LzChainId.ethereum,
      },

      // BAL Market
      {
        target: vBAL,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["7200"],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: vBAL,
        signature: "setReserveFactor(uint256)",
        params: [parseUnits("0.2", 18)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [BAL, parseUnits("4000", 18), NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: BAL,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, parseUnits("4000", 18)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            vBAL,
            parseUnits("0.57", 18),
            parseUnits("0.59", 18),
            parseUnits("4000", 18),
            VTOKEN_RECEIVER,
            parseUnits("1500000", 18),
            parseUnits("700000", 18),
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: BAL,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, 0],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: vBAL,
        signature: "setProtocolSeizeShare(uint256)",
        params: [parseUnits("0.05", 18)],
        dstChainId: LzChainId.ethereum,
      },

      // set converters
      {
        target: USDT_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[0], [BAL], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: USDC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[1], [BAL], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: WBTC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[2], [BAL], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: WETH_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[3], [BAL], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: XVS_VAULT_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[4], [BAL], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip442;
