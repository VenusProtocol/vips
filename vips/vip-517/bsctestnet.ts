import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;

export const BOUND_VALIDATOR = "0x2842140e4Ad3a92e9af30e27e290300dd785076d";
export const DEFAULT_PROXY_ADMIN = "0xef480a5654b231ff7d80A0681F938f3Db71a6Ca6";
export const RESILIENT_ORACLE_IMPLEMENTATION = "0x42D122E8BB9CCBe950F8b04a8c5909DbE14Be819";
export const CHAINLINK_ORACLE_IMPLEMENTATION = "0xBea89b7560Ec88f75f31A8E62da7F2d52c807416";
export const BINANCE_ORACLE_IMPLEMENTATION = "0x8dA774a84e20BBFA5d62c3718feE5f1753046e0C";
export const REDSTONE_ORACLE_IMPLEMENTATION = "0xfFEd0a672A59F506a75E45e245fCec02aF99eb66";
export const BOUND_VALIDATOR_IMPLEMENTATION = "0xa51509c7a811a668F617B14146533E28B034CFdB";
export const PTsUSDE26JUN2025Oracle = "0x85201328baa52061E6648d9b4c285529411Cd33B";
export const PTsUSDE26JUN2025 = "0x95e58161BA2423c3034658d957F3f5b94DeAbf81";
export const sUSDe_Chainlink_Oracle = "0x4678BcB5B8eDd9f853725F64d59Ba592F9e41565";
export const sUSDe_Redstone_Oracle = "0xA5b51bF1625c1F90341c4527AFa5B0865F15ac70";
export const sUSDe = "0xcFec590e417Abb378cfEfE6296829E35fa25cEbd";
export const xSolvBTCOracle = "0x33a2BDcBB401a81C590215a6953A9a4B90aD57b9";
export const xSolvBTC = "0x3ea87323806586A0282b50377e0FEa76070F532B";
export const ankrBNBOracle = "0x7655d558c3C865913013D82fF4d1e70e97cDf906";
export const ankrBNB = "0x5269b7558D3d5E113010Ef1cFF0901c367849CC9";
export const asBNBOracle = "0xb31909f6687Da5bEc559DB7baeed41E14f5Dc17E";
export const asBNB = "0xc625f060ad25f4A6c2d9eBF30C133dB61B7AF072";
export const BNBxOracle = "0x068945930785e6816faE855a2A2e8c59BAD380f0";
export const BNBx = "0x327d6E6FAC0228070884e913263CFF9eFed4a2C8";
export const slisBNBOracle = "0x6a8154699b6670Ba6166ba59d1c094663E603cA8";
export const slisBNB = "0xd2aF6A916Bc77764dc63742BC30f71AF4cF423F4";

export const vip517 = () => {
  const meta = {
    version: "v2",
    title: "VIP-518 [BNB Chain]",
    description: "[VIP-18] Update oracles implementation in BNB",
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [bsctestnet.RESILIENT_ORACLE, RESILIENT_ORACLE_IMPLEMENTATION],
      },
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [bsctestnet.CHAINLINK_ORACLE, CHAINLINK_ORACLE_IMPLEMENTATION],
      },
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [bsctestnet.REDSTONE_ORACLE, REDSTONE_ORACLE_IMPLEMENTATION],
      },
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [BOUND_VALIDATOR, BOUND_VALIDATOR_IMPLEMENTATION],
      },
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [bsctestnet.BINANCE_ORACLE, BINANCE_ORACLE_IMPLEMENTATION],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", bsctestnet.CRITICAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", bsctestnet.CRITICAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", bsctestnet.CRITICAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", bsctestnet.FAST_TRACK_TIMELOCK],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", bsctestnet.FAST_TRACK_TIMELOCK],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", bsctestnet.FAST_TRACK_TIMELOCK],
      },
      {
        target: bsctestnet.RESILIENT_ORACLE,
        signature: "setTokenConfigs((address,address[3],bool[3],bool)[])",
        params: [
          [
            [
              xSolvBTC,
              [xSolvBTCOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [
              PTsUSDE26JUN2025,
              [PTsUSDE26JUN2025Oracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [
              ankrBNB,
              [ankrBNBOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [
              asBNB,
              [asBNBOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [sUSDe, [sUSDe_Redstone_Oracle, sUSDe_Chainlink_Oracle, sUSDe_Chainlink_Oracle], [true, true, true], false],
            [
              BNBx,
              [BNBxOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [
              slisBNB,
              [slisBNBOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
          ],
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip517;
