import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { ethereum } = NETWORK_ADDRESSES;

export const eBTC = "0x657e8C867D8B37dCC18fA4Caead9C45EB088C642";
const INITIAL_SUPPLY = parseUnits("0.14471345", 8);
export const SUPPLY_CAP = parseUnits("25", 8);
export const BORROW_CAP = parseUnits("12.6", 8);
const CF = parseUnits("0.68", 18);
const LT = parseUnits("0.72", 18);
export const veBTC = "0x325cEB02fe1C2fF816A83a5770eA0E88e2faEcF2";
export const CORE_COMPTROLLER = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";

export const USDT_PRIME_CONVERTER = "0x4f55cb0a24D5542a3478B0E284259A6B850B06BD";
export const USDC_PRIME_CONVERTER = "0xcEB9503f10B781E30213c0b320bCf3b3cE54216E";
export const WBTC_PRIME_CONVERTER = "0xDcCDE673Cd8988745dA384A7083B0bd22085dEA0";
export const WETH_PRIME_CONVERTER = "0xb8fD67f215117FADeF06447Af31590309750529D";
export const XVS_VAULT_CONVERTER = "0x1Fd30E761C3296fe36d9068b1e398Fd97b4C0407";
export const BaseAssets = [
  "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT USDTTokenConverter BaseAsset
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC USDCTokenConverter BaseAsset
  "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC WBTCTokenConverter BaseAsset
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH WETHTokenConverter BaseAsset
  "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A", // XVS XVSTokenConverter BaseAsset
];
const CONVERSION_INCENTIVE = parseUnits("0.0001", 18);
const eBTCAccountantOracle = "0x077A11d634be3498b9af3EbD3d5D35A0fC3569d8";

const vip394 = () => {
  const meta = {
    version: "v2",
    title: "VIP-394 [Ethereum] New eBTC market in the Core pool",
    description: `#### Summary

If passed, following the Community proposal “[Support eBTC collateral on Venus on ETH Mainnet](https://community.venus.io/t/support-ebtc-collateral-on-venus-on-eth-mainnet/4603/1)” and [the associated snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x2601ffe3252262981a9801504ade2ffd0018a87b226fb2c16c7eca407d0d5619), this VIP adds a market for [eBTC](https://etherscan.io/address/0x657e8c867d8b37dcc18fa4caead9c45eb088c642) into the Core pool on Ethereum, and refunds the [Community Wallet](https://bscscan.com/address/0xc444949e0054A23c44Fc45789738bdF64aed2391) the provided bootstrap liquidity.

#### Description

#### Risk parameters

Following [Chaos Labs recommendations](https://community.venus.io/t/support-ebtc-collateral-on-venus-on-eth-mainnet/4603/4), the risk parameters for the new market are:

Underlying token: [eBTC](https://etherscan.io/address/0x657e8c867d8b37dcc18fa4caead9c45eb088c642)

- Borrow cap: 25
- Supply cap: 12.5
- Collateral factor: 68%
- Liquidation threshold: 72%
- Reserve factor: 20%

Bootstrap liquidity: 0.14471345 eBTC - provided by the [Ether.fi project](https://etherscan.io/address/0x86fBaEB3D6b5247F420590D303a6ffC9cd523790).

Interest rate curve for the new market:

- kink: 45%
- base (yearly): 0%
- multiplier (yearly): 9%
- jump multiplier (yearly): 200%

#### Oracles configuration

The [ResilientOracle](https://docs-v4.venus.io/risk/resilient-price-oracle) deployed to [Ethereum](https://etherscan.io/address/0xd2ce3fb018805ef92b8C5976cb31F84b4E295F94) is used for eBTC.

- Main oracle: [EtherfiAccountantOracle](https://github.com/VenusProtocol/oracle/pull/233)
- Accountant contract: [0x1b293DC39F94157fA0D1D36d7e0090C8B8B8c13F](https://etherscan.io/address/0x1b293DC39F94157fA0D1D36d7e0090C8B8B8c13F)

The EtherfiAccountantOracle gets the conversion rate for eBTC/BTC from the Accountant contract, and then the BTC/USD price from the Venus ResilientOracle.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, validating the new market is properly added to the Core pool on Ethereum, with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same market has been deployed to Sepolia, and used in the Venus Protocol testnet deployment

The bootstrap liquidity is available on the [Venus Treasury on Ethereum](https://etherscan.io/address/0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA). If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x1f10be126a80e9650d1abb9672b5b4d2df83160ffe8843c0daeac5c79b3b3ec0) multisig transaction will be executed to withdraw those funds, allowing Governance to supply them to the new eBTC market.

#### Deployed contracts

- Mainnet veBTC_Core: [0x325cEB02fe1C2fF816A83a5770eA0E88e2faEcF2](https://etherscan.io/address/0x325cEB02fe1C2fF816A83a5770eA0E88e2faEcF2)
- Testnet veBTC_Core: [0x8E6241389e823111259413810b81a050bd45e5cE](https://sepolia.etherscan.io/address/0x8E6241389e823111259413810b81a050bd45e5cE)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/420)
- [Deployment to Sepolia](https://sepolia.etherscan.io/tx/0xc5f0e85dba931274b1a753a585e866f0b9e22bd8fda0291dfc139d19ee574e1c)
- [Documentation](https://docs-v4.venus.io/)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: ethereum.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            eBTC,
            [eBTCAccountantOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },

      // Add Market
      {
        target: eBTC,
        signature: "approve(address,uint256)",
        params: [ethereum.POOL_REGISTRY, 0],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: eBTC,
        signature: "approve(address,uint256)",
        params: [ethereum.POOL_REGISTRY, INITIAL_SUPPLY],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: veBTC,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["7200"],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [[veBTC, CF, LT, INITIAL_SUPPLY, ethereum.VTREASURY, SUPPLY_CAP, BORROW_CAP]],
        dstChainId: LzChainId.ethereum,
      },

      // Conversion config
      {
        target: USDT_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[0], [eBTC], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: USDC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[1], [eBTC], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: WBTC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[2], [eBTC], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: WETH_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[3], [eBTC], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: XVS_VAULT_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[4], [eBTC], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip394;
