import { ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const XVS_BRIDGE_SRC = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";
export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const BSC_TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const ETH_TREASURY = "0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA";
export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";

export const REWARDS = [
  {
    market: "WETH",
    reward: parseUnits("1125", 18),
  },
  {
    market: "WBTC",
    reward: parseUnits("3375", 18),
  },
  {
    market: "USDT",
    reward: parseUnits("3375", 18),
  },
  {
    market: "USDC",
    reward: parseUnits("3375", 18),
  },
  {
    market: "crvUSD",
    reward: parseUnits("1500", 18),
  },
  {
    market: "FRAX",
    reward: parseUnits("600", 18),
  },
  {
    market: "sFRAX",
    reward: parseUnits("600", 18),
  },
  {
    market: "TUSD",
    reward: parseUnits("200", 18),
  },
  {
    market: "DAI",
    reward: parseUnits("500", 18),
  },
  {
    market: "CRV",
    reward: parseUnits("375", 18),
  },
  {
    market: "crvUSD",
    reward: parseUnits("375", 18),
  },
  {
    market: "WETH",
    reward: parseUnits("18333", 18),
  },
  {
    market: "wstETH",
    reward: parseUnits("3600", 18),
  },
];

export const BRIDGE_FEES = parseUnits("0.1", 18);
export const DEST_ENDPOINT_ID = 101; // Ethereum chain
export const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
export const TOTAL_MONTHS = 3;
export const TOTAL_XVS_TO_BRIDGE = REWARDS.reduce((acc, { reward }) => acc.add(reward), ethers.BigNumber.from(0)).mul(
  TOTAL_MONTHS,
);

export const vip322 = () => {
  const meta = {
    version: "v2",
    title: "VIP-322",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: BSC_TREASURY,
        signature: "withdrawTreasuryBNB(uint256,address)",
        params: [BRIDGE_FEES, NORMAL_TIMELOCK],
        value: "0",
      },
      {
        target: COMPTROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [NORMAL_TIMELOCK, TOTAL_XVS_TO_BRIDGE],
      },
      {
        target: XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE_SRC, TOTAL_XVS_TO_BRIDGE],
      },
      {
        target: XVS_BRIDGE_SRC,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          NORMAL_TIMELOCK,
          DEST_ENDPOINT_ID,
          ethers.utils.defaultAbiCoder.encode(["address"], [ETH_TREASURY]),
          TOTAL_XVS_TO_BRIDGE,
          [BSC_TREASURY, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: BRIDGE_FEES.toString(),
      },
      {
        target: XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE_SRC, 0],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip322;
