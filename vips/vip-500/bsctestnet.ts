import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { RESILIENT_ORACLE, REDSTONE_ORACLE, UNITROLLER, ACCESS_CONTROL_MANAGER, VTREASURY } =
  NETWORK_ADDRESSES.bsctestnet;
export const PROTOCOL_SHARE_RESERVE = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";
export const USD1 = "0x7792af341a10ccc4B1CDd7B317F0460a37346a0A";
export const VUSD1 = "0x519e61D2CDA04184FB086bbD2322C1bfEa0917Cf";
export const REDUCE_RESERVES_BLOCK_DELTA = "28800";

export const marketSpec = {
  vToken: {
    address: VUSD1,
    name: "Venus USD1",
    symbol: "vUSD1",
    underlying: {
      address: USD1,
      decimals: 18,
      symbol: "USD1",
    },
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: UNITROLLER,
    isLegacyPool: true,
  },
  interestRateModel: {
    model: "jump",
    baseRatePerYear: "0",
    multiplierPerYear: "0.1",
    jumpMultiplierPerYear: "2.5",
    kink: "0.8",
  },
  initialSupply: {
    amount: parseUnits("4988.032727667459257279", 18),
    vTokenReceiver: VTREASURY,
  },
  riskParameters: {
    supplyCap: parseUnits("16000000", 18),
    borrowCap: parseUnits("14400000", 18),
    collateralFactor: parseUnits("0", 18),
    reserveFactor: parseUnits("0.2", 18),
  },
};

export const vip500 = () => {
  const meta = {
    version: "v2",
    title: "VIP-3195 [BNB Chain] Add support for USD1 on Venus Core Pool",
    description: "",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Configure Oracle
      {
        target: REDSTONE_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [marketSpec.vToken.underlying.address, parseUnits("1", 18)],
      },

      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            marketSpec.vToken.underlying.address,
            [REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
      },

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

      {
        target: marketSpec.vToken.comptroller,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[marketSpec.vToken.address], [7], true],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip500;
