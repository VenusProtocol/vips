import { ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const XVS_BRIDGE_SRC = "0x0E132cd94fd70298b747d2b4D977db8d086e5fD0";
export const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
export const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const BSC_TREASURY = "0x8b293600c50d6fbdc6ed4251cc75ece29880276f";
export const ETH_TREASURY = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";
export const XVS = "0xB9e0E753630434d7863528cc73CB7AC638a7c8ff";

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

export const BRIDGE_FEES = parseUnits("0.4", 18);
export const DEST_ENDPOINT_ID = 10161; // Sepolia chain
export const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
export const PERCENTAGE_OF_REAL_AMOUNT_BRIDGE = 10;
export const TOTAL_MONTHS = 3;
export const TOTAL_XVS_TO_BRIDGE = REWARDS.reduce((acc, { reward }) => acc.add(reward), ethers.BigNumber.from(0))
  .mul(TOTAL_MONTHS)
  .div(PERCENTAGE_OF_REAL_AMOUNT_BRIDGE);

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
