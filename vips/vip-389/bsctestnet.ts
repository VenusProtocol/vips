import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { sepolia } = NETWORK_ADDRESSES;

export const EIGEN = "0xf140594470Bff436aE82F2116ab8a438671C6e83";
const INITIAL_SUPPLY = parseUnits("500", 18);
export const SUPPLY_CAP = parseUnits("3000000", 18);
export const BORROW_CAP = parseUnits("1500000", 18);
const CF = parseUnits("0.5", 18);
const LT = parseUnits("0.6", 18);
export const vEIGEN = "0x6DB4aDbA8F144a57a397b57183BF619e957040B1";
export const CORE_COMPTROLLER = "0x7Aa39ab4BcA897F403425C9C6FDbd0f882Be0D70";
export const PRICE = parseUnits("3.5", 18);

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

const vip389 = () => {
  const meta = {
    version: "v2",
    title: "VIP-389",
    description: `### Description`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: sepolia.CHAINLINK_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [EIGEN, PRICE],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sepolia.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [EIGEN, [sepolia.CHAINLINK_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero], [true, false, false]],
        ],
        dstChainId: LzChainId.sepolia,
      },

      // Add Market
      {
        target: EIGEN,
        signature: "faucet(uint256)",
        params: [INITIAL_SUPPLY],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: EIGEN,
        signature: "approve(address,uint256)",
        params: [sepolia.POOL_REGISTRY, 0],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: EIGEN,
        signature: "approve(address,uint256)",
        params: [sepolia.POOL_REGISTRY, INITIAL_SUPPLY],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: vEIGEN,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["7200"],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: sepolia.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [[vEIGEN, CF, LT, INITIAL_SUPPLY, sepolia.VTREASURY, SUPPLY_CAP, BORROW_CAP]],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: vEIGEN,
        signature: "setProtocolSeizeShare(uint256)",
        params: [parseUnits("0.01", 18)],
        dstChainId: LzChainId.sepolia,
      },

      // Conversion config
      {
        target: USDT_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[0], [EIGEN], [[0, 1]]],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: USDC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[1], [EIGEN], [[0, 1]]],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: WBTC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[2], [EIGEN], [[0, 1]]],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: WETH_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[3], [EIGEN], [[0, 1]]],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: XVS_VAULT_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[4], [EIGEN], [[0, 1]]],
        dstChainId: LzChainId.sepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
export default vip389;