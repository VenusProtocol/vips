import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { POOL_REGISTRY, VTREASURY, CHAINLINK_ORACLE, RESILIENT_ORACLE } = NETWORK_ADDRESSES["sepolia"];

export const COMPTROLLER = "0x7Aa39ab4BcA897F403425C9C6FDbd0f882Be0D70";
export const sUSDS_ERC4626_ORACLE = "0x386C41A4Ff2e4da2C5CC6B1A13fD34A98B48C51d";
export const USDS = "0xfB287f9A45E54df6AADad95C6F37b1471e744762";
export const sUSDS = "0xE9E34fd81982438E96Bd945f5810F910e35F0165";
export const vUSDS = "0x459C6a6036e2094d1764a9ca32939b9820b2C8e0";
export const vsUSDS = "0x083a24648614df4b72EFD4e4C81141C044dBB253";

export const FIXED_STABLECOIN_PRICE = parseUnits("1.1", 18);
export const CONVERSION_INCENTIVE = parseUnits("0.0001", 18);

export const BaseAssets = [
  "0x8d412FD0bc5d826615065B931171Eed10F5AF266", // USDT USDTPrimeConverter BaseAsset
  "0x772d68929655ce7234C8C94256526ddA66Ef641E", // USDC USDCPrimeConverter BaseAsset
  "0x92A2928f5634BEa89A195e7BeCF0f0FEEDAB885b", // WBTC WBTCPrimeConverter BaseAsset
  "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9", // WETH WETHPrimeConverter BaseAsset
  "0x66ebd019E86e0af5f228a0439EBB33f045CBe63E", // XVS XVSPrimeConverter BaseAsset
];

export const CONVERTER_NETWORK = "0xB5A4208bFC4cC2C4670744849B8fC35B21A690Fa";
export const USDT_PRIME_CONVERTER = "0x3716C24EA86A67cAf890d7C9e4C4505cDDC2F8A2";
export const USDC_PRIME_CONVERTER = "0x511a559a699cBd665546a1F75908f7E9454Bfc67";
export const WBTC_PRIME_CONVERTER = "0x8a3937F27921e859db3FDA05729CbCea8cfd82AE";
export const WETH_PRIME_CONVERTER = "0x274a834eFFA8D5479502dD6e78925Bc04ae82B46";
export const XVS_VAULT_CONVERTER = "0xc203bfA9dCB0B5fEC510Db644A494Ff7f4968ed2";

const vip439 = () => {
  const meta = {
    version: "v2",
    title: "Configure USDS & sUSDS markets on sepolia - Core pool",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: vUSDS,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: vsUSDS,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.sepolia,
      },
      // Oracle config
      {
        target: CHAINLINK_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [USDS, FIXED_STABLECOIN_PRICE],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [USDS, [CHAINLINK_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero], [true, false, false]],
        ],
        dstChainId: LzChainId.sepolia,
      },
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
        dstChainId: LzChainId.sepolia,
      },

      // USDS Market
      {
        target: vUSDS,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["7200"],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: vUSDS,
        signature: "setReserveFactor(uint256)",
        params: [parseUnits("0.1", 18)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: USDS,
        signature: "faucet(uint256)",
        params: [parseUnits("10000", 18)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: USDS,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, parseUnits("10000", 18)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            vUSDS,
            parseUnits("0.73", 18),
            parseUnits("0.75", 18),
            parseUnits("10000", 18),
            VTREASURY,
            parseUnits("65000000", 18),
            parseUnits("7680000", 18),
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: USDS,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, 0],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: vUSDS,
        signature: "setProtocolSeizeShare(uint256)",
        params: [parseUnits("0.05", 18)],
        dstChainId: LzChainId.sepolia,
      },

      {
        target: vsUSDS,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["7200"],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: vsUSDS,
        signature: "setReserveFactor(uint256)",
        params: [parseUnits("0.1", 18)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sUSDS,
        signature: "faucet(uint256)",
        params: [parseUnits("10000", 18)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sUSDS,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, parseUnits("10000", 18)],
        dstChainId: LzChainId.sepolia,
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
            VTREASURY,
            parseUnits("30000000", 18),
            parseUnits("0", 18),
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sUSDS,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, 0],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: vsUSDS,
        signature: "setProtocolSeizeShare(uint256)",
        params: [parseUnits("0.05", 18)],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: COMPTROLLER,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[vsUSDS], [2], true],
        dstChainId: LzChainId.sepolia,
      },

      // set converters
      {
        target: USDT_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [
          BaseAssets[0],
          [USDS, sUSDS],
          [
            [CONVERSION_INCENTIVE, 1],
            [CONVERSION_INCENTIVE, 1],
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: USDC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [
          BaseAssets[1],
          [USDS, sUSDS],
          [
            [CONVERSION_INCENTIVE, 1],
            [CONVERSION_INCENTIVE, 1],
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: WBTC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [
          BaseAssets[2],
          [USDS, sUSDS],
          [
            [CONVERSION_INCENTIVE, 1],
            [CONVERSION_INCENTIVE, 1],
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: WETH_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [
          BaseAssets[3],
          [USDS, sUSDS],
          [
            [CONVERSION_INCENTIVE, 1],
            [CONVERSION_INCENTIVE, 1],
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: XVS_VAULT_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [
          BaseAssets[4],
          [USDS, sUSDS],
          [
            [CONVERSION_INCENTIVE, 1],
            [CONVERSION_INCENTIVE, 1],
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip439;
