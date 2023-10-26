import { ethers } from "hardhat";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const NEW_VBEP20_DELEGATE_IMPL = "0xc3279442a5aCaCF0A2EcB015d1cDDBb3E0f3F775";
const ACCESS_CONTROL_MANAGER = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

interface AssetConfig {
  name: string;
  address: string;
  reduceReservesBlockDelta: number;
  holder: string; // Used by the simulation
}

export const CORE_MARKETS: AssetConfig[] = [
  {
    name: "vTRXOLD",
    address: "0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93",
    reduceReservesBlockDelta: 28800,
    holder: "0xe2fc31F816A9b94326492132018C3aEcC4a93aE1",
  },
  {
    name: "vTUSDOLD",
    address: "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3",
    reduceReservesBlockDelta: 28800,
    holder: "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3",
  },
];

export const vip193 = () => {
  const meta = {
    version: "v2",
    title: "VIP-193 VToken Upgrade of AIA Part - 2",
    description: `upgrade the implementation of the Vtoken core supportimg Automatic income allocation feature.`,
    forDescription: "I agree that Venus Protocol should proceed with VToken Upgrade of AIA",
    againstDescription: "I do not think that Venus Protocol should proceed with VToken Upgrade of AIA",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with VToken Upgrade of AIA or not",
  };

  return makeProposal(
    [
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setReduceReservesBlockDelta(uint256)", NORMAL_TIMELOCK], // Permission to success vip simulations (remove later)
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setReduceReservesBlockDelta(uint256)", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setReduceReservesBlockDelta(uint256)", CRITICAL_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "_setReserveFactor(uint256)", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "_setReserveFactor(uint256)", CRITICAL_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "_setInterestRateModel(address)", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "_setInterestRateModel(address)", CRITICAL_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "_reduceReserves(uint256)", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "_reduceReserves(uint256)", CRITICAL_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [COMPTROLLER, "_setCollateralFactor(address,uint256)", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [COMPTROLLER, "_setCollateralFactor(address,uint256)", CRITICAL_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [COMPTROLLER, "_setMarketBorrowCaps(address[],uint256[])", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [COMPTROLLER, "_setMarketBorrowCaps(address[],uint256[])", CRITICAL_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [COMPTROLLER, "_setMarketSupplyCaps(address[],uint256[])", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [COMPTROLLER, "_setMarketSupplyCaps(address[],uint256[])", CRITICAL_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [COMPTROLLER, "_setProtocolPaused(bool)", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [COMPTROLLER, "_setProtocolPaused(bool)", CRITICAL_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [COMPTROLLER, "_setActionsPaused(address[],uint8[],bool)", FAST_TRACK_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [COMPTROLLER, "_setActionsPaused(address[],uint8[],bool)", CRITICAL_TIMELOCK],
      },

      ...CORE_MARKETS.map(asset => {
        return {
          target: asset.address,
          signature: "_setImplementation(address,bool,bytes)",
          params: [NEW_VBEP20_DELEGATE_IMPL, false, "0x"],
        };
      }),

      ...CORE_MARKETS.map(asset => {
        return {
          target: asset.address,
          signature: "setAccessControlManager(address)",
          params: [ACCESS_CONTROL_MANAGER],
        };
      }),

      ...CORE_MARKETS.map(asset => {
        return {
          target: asset.address,
          signature: "setReduceReservesBlockDelta(uint256)",
          params: [asset.reduceReservesBlockDelta],
        };
      }),

      ...CORE_MARKETS.map(asset => {
        return {
          target: asset.address,
          signature: "setProtocolShareReserve(address)",
          params: [PROTOCOL_SHARE_RESERVE],
        };
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
