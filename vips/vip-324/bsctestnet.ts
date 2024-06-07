import { BigNumber, ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

// BNB Addresses
export const XVS_BRIDGE_SRC = "0x0E132cd94fd70298b747d2b4D977db8d086e5fD0";
export const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
export const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const BSC_TREASURY = "0x8b293600c50d6fbdc6ed4251cc75ece29880276f";
export const ETH_TREASURY = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";
export const XVS = "0xB9e0E753630434d7863528cc73CB7AC638a7c8ff";

// Ethereum Addresses
export const CORE_vwETH = "0xc2931B1fEa69b6D6dA65a50363A8D75d285e4da9";
export const CORE_vWBTC = "0x74E708A7F5486ed73CCCAe54B63e71B1988F1383";
export const CORE_vUSDT = "0x19252AFD0B2F539C400aEab7d460CBFbf74c17ff";
export const CORE_vUSDC = "0xF87bceab8DD37489015B426bA931e08A4D787616";
export const CORE_vcrvUSD = "0xA09cFAd2e138fe6d8FF62df803892cbCb79ED082";
export const CORE_vFRAX = "0x33942B932159A67E3274f54bC4082cbA4A704340";
export const CORE_vsFRAX = "0x18995825f033F33fa30CF59c117aD21ff6BdB48c";
export const CORE_vTUSD = "0xE23A1fC1545F1b072308c846a38447b23d322Ee2";
export const CORE_vDAI = "0xfe050f628bF5278aCfA1e7B13b59fF207e769235";
export const CURVE_vCRV = "0x9Db62c5BBc6fb79416545FcCBDB2204099217b78";
export const CURVE_vcrvUSD = "0xc7be132027e191636172798B933202E0f9CAD548";
export const LST_vwETH = "0x9f6213dFa9069a5426Fe8fAE73857712E1259Ed4";
export const LST_vwstETH = "0x0a95088403229331FeF1EB26a11F9d6C8E73f23D";
export const LST_vweETH = "0x30c31bA6f4652B548fe7a142A949987c3f3Bf80b";
export const CORE_XVS_DISTRIBUTOR = "0xB60666395bEFeE02a28938b75ea620c7191cA77a";
export const CURVE_XVS_DISTRIBUTOR = "0x67dA6435b35d43081c7c27685fAbb2662b7f1290";
export const LST_XVS_DISTRIBUTOR = "0x4597B9287fE0DF3c5513D66886706E0719bD270f";
export const TREASURY = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";
export const ETHEREUM_XVS = "0x66ebd019E86e0af5f228a0439EBB33f045CBe63E";

export const CORE_SPEEDS = [
  {
    name: "vweETH",
    address: CORE_vwETH,
    reward: parseUnits("1125", 18),
    supplySpeedPercentage: 40,
    borrowSpeedPercentage: 60,
    distributor: CORE_XVS_DISTRIBUTOR,
  },
  {
    name: "vWBTC",
    address: CORE_vWBTC,
    reward: parseUnits("3375", 18),
    supplySpeedPercentage: 40,
    borrowSpeedPercentage: 60,
    distributor: CORE_XVS_DISTRIBUTOR,
  },
  {
    name: "vUSDT",
    address: CORE_vUSDT,
    reward: parseUnits("3375", 18),
    supplySpeedPercentage: 40,
    borrowSpeedPercentage: 60,
    distributor: CORE_XVS_DISTRIBUTOR,
  },
  {
    name: "vUSDC",
    address: CORE_vUSDC,
    reward: parseUnits("3375", 18),
    supplySpeedPercentage: 40,
    borrowSpeedPercentage: 60,
    distributor: CORE_XVS_DISTRIBUTOR,
  },
  {
    name: "vcrvUSD",
    address: CORE_vcrvUSD,
    reward: parseUnits("1500", 18),
    supplySpeedPercentage: 40,
    borrowSpeedPercentage: 60,
    distributor: CORE_XVS_DISTRIBUTOR,
  },
  {
    name: "vFRAX",
    address: CORE_vFRAX,
    reward: parseUnits("600", 18),
    supplySpeedPercentage: 40,
    borrowSpeedPercentage: 60,
    distributor: CORE_XVS_DISTRIBUTOR,
  },
  {
    name: "vsFRAX",
    address: CORE_vsFRAX,
    reward: parseUnits("600", 18),
    supplySpeedPercentage: 40,
    borrowSpeedPercentage: 60,
    distributor: CORE_XVS_DISTRIBUTOR,
  },
  {
    name: "vTUSD",
    address: CORE_vTUSD,
    reward: parseUnits("200", 18),
    supplySpeedPercentage: 40,
    borrowSpeedPercentage: 60,
    distributor: CORE_XVS_DISTRIBUTOR,
  },
  {
    name: "vDAI",
    address: CORE_vDAI,
    reward: parseUnits("500", 18),
    supplySpeedPercentage: 40,
    borrowSpeedPercentage: 60,
    distributor: CORE_XVS_DISTRIBUTOR,
  },
];

export const CURVE_SPEEDS = [
  {
    name: "vCRV",
    address: CURVE_vCRV,
    reward: parseUnits("375", 18),
    supplySpeedPercentage: 40,
    borrowSpeedPercentage: 60,
    distributor: CURVE_XVS_DISTRIBUTOR,
  },
  {
    name: "vcrvUSD",
    address: CURVE_vcrvUSD,
    reward: parseUnits("375", 18),
    supplySpeedPercentage: 40,
    borrowSpeedPercentage: 60,
    distributor: CURVE_XVS_DISTRIBUTOR,
  },
];

export const LST_SPEEDS = [
  {
    name: "vWETH",
    address: LST_vwETH,
    reward: parseUnits("18333", 18),
    supplySpeedPercentage: 30,
    borrowSpeedPercentage: 70,
    distributor: LST_XVS_DISTRIBUTOR,
  },
  {
    name: "vwstETH",
    address: LST_vwstETH,
    reward: parseUnits("3600", 18),
    supplySpeedPercentage: 100,
    borrowSpeedPercentage: 0,
    distributor: LST_XVS_DISTRIBUTOR,
  },
];

export const BRIDGE_FEES = parseUnits("0.4", 18);
export const DEST_ENDPOINT_ID = 10161; // Sepolia chain
export const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
export const PERCENTAGE_OF_REAL_AMOUNT_BRIDGE = 10;
export const TOTAL_MONTHS = 3;
export const TOTAL_XVS_TO_BRIDGE = CORE_SPEEDS.concat(CURVE_SPEEDS)
  .concat(LST_SPEEDS)
  .reduce((acc, { reward }) => acc.add(reward), ethers.BigNumber.from(0))
  .mul(TOTAL_MONTHS)
  .div(PERCENTAGE_OF_REAL_AMOUNT_BRIDGE);

export const TOTAL_XVS_FOR_CORE = CORE_SPEEDS.reduce(
  (acc, { reward }) => acc.add(reward),
  ethers.BigNumber.from(0),
).mul(TOTAL_MONTHS);
export const TOTAL_XVS_FOR_CURVE = CURVE_SPEEDS.reduce(
  (acc, { reward }) => acc.add(reward),
  ethers.BigNumber.from(0),
).mul(TOTAL_MONTHS);
export const TOTAL_XVS_FOR_LST = LST_SPEEDS.reduce((acc, { reward }) => acc.add(reward), ethers.BigNumber.from(0)).mul(
  TOTAL_MONTHS,
);

export const BLOCKS_PER_YEAR = BigNumber.from(2628000); // assuming a block is mined every 12 seconds
export const BLOCKS_IN_30_DAYS = BLOCKS_PER_YEAR.mul(30).div(365);
const commands = CORE_SPEEDS.concat(CURVE_SPEEDS)
  .concat(LST_SPEEDS)
  .map(speed => {
    const totalAmount = speed.reward;
    const supplyAmount = totalAmount.mul(speed.supplySpeedPercentage).div(100);
    const supplySpeed = supplyAmount.div(BLOCKS_IN_30_DAYS);
    const borrowAmount = totalAmount.mul(speed.borrowSpeedPercentage).div(100);
    const borrowSpeed = borrowAmount.div(BLOCKS_IN_30_DAYS);

    return {
      target: speed.distributor,
      signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
      params: [[speed.address], [supplySpeed], [borrowSpeed]],
      value: "0",
      dstChainId: DEST_ENDPOINT_ID,
    };
  });

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
      {
        target: TREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [ETHEREUM_XVS, TOTAL_XVS_FOR_CORE, CORE_XVS_DISTRIBUTOR],
        dstChainId: DEST_ENDPOINT_ID,
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [ETHEREUM_XVS, TOTAL_XVS_FOR_CURVE, CURVE_XVS_DISTRIBUTOR],
        dstChainId: DEST_ENDPOINT_ID,
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [ETHEREUM_XVS, TOTAL_XVS_FOR_LST, LST_XVS_DISTRIBUTOR],
        dstChainId: DEST_ENDPOINT_ID,
      },
      ...commands,
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip322;
