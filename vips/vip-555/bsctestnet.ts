import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const PSR = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";
export const USDT_PRIME_CONVERTER = "0xf1FA230D25fC5D6CAfe87C5A6F9e1B17Bc6F194E";
export const USDC_PRIME_CONVERTER = "0x2ecEdE6989d8646c992344fF6C97c72a3f811A13";
export const BTCB_PRIME_CONVERTER = "0x989A1993C023a45DA141928921C0dE8fD123b7d1";
export const ETH_PRIME_CONVERTER = "0xf358650A007aa12ecC8dac08CF8929Be7f72A4D9";

export const USDC = "0x16227D60f7a0e586C66B005219dfc887D13C9531";
export const ETH = "0x98f7A83361F7Ac8765CcEBAB1425da6b341958a7";
export const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
export const BTCB = "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4";

export const PRIME_LIQUIDITY_PROVIDER = "0xAdeddc73eAFCbed174e6C400165b111b0cb80B7E";
export const PRIME = "0xe840F8EC2Dc50E7D22e5e2991975b9F6e34b62Ad";

export const vUSDC = "0xD5C4C2e2facBEB59D0216D0595d63FcDc6F9A1a7";
export const vUSDT = "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A";

export const CORE_MARKETS = [
  {
    symbol: "vUSDC",
    address: "0xD5C4C2e2facBEB59D0216D0595d63FcDc6F9A1a7",
    asset: "0x16227D60f7a0e586C66B005219dfc887D13C9531",
  },
  {
    symbol: "vUSDT",
    address: "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A",
    asset: "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c",
  },
  {
    symbol: "vETH",
    address: "0x162D005F0Fff510E54958Cfc5CF32A3180A84aab",
    asset: "0x98f7A83361F7Ac8765CcEBAB1425da6b341958a7",
  },
  {
    symbol: "vBTC",
    address: "0xb6e9322C49FD75a367Fcb17B0Fcd62C5070EbCBe",
    asset: "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4",
  },
];

export const vip555 = () => {
  const meta = {
    version: "v2",
    title: "Adjust Prime rewards for October 2025",
    description: `Adjust Prime rewards for October 2025`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: PSR,
        signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
        /// @dev PRIME benefits 20% of the total normal income
        // 0 (PROTOCOL_RESERVES), 1000 (i.e. 10%), ...
        params: [
          [
            [0, 1000, USDT_PRIME_CONVERTER],
            [0, 1000, USDC_PRIME_CONVERTER],
            [0, 0, BTCB_PRIME_CONVERTER],
            [0, 0, ETH_PRIME_CONVERTER],
          ],
        ],
      },
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "sweepToken(address,address,uint256)",
        params: [USDC, USDT_PRIME_CONVERTER, parseUnits("1000", 6)],
      },
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "sweepToken(address,address,uint256)",
        params: [ETH, USDT_PRIME_CONVERTER, parseUnits("0", 18)],
      },
      {
        target: USDT_PRIME_CONVERTER,
        signature: "updateAssetsState(address,address)",
        params: [NETWORK_ADDRESSES.bsctestnet.UNITROLLER, USDC],
      },
      {
        target: USDT_PRIME_CONVERTER,
        signature: "updateAssetsState(address,address)",
        params: [NETWORK_ADDRESSES.bsctestnet.UNITROLLER, ETH],
      },
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "setTokensDistributionSpeed(address[],uint256[])",
        params: [[USDT], [7000n]],
      },
      /// @interim there is some issue for vUSDC prime system on bsctestnet
      // {
      //   target: PRIME,
      //   signature: "updateMultipliers(address,uint256,uint256)",
      //   params: [vUSDC, 2000000000000000000n, 0],
      // },
      {
        target: PRIME,
        signature: "updateMultipliers(address,uint256,uint256)",
        params: [vUSDT, 2000000000000000000n, 0],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip555;
