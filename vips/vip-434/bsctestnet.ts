import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { POOL_REGISTRY, VTREASURY, NORMAL_TIMELOCK, CHAINLINK_ORACLE, RESILIENT_ORACLE } =
  NETWORK_ADDRESSES["arbitrumsepolia"];

export const COMPTROLLER_CORE = "0x006D44b6f5927b3eD83bD0c1C36Fb1A3BaCaC208";

export const USDT_PRIME_CONVERTER = "0xFC0ec257d3ec4D673cB4e2CD3827C202e75fd0be";
export const USDC_PRIME_CONVERTER = "0xE88ed530597bc8D50e8CfC0EecAAFf6A93248C74";
export const WBTC_PRIME_CONVERTER = "0x3089F46caf6611806caA39Ffaf672097156b893a";
export const WETH_PRIME_CONVERTER = "0x0d1e90c1F86CD1c1dF514B493c5985B3FD9CD6C8";
export const XVS_VAULT_CONVERTER = "0x99942a033454Cef6Ffb2843886C8b2E658E7D5fd";
export const BaseAssets = [
  "0xf3118a17863996B9F2A073c9A66Faaa664355cf8", // USDT USDTTokenConverter BaseAsset
  "0x86f096B1D970990091319835faF3Ee011708eAe8", // USDC USDCTokenConverter BaseAsset
  "0xFb8d93FD3Cf18386a5564bb5619cD1FdB130dF7D", // WBTC WBTCTokenConverter BaseAsset
  "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73", // WETH WETHTokenConverter BaseAsset
  "0x877Dc896e7b13096D3827872e396927BbE704407", // XVS XVSTokenConverter BaseAsset
];
const CONVERSION_INCENTIVE = parseUnits("0.0001", 18);

type Token = {
  address: string;
  decimals: number;
  symbol: string;
}

export const token = {
  address: "0xbd3AAd064295dcA0f45fab4C6A5adFb0D23a19D2",
  decimals: 18,
  symbol: "gmBTC",
}

type Market = {
  vToken: {
    address: string;
    name: string;
    symbol: string;
    underlying: Token;
    decimals: number;
    exchangeRate: BigNumber;
    comptroller: string;
  };
  riskParameters: {
    collateralFactor: BigNumber;
    liquidationThreshold: BigNumber;
    supplyCap: BigNumber;
    borrowCap: BigNumber;
    reserveFactor: BigNumber;
    protocolSeizeShare: BigNumber;
  };
  initialSupply: {
    amount: BigNumber;
    vTokenReceiver: string;
  };
  interestRateModel: {
    address: string;
    base: string;
    multiplier: string;
    jump: string;
    kink: string;
  };
};

export const market: Market = 
  {
    vToken: {
      address: "0x6089B1F477e13459C4d1D1f767c974e5A72a541F",
      name: "Venus gmBTC-USDC (Core)",
        symbol: "vgmBTC-USDC_Core",
        underlying: token,
        decimals: 8,
        exchangeRate: parseUnits("1", 28),
        comptroller: COMPTROLLER_CORE,
      },
      riskParameters: {
        collateralFactor: parseUnits("0.55", 18),
        liquidationThreshold: parseUnits("0.6", 18),
        supplyCap: parseUnits("2650000", 18),
        borrowCap: parseUnits("0", 18),
        reserveFactor: parseUnits("0.25", 18),
        protocolSeizeShare: parseUnits("0.05", 18),
      },
      initialSupply: {
        amount: parseUnits("4800", 18),
      vTokenReceiver: VTREASURY,
    },
    interestRateModel: {
      address: "0xf5EA67C92EF40b948EF672DE5fb913237A880A9E",
      base: "0",
    multiplier: "0.15",
    jump: "2.5",
    kink: "0.45",
    },
  };

  export const FIXED_PRICE = parseUnits("2.32639502", 18);


const vip434 = () => {
  const meta = {
    version: "v2",
    title: "VIP-434",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: CHAINLINK_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [
          token.address, FIXED_PRICE
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            token.address,
            [CHAINLINK_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },

      {
        target: token.address,
        signature: "faucet(uint256)",
        params: [market.initialSupply.amount],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: market.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["86400"],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: market.vToken.address,
        signature: "setReserveFactor(uint256)",
        params: [market.riskParameters.reserveFactor],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: market.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, market.initialSupply.amount],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            market.vToken.address,
            market.riskParameters.collateralFactor,
            market.riskParameters.liquidationThreshold,
            market.initialSupply.amount,
            market.initialSupply.vTokenReceiver,
            market.riskParameters.supplyCap,
            market.riskParameters.borrowCap,
          ],
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: market.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, 0],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: market.vToken.address,
        signature: "setProtocolSeizeShare(uint256)",
        params: [market.riskParameters.protocolSeizeShare],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: USDT_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[0], [market.vToken.underlying.address], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: USDC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[1], [market.vToken.underlying.address], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: WBTC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[2], [market.vToken.underlying.address], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: WETH_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[3], [market.vToken.underlying.address], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: XVS_VAULT_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[4], [market.vToken.underlying.address], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.arbitrumsepolia,
      },
      {
        target: COMPTROLLER_CORE,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[
          market.vToken.address,
        ], [2], true],
        dstChainId: LzChainId.arbitrumsepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip434;
