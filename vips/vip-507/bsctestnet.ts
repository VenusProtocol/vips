import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { sepolia } = NETWORK_ADDRESSES;

export const COMPTROLLER_CORE = "0x7Aa39ab4BcA897F403425C9C6FDbd0f882Be0D70";
export const sUSDe = "0xA3A3e5ecEA56940a4Ae32d0927bfd8821DdA848A";
export const USDe = "0x8bAe3E12870a002A0D4b6Eb0F0CBf91b29d9806F";

export const VsUSDe_CORE = "0x33e4C9227b8Fca017739419119BbBA33A089D4a0";
export const VUSDe_CORE = "0x36e8955c305aa48A99e4c953C9883989a7364a42";

export const sUSDe_INITIAL_SUPPLY = parseUnits("10000", 18);
export const USDe_INITIAL_SUPPLY = parseUnits("10000", 18);
export const VsUSDe_IR_MODEL = "0xc948752610D09E9f2B2A9C7114d9593DDED85487";

// Converters
export const USDT_PRIME_CONVERTER = "0x3716C24EA86A67cAf890d7C9e4C4505cDDC2F8A2";
export const USDC_PRIME_CONVERTER = "0x511a559a699cBd665546a1F75908f7E9454Bfc67";
export const WBTC_PRIME_CONVERTER = "0x8a3937F27921e859db3FDA05729CbCea8cfd82AE";
export const WETH_PRIME_CONVERTER = "0x274a834eFFA8D5479502dD6e78925Bc04ae82B46";
export const XVS_VAULT_CONVERTER = "0xc203bfA9dCB0B5fEC510Db644A494Ff7f4968ed2";
export const BaseAssets = [
  "0x8d412FD0bc5d826615065B931171Eed10F5AF266", // USDT USDTPrimeConverter BaseAsset
  "0x772d68929655ce7234C8C94256526ddA66Ef641E", // USDC USDCPrimeConverter BaseAsset
  "0x92A2928f5634BEa89A195e7BeCF0f0FEEDAB885b", // WBTC WBTCPrimeConverter BaseAsset
  "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9", // WETH WETHPrimeConverter BaseAsset
  "0x66ebd019E86e0af5f228a0439EBB33f045CBe63E", // XVS XVSPrimeConverter BaseAsset
];
export const CONVERSION_INCENTIVE = parseUnits("3", 14);

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

const Actions = {
  BORROW: 2,
};

const vip507 = () => {
  const meta = {
    version: "v2",
    title: "[sepolia] New sUSDe and USDe market in the Core pool",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Add Markets to the Core pool
      // Market configurations sUSDe
      {
        target: VsUSDe_CORE,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["7200"],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: VsUSDe_CORE,
        signature: "setInterestRateModel(address)",
        params: [VsUSDe_IR_MODEL],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sUSDe,
        signature: "faucet(uint256)",
        params: [sUSDe_INITIAL_SUPPLY],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sUSDe,
        signature: "approve(address,uint256)",
        params: [sepolia.POOL_REGISTRY, 0],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sUSDe,
        signature: "approve(address,uint256)",
        params: [sepolia.POOL_REGISTRY, sUSDe_INITIAL_SUPPLY],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sepolia.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VsUSDe_CORE,
            parseUnits("0.72", 18), // CF
            parseUnits("0.75", 18), // LT
            sUSDe_INITIAL_SUPPLY, // initial supply
            sepolia.NORMAL_TIMELOCK,
            parseUnits("20000000", 18), // supply cap
            parseUnits("0", 18), // borrow cap
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: VsUSDe_CORE,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, parseUnits("100", 8)], // around $100
        dstChainId: LzChainId.sepolia,
      },
      (() => {
        const vTokensMinted = convertAmountToVTokens(USDe_INITIAL_SUPPLY, parseUnits("1", 28));
        const vTokensRemaining = vTokensMinted.sub(parseUnits("100", 8));
        return {
          target: VsUSDe_CORE,
          signature: "transfer(address,uint256)",
          params: [sepolia.VTREASURY, vTokensRemaining],
          dstChainId: LzChainId.sepolia,
        };
      })(),
      {
        target: COMPTROLLER_CORE,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[VsUSDe_CORE], [Actions.BORROW], true],
        dstChainId: LzChainId.sepolia,
      },

      // Market configurations USDe
      {
        target: VUSDe_CORE,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["7200"],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: USDe,
        signature: "faucet(uint256)",
        params: [USDe_INITIAL_SUPPLY],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: USDe,
        signature: "approve(address,uint256)",
        params: [sepolia.POOL_REGISTRY, 0],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: USDe,
        signature: "approve(address,uint256)",
        params: [sepolia.POOL_REGISTRY, USDe_INITIAL_SUPPLY],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sepolia.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VUSDe_CORE,
            parseUnits("0.72", 18), // CF
            parseUnits("0.75", 18), // LT
            USDe_INITIAL_SUPPLY, // initial supply
            sepolia.NORMAL_TIMELOCK,
            parseUnits("30000000", 18), // supply cap
            parseUnits("25000000", 18), // borrow cap
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: VUSDe_CORE,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, parseUnits("100", 8)], // around $100
        dstChainId: LzChainId.sepolia,
      },
      (() => {
        const vTokensMinted = convertAmountToVTokens(USDe_INITIAL_SUPPLY, parseUnits("1", 28));
        const vTokensRemaining = vTokensMinted.sub(parseUnits("100", 8));
        return {
          target: VUSDe_CORE,
          signature: "transfer(address,uint256)",
          params: [sepolia.VTREASURY, vTokensRemaining],
          dstChainId: LzChainId.sepolia,
        };
      })(),

      // Conversion config of USDe
      {
        target: USDT_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[0], [USDe], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: USDC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[1], [USDe], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: WBTC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[2], [USDe], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: WETH_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[3], [USDe], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: XVS_VAULT_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[4], [USDe], [[CONVERSION_INCENTIVE, 1]]],
        dstChainId: LzChainId.sepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip507;
