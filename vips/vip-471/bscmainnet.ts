import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";
import { NORMAL_TIMELOCK } from "src/vip-framework";

const { VTREASURY, ACCESS_CONTROL_MANAGER } = NETWORK_ADDRESSES.bscmainnet;

export const COMPTROLLER_CORE = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
const REDUCE_RESERVES_BLOCK_DELTA = "28800";

export const marketSpec = {
  vToken: {
    address: "0x689E0daB47Ab16bcae87Ec18491692BF621Dc6Ab",
    name: "Venus lisUSD",
    symbol: "vlisUSD",
    underlying: {
      address: "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5",
      decimals: 18,
      symbol: "SOL",
    },
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_CORE,
  },
  interestRateModel: {
    address: "0x62A8919C4C413fd4F9aef7348540Bc4B1b5CC805",
    base: "0",
    multiplier: "0.1",
    jump: "2.5",
    kink: "0.8",
  },
  initialSupply: {
    amount: parseUnits("1000000", 18),
    vTokenReceiver: "0x1d60bBBEF79Fb9540D271Dbb01925380323A8f66",
  },
  riskParameters: {
    collateralFactor: parseUnits("0.5", 18),
    reserveFactor: parseUnits("0.1", 18),
    supplyCap: parseUnits("12000000", 18),
    borrowCap: parseUnits("10000000", 18),
  },
};

export const vip471 = () => {
  const meta = {
    version: "v2",
    title: "VIP-471",
    description: ``,
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
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [marketSpec.vToken.underlying.address, marketSpec.initialSupply.amount, NORMAL_TIMELOCK],
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
