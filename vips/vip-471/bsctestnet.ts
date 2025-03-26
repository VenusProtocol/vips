import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { POOL_REGISTRY, VTREASURY, ACCESS_CONTROL_MANAGER, NORMAL_TIMELOCK } = NETWORK_ADDRESSES["bsctestnet"];

export const COMPTROLLER_CORE = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const PROTOCOL_SHARE_RESERVE = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";
const REDUCE_RESERVES_BLOCK_DELTA = "28800";

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

export const marketSpec = {
  vToken: {
    address: "0x9447b1D4Bd192f25416B6aCc3B7f06be2f7D6309",
    name: "Venus lisUSD",
    symbol: "vlisUSD",
    underlying: {
      address: "0xe73774DfCD551BF75650772dC2cC56a2B6323453",
      decimals: 18,
      symbol: "lisUSD",
    },
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_CORE,
  },
  interestRateModel: {
    address: "0x4348FC0CBD4ab6E46311ef90ba706169e50fC804",
    base: "0",
    multiplier: "0.1",
    jump: "2.5",
    kink: "0.8",
  },
  initialSupply: {
    amount: parseUnits("1000000", 18),
    vTokenReceiver: VTREASURY,
  },
  riskParameters: {
    collateralFactor: parseUnits("0.5", 18),
    reserveFactor: parseUnits("0.1", 18),
    supplyCap: parseUnits("12000000", 18),
    borrowCap: parseUnits("10000000", 18),
  },
};

const vip471 = () => {
  const meta = {
    version: "v2",
    title: "lisUSD",
    description: `lisUSD`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Add Market
      {
        target: marketSpec.vToken.comptroller,
        signature: "_supportMarket(address)",
        params: [marketSpec.vToken.address],
      },
      {
        target: marketSpec.vToken.comptroller,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[marketSpec.vToken.address], [marketSpec.riskParameters.supplyCap]],
      },
      {
        target: marketSpec.vToken.comptroller,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[marketSpec.vToken.address], [marketSpec.riskParameters.borrowCap]],
      },
      {
        target: marketSpec.vToken.comptroller,
        signature: "_setCollateralFactor(address,uint256)",
        params: [marketSpec.vToken.address, marketSpec.riskParameters.collateralFactor],
      },
      {
        target: marketSpec.vToken.address,
        signature: "setAccessControlManager(address)",
        params: [ACCESS_CONTROL_MANAGER],
      },
      {
        target: marketSpec.vToken.address,
        signature: "setProtocolShareReserve(address)",
        params: [PROTOCOL_SHARE_RESERVE],
      },
      {
        target: marketSpec.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: [REDUCE_RESERVES_BLOCK_DELTA],
      },
      {
        target: marketSpec.vToken.address,
        signature: "_setReserveFactor(uint256)",
        params: [marketSpec.riskParameters.reserveFactor],
      },
      // Mint initial supply
      {
        target: marketSpec.vToken.underlying.address,
        signature: "faucet(uint256)",
        params: [marketSpec.initialSupply.amount],
      },
      {
        target: marketSpec.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [marketSpec.vToken.address, marketSpec.initialSupply.amount],
      },
      {
        target: marketSpec.vToken.address,
        signature: "mintBehalf(address,uint256)",
        params: [marketSpec.initialSupply.vTokenReceiver, marketSpec.initialSupply.amount],
      },
      {
        target: marketSpec.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [marketSpec.vToken.address, 0],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip471;
