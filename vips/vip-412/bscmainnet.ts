import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { ethereum } = NETWORK_ADDRESSES;

const COMPTROLLER_ETHENA = "0x562d2b6FF1dbf5f63E233662416782318cC081E4";

const PT_USDe_27MAR2025 = "0x8a47b431a7d947c6a3ed6e42d501803615a97eaa";
const PT_sUSDE_27MAR2025 = "0xe00bd3df25fb187d6abbb620b3dfd19839947b81";
const sUSDe = "0x9D39A5DE30e57443BfF2A8307A4256c8797A3497";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
export const VsUSDe_Ethena = "0x0792b9c60C728C1D2Fd6665b3D7A08762a9b28e0";
export const VUSDC_Ethena = "0xa8e7f9473635a5CB79646f14356a9Fc394CA111A";
export const VTOKEN_RECEIVER = "0x3e8734ec146c981e3ed1f6b582d447dde701d90c";

export const underlyingAddress = [PT_USDe_27MAR2025, PT_sUSDE_27MAR2025, sUSDe, USDC];

enum ConversionAccessibility {
  NONE = 0,
  ALL = 1,
  ONLY_FOR_CONVERTERS = 2,
  ONLY_FOR_USERS = 3,
}

export const CONVERSION_INCENTIVE = 1e14;

export const USDT_PRIME_CONVERTER = "0x4f55cb0a24D5542a3478B0E284259A6B850B06BD";
export const USDC_PRIME_CONVERTER = "0xcEB9503f10B781E30213c0b320bCf3b3cE54216E";
export const WBTC_PRIME_CONVERTER = "0xDcCDE673Cd8988745dA384A7083B0bd22085dEA0";
export const WETH_PRIME_CONVERTER = "0xb8fD67f215117FADeF06447Af31590309750529D";
export const XVS_VAULT_CONVERTER = "0x1FD30e761C3296fE36D9067b1e398FD97B4C0407";
const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
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

export const vip412 = () => {
  const meta = {
    version: "v2",
    title: "VIP-412 [Ethereum] Add Ethena pool to Ethereum (2/2)",
    description: `#### Summary

If passed, this VIP will perform the following actions:

- Add the following markets to the Ethena pool on Ethereum, following the [Chaos labs recommendations](https://community.venus.io/t/support-ethena-assets-on-ethereum-mainnet/4719/7):
    - [sUSDe](https://etherscan.io/address/0x9D39A5DE30e57443BfF2A8307A4256c8797A3497)
    - [USDC](https://etherscan.io/address/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48)

This is a follow-up VIP of [VIP-411 [Ethereum] Add Ethena pool to Ethereum (1/2)](https://app.venus.io/#/governance/proposal/411).

#### Description

#### Risk parameters of the new markets

**Underlying token: [sUSDe](https://etherscan.io/address/0x9D39A5DE30e57443BfF2A8307A4256c8797A3497)**

- Borrow cap: 0
- Supply cap: 50,000,000
- Collateral factor: 0.9
- Liquidation threshold: 0.92
- Reserve factor: 0
- Bootstrap liquidity: 10,000 sUSDe - provided by the market supporter [0x3e8734ec146c981e3ed1f6b582d447dde701d90c](https://etherscan.io/address/0x3e8734ec146c981e3ed1f6b582d447dde701d90c)
- Interest rates (not relevant, because the asset is not borrowable, but configured anyway):
    - kink: 0.8
    - base (yearly): 0
    - multiplier (yearly): 0.08
    - jump multiplier (yearly): 0.8
- Liquidation incentive sent to the protocol: 1%

**Underlying token: [USDC](https://etherscan.io/address/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48)**

- Borrow cap: 46,000,000
- Supply cap: 50,000,000
- Collateral factor: 0
- Liquidation threshold: 0
- Reserve factor: 0.1
- Bootstrap liquidity: 10,000 USDC - provided by the market supporter [0x3e8734ec146c981e3ed1f6b582d447dde701d90c](https://etherscan.io/address/0x3e8734ec146c981e3ed1f6b582d447dde701d90c)
- Interest rate:
    - kink: 0.92
    - base (yearly): 0
    - multiplier (yearly): 0.16304
    - jump multiplier (yearly): 2.5
- Liquidation incentive sent to the protocol: 2%

#### Oracle configuration

- sUSDe
    - Main oracle: [ERC4626Oracle](https://etherscan.io/address/0x67841858BCCA8dF50B962d6A314722a6AEC0970e)
        - correlated token: [sUSDe](https://etherscan.io/address/0x9D39A5DE30e57443BfF2A8307A4256c8797A3497)
        - underlying token: [USDe](https://etherscan.io/address/0x4c9EDD5852cd905f086C759E8383e09bff1E68B3)
- USDe
    - Main oracle: [RedStoneOracle](https://etherscan.io/address/0x0FC8001B2c9Ec90352A46093130e284de5889C86) ([feed](https://etherscan.io/address/0xbC5FBcf58CeAEa19D523aBc76515b9AEFb5cfd58))
    - Pivot and fallback oracles: [ChainlinkOracle](https://etherscan.io/address/0x94c3A2d6B7B2c051aDa041282aec5B0752F8A1F2) ([feed](https://etherscan.io/address/0xa569d910839Ae8865Da8F8e70FfFb0cBA869F961))

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **No changes in the deployed code.** The deployed contracts (markets, comptroller, etc.) have not been modified. It’s the same codebase used for the Core pool on Ethereum
- **Audit:** Certik, Peckshield, Hacken and Code4rena have audited the deployed code
- **VIP execution simulation:** in a simulation environment, validating the markets are properly added to the pool with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet:** the same pool has been deployed to testnet, and used in the Venus Protocol testnet deployment
- **Fork tests:** in a simulation environment, verifying the main actions of the protocol are executable as expected with real data

#### Audit reports

- [Certik audit report](https://github.com/VenusProtocol/isolated-pools/blob/1d60500e28d4912601bac461870c754dd9e72341/audits/036_isolatedPools_certik_20230619.pdf) (2023/June/19)
- [Code4rena contest](https://code4rena.com/contests/2023-05-venus-protocol-isolated-pools) (2023/May/05)
- [Hacken audit report](https://github.com/VenusProtocol/isolated-pools/blob/c801e898e034e313e885c5d486ed27c15e7e2abf/audits/016_isolatedPools_hacken_20230426.pdf) (2023/April/26)
- [Peckshield audit report 1](https://github.com/VenusProtocol/isolated-pools/blob/c801e898e034e313e885c5d486ed27c15e7e2abf/audits/003_isolatedPools_peckshield_20230112.pdf) (2023/January/12)
- [Peckshield audit report 2](https://github.com/VenusProtocol/isolated-pools/blob/1d60500e28d4912601bac461870c754dd9e72341/audits/037_isolatedPools_peckshield_20230625.pdf) (2023/June/25)

#### Contracts on mainnet

- Comptroller: [0x562d2b6FF1dbf5f63E233662416782318cC081E4](https://etherscan.io/address/0x562d2b6FF1dbf5f63E233662416782318cC081E4)
- Markets:
    - VToken_vUSDC_Ethena: [0xa8e7f9473635a5CB79646f14356a9Fc394CA111A](https://etherscan.io/address/0xa8e7f9473635a5CB79646f14356a9Fc394CA111A)
    - VToken_vsUSDe_Ethena: [0x0792b9c60C728C1D2Fd6665b3D7A08762a9b28e0](https://etherscan.io/address/0x0792b9c60C728C1D2Fd6665b3D7A08762a9b28e0)

#### Contracts on testnet

- Comptroller: [0x05Cdc6c3dceA796971Db0d9edDbC7C56f2176D1c](https://sepolia.etherscan.io/address/0x05Cdc6c3dceA796971Db0d9edDbC7C56f2176D1c)
- Markets:
    - VToken_vUSDC_Ethena: [0x466fe60aE3d8520e49D67e3483626786Ba0E6416](https://sepolia.etherscan.io/address/0x466fe60aE3d8520e49D67e3483626786Ba0E6416)
    - VToken_vsUSDe_Ethena: [0x643a2BE96e7675Ca34bcceCB33F4f0fECA1ba9fC](https://sepolia.etherscan.io/address/0x643a2BE96e7675Ca34bcceCB33F4f0fECA1ba9fC)

#### References

- [Repository](https://github.com/VenusProtocol/isolated-pools)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/440)
- [Chaos labs recommendations](https://community.venus.io/t/support-ethena-assets-on-ethereum-mainnet/4719/7)
- [Source code of the ERC4626Oracle](https://github.com/VenusProtocol/oracle/blob/main/contracts/oracles/ERC4626Oracle.sol)
- Snapshot “[Support Ethena Assets on Ethereum Mainnet](https://snapshot.box/#/s:venus-xvs.eth/proposal/0x5173788fc589aa30ac9b1472542f000d915a4a3583ad85a375fc248f05810077)”
- [Documentation](https://docs.venus.io/whats-new/isolated-pools)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };
  return makeProposal(
    [
      {
        target: ethereum.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [sUSDe, parseUnits("10000", 18), ethereum.NORMAL_TIMELOCK],
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
        params: [ethereum.POOL_REGISTRY, parseUnits("10000", 18)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: VsUSDe_Ethena,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["7200"],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VsUSDe_Ethena,
            parseUnits("0.9", 18),
            parseUnits("0.92", 18),
            parseUnits("10000", 18),
            VTOKEN_RECEIVER,
            parseUnits("50000000", 18),
            parseUnits("0", 18),
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [USDC, parseUnits("10000", 6), ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: USDC,
        signature: "approve(address,uint256)",
        params: [ethereum.POOL_REGISTRY, 0],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: USDC,
        signature: "approve(address,uint256)",
        params: [ethereum.POOL_REGISTRY, parseUnits("10000", 6)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: VUSDC_Ethena,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["7200"],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VUSDC_Ethena,
            parseUnits("0", 18),
            parseUnits("0", 18),
            parseUnits("10000", 6),
            VTOKEN_RECEIVER,
            parseUnits("50000000", 6),
            parseUnits("46000000", 6),
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: VsUSDe_Ethena,
        signature: "setProtocolSeizeShare(uint256)",
        params: [parseUnits("0.010", 18)],
        dstChainId: LzChainId.ethereum,
      },

      {
        target: VUSDC_Ethena,
        signature: "setProtocolSeizeShare(uint256)",
        params: [parseUnits("0.020", 18)],
        dstChainId: LzChainId.ethereum,
      },

      {
        target: COMPTROLLER_ETHENA,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[VsUSDe_Ethena], [2], true],
        dstChainId: LzChainId.ethereum,
      },

      // Configure converters

      ...Object.entries(converterBaseAssets).map(([converter, baseAsset]: [string, string]) => ({
        target: converter,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [
          baseAsset,
          [PT_USDe_27MAR2025, PT_sUSDE_27MAR2025, sUSDe],
          [
            [CONVERSION_INCENTIVE, ConversionAccessibility.ALL],
            [CONVERSION_INCENTIVE, ConversionAccessibility.ALL],
            [CONVERSION_INCENTIVE, ConversionAccessibility.ALL],
          ],
        ],
        dstChainId: LzChainId.ethereum,
      })),
    ],

    meta,
    ProposalType.REGULAR,
  );
};

export default vip412;
