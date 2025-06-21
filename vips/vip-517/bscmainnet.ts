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

export const vip517 = (mockPendleOracleConfiguration: boolean) => {
  const meta = {
    version: "v2",
    title: "VIP-517 [BNB Chain] Capped Oracles and Cached Prices (1/2)",
    description: `#### Summary

If passed, following the community proposal “[Provide Support for Capped Oracles for Enhanced Security](https://community.venus.io/t/provide-support-for-capped-oracles-for-enhanced-security/5092)” ([snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xcd64c64eee56e75b56a0a0b84f1ffa2b4ea5fb2be76cca96a155137c46305c07)), this VIP will upgrade the implementations of the following contracts on BNB Chain, including support for Capped Oracles and Cached Prices:

- [ResilientOracle](https://bscscan.com/address/0x6592b5DE802159F3E74B2486b091D11a8256ab8A)
- [ChainlinkOracle](https://bscscan.com/address/0x1B2103441A0A108daD8848D8F5d790e4D402921F)
- [RedStoneOracle](https://bscscan.com/address/0x8455EFA4D7Ff63b8BFD96AdD889483Ea7d39B70a)
- [BinanceOracle](https://bscscan.com/address/0x594810b741d136f1960141C0d8Fb4a91bE78A820)
- [BoundValidator](https://bscscan.com/address/0x6E332fF0bB52475304494E4AE5063c1051c7d735)

The oracles used for the following assets will also be updated, using contracts ready to cap the prices (see the new codebase [here](https://github.com/VenusProtocol/oracle/pull/239)), but without configuring these caps yet. These caps will be configured in another VIP, following the upcoming Chaos Labs recommendations:

- [ankrBNB](https://bscscan.com/address/0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827)
- [BNBx](https://bscscan.com/address/0x1bdd3Cf7F79cfB8EdbB955f20ad99211551BA275)
- [asBNB](https://bscscan.com/address/0x77734e70b6E88b4d82fE632a168EDf6e700912b6)
- [slisBNB](https://bscscan.com/address/0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B)
- [sUSDe](https://bscscan.com/address/0x211Cc4DD073734dA055fbF44a2b4667d5E5fE5d2)
- [PT-sUSDE-26JUN2025](https://bscscan.com/address/0xDD809435ba6c9d6903730f923038801781cA66ce)
- [xSolvBTC](https://bscscan.com/address/0x1346b618dC92810EC74163e4c27004c921D446a5)

#### Description

**Capped Oracles** are a type of price oracle designed to limit the maximum value (or growth) of an asset's reported price to protect against manipulation or sudden volatility.

**Cached Prices** is a new feature integrated into the Venus oracle contracts, that reduces the gas consumed by the functions that collect and return the prices, using [Transient Storage](https://soliditylang.org/blog/2024/01/26/transient-storage/) to cache the prices in the smart contract memory. This VIP doesn’t enable Cached Prices for any market on the affected networks. It only upgrades the oracle contracts to support that feature.

More information about Capped Oracles and Cached Prices:

- [VIP-495 [opBNB] Capped Oracles and Cached Prices](https://app.venus.io/#/governance/proposal/495?chainId=56)
- [VIP-497 [Base][Optimism][Unichain] Capped Oracles and Cached Prices](https://app.venus.io/#/governance/proposal/497?chainId=56)
- [VIP-500 [Arbitrum][ZKSync] Capped Oracles and Cached Prices](https://app.venus.io/#/governance/proposal/500?chainId=56)
- [VIP-506 [Ethereum] Capped Oracles and Cached Prices (1/2)](https://app.venus.io/#/governance/proposal/506?chainId=56)
- [VIP-511 [Ethereum] Capped Oracles and Cached Prices (2/2)](https://app.venus.io/#/governance/proposal/511?chainId=56)
- [Technical article about Capped Oracles](https://docs-v4.venus.io/technical-reference/reference-technical-articles/capped-oracles)

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Audits**: [Certik](https://www.certik.com/), [Quantstamp](https://quantstamp.com/) and [Fairyproof](https://www.fairyproof.com/) have audited the deployed code
- **VIP execution simulation**: in a simulation environment, validating the new implementations are properly set on BNB Chain, and the asset prices don’t change
- **Deployment on testnet**: the same upgrade has been performed on BNB Chain testnet, and used in the Venus Protocol testnet deployment

Permissions are granted to Governance on BNB Chain, to configure the new risk parameters related to Capped oracles.

#### Audit reports

- [Certik audit audit report](https://github.com/VenusProtocol/oracle/blob/d6497b924d6255db8aa664076b703713296439d0/audits/125_capped_cached_certik_20250430.pdf) (2025/04/30)
- [Quantstamp](https://github.com/VenusProtocol/oracle/blob/d6497b924d6255db8aa664076b703713296439d0/audits/127_capped_cached_quantstamp_20250325.pdf) (2025/03/25)
- [Fairyproof audit report](https://github.com/VenusProtocol/oracle/blob/d6497b924d6255db8aa664076b703713296439d0/audits/126_capped_cached_fairyproof_20250319.pdf) (2025/03/19)

#### Deployed contracts

BNB Chain

- [New ResilientOracle implementation](https://bscscan.com/address/0x90d840f463c4E341e37B1D51b1aB16Bc5b34865C)
- [New ChainlinkOracle implementation](https://bscscan.com/address/0x219cFfEFB1afA9F34695C7fACD9B98d1b3291C8b)
- [New RedStoneOracle implementation](https://bscscan.com/address/0x452FeCfa5dd59243EeC214577345d21F7D8AC5Bf)
- [New BinanceOracle implementation](https://bscscan.com/address/0x201C72986d391A5a8E1713ac5a42CEAf90556a1b)
- [New BoundValidator implementation](https://bscscan.com/address/0xbE4176749a74320641e24102B2Af2Ca37FAF2DF1)
- [New oracle for ankrBNB](https://bscscan.com/address/0x4512e9579734f7B8730f0a05Cd0D92DC33EB2675)
- [New oracle for BNBx](https://bscscan.com/address/0xC2E2b6f9CdE2BFA5Ba5fda2Dd113CAcD781bdb31)
- [New oracle for asBNB](https://bscscan.com/address/0x652B90D1d45a7cD5BE82c5Fb61a4A00bA126dde5)
- [New oracle for slisBNB](https://bscscan.com/address/0xDDE6446E66c786afF4cd3D183a908bCDa57DF9c1)
- New oracle for sUSDe
    - [Using Chainlink as intermediate oracle](https://bscscan.com/address/0xA67F01322AF8EBa444D788Ee398775b446de51a0)
    - [Using RedStone as intermediate oracle](https://bscscan.com/address/0x2B2895104f958E1EC042E6Ba5cbfeCbAD3C5beDb)
- [New oracle for PT-sUSDE-26JUN2025](https://bscscan.com/address/0xC407403fa78Bce509821D776b6Be7f91cC04474f)
- [New oracle for xSolvBTC](https://bscscan.com/address/0xf5534f78Df9b610B19A63956d498d00CFaD8B9D3)

BNB Chain testnet

- [New ResilientOracle implementation](https://testnet.bscscan.com/address/0x42D122E8BB9CCBe950F8b04a8c5909DbE14Be819)
- [New ChainlinkOracle implementation](https://testnet.bscscan.com/address/0xBea89b7560Ec88f75f31A8E62da7F2d52c807416)
- [New RedStoneOracle implementation](https://testnet.bscscan.com/address/0xfFEd0a672A59F506a75E45e245fCec02aF99eb66)
- [New BinanceOracle implementation](https://testnet.bscscan.com/address/0x8dA774a84e20BBFA5d62c3718feE5f1753046e0C)
- [New BoundValidator implementation](https://testnet.bscscan.com/address/0xa51509c7a811a668F617B14146533E28B034CFdB)
- [New oracle for ankrBNB](https://testnet.bscscan.com/address/0x7655d558c3C865913013D82fF4d1e70e97cDf906)
- [New oracle for BNBx](https://testnet.bscscan.com/address/0x068945930785e6816faE855a2A2e8c59BAD380f0)
- [New oracle for asBNB](https://testnet.bscscan.com/address/0xb31909f6687Da5bEc559DB7baeed41E14f5Dc17E)
- [New oracle for slisBNB](https://testnet.bscscan.com/address/0x6a8154699b6670Ba6166ba59d1c094663E603cA8)
- New oracle for sUSDe
    - [Using Chainlink as intermediate oracle](https://testnet.bscscan.com/address/0x4678BcB5B8eDd9f853725F64d59Ba592F9e41565)
    - [Using RedStone as intermediate oracle](https://testnet.bscscan.com/address/0xA5b51bF1625c1F90341c4527AFa5B0865F15ac70)
- [New oracle for PT-sUSDE-26JUN2025](https://testnet.bscscan.com/address/0x85201328baa52061E6648d9b4c285529411Cd33B)
- [New oracle for xSolvBTC](https://testnet.bscscan.com/address/0x33a2BDcBB401a81C590215a6953A9a4B90aD57b9)

#### References

- [Capped Oracles and Cached Prices feature](https://github.com/VenusProtocol/oracle/pull/239)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/576)
- [Upgrade on BNB Chain testnet](https://testnet.bscscan.com/tx/0xd0bb75835f2834c0a7fbefe079ee150094be352162b4d80805deb207870e3147)
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
      ...getPendleOracleCommand(mockPendleOracleConfiguration),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip517;
