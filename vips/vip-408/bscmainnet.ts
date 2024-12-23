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

export const vip408 = () => {
  const meta = {
    version: "v2",
    title: "VIP-408 [Ethereum] New Ethena pool (Part-II)",
    description: `#### Summary`,
    forDescription: "Process to configure and launch the new pool",
    againstDescription: "Defer configuration and launch of the new pool",
    abstainDescription: "No opinion on the matter",
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
        params: [[VsUSDe_Ethena, VUSDC_Ethena], [2, 7], true],
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

export default vip408;
