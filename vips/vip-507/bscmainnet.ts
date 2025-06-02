import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { ethereum } = NETWORK_ADDRESSES;

export const COMPTROLLER_CORE = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";
export const sUSDe = "0x9D39A5DE30e57443BfF2A8307A4256c8797A3497";
export const USDe = "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3";
export const VsUSDe_CORE = "0xa836ce315b7A6Bb19397Ee996551659B1D92298e";
export const VUSDe_CORE = "0xa0EE2bAA024cC3AA1BC9395522D07B7970Ca75b3";
export const sUSDe_INITIAL_SUPPLY = parseUnits("87.064925543819110686", 18);
export const USDe_INITIAL_SUPPLY = parseUnits("100", 18);
export const VSUSDE_EXPECTED = parseUnits("87.06492554", 8); // around $100
export const VUSDE_EXPECTED = parseUnits("100", 8); // around $100
export const VsUSDe_IR_MODEL = "0x410a068C2ca9986d2b76d0A7b2b5DF336499114f";

// converters
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
export const CONVERSION_INCENTIVE = parseUnits("3", 14);

const Actions = {
  BORROW: 2,
};

export const vip507 = () => {
  const meta = {
    version: "v2",
    title: "VIP-507 [Ethereum] Add USDe and sUSDe to the Core pool",
    description: `#### Summary

If passed, this VIP will add markets for [USDe](https://etherscan.io/address/0x4c9edd5852cd905f086c759e8383e09bff1e68b3) and [sUSDe](https://etherscan.io/address/0x9D39A5DE30e57443BfF2A8307A4256c8797A3497) to the Core pool on Ethereum, following the Community proposal “[[Proposal] Decommission the Ethena Isolated Pool on Ethereum and Explore USDe and sUSDe Integration in the Core Pool](https://community.venus.io/t/proposal-decommission-the-ethena-isolated-pool-on-ethereum-and-explore-usde-and-susde-integration-in-the-core-pool/5051)”.

#### Description

**Risk parameters for USDe**

Following [Chaos Labs recommendations](https://community.venus.io/t/proposal-decommission-the-ethena-isolated-pool-on-ethereum-and-explore-usde-and-susde-integration-in-the-core-pool/5051/6), the risk parameters for the new market are:

Underlying token: [USDe](https://etherscan.io/address/0x4c9edd5852cd905f086c759e8383e09bff1e68b3)

- Borrow cap: 25M USDe
- Supply cap: 30M USDe
- Collateral factor: 72%
- Liquidation threshold: 75%
- Reserve factor: 10%

Bootstrap liquidity: 100 USDe, that are burned for security reasons

Interest rate curve for the new market:

- kink: 80%
- base (yearly): 0%
- multiplier (yearly): 10%
- jump multiplier (yearly): 250%

**Oracles configuration for USDe**

- Main oracle: [RedStoneOracle](https://etherscan.io/address/0x0FC8001B2c9Ec90352A46093130e284de5889C86) ([feed](https://etherscan.io/address/0xbC5FBcf58CeAEa19D523aBc76515b9AEFb5cfd58))
- Pivot and fallback oracles: [ChainlinkOracle](https://etherscan.io/address/0x94c3A2d6B7B2c051aDa041282aec5B0752F8A1F2) ([feed](https://etherscan.io/address/0xa569d910839Ae8865Da8F8e70FfFb0cBA869F961))

**Risk parameters for sUSDe**

Following [Chaos Labs recommendations](https://community.venus.io/t/proposal-decommission-the-ethena-isolated-pool-on-ethereum-and-explore-usde-and-susde-integration-in-the-core-pool/5051/6), the risk parameters for the new market are:

Underlying token: [sUSDe](https://etherscan.io/address/0x9D39A5DE30e57443BfF2A8307A4256c8797A3497)

- Borrow cap: 0 sUSDe
- Supply cap: 20M sUSDe
- Collateral factor: 72%
- Liquidation threshold: 72.5%
- Reserve factor: 10%

Bootstrap liquidity: 87 sUSDe, that are burned for security reasons

Interest rate curve for the new market (not relevant, because the asset is not borrowable, but configured anyway):

- kink: 80%
- base (yearly): 0%
- multiplier (yearly): 10%
- jump multiplier (yearly): 250%

**Oracles configuration for sUSDe**

- Main oracle: [ERC4626Oracle](https://etherscan.io/address/0xaE847E81ff6dD2bdFB1fD563ccB4f848c74D2B70)
    - correlated token: [sUSDe](https://etherscan.io/address/0x9D39A5DE30e57443BfF2A8307A4256c8797A3497)
    - underlying token: [USDe](https://etherscan.io/address/0x4c9EDD5852cd905f086C759E8383e09bff1E68B3)

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, validating the new markets are properly added to the Core pool on Ethereum, with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same markets have been deployed to testnet, and used in the Venus Protocol testnet deployment

#### Deployed contracts

Ethereum:

- vUSDe_Core: [0xa0EE2bAA024cC3AA1BC9395522D07B7970Ca75b3](https://etherscan.io/address/0xa0EE2bAA024cC3AA1BC9395522D07B7970Ca75b3)
- vsUSDe_Core: [0xa836ce315b7A6Bb19397Ee996551659B1D92298e](https://etherscan.io/address/0xa836ce315b7A6Bb19397Ee996551659B1D92298e)

Sepolia:

- vUSDe_Core: [0xa0EE2bAA024cC3AA1BC9395522D07B7970Ca75b3](https://etherscan.io/address/0xa0EE2bAA024cC3AA1BC9395522D07B7970Ca75b3)
- vsUSDe_Core: [0xa836ce315b7A6Bb19397Ee996551659B1D92298e](https://etherscan.io/address/0xa836ce315b7A6Bb19397Ee996551659B1D92298e)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/552)
- [Deployment of USDe and sUSDe to Sepolia](https://sepolia.etherscan.io/tx/0xba56df27f12f7cdd34ec90a892a8c18680e8ac9691c8399c3c9e82d997383eeb)
- [Documentation](https://docs-v4.venus.io/)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // Add Markets to the Core pool
      // Market configurations sUSDe
      {
        target: VsUSDe_CORE,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["7200"],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: VsUSDe_CORE,
        signature: "setInterestRateModel(address)",
        params: [VsUSDe_IR_MODEL],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [sUSDe, sUSDe_INITIAL_SUPPLY, ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: sUSDe,
        signature: "approve(address,uint256)",
        params: [ethereum.POOL_REGISTRY, 0],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: sUSDe,
        signature: "approve(address,uint256)",
        params: [ethereum.POOL_REGISTRY, sUSDe_INITIAL_SUPPLY],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VsUSDe_CORE,
            parseUnits("0.72", 18), // CF
            parseUnits("0.75", 18), // LT
            sUSDe_INITIAL_SUPPLY, // initial supply
            ethereum.NORMAL_TIMELOCK,
            parseUnits("20000000", 18), // supply cap
            parseUnits("0", 18), // borrow cap
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: VsUSDe_CORE,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, VSUSDE_EXPECTED], // around $100
        dstChainId: LzChainId.ethereum,
      },
      {
        target: COMPTROLLER_CORE,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[VsUSDe_CORE], [Actions.BORROW], true],
        dstChainId: LzChainId.ethereum,
      },

      // Market configurations USDe
      {
        target: VUSDe_CORE,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["7200"],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [USDe, USDe_INITIAL_SUPPLY, ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: USDe,
        signature: "approve(address,uint256)",
        params: [ethereum.POOL_REGISTRY, 0],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: USDe,
        signature: "approve(address,uint256)",
        params: [ethereum.POOL_REGISTRY, USDe_INITIAL_SUPPLY],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VUSDe_CORE,
            parseUnits("0.72", 18), // CF
            parseUnits("0.75", 18), // LT
            USDe_INITIAL_SUPPLY, // initial supply
            ethereum.NORMAL_TIMELOCK,
            parseUnits("30000000", 18), // supply cap
            parseUnits("25000000", 18), // borrow cap
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: VUSDe_CORE,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, VUSDE_EXPECTED],
        dstChainId: LzChainId.ethereum,
      },

      // Conversion config of USDe
      {
        target: USDT_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[0], [USDe], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: USDC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[1], [USDe], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: WBTC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[2], [USDe], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: WETH_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[3], [USDe], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: XVS_VAULT_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[4], [USDe], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip507;
