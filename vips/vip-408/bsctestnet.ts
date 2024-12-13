import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { sepolia } = NETWORK_ADDRESSES;

const COMPTROLLER_ETHENA = "0x05Cdc6c3dceA796971Db0d9edDbC7C56f2176D1c";

const MockPT_USDe_27MAR2025 = "0x74671106a04496199994787B6BcB064d08afbCCf";
const MockPT_sUSDE_27MAR2025 = "0x3EBa2Aa29eC2498c2124523634324d4ce89c8579";
const MocksUSDe = "0xD28894b4A8AB53Ce55965AfD330b55C2DbB3E07D";
const MockUSDC = "0x772d68929655ce7234C8C94256526ddA66Ef641E";

const VPT_USDe_27MAR2025_ETHENA = "0x11B3a14D9F4182b841bBb48637B26ecCC527A30c";
const VPT_sUSDE_27MAR2025_ETHENA = "0x4975ECc52179b49ECE4B8328601572f07a1fC51D";
const VsUSDe_Ethena = "0xb17abC45289EE8075447853D4E443f1E7e36fF99";
const VUSDC_Ethena = "0xf3c213775e0592108350Bd0A1864d7e581fBd3a0";

export const underlyingAddress = [MockPT_USDe_27MAR2025, MockPT_sUSDE_27MAR2025, MocksUSDe, MockUSDC];

enum ConversionAccessibility {
  NONE = 0,
  ALL = 1,
  ONLY_FOR_CONVERTERS = 2,
  ONLY_FOR_USERS = 3,
}

export const CONVERSION_INCENTIVE = 1e14;

export const USDT_PRIME_CONVERTER = "0x3716C24EA86A67cAf890d7C9e4C4505cDDC2F8A2";
export const USDC_PRIME_CONVERTER = "0x511a559a699cBd665546a1F75908f7E9454Bfc67";
export const WBTC_PRIME_CONVERTER = "0x8a3937F27921e859db3FDA05729CbCea8cfd82AE";
export const WETH_PRIME_CONVERTER = "0x274a834eFFA8D5479502dD6e78925Bc04ae82B46";
export const XVS_VAULT_CONVERTER = "0xc203bfA9dCB0B5fEC510Db644A494Ff7f4968ed2";
const USDT = "0x8d412FD0bc5d826615065B931171Eed10F5AF266";
const USDC = "0x772d68929655ce7234C8C94256526ddA66Ef641E";
const WBTC = "0x92A2928f5634BEa89A195e7BeCF0f0FEEDAB885b";
const WETH = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";
const XVS = "0x66ebd019E86e0af5f228a0439EBB33f045CBe63E";

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
    title: "VIP-408 [Sepolia] New Ethena pool (Part-II)",
    description: `#### Summary`,
    forDescription: "Process to configure and launch the new pool",
    againstDescription: "Defer configuration and launch of the new pool",
    abstainDescription: "No opinion on the matter",
  };
  return makeProposal(
    [
      {
        target: sepolia.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [MocksUSDe, parseUnits("10653", 6), sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: MocksUSDe,
        signature: "approve(address,uint256)",
        params: [sepolia.POOL_REGISTRY, 0],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: MocksUSDe,
        signature: "approve(address,uint256)",
        params: [sepolia.POOL_REGISTRY, parseUnits("10653", 6)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: VsUSDe_Ethena,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["7200"],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sepolia.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VsUSDe_Ethena,
            parseUnits("0.9", 18),
            parseUnits("0.92", 18),
            parseUnits("10653", 18),
            sepolia.VTREASURY,
            parseUnits("50000000", 18),
            parseUnits("0", 18),
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sepolia.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [MockUSDC, parseUnits("10000", 18), sepolia.NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: MockUSDC,
        signature: "approve(address,uint256)",
        params: [sepolia.POOL_REGISTRY, 0],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: MockUSDC,
        signature: "approve(address,uint256)",
        params: [sepolia.POOL_REGISTRY, parseUnits("10000", 18)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: VUSDC_Ethena,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["7200"],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sepolia.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VUSDC_Ethena,
            parseUnits("0", 18),
            parseUnits("0", 18),
            parseUnits("10000", 6),
            sepolia.VTREASURY,
            parseUnits("50000000", 6),
            parseUnits("46000000", 6),
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },

      {
        target: COMPTROLLER_ETHENA,
        signature: "setActionsPaused(address[],uint256[],bool)",
        params: [
          [VPT_USDe_27MAR2025_ETHENA, VPT_sUSDE_27MAR2025_ETHENA, VsUSDe_Ethena, VUSDC_Ethena],
          [3, 3, 3, 8],
          true,
        ],
        dstChainId: LzChainId.sepolia,
      },

      // Configure converters

      ...Object.entries(converterBaseAssets).map(([converter, baseAsset]: [string, string]) => ({
        target: converter,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [baseAsset, [MockPT_USDe_27MAR2025], [[CONVERSION_INCENTIVE, ConversionAccessibility.ALL]]],
        dstChainId: LzChainId.sepolia,
      })),

      ...Object.entries(converterBaseAssets).map(([converter, baseAsset]: [string, string]) => ({
        target: converter,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [baseAsset, [MockPT_sUSDE_27MAR2025], [[CONVERSION_INCENTIVE, ConversionAccessibility.ALL]]],
        dstChainId: LzChainId.sepolia,
      })),

      ...Object.entries(converterBaseAssets).map(([converter, baseAsset]: [string, string]) => ({
        target: converter,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [baseAsset, [MocksUSDe], [[CONVERSION_INCENTIVE, ConversionAccessibility.ALL]]],
        dstChainId: LzChainId.sepolia,
      })),

      ...Object.entries(converterBaseAssets).map(([converter, baseAsset]: [string, string]) => ({
        target: converter,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [baseAsset, [MockUSDC], [[CONVERSION_INCENTIVE, ConversionAccessibility.ALL]]],
        dstChainId: LzChainId.sepolia,
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip408;
