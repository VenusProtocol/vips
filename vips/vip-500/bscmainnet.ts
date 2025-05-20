import { ethers } from "hardhat";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const RESILIENT_ORACLE = "0xd2ce3fb018805ef92b8C5976cb31F84b4E295F94";
export const CHAINLINK_ORACLE = "0x94c3A2d6B7B2c051aDa041282aec5B0752F8A1F2";
export const REDSTONE_ORACLE = "0x0FC8001B2c9Ec90352A46093130e284de5889C86";
export const BOUND_VALIDATOR = "0x1Cd5f336A1d28Dff445619CC63d3A0329B4d8a58";
export const DEFAULT_PROXY_ADMIN = "0x567e4cc5e085d09f66f836fa8279f38b4e5866b9";
export const RESILIENT_ORACLE_IMPLEMENTATION = "0x582d6d131e93D81676e82f032B2Dfa638F4E3275";
export const CHAINLINK_ORACLE_IMPLEMENTATION = "0x36EFe8716fa2ff9f59D528d154D89054581866A5";
export const REDSTONE_ORACLE_IMPLEMENTATION = "0xa3b4A56bf47a93459293CFA5E3D20c4f49C8643C";
export const BOUND_VALIDATOR_IMPLEMENTATION = "0x955c01a8307618Ac3e5Fc08a7444f5cB6bD7d71e";
export const weETH_ORACLE = "0x07ac126C57640a53DFf378FF6A8603bEdF9fE94d";
export const weETH = "0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee";
export const weETHsOracle = "0x77f5deEcd0418c396dB9A5fbf37e36D85c996CE5";
export const weETHs = "0x917ceE801a67f933F2e6b33fC0cD1ED2d5909D88";
export const sFraxOracle = "0x0e86F8203DAd5681bD512C3C0B49948b234a6023";
export const sFrax = "0xA663B02CF0a4b149d2aD41910CB81e23e1c41c32";
export const PTweETHOracle = "0xB89C0F93442C269271cB4e9Acd10E81D3fC237Ba";
export const PTweETH = "0x6ee2b5E19ECBa773a352E5B21415Dc419A700d1d";
export const PTUSDeOracle = "0x4CD93DcD2E11835D06a45F7eF9F7225C249Bb6Db";
export const PTUSDe = "0x8A47b431A7D947c6a3ED6E42d501803615a97EAa";
export const PTsUSDeOracle = "0x51B83bbbdCa078b2497C41c9f54616D1aDBEF86F";
export const PTsUSDe = "0xE00bd3Df25fb187d6ABBB620b3dfd19839947b81";
export const rsETH_Chainlink_Oracle = "0xc68A156b08C5C5C2e9c27B32A09977F3FA50FFE0";
export const rsETH_Redstone_Oracle = "0x6AC694f2D118a35e1984AE590B916108F4f9337F";
export const rsETH = "0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7";
export const ezETH_Chainlink_Oracle = "0x84FAe9909Fa1F259CB23Fa14FCdd1a35A0FE7EB8";
export const ezETH_Redstone_Oracle = "0xA6efeF98D9C4E9FF8193f80FbABF92AD92D50500";
export const ezETH = "0xbf5495Efe5DB9ce00f80364C8B423567e58d2110";
export const sUSDeOracle = "0x3150b7Ff6687a94dBdF0a3A7E99B20Dad428EA16";
export const sUSDe = "0x9D39A5DE30e57443BfF2A8307A4256c8797A3497";
export const sUSDSOracle = "0x4bfEB803d1156453198f2820450A2B64301e9E4C";
export const sUSDS = "0xa3931d71877C0E7a3148CB7Eb4463524FEc27fbD";
export const yvUSDCOracle = "0x74E7b5D3eD9b80473D5B28a6bd11C9C7E510b284";
export const yvUSDC = "0xBe53A109B500E5c9f97b9Cd39Fe969BE68BF6204";
export const yvUSDTOracle = "0x0011b8A451DC619Dc39f5cB968A9dce329246FCF";
export const yvUSDT = "0x310B7Ea7475A0B449Cfd73bE81522F1B88eFAFaa";
export const yvUSDSOracle = "0x3Bd4E87c0BD4FF33261D39fd0d5b1c9Cc468bBb5";
export const yvUSDS = "0x182863131F9a4630fF9E27830d945B1413e347E8";
export const yvWETHOracle = "0xC14a07b33a49b2e663ACBC2DDc6e34d9e5ea1Ab8";
export const yvWETH = "0xc56413869c6CDf96496f2b1eF801fEDBdFA7dDB0";

export const vip500 = () => {
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
        params: [RESILIENT_ORACLE, RESILIENT_ORACLE_IMPLEMENTATION],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [CHAINLINK_ORACLE, CHAINLINK_ORACLE_IMPLEMENTATION],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [REDSTONE_ORACLE, REDSTONE_ORACLE_IMPLEMENTATION],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [BOUND_VALIDATOR, BOUND_VALIDATOR_IMPLEMENTATION],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            weETH,
            [weETH_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            weETHs,
            [weETHsOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            sFrax,
            [sFraxOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            PTweETH,
            [PTweETHOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            PTUSDe,
            [PTUSDeOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            PTsUSDe,
            [PTsUSDeOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            rsETH,
            [rsETH_Redstone_Oracle, rsETH_Chainlink_Oracle, rsETH_Chainlink_Oracle],
            [true, true, true],
            false,
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            ezETH,
            [ezETH_Redstone_Oracle, ezETH_Chainlink_Oracle, ezETH_Chainlink_Oracle],
            [true, true, true],
            false,
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            sUSDe,
            [sUSDeOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            sUSDS,
            [sUSDSOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            yvUSDC,
            [yvUSDCOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            yvUSDT,
            [yvUSDTOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            yvUSDS,
            [yvUSDSOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            yvWETH,
            [yvWETHOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip500;
