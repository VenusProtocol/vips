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
export const weETH_ORACLE = "0xaB663D4a701229DFF407Eb4B45007921029072e9";
export const weETH = "0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee";
export const weETHsOracle = "0x47F7A7f3486b08A019E0c10Af969ADC4B6E415Cd";
export const weETHs = "0x917ceE801a67f933F2e6b33fC0cD1ED2d5909D88";
export const sFraxOracle = "0x1aDCE75BB3164bBf6060a4f44262df5414473110";
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
export const sUSDeOracle = "0xaE847E81ff6dD2bdFB1fD563ccB4f848c74D2B70";
export const sUSDe = "0x9D39A5DE30e57443BfF2A8307A4256c8797A3497";
export const sUSDSOracle = "0xEC3865a8a5DCb8C507781DA17A38b754E3d01C50";
export const sUSDS = "0xa3931d71877C0E7a3148CB7Eb4463524FEc27fbD";
export const yvUSDCOracle = "0xA938eFfc4f68262E17eAcfAFD41Ee68b0F8874D1";
export const yvUSDC = "0xBe53A109B494E5c9f97b9Cd39Fe969BE68BF6204";
export const yvUSDTOracle = "0xbC0289BFbF3F14af0829f10640a7B7E539910723";
export const yvUSDT = "0x310B7Ea7475A0B449Cfd73bE81522F1B88eFAFaa";
export const yvUSDSOracle = "0xE6eB6A0321CA8c18A3e4C31E36954467f72670EF";
export const yvUSDS = "0x182863131F9a4630fF9E27830d945B1413e347E8";
export const yvWETHOracle = "0x38b3643c1b5160591073cc4121Bd91A456F14Acd";
export const yvWETH = "0xc56413869c6CDf96496f2b1eF801fEDBdFA7dDB0";
export const eBTC = "0x657e8C867D8B37dCC18fA4Caead9C45EB088C642";
export const eBTCOracle = "0x04d6096A6F089047C7af6E4644D18fB766B8d4cE";
export const LBTC = "0x8236a87084f8B84306f72007F36F2618A5634494";
export const LBTCOracle = "0x54B033D102db7DD734E0Ad649463E90fFA78D853";
export const pufETH = "0xD9A442856C234a39a81a089C06451EBAa4306a72";
export const pufETHOracle = "0x4fCbfE445396f31005b3Fd2F6DE2A986d6E2dCB5";

export const ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
export const NORMAL_TIMELOCK = "0xd969E79406c35E80750aAae061D402Aab9325714";
export const CRITICAL_TIMELOCK = "0xeB9b85342c34F65af734C7bd4a149c86c472bC00";
export const FASTTRACK_TIMELOCK = "0x8764F50616B62a99A997876C2DEAaa04554C5B2E";

export const vip506 = () => {
  const meta = {
    version: "v2",
    title: "VIP-506 [Ethereum] Capped Oracles and Cached Prices (1/2)",
    description: `#### Summary

If passed, following the community proposal “[Provide Support for Capped Oracles for Enhanced Security](https://community.venus.io/t/provide-support-for-capped-oracles-for-enhanced-security/5092)” ([snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xcd64c64eee56e75b56a0a0b84f1ffa2b4ea5fb2be76cca96a155137c46305c07)), this VIP will upgrade the implementations of the following contracts on Ethereum, including support for Capped Oracles and Cached Prices:

- [ResilientOracle](https://etherscan.io/address/0xd2ce3fb018805ef92b8C5976cb31F84b4E295F94)
- [ChainlinkOracle](https://etherscan.io/address/0x94c3A2d6B7B2c051aDa041282aec5B0752F8A1F2)
- [RedStoneOracle](https://etherscan.io/address/0x0FC8001B2c9Ec90352A46093130e284de5889C86)
- [BoundValidator](https://etherscan.io/address/0x1Cd5f336A1d28Dff445619CC63d3A0329B4d8a58)

Moreover, the oracles for the following assets are updated (following the [Chaos Labs recommendation](https://community.venus.io/t/provide-support-for-capped-oracles-for-enhanced-security/5092/5)):

- [sFRAX](https://app.venus.io/#/core-pool/market/0x17142a05fe678e9584FA1d88EfAC1bF181bF7ABe?chainId=1): using the [new implementation for the SFraxOracle](https://github.com/VenusProtocol/oracle/pull/239):
    - Maximum annual growth rate: 54.04%
    - Automatic snapshot period: 30 days (how frequently the reference value to calculate the cap in the price is updated)
    - Automatic snapshot update gap: 4.5% of the current exchange rate
- [sUSDs](https://app.venus.io/#/core-pool/market/0xE36Ae842DbbD7aE372ebA02C8239cd431cC063d6?chainId=1): using the [new implementation for the ERC4626Oracle](https://github.com/VenusProtocol/oracle/pull/239):
    - Maximum annual growth rate: 16.24%
    - Automatic snapshot period: 30 days
    - Automatic snapshot update gap: 1.35%
- [yvUSDT](https://app.venus.io/#/core-pool/market/0x475d0C68a8CD275c15D1F01F4f291804E445F677?chainId=1): using the [new implementation for the ERC4626Oracle](https://github.com/VenusProtocol/oracle/pull/239):
    - Maximum annual growth rate: 11.08%
    - Automatic snapshot period: 30 days
    - Automatic snapshot update gap: 0.92%
- [yvUSDS](https://app.venus.io/#/core-pool/market/0x520d67226Bc904aC122dcE66ed2f8f61AA1ED764?chainId=1): using the [new implementation for the ERC4626Oracle](https://github.com/VenusProtocol/oracle/pull/239):
    - Maximum annual growth rate: 22.21%
    - Automatic snapshot period: 30 days
    - Automatic snapshot update gap: 1.85%
- [yvUSDC](https://app.venus.io/#/core-pool/market/0xf87c0a64dc3a8622D6c63265FA29137788163879?chainId=1): using the [new implementation for the ERC4626Oracle](https://github.com/VenusProtocol/oracle/pull/239):
    - Maximum annual growth rate: 12.21%
    - Automatic snapshot period: 30 days
    - Automatic snapshot update gap: 1.07%
- [yvWETH](https://app.venus.io/#/core-pool/market/0xba3916302cBA4aBcB51a01e706fC6051AaF272A0?chainId=1): using the [new implementation for the ERC4626Oracle](https://github.com/VenusProtocol/oracle/pull/239):
    - Maximum annual growth rate: 5.18%
    - Automatic snapshot period: 30 days
    - Automatic snapshot update gap: 0.43%
- [LBTC](https://app.venus.io/#/core-pool/market/0x25C20e6e110A1cE3FEbaCC8b7E48368c7b2F0C91?chainId=1): using the [new implementation for the OneJumpOracle](https://github.com/VenusProtocol/oracle/pull/239)
    - Maximum annual growth rate: 0%
    - Automatic snapshot period: 30 days
    - Automatic snapshot update gap: 4%
- [eBTC](https://app.venus.io/#/core-pool/market/0x325cEB02fe1C2fF816A83a5770eA0E88e2faEcF2?chainId=1): using the [new implementation for the EtherfiAccountantOracle](https://github.com/VenusProtocol/oracle/pull/239)
    - Maximum annual growth rate: 0%
    - Automatic snapshot period: 30 days
    - Automatic snapshot update gap: 4%

The oracles used for the following assets will also be updated, using contracts ready to cap the prices, but without configuring these caps yet. These caps will be configured in another VIP, following the upcoming Chaos Labs recommendations:

- [weETH](https://etherscan.io/address/0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee)
- [weETHs](https://etherscan.io/address/0x917ceE801a67f933F2e6b33fC0cD1ED2d5909D88)
- [PT-weETH-26DEC2024](https://etherscan.io/address/0x6ee2b5e19ecba773a352e5b21415dc419a700d1d)
- [PT-USDe-27MAR2025](https://etherscan.io/address/0x8A47b431A7D947c6a3ED6E42d501803615a97EAa)
- [PT-sUSDe-27MAR2025](https://etherscan.io/address/0xE00bd3Df25fb187d6ABBB620b3dfd19839947b81)
- [rsETH](https://etherscan.io/address/0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7)
- [ezETH](https://etherscan.io/address/0xbf5495Efe5DB9ce00f80364C8B423567e58d2110)
- [sUSDe](https://etherscan.io/address/0x9D39A5DE30e57443BfF2A8307A4256c8797A3497)
- [pufETH](https://etherscan.io/address/0xD9A442856C234a39a81a089C06451EBAa4306a72)

#### Description

**Capped Oracles** are a type of price oracle designed to limit the maximum value (or growth) of an asset's reported price to protect against manipulation or sudden volatility.

**Cached Prices** is a new feature integrated into the Venus oracle contracts, that reduces the gas consumed by the functions that collect and return the prices, using [Transient Storage](https://soliditylang.org/blog/2024/01/26/transient-storage/) to cache the prices in the smart contract memory. This VIP doesn’t enable Cached Prices for any market on the affected networks. It only upgrades the oracle contracts to support that feature.

More information about Capped Oracles and Cached Prices:

- [VIP-495 [opBNB] Capped Oracles and Cached Prices](https://app.venus.io/#/governance/proposal/495?chainId=56)
- [VIP-497 [Base][Optimism][Unichain] Capped Oracles and Cached Prices](https://app.venus.io/#/governance/proposal/497?chainId=56)
- [VIP-500 [Arbitrum][ZKSync] Capped Oracles and Cached Prices](https://app.venus.io/#/governance/proposal/500?chainId=56)
- [Technical article about Capped Oracles](https://docs-v4.venus.io/technical-reference/reference-technical-articles/capped-oracles)

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Audits**: [Certik](https://www.certik.com/), [Quantstamp](https://quantstamp.com/) and [Fairyproof](https://www.fairyproof.com/) have audited the deployed code
- **VIP execution simulation**: in a simulation environment, validating the new implementations are properly set on Ethereum, and the asset prices don’t change
- **Deployment on testnet**: the same upgrade has been performed on Sepolia, and used in the Venus Protocol testnet deployment

Permissions are granted to Governance on Ethereum, to configure the new risk parameters related to Capped oracles.

#### Audit reports

- [Certik audit audit report](https://github.com/VenusProtocol/oracle/blob/d6497b924d6255db8aa664076b703713296439d0/audits/125_capped_cached_certik_20250430.pdf) (2025/04/30)
- [Quantstamp](https://github.com/VenusProtocol/oracle/blob/d6497b924d6255db8aa664076b703713296439d0/audits/127_capped_cached_quantstamp_20250325.pdf) (2025/03/25)
- [Fairyproof audit report](https://github.com/VenusProtocol/oracle/blob/d6497b924d6255db8aa664076b703713296439d0/audits/126_capped_cached_fairyproof_20250319.pdf) (2025/03/19)

#### Deployed contracts

Mainnet

- [New ResilientOracle implementation](https://etherscan.io/address/0x582d6d131e93D81676e82f032B2Dfa638F4E3275)
- [New ChainlinkOracle implementation](https://etherscan.io/address/0x36EFe8716fa2ff9f59D528d154D89054581866A5)
- [New RedStoneOracle implementation](https://etherscan.io/address/0xa3b4A56bf47a93459293CFA5E3D20c4f49C8643C)
- [New BoundValidator implementation](https://etherscan.io/address/0x955c01a8307618Ac3e5Fc08a7444f5cB6bD7d71e)
- [New oracle for LBTC](https://etherscan.io/address/0x54B033D102db7DD734E0Ad649463E90fFA78D853)
- [New oracle for PT-weETH-26DEC2024](https://etherscan.io/address/0xB89C0F93442C269271cB4e9Acd10E81D3fC237Ba)
- [New oracle for PT-USDe-27MAR2025](https://etherscan.io/address/0x4CD93DcD2E11835D06a45F7eF9F7225C249Bb6Db)
- [New oracle for PT-sUSDe-27MAR2025](https://etherscan.io/address/0x51B83bbbdCa078b2497C41c9f54616D1aDBEF86F)
- [New oracle for sFrax](https://etherscan.io/address/0x1aDCE75BB3164bBf6060a4f44262df5414473110)
- [New oracle for weETHs](https://etherscan.io/address/0x47F7A7f3486b08A019E0c10Af969ADC4B6E415Cd)
- [New oracle for weETH](https://etherscan.io/address/0xaB663D4a701229DFF407Eb4B45007921029072e9)
- [New oracle for eBTC](https://etherscan.io/address/0x04d6096A6F089047C7af6E4644D18fB766B8d4cE)
- New oracles for ezETH
    - [Based on Chainlink](https://etherscan.io/address/0x84FAe9909Fa1F259CB23Fa14FCdd1a35A0FE7EB8)
    - [Based on RedStone](https://etherscan.io/address/0xA6efeF98D9C4E9FF8193f80FbABF92AD92D50500)
- [New oracle for pufETH](https://etherscan.io/address/0x4fCbfE445396f31005b3Fd2F6DE2A986d6E2dCB5)
- New oracles for rsETH
    - [Based on Chainlink](https://etherscan.io/address/0xc68A156b08C5C5C2e9c27B32A09977F3FA50FFE0)
    - [Based on RedStone](https://etherscan.io/address/0x6AC694f2D118a35e1984AE590B916108F4f9337F)
- [New oracle for sUSDs](https://etherscan.io/address/0xaE847E81ff6dD2bdFB1fD563ccB4f848c74D2B70)
- [New oracle for USDe](https://etherscan.io/address/0x3150b7Ff6687a94dBdF0a3A7E99B20Dad428EA16)
- [New oracle for yvUSDC-1](https://etherscan.io/address/0xA938eFfc4f68262E17eAcfAFD41Ee68b0F8874D1)
- [New oracle for yvUSDS-1](https://etherscan.io/address/0xE6eB6A0321CA8c18A3e4C31E36954467f72670EF)
- [New oracle for yvUSDT-1](https://etherscan.io/address/0xbC0289BFbF3F14af0829f10640a7B7E539910723)
- [New oracle for yvWETH-1](https://etherscan.io/address/0x38b3643c1b5160591073cc4121Bd91A456F14Acd)

Sepolia

- [New ResilientOracle implementation](https://sepolia.etherscan.io/address/0xb4933AF59868986316Ed37fa865C829Eba2df0C7)
- [New ChainlinkOracle implementation](https://sepolia.etherscan.io/address/0xDCB0CfA130496c749738Acbe2d6aA06C7C320f06)
- [New RedStoneOracle implementation](https://sepolia.etherscan.io/address/0x6150997cd4B2f2366d1B0503F0DE020653b67BFe)
- [New BoundValidator implementation](https://sepolia.etherscan.io/address/0xB634cd4F8b1CF2132E05381Eee0f994DF964869D)
- [New oracle for LBTC](https://sepolia.etherscan.io/address/0x75C573Bf23FbD0bff9B764c037C9543a1690A23b)
- [New oracle for PT-weETH-26DEC2024](https://sepolia.etherscan.io/address/0x5CDE9fec66D89B931fB7a5DB8cFf2cDb642f4e7d)
- [New oracle for PT-USDe-27MAR2025](https://sepolia.etherscan.io/address/0x16D54113De89ACE580918D15653e9C0d1DE05C35)
- [New oracle for PT-sUSDe-27MAR2025](https://sepolia.etherscan.io/address/0x1bB3faB3813267d5b6c2abE5A284C621350544aD)
- [New oracle for sFrax](https://sepolia.etherscan.io/address/0xac35DbBfACeDd301cB295DBeA57ddA7A032F0E41)
- [New oracle for weETHs](https://sepolia.etherscan.io/address/0x660c6d8C5FDDC4F47C749E0f7e03634513f23e0e)
- [New oracle for weETH](https://sepolia.etherscan.io/address/0xf3ebD2A722c2039E6f66179Ad7F9f1462B14D8e0)
- [New oracle for eBTC](https://sepolia.etherscan.io/address/0x51Fa73926Cd9456A94221b70428aa94F009a5b81)
- New oracles for ezETH
    - [Based on Chainlink](https://sepolia.etherscan.io/address/0x50196dfad5030ED54190F75e5F9d88600A4CA0B4)
    - [Based on RedStone](https://sepolia.etherscan.io/address/0x987010fD82FDCe099174aC605B88E1cc35019ef4)
- [New oracle for pufETH](https://sepolia.etherscan.io/address/0xbD2272b9f426dF6D18468fe5117fCFd547D6882b)
- New oracles for rsETH
    - [Based on Chainlink](https://sepolia.etherscan.io/address/0x3a6f2c02ec48dbEE4Ca406d701DCA2CC9d919EaD)
    - [Based on RedStone](https://sepolia.etherscan.io/address/0xA1eA3cB0FeA73a6c53aB07CcC703Dc039D8EAFb4)
- [New oracle for sUSDs](https://sepolia.etherscan.io/address/0xb844Fc5cE6e9c0D0cB6E2336B0F86A3e4146DbfB)
- [New oracle for USDe](https://sepolia.etherscan.io/address/0x93e19584359C6c5844f1f7E1621983418b5A892F)
- [New oracle for yvUSDC-1](https://sepolia.etherscan.io/address/0x23c151c861c38544E5D09D7aBEDf2a4Cce1AfDa2)
- [New oracle for yvUSDS-1](https://sepolia.etherscan.io/address/0x729d134355774224f7F65a85EF76b0EF08B31400)
- [New oracle for yvUSDT-1](https://sepolia.etherscan.io/address/0xcB99fcc1De353E69F970B499F945B41B3E35B404)
- [New oracle for yvWETH-1](https://sepolia.etherscan.io/address/0x5fA77768b9b5927A1Ed4bc2C562AE375Cd1887A2)

#### References

- [Capped Oracles and Cached Prices feature](https://github.com/VenusProtocol/oracle/pull/239)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/560)
- [Upgrade on Sepolia](https://sepolia.etherscan.io/tx/0x84a1cec8b4a3d0c2fdb764caca388bdec66eb99f7395e75ab831337c6e102d71)
- [Technical article about Capped Oracles](https://docs-v4.venus.io/technical-reference/reference-technical-articles/capped-oracles)`,
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
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", CRITICAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", CRITICAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", CRITICAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", FASTTRACK_TIMELOCK],
        dstChainId: LzChainId.ethereum,
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
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip506;
