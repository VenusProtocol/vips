import { ethers } from "hardhat";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const NEW_VBEP20_DELEGATE_IMPL = "0xc3279442a5aCaCF0A2EcB015d1cDDBb3E0f3F775";
const ACCESS_CONTROL_MANAGER = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

interface AssetConfig {
  name: string;
  address: string;
  reduceReservesBlockDelta: number;
  holder: string; // Defines underlying is MockToken
}

export const CORE_MARKETS: AssetConfig[] = [
  {
    name: "vAAVE",
    address: "0x26DA28954763B92139ED49283625ceCAf52C6f94",
    reduceReservesBlockDelta: 28800,
    holder: "0x5a52E96BAcdaBb82fd05763E25335261B270Efcb",
  },
  {
    name: "vADA",
    address: "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vBCH",
    address: "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vBETH",
    address: "0x972207A639CC1B374B893cc33Fa251b55CEB7c07",
    reduceReservesBlockDelta: 28800,
    holder: "0xF68a4b64162906efF0fF6aE34E2bB1Cd42FEf62d",
  },
  {
    name: "vBTC",
    address: "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vCAKE",
    address: "0x86aC3974e2BD0d60825230fa6F355fF11409df5c",
    reduceReservesBlockDelta: 28800,
    holder: "0x000000000000000000000000000000000000dEaD",
  },
  {
    name: "vDAI",
    address: "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vDOGE",
    address: "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71",
    reduceReservesBlockDelta: 28800,
    holder: "0x0000000000000000000000000000000000001004",
  },
  {
    name: "vDOT",
    address: "0x1610bc33319e9398de5f57B33a5b184c806aD217",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vETH",
    address: "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vFIL",
    address: "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vLINK",
    address: "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vLTC",
    address: "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vMATIC",
    address: "0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vSXP",
    address: "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vTRX",
    address: "0xC5D3466aA484B040eE977073fcF337f2c00071c1",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vTUSD",
    address: "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vUSDC",
    address: "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vUSDT",
    address: "0xfD5840Cd36d94D7229439859C0112a4185BC0255",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vWBETH",
    address: "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vXRP",
    address: "0xB248a295732e0225acd3337607cc01068e3b9c10",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
  {
    name: "vXVS",
    address: "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D",
    reduceReservesBlockDelta: 28800,
    holder: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  },
];

export const vip192 = () => {
  const meta = {
    version: "v2",
    title: "VIP-192 VToken Upgrade of AIA",
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
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "_setReserveFactor(uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "_setInterestRateModel(address)", NORMAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "_reduceReserves(uint256)", NORMAL_TIMELOCK],
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
