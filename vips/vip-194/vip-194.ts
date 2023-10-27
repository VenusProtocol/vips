import { ethers } from "hardhat";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const VTOKEN_BEACON = "0x2b8A1C539ABaC89CbF7E2Bc6987A0A38A5e660D4";
const NEW_IMPL_VTOKEN = "0x1Db646E1Ab05571AF99e47e8F909801e5C99d37B";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
const ACCESS_CONTROL_MANAGER = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

interface AssetConfig {
  name: string;
  address: string;
  reduceReservesBlockDelta: number;
  holder: string; // Used by the simulation
}

export const IL_MARKETS: AssetConfig[] = [
  {
    name: "vHAY_Stablecoins",
    address: "0xCa2D81AA7C09A1a025De797600A7081146dceEd9",
    reduceReservesBlockDelta: 28800,
    holder: "0x192D4e2E19A01e49b30Fb3894A01B6e08947d9CA",
  },
  {
    name: "vUSDD_Stablecoins",
    address: "0xc3a45ad8812189cAb659aD99E64B1376f6aCD035",
    reduceReservesBlockDelta: 28800,
    holder: "0xCa266910d92a313E5F9eb1AfFC462bcbb7d9c4A9",
  },
  {
    name: "vUSDT_Stablecoins",
    address: "0x5e3072305F9caE1c7A82F6Fe9E38811c74922c3B",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vagEUR_Stablecoins",
    address: "0x795DE779Be00Ea46eA97a28BDD38d9ED570BCF0F",
    reduceReservesBlockDelta: 28800,
    holder: "0x7B1db35fbd95548777B9079527e8fa2a70fb2CE0",
  },
  {
    name: "vBSW_DeFi",
    address: "0x8f657dFD3a1354DEB4545765fE6840cc54AFd379",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vALPACA_DeFi",
    address: "0x02c5Fb0F26761093D297165e902e96D08576D344",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vUSDT_DeFi",
    address: "0x1D8bBDE12B6b34140604E18e9f9c6e14deC16854",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vUSDD_DeFi",
    address: "0xA615467caE6B9E0bb98BC04B4411d9296fd1dFa0",
    reduceReservesBlockDelta: 28800,
    holder: "0xCa266910d92a313E5F9eb1AfFC462bcbb7d9c4A9",
  },
  {
    name: "vANKR_DeFi",
    address: "0x19CE11C8817a1828D1d357DFBF62dCf5b0B2A362",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vankrBNB_DeFi",
    address: "0x53728FD51060a85ac41974C6C3Eb1DaE42776723",
    reduceReservesBlockDelta: 28800,
    holder: "0x25b21472c073095bebC681001Cbf165f849eEe5E",
  },
  {
    name: "vTWT_DeFi",
    address: "0x736bf1D21A28b5DC19A1aC8cA71Fc2856C23c03F",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vRACA_GameFi",
    address: "0xE5FE5527A5b76C75eedE77FdFA6B80D52444A465",
    reduceReservesBlockDelta: 28800,
    holder: "0xC882b111A75C0c657fC507C04FbFcD2cC984F071",
  },
  {
    name: "vFLOKI_GameFi",
    address: "0xc353B7a1E13dDba393B5E120D4169Da7185aA2cb",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vUSDD_GameFi",
    address: "0x9f2FD23bd0A5E08C5f2b9DD6CF9C96Bfb5fA515C",
    reduceReservesBlockDelta: 28800,
    holder: "0xCa266910d92a313E5F9eb1AfFC462bcbb7d9c4A9",
  },
  {
    name: "vUSDT_GameFi",
    address: "0x4978591f17670A846137d9d613e333C38dc68A37",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vankrBNB_LiquidStakedBNB",
    address: "0xBfe25459BA784e70E2D7a718Be99a1f3521cA17f",
    reduceReservesBlockDelta: 28800,
    holder: "0x25b21472c073095bebC681001Cbf165f849eEe5E",
  },
  {
    name: "vBNBx_LiquidStakedBNB",
    address: "0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791",
    reduceReservesBlockDelta: 28800,
    holder: "0xFF4606bd3884554CDbDabd9B6e25E2faD4f6fc54",
  },
  {
    name: "vstkBNB_LiquidStakedBNB",
    address: "0xcc5D9e502574cda17215E70bC0B4546663785227",
    reduceReservesBlockDelta: 28800,
    holder: "0x98CB81d921B8F5020983A46e96595471Ad4E60Be",
  },
  {
    name: "vSnBNB_LiquidStakedBNB",
    address: "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A",
    reduceReservesBlockDelta: 28800,
    holder: "0x6F28FeC449dbd2056b76ac666350Af8773E03873",
  },
  {
    name: "vWBNB_LiquidStakedBNB",
    address: "0xe10E80B7FD3a29fE46E16C30CC8F4dd938B742e2",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vBTT_Tron",
    address: "0x49c26e12959345472E2Fd95E5f79F8381058d3Ee",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vTRX_Tron",
    address: "0x836beb2cB723C498136e1119248436A645845F4E",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vWIN_Tron",
    address: "0xb114cfA615c828D88021a41bFc524B800E64a9D5",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vUSDD_Tron",
    address: "0xf1da185CCe5BeD1BeBbb3007Ef738Ea4224025F7",
    reduceReservesBlockDelta: 28800,
    holder: "0xCa266910d92a313E5F9eb1AfFC462bcbb7d9c4A9",
  },
  {
    name: "vUSDT_Tron",
    address: "0x281E5378f99A4bc55b295ABc0A3E7eD32Deba059",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
];

export const vip194 = () => {
  const meta = {
    version: "v2",
    title: "VIP-194 VToken Upgrade of AIA in IL",
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
        params: [ethers.constants.AddressZero, "setReduceReservesBlockDelta(uint256)", NORMAL_TIMELOCK],
      },
      {
        target: VTOKEN_BEACON,
        signature: "upgradeTo(address)",
        params: [NEW_IMPL_VTOKEN],
      },
      ...IL_MARKETS.map(asset => {
        return {
          target: asset.address,
          signature: "setReduceReservesBlockDelta(uint256)",
          params: [asset.reduceReservesBlockDelta],
        };
      }),
      ...IL_MARKETS.map(asset => {
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
