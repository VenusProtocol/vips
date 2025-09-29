import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

/// @dev cant find NETWORK_ADDRESSES.bsctestnet.PROTOCOL_SHARE_RESERVE,
export const PSR = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
export const USDT_PRIME_CONVERTER = "0xD9f101AA67F3D72662609a2703387242452078C3";
export const USDC_PRIME_CONVERTER = "0xa758c9C215B6c4198F0a0e3FA46395Fa15Db691b";
export const BTCB_PRIME_CONVERTER = "0xE8CeAa79f082768f99266dFd208d665d2Dd18f53";
export const ETH_PRIME_CONVERTER = "0xca430B8A97Ea918fF634162acb0b731445B8195E";

export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";

export const PRIME_LIQUIDITY_PROVIDER = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";
export const PRIME = "0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC";

export const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
export const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";

export const CORE_MARKETS = [
  {
    symbol: "vUSDC",
    asset: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    address: "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8",
    collateralFactor: 825000000000000000n,
  },
  {
    symbol: "vUSDT",
    asset: "0x55d398326f99059fF775485246999027B3197955",
    address: "0xfD5840Cd36d94D7229439859C0112a4185BC0255",
    collateralFactor: 800000000000000000n,
  },
  {
    symbol: "vBTC",
    asset: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    address: "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B",
    collateralFactor: 800000000000000000n,
  },
  {
    symbol: "vETH",
    asset: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    address: "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8",
    collateralFactor: 800000000000000000n,
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
        params: [USDC, USDT_PRIME_CONVERTER, parseUnits("13000", 18)],
      },
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "sweepToken(address,address,uint256)",
        params: [ETH, USDT_PRIME_CONVERTER, parseUnits("2", 18)],
      },
      {
        target: USDT_PRIME_CONVERTER,
        signature: "updateAssetsState(address,address)",
        params: [NETWORK_ADDRESSES.bscmainnet.UNITROLLER, USDC],
      },
      {
        target: USDT_PRIME_CONVERTER,
        signature: "updateAssetsState(address,address)",
        params: [NETWORK_ADDRESSES.bscmainnet.UNITROLLER, ETH],
      },
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "setTokensDistributionSpeed(address[],uint256[])",
        params: [
          [USDC, USDT],
          [parseUnits("0.007", 18), parseUnits("0.007", 18)],
        ],
      },
      {
        target: PRIME,
        signature: "updateMultipliers(address,uint256,uint256)",
        params: [vUSDC, 2000000000000000000n, 0],
      },
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
