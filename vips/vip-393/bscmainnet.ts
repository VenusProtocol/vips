import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet, ethereum } = NETWORK_ADDRESSES;
export const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";

export const EIGEN = "0xec53bF9167f50cDEB3Ae105f56099aaaB9061F83";
const INITIAL_SUPPLY = parseUnits("2204.501208", 18);
export const SUPPLY_CAP = parseUnits("3000000", 18);
export const BORROW_CAP = parseUnits("1500000", 18);
const CF = parseUnits("0.5", 18);
const LT = parseUnits("0.6", 18);
export const vEIGEN = "0x256AdDBe0a387c98f487e44b85c29eb983413c5e";
export const CORE_COMPTROLLER = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";

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
const CONVERSION_INCENTIVE = parseUnits("0.0001", 18);
const CHAINLINK_FEED = "0xf2917e602C2dCa458937fad715bb1E465305A4A1";
const MAX_STALE_PERIOD = 30 * 3600;

const vip393 = (maxStalePeriod?: number) => {
  const meta = {
    version: "v2",
    title: "VIP-393 [Ethereum] New EIGEN market in the Core pool",
    description: `#### Summary

If passed, following the Community proposal “[Support EIGEN as collateral on Venus Protocol Ethereum Core Pool](https://community.venus.io/t/support-eigen-as-collateral-on-venus-protocol-ethereum-core-pool/4615)” and [the associated snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x171c3ffba6886856609e3db5b2a701a4cdeb73ab91fb7a165387475234729b6b), this VIP adds a market for [EIGEN](https://etherscan.io/address/0xec53bf9167f50cdeb3ae105f56099aaab9061f83) into the Core pool on Ethereum, and refunds the [Community Wallet](https://bscscan.com/address/0xc444949e0054A23c44Fc45789738bdF64aed2391) the provided bootstrap liquidity.

#### Description

#### Risk parameters

Following [Chaos Labs recommendations](https://community.venus.io/t/support-eigen-as-collateral-on-venus-protocol-ethereum-core-pool/4615/8), the risk parameters for the new market are:

Underlying token: [EIGEN](https://etherscan.io/address/0xec53bf9167f50cdeb3ae105f56099aaab9061f83)

- Borrow cap: 1,500,000
- Supply cap: 3,000,000
- Collateral factor: 50%
- Liquidation threshold: 60%
- Reserve factor: 25%

Bootstrap liquidity: 2,204.50 EIGEN - provided by the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9).

Interest rate curve for the new market:

- kink: 45%
- base (yearly): 2%
- multiplier (yearly): 15%
- jump multiplier (yearly): 300%

#### Oracles configuration

The [ResilientOracle](https://docs-v4.venus.io/risk/resilient-price-oracle) deployed to [Ethereum](https://etherscan.io/address/0xd2ce3fb018805ef92b8C5976cb31F84b4E295F94) is used for EIGEN, with the [Chainlink feed](https://etherscan.io/address/0xf2917e602C2dCa458937fad715bb1E465305A4A1) for this asset as the main oracle.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, validating the new market is properly added to the Core pool on Ethereum, with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same market has been deployed to Sepolia, and used in the Venus Protocol testnet deployment

The Community Wallet provided the bootstrap liquidity ([here](https://etherscan.io/tx/0x84c524c8f37f3cb30cad66befe760ad46d51dbfdf371a1347c82d3cbe76df50e) and [here](https://etherscan.io/tx/0x0e06e43adf7d02decff5dc38c2678d3b1366880000ef2f6605a08cd17c2159fa)), spending 6,000 USDC, that will be refunded in this VIP with funds from the [Venus Treasury on BNB Chain](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9). Part of the bootstrap liquidity is available on the [Venus Treasury on Ethereum](https://etherscan.io/address/0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA). If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0xd0d5a8d8203443471dff3f7330dc3b62bb6e43aac2bd5003b08f84da15673f5b) multisig transaction will be executed to withdraw those funds, allowing Governance to supply them to the new EIGEN market.

#### Deployed contracts

- Mainnet vEIGEN_Core: [0x256AdDBe0a387c98f487e44b85c29eb983413c5e](https://etherscan.io/address/0x256AdDBe0a387c98f487e44b85c29eb983413c5e)
- Testnet vEIGEN_Core: [0x6DB4aDbA8F144a57a397b57183BF619e957040B1](https://sepolia.etherscan.io/address/0x6DB4aDbA8F144a57a397b57183BF619e957040B1)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/419)
- [Deployment to Sepolia](https://testnet.bscscan.com/tx/0xde0347163b1259ea955c3e83ffd9de7d856e9adbacc4f1b84cd24a06c05a0aaa)
- [Documentation](https://docs-v4.venus.io/)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, parseUnits("6000", 18), COMMUNITY_WALLET],
      },
      {
        target: ethereum.CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[EIGEN, CHAINLINK_FEED, maxStalePeriod || MAX_STALE_PERIOD]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            EIGEN,
            [ethereum.CHAINLINK_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },

      // Add Market
      {
        target: EIGEN,
        signature: "approve(address,uint256)",
        params: [ethereum.POOL_REGISTRY, 0],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: EIGEN,
        signature: "approve(address,uint256)",
        params: [ethereum.POOL_REGISTRY, INITIAL_SUPPLY],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: vEIGEN,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["7200"],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [[vEIGEN, CF, LT, INITIAL_SUPPLY, ethereum.VTREASURY, SUPPLY_CAP, BORROW_CAP]],
        dstChainId: LzChainId.ethereum,
      },

      // Conversion config
      {
        target: USDT_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[0], [EIGEN], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: USDC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[1], [EIGEN], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: WBTC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[2], [EIGEN], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: WETH_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[3], [EIGEN], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: XVS_VAULT_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[4], [EIGEN], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip393;
