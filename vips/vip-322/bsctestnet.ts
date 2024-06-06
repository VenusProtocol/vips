import { ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const XVS_BRIDGE_SRC = "0x0E132cd94fd70298b747d2b4D977db8d086e5fD0";
export const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
export const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const BSC_TREASURY = "0x8b293600c50d6fbdc6ed4251cc75ece29880276f";
export const XVS = "0xB9e0E753630434d7863528cc73CB7AC638a7c8ff";

export const CORE_XVS_DISTRIBUTOR = "0xB60666395bEFeE02a28938b75ea620c7191cA77a";
export const CURVE_XVS_DISTRIBUTOR = "0x67dA6435b35d43081c7c27685fAbb2662b7f1290";
export const LST_XVS_DISTRIBUTOR = "0x4597B9287fE0DF3c5513D66886706E0719bD270f";

export const REWARDS_CORE = [
  {
    market: "WETH",
    reward: parseUnits("1125", 18),
    distributor: "0xc2931B1fEa69b6D6dA65a50363A8D75d285e4da9",
  },
  {
    market: "WBTC",
    reward: parseUnits("3375", 18),
    distributor: "0x74E708A7F5486ed73CCCAe54B63e71B1988F1383",
  },
  {
    market: "USDT",
    reward: parseUnits("3375", 18),
    distributor: "0x19252AFD0B2F539C400aEab7d460CBFbf74c17ff",
  },
  {
    market: "USDC",
    reward: parseUnits("3375", 18),
    distributor: "0xF87bceab8DD37489015B426bA931e08A4D787616",
  },
  {
    market: "crvUSD",
    reward: parseUnits("1500", 18),
    distributor: "0xA09cFAd2e138fe6d8FF62df803892cbCb79ED082",
  },
  {
    market: "FRAX",
    reward: parseUnits("600", 18),
    distributor: "0x33942B932159A67E3274f54bC4082cbA4A704340",
  },
  {
    market: "sFRAX",
    reward: parseUnits("600", 18),
    distributor: "0x18995825f033F33fa30CF59c117aD21ff6BdB48c",
  },
  {
    market: "TUSD",
    reward: parseUnits("200", 18),
    distributor: "0xE23A1fC1545F1b072308c846a38447b23d322Ee2",
  },
  {
    market: "DAI",
    reward: parseUnits("500", 18),
    distributor: "0xfe050f628bF5278aCfA1e7B13b59fF207e769235",
  },
];

export const REWARDS_CURVE = [
  {
    market: "CRV",
    reward: parseUnits("375", 18),
    distributor: "0x9Db62c5BBc6fb79416545FcCBDB2204099217b78",
  },
  {
    market: "crvUSD",
    reward: parseUnits("375", 18),
    distributor: "0xc7be132027e191636172798B933202E0f9CAD548",
  },
];

export const REWARDS_LST = [
  {
    market: "WETH",
    reward: parseUnits("18333", 18),
    distributor: "0x9f6213dFa9069a5426Fe8fAE73857712E1259Ed4",
  },
  {
    market: "wstETH",
    reward: parseUnits("3600", 18),
    distributor: "0x0a95088403229331FeF1EB26a11F9d6C8E73f23D",
  },
];

export const BRIDGE_FEES = parseUnits("0.1", 18);
export const DEST_ENDPOINT_ID = 10161; // Sepolia chain
export const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
export const TOTAL_XVS_TO_BRIDGE_TO_CORE = REWARDS_CORE.reduce(
  (acc, { reward }) => acc.add(reward),
  ethers.BigNumber.from(0),
);
export const TOTAL_XVS_TO_BRIDGE_TO_CURVE = REWARDS_CURVE.reduce(
  (acc, { reward }) => acc.add(reward),
  ethers.BigNumber.from(0),
);
export const TOTAL_XVS_TO_BRIDGE_TO_LST = REWARDS_LST.reduce(
  (acc, { reward }) => acc.add(reward),
  ethers.BigNumber.from(0),
);
export const TOTAL_XVS_TO_BRIDGE =
  TOTAL_XVS_TO_BRIDGE_TO_CORE.add(TOTAL_XVS_TO_BRIDGE_TO_CURVE).add(TOTAL_XVS_TO_BRIDGE_TO_LST);

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
          ethers.utils.defaultAbiCoder.encode(["address"], [CORE_XVS_DISTRIBUTOR]),
          TOTAL_XVS_TO_BRIDGE_TO_CORE,
          [BSC_TREASURY, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: BRIDGE_FEES.toString(),
      },
      {
        target: XVS_BRIDGE_SRC,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          NORMAL_TIMELOCK,
          DEST_ENDPOINT_ID,
          ethers.utils.defaultAbiCoder.encode(["address"], [CURVE_XVS_DISTRIBUTOR]),
          TOTAL_XVS_TO_BRIDGE_TO_CURVE,
          [BSC_TREASURY, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: BRIDGE_FEES.toString(),
      },
      {
        target: XVS_BRIDGE_SRC,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          NORMAL_TIMELOCK,
          DEST_ENDPOINT_ID,
          ethers.utils.defaultAbiCoder.encode(["address"], [LST_XVS_DISTRIBUTOR]),
          TOTAL_XVS_TO_BRIDGE_TO_LST,
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
