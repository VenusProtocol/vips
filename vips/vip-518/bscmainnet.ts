import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const BOUND_VALIDATOR = "0x6E332fF0bB52475304494E4AE5063c1051c7d735";
export const DEFAULT_PROXY_ADMIN = "0x1BB765b741A5f3C2A338369DAb539385534E3343";
export const RESILIENT_ORACLE_IMPLEMENTATION = "0x90d840f463c4E341e37B1D51b1aB16Bc5b34865C";
export const CHAINLINK_ORACLE_IMPLEMENTATION = "0x219cFfEFB1afA9F34695C7fACD9B98d1b3291C8b";
export const BINANCE_ORACLE_IMPLEMENTATION = "0x201C72986d391A5a8E1713ac5a42CEAf90556a1b";
export const REDSTONE_ORACLE_IMPLEMENTATION = "0x452FeCfa5dd59243EeC214577345d21F7D8AC5Bf";
export const BOUND_VALIDATOR_IMPLEMENTATION = "0xbE4176749a74320641e24102B2Af2Ca37FAF2DF1";
export const PTsUSDe_ORACLE = "0xC407403fa78Bce509821D776b6Be7f91cC04474f";
export const PTsUSDE_26JUN2025 = "0xDD809435ba6c9d6903730f923038801781cA66ce";
export const SUSDE_ONEJUMP_CHAINLINK_ORACLE = "0xA67F01322AF8EBa444D788Ee398775b446de51a0";
export const SUSDE_ONEJUMP_REDSTONE_ORACLE = "0x2B2895104f958E1EC042E6Ba5cbfeCbAD3C5beDb";
export const SUSDE = "0x211Cc4DD073734dA055fbF44a2b4667d5E5fE5d2";
export const USDE = "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34";
export const XSOLVBTC_ONEJUMP_REDSTONE_ORACLE = "0xf5534f78Df9b610B19A63956d498d00CFaD8B9D3";
export const XSOLVBTC = "0x1346b618dC92810EC74163e4c27004c921D446a5";
export const AnkrBNB_ORACLE = "0x4512e9579734f7B8730f0a05Cd0D92DC33EB2675";
export const AnkrBNB = "0x52f24a5e03aee338da5fd9df68d2b6fae1178827";
export const AsBNB_ORACLE = "0x652B90D1d45a7cD5BE82c5Fb61a4A00bA126dde5";
export const AsBNB = "0x77734e70b6E88b4d82fE632a168EDf6e700912b6";
export const BNBx_ORACLE = "0xC2E2b6f9CdE2BFA5Ba5fda2Dd113CAcD781bdb31";
export const BNBx = "0x1bdd3cf7f79cfb8edbb955f20ad99211551ba275";
export const SlisBNB_ORACLE = "0xDDE6446E66c786afF4cd3D183a908bCDa57DF9c1";
export const SlisBNB = "0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B";
export const PT_SUSDE_FIXED_PRICE = parseUnits("1.05", 18);

const getPendleOracleCommand = (mockPendleOracleConfiguration: boolean) => {
  if (mockPendleOracleConfiguration) {
    return [
      {
        target: bscmainnet.REDSTONE_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [PTsUSDE_26JUN2025, PT_SUSDE_FIXED_PRICE],
      },
      {
        target: bscmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            PTsUSDE_26JUN2025,
            [bscmainnet.REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
      },
    ];
  } else {
    return [
      {
        target: bscmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            PTsUSDE_26JUN2025,
            [PTsUSDe_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
      },
    ];
  }
};

export const vip518 = () => {
  const meta = {
    version: "v2",
    title: "",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_IMPLEMENTATION],
      },
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [bscmainnet.CHAINLINK_ORACLE, CHAINLINK_ORACLE_IMPLEMENTATION],
      },
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [bscmainnet.REDSTONE_ORACLE, REDSTONE_ORACLE_IMPLEMENTATION],
      },
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [BOUND_VALIDATOR, BOUND_VALIDATOR_IMPLEMENTATION],
      },
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [bscmainnet.BINANCE_ORACLE, BINANCE_ORACLE_IMPLEMENTATION],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", bscmainnet.CRITICAL_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", bscmainnet.CRITICAL_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", bscmainnet.CRITICAL_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", bscmainnet.FAST_TRACK_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", bscmainnet.FAST_TRACK_TIMELOCK],
      },
      {
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", bscmainnet.FAST_TRACK_TIMELOCK],
      },

      {
        target: bscmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfigs((address,address[3],bool[3],bool)[])",
        params: [
          [
            [
              XSOLVBTC,
              [XSOLVBTC_ONEJUMP_REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [
              AnkrBNB,
              [AnkrBNB_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [
              AsBNB,
              [AsBNB_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [
              SUSDE,
              [SUSDE_ONEJUMP_REDSTONE_ORACLE, SUSDE_ONEJUMP_CHAINLINK_ORACLE, SUSDE_ONEJUMP_CHAINLINK_ORACLE],
              [true, true, true],
              false,
            ],
            [
              BNBx,
              [BNBx_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [
              SlisBNB,
              [SlisBNB_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
          ],
        ],
      },
      ...getPendleOracleCommand(true),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip518;
