import { ethers } from "hardhat";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const RESILIENT_ORACLE = "0x8000eca36201dddf5805Aa4BeFD73d1EB4D23264";
export const CHAINLINK_ORACLE = "0x102F0b714E5d321187A4b6E5993358448f7261cE";
export const REDSTONE_ORACLE = "0x4e6269Ef406B4CEE6e67BA5B5197c2FfD15099AE";
export const BOUND_VALIDATOR = "0x60c4Aa92eEb6884a76b309Dd8B3731ad514d6f9B";
export const DEFAULT_PROXY_ADMIN = "0x01435866babd91311b1355cf3af488cca36db68e";
export const RESILIENT_ORACLE_IMPLEMENTATION = "0xb4933AF59868986316Ed37fa865C829Eba2df0C7";
export const CHAINLINK_ORACLE_IMPLEMENTATION = "0xDCB0CfA130496c749738Acbe2d6aA06C7C320f06";
export const REDSTONE_ORACLE_IMPLEMENTATION = "0x6150997cd4B2f2366d1B0503F0DE020653b67BFe";
export const BOUND_VALIDATOR_IMPLEMENTATION = "0xB634cd4F8b1CF2132E05381Eee0f994DF964869D";
export const weETH_ORACLE = "0xf3ebD2A722c2039E6f66179Ad7F9f1462B14D8e0";
export const weETH = "0x3b8b6E96e57f0d1cD366AaCf4CcC68413aF308D0";
export const weETHsOracle = "0x660c6d8C5FDDC4F47C749E0f7e03634513f23e0e";
export const weETHs = "0xE233527306c2fa1E159e251a2E5893334505A5E0";
export const sFraxOracle = "0xac35DbBfACeDd301cB295DBeA57ddA7A032F0E41";
export const sFrax = "0xd85FfECdB4287587BC53c1934D548bF7480F11C4";
export const PTweETHOracle = "0x5CDE9fec66D89B931fB7a5DB8cFf2cDb642f4e7d";
export const PTweETH = "0x56107201d3e4b7Db92dEa0Edb9e0454346AEb8B5";
export const PTUSDeOracle = "0x16D54113De89ACE580918D15653e9C0d1DE05C35";
export const PTUSDe = "0x74671106a04496199994787B6BcB064d08afbCCf";
export const PTsUSDeOracle = "0x1bB3faB3813267d5b6c2abE5A284C621350544aD";
export const PTsUSDe = "0x3EBa2Aa29eC2498c2124523634324d4ce89c8579";
export const rsETH_Chainlink_Oracle = "0x3a6f2c02ec48dbEE4Ca406d701DCA2CC9d919EaD";
export const rsETH_Redstone_Oracle = "0xA1eA3cB0FeA73a6c53aB07CcC703Dc039D8EAFb4";
export const rsETH = "0xfA0614E5C803E15070d31f7C38d2d430EBe68E47";
export const ezETH_Chainlink_Oracle = "0x50196dfad5030ED54190F75e5F9d88600A4CA0B4";
export const ezETH_Redstone_Oracle = "0x987010fD82FDCe099174aC605B88E1cc35019ef4";
export const ezETH = "0xB8eb706b85Ae7355c9FE4371a499F50f3484809c";
export const sUSDeOracle = "0x93e19584359C6c5844f1f7E1621983418b5A892F";
export const sUSDe = "0xA3A3e5ecEA56940a4Ae32d0927bfd8821DdA848A";
export const sUSDSOracle = "0xb844Fc5cE6e9c0D0cB6E2336B0F86A3e4146DbfB";
export const sUSDS = "0xE9E34fd81982438E96Bd945f5810F910e35F0165";
export const yvUSDCOracle = "0x23c151c861c38544E5D09D7aBEDf2a4Cce1AfDa2";
export const yvUSDC = "0x9fE6052B9534F134171F567dAC9c9B22556c1DDb";
export const yvUSDTOracle = "0xcB99fcc1De353E69F970B499F945B41B3E35B404";
export const yvUSDT = "0x5cBA66C5415E56CC0Ace55148ffC63f61327478B";
export const yvUSDSOracle = "0x729d134355774224f7F65a85EF76b0EF08B31400";
export const yvUSDS = "0xC6A0e98B8D9E9F1160E9cE1f2E0172F41FB06BC2";
export const yvWETHOracle = "0x5fA77768b9b5927A1Ed4bc2C562AE375Cd1887A2";
export const yvWETH = "0x99AD7ecf9b1C5aC2A11BB00D7D8a7C54fCd41517";
export const eBTC = "0xd48392CCf3fe028023D0783E570DFc71996859d7";
export const eBTCOracle = "0x51Fa73926Cd9456A94221b70428aa94F009a5b81";
export const LBTC = "0x37798CaB3Adde2F4064afBc1C7F9bbBc6A826375";
export const LBTCOracle = "0x75C573Bf23FbD0bff9B764c037C9543a1690A23b";
export const pufETH = "0x6D9f78b57AEeB0543a3c3B32Cc038bFB14a4bA68";
export const pufETHOracle = "0xbD2272b9f426dF6D18468fe5117fCFd547D6882b";

export const ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const NORMAL_TIMELOCK = "0xc332F7D8D5eA72cf760ED0E1c0485c8891C6E0cF";
export const CRITICAL_TIMELOCK = "0xA24A7A65b8968a749841988Bd7d05F6a94329fDe";
export const FASTTRACK_TIMELOCK = "0x7F043F43Adb392072a3Ba0cC9c96e894C6f7e182";

export const vip501 = () => {
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
        dstChainId: LzChainId.sepolia,
      },
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [CHAINLINK_ORACLE, CHAINLINK_ORACLE_IMPLEMENTATION],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [REDSTONE_ORACLE, REDSTONE_ORACLE_IMPLEMENTATION],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [BOUND_VALIDATOR, BOUND_VALIDATOR_IMPLEMENTATION],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", NORMAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", CRITICAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", CRITICAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", CRITICAL_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfigs((address,address[3],bool[3],bool)[])",
        params: [
          [
            [
              weETH,
              [weETH_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [
              weETHs,
              [weETHsOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [
              sFrax,
              [sFraxOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [
              PTweETH,
              [PTweETHOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [
              PTUSDe,
              [PTUSDeOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [
              PTsUSDe,
              [PTsUSDeOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [rsETH, [rsETH_Redstone_Oracle, rsETH_Chainlink_Oracle, rsETH_Chainlink_Oracle], [true, true, true], false],
            [ezETH, [ezETH_Redstone_Oracle, ezETH_Chainlink_Oracle, ezETH_Chainlink_Oracle], [true, true, true], false],
            [
              sUSDe,
              [sUSDeOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [
              sUSDS,
              [sUSDSOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [
              yvUSDC,
              [yvUSDCOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [
              yvUSDT,
              [yvUSDTOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [
              yvUSDS,
              [yvUSDSOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [
              yvWETH,
              [yvWETHOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [
              eBTC,
              [eBTCOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [
              LBTC,
              [LBTCOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            [
              pufETH,
              [pufETHOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip501;
