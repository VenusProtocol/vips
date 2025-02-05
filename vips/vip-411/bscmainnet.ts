import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { ethereum } = NETWORK_ADDRESSES;

export const ACM = "0x230058da2D23eb8836EC5DB7037ef7250c56E25E";
export const COMPTROLLER_ETHENA = "0x562d2b6FF1dbf5f63E233662416782318cC081E4";

export const PT_USDe_27MAR2025 = "0x8A47b431A7D947c6a3ED6E42d501803615a97EAa";
export const PT_sUSDE_27MAR2025 = "0xE00bd3Df25fb187d6ABBB620b3dfd19839947b81";
export const sUSDe = "0x9D39A5DE30e57443BfF2A8307A4256c8797A3497";
export const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const USDe = "0x4c9edd5852cd905f086c759e8383e09bff1e68b3";
export const VTOKEN_RECEIVER = "0x3e8734ec146c981e3ed1f6b582d447dde701d90c";
export const PRIME = "0x14C4525f47A7f7C984474979c57a2Dccb8EACB39";

export const VPT_USDe_27MAR2025_ETHENA = "0x62D9E2010Cff87Bae05B91d5E04605ef864ABc3B";
export const VPT_sUSDE_27MAR2025_ETHENA = "0xCca202a95E8096315E3F19E46e19E1b326634889";

const sUSDE_ERC4626ORACLE = "0x67841858BCCA8dF50B962d6A314722a6AEC0970e";
const PendleOracle_PT_USDe_27MAR2025 = "0x721C02F98bE5ef916F6574E53700a25473742093";
const PendleOracle_PT_sUSDe_27MAR2025 = "0x17B49f36878c401C1fE4D7Bf6D9CeBAAFBf4edE2";
const BOUND_VALIDATOR = "0x1Cd5f336A1d28Dff445619CC63d3A0329B4d8a58";

const REDSTONE_USDe_FEED = "0xbC5FBcf58CeAEa19D523aBc76515b9AEFb5cfd58";
const CHAINLINK_USDe_FEED = "0xa569d910839Ae8865Da8F8e70FfFb0cBA869F961";

const STALE_PERIOD_26H = 60 * 60 * 26; // 26 hours (pricefeeds with heartbeat of 24 hr)
const UPPER_BOUND_RATIO = parseUnits("1.01", 18);
const LOWER_BOUND_RATIO = parseUnits("0.99", 18);

export const vip411 = (maxStalePeriod?: number) => {
  const meta = {
    version: "v2",
    title: "VIP-411 [Ethereum] Add Ethena pool to Ethereum (1/2)",
    description: `#### Summary

If passed, this VIP will perform the following actions:

- Add pool "Ethena" to the [PoolRegistry contract](https://etherscan.io/address/0x61CAff113CCaf05FFc6540302c37adcf077C5179) on Ethereum
- Add the following markets to the new pool, following the [Chaos labs recommendations](https://community.venus.io/t/support-ethena-assets-on-ethereum-mainnet/4719/7):
    - [PT-USDe-27MAR2025](https://etherscan.io/address/0x8a47b431a7d947c6a3ed6e42d501803615a97eaa)
    - [PT-sUSDE-27MAR2025](https://etherscan.io/address/0xE00bd3Df25fb187d6ABBB620b3dfd19839947b81)
- Transfer [VenusTreasury](https://etherscan.io/address/0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA) to Omnichain Governance

There will be a follow-up VIP, to add [sUSDe](https://etherscan.io/address/0x9D39A5DE30e57443BfF2A8307A4256c8797A3497) and [USDC](https://etherscan.io/address/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48) to the same pool, following the Chaos labs recommendations. These markets have not been included in this VIP because doing so would exceed the maximum payload size accepted by LayerZero in one transaction.

#### Description

Initial risk parameters for the new pool:

- Close factor: 50%
- Liquidation incentive: 4%

#### Risk parameters of the new markets

**Underlying token: [PT-USDe-27MAR2025](https://etherscan.io/address/0x8a47b431a7d947c6a3ed6e42d501803615a97eaa)**

- Borrow cap: 0
- Supply cap: 850,000
- Collateral factor: 0.86
- Liquidation threshold: 0.88
- Reserve factor: 0
- Bootstrap liquidity: 10,619.58 PT-USDe-27MAR2025 - provided by the market supporter [0x3e8734ec146c981e3ed1f6b582d447dde701d90c](https://etherscan.io/address/0x3e8734ec146c981e3ed1f6b582d447dde701d90c)
- Interest rates (not relevant, because the asset is not borrowable, but configured anyway):
    - kink: 0.8
    - base (yearly): 0
    - multiplier (yearly): 0.08
    - jump multiplier (yearly): 0.8
- Liquidation incentive sent to the protocol: 0.4%

**Underlying token: [PT-sUSDE-27MAR2025](https://etherscan.io/address/0xE00bd3Df25fb187d6ABBB620b3dfd19839947b81)**

- Borrow cap: 0
- Supply cap: 12,000,000
- Collateral factor: 0.85
- Liquidation threshold: 0.87
- Reserve factor: 0
- Bootstrap liquidity: 10,653.072723772024710328 PT-sUSDE-27MAR2025 - provided by the market supporter [0x3e8734ec146c981e3ed1f6b582d447dde701d90c](https://etherscan.io/address/0x3e8734ec146c981e3ed1f6b582d447dde701d90c)
- Interest rates (not relevant, because the asset is not borrowable, but configured anyway):
    - kink: 0.8
    - base (yearly): 0
    - multiplier (yearly): 0.08
    - jump multiplier (yearly): 0.8
- Liquidation incentive sent to the protocol: 0.4%

#### Oracle configuration

- PT-USDe-27MAR2025
    - Main oracle: [PendleOracle](https://etherscan.io/address/0x721C02F98bE5ef916F6574E53700a25473742093), that will internally use the ratio PT-USDe-27MAR2025/USDe ([oracle](https://etherscan.io/address/0x9a9Fa8338dd5E5B2188006f1Cd2Ef26d921650C2), [market](https://etherscan.io/address/0xB451A36c8B6b2EAc77AD0737BA732818143A0E25), [underlying token](https://etherscan.io/address/0x4c9EDD5852cd905f086C759E8383e09bff1E68B3), twap duration: 1,800 seconds)
- PT-sUSDe-27MAR2025
    - Main oracle: [PendleOracle](https://etherscan.io/address/0x17B49f36878c401C1fE4D7Bf6D9CeBAAFBf4edE2), that will internally use the ratio PT-USDe-27MAR2025/sUSDe/USDe ([oracle](https://etherscan.io/address/0x9a9Fa8338dd5E5B2188006f1Cd2Ef26d921650C2), [market](https://etherscan.io/address/0xcDd26Eb5EB2Ce0f203a84553853667aE69Ca29Ce), [underlying token](https://etherscan.io/address/0x4c9EDD5852cd905f086C759E8383e09bff1E68B3), twap duration: 1,800 seconds)
- USDe
    - Main oracle: [RedStoneOracle](https://etherscan.io/address/0x0FC8001B2c9Ec90352A46093130e284de5889C86) ([feed](https://etherscan.io/address/0xbC5FBcf58CeAEa19D523aBc76515b9AEFb5cfd58))
    - Pivot and fallback oracles: [ChainlinkOracle](https://etherscan.io/address/0x94c3A2d6B7B2c051aDa041282aec5B0752F8A1F2) ([feed](https://etherscan.io/address/0xa569d910839Ae8865Da8F8e70FfFb0cBA869F961))

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **No changes in the deployed code.** The deployed contracts (markets, comptroller, etc.) have not been modified. It’s the same codebase used for the Core pool on Ethereum
- **Audit:** Certik, Peckshield, Hacken and Code4rena have audited the deployed code
- **VIP execution simulation:** in a simulation environment, validating the markets are properly added to the pool with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet:** the same pool has been deployed to testnet, and used in the Venus Protocol testnet deployment
- **Fork tests:** in a simulation environment, verifying the main actions of the protocol are executable as expected with real data

To transfer the VenusTreasury to the Normal Timelock contract on Ethereum, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x0239e0a02853831b23e7655e4f6d3475180ed864d4dffdaa055178c63dbdca71) transaction is required, where the two steps transfer is initiated by the [Guardian wallet on Ethereum](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67). If this VIP passes, that transaction will be executed. Otherwise, it will be rejected.

#### Audit reports

- [Certik audit report](https://github.com/VenusProtocol/isolated-pools/blob/1d60500e28d4912601bac461870c754dd9e72341/audits/036_isolatedPools_certik_20230619.pdf) (2023/June/19)
- [Code4rena contest](https://code4rena.com/contests/2023-05-venus-protocol-isolated-pools) (2023/May/05)
- [Hacken audit report](https://github.com/VenusProtocol/isolated-pools/blob/c801e898e034e313e885c5d486ed27c15e7e2abf/audits/016_isolatedPools_hacken_20230426.pdf) (2023/April/26)
- [Peckshield audit report 1](https://github.com/VenusProtocol/isolated-pools/blob/c801e898e034e313e885c5d486ed27c15e7e2abf/audits/003_isolatedPools_peckshield_20230112.pdf) (2023/January/12)
- [Peckshield audit report 2](https://github.com/VenusProtocol/isolated-pools/blob/1d60500e28d4912601bac461870c754dd9e72341/audits/037_isolatedPools_peckshield_20230625.pdf) (2023/June/25)

#### Contracts on mainnet

- Comptroller: [0x562d2b6FF1dbf5f63E233662416782318cC081E4](https://etherscan.io/address/0x562d2b6FF1dbf5f63E233662416782318cC081E4)
- Markets:
    - VToken_vPT-USDe-27MAR2025_Ethena: [0x62D9E2010Cff87Bae05B91d5E04605ef864ABc3B](https://etherscan.io/address/0x62D9E2010Cff87Bae05B91d5E04605ef864ABc3B)
    - VToken_vPT-sUSDE-27MAR2025_Ethena: [0xCca202a95E8096315E3F19E46e19E1b326634889](https://etherscan.io/address/0xCca202a95E8096315E3F19E46e19E1b326634889)

**Contracts on testnet**

- Comptroller: [0x05Cdc6c3dceA796971Db0d9edDbC7C56f2176D1c](https://sepolia.etherscan.io/address/0x05Cdc6c3dceA796971Db0d9edDbC7C56f2176D1c)
- Markets:
    - VToken_vPT-USDe-27MAR2025_Ethena: [0xf2C00a9C3314f7997721253c49276c8531a30803](https://sepolia.etherscan.io/address/0xf2C00a9C3314f7997721253c49276c8531a30803)
    - VToken_vPT-sUSDE-27MAR2025_Ethena: [0x6c87587b1813eAf5571318E2139048b04eAaFf97](https://sepolia.etherscan.io/address/0x6c87587b1813eAf5571318E2139048b04eAaFf97)

#### References

- [Repository](https://github.com/VenusProtocol/isolated-pools)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/440)
- [Chaos labs recommendations](https://community.venus.io/t/support-ethena-assets-on-ethereum-mainnet/4719/7)
- [Source code of the PendleOracle](https://github.com/VenusProtocol/oracle/blob/main/contracts/oracles/PendleOracle.sol)
- Snapshot “[Support Ethena Assets on Ethereum Mainnet](https://snapshot.box/#/s:venus-xvs.eth/proposal/0x5173788fc589aa30ac9b1472542f000d915a4a3583ad85a375fc248f05810077)”
- [Documentation](https://docs.venus.io/whats-new/isolated-pools)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };
  return makeProposal(
    [
      {
        target: COMPTROLLER_ETHENA,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.VTREASURY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: BOUND_VALIDATOR,
        signature: "setValidateConfig((address,uint256,uint256))",
        params: [[USDe, UPPER_BOUND_RATIO, LOWER_BOUND_RATIO]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.REDSTONE_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[USDe, REDSTONE_USDe_FEED, maxStalePeriod || STALE_PERIOD_26H]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[USDe, CHAINLINK_USDe_FEED, maxStalePeriod || STALE_PERIOD_26H]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [USDe, [ethereum.REDSTONE_ORACLE, ethereum.CHAINLINK_ORACLE, ethereum.CHAINLINK_ORACLE], [true, true, true]],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            sUSDe,
            [sUSDE_ERC4626ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },

      {
        target: ethereum.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            PT_USDe_27MAR2025,
            [PendleOracle_PT_USDe_27MAR2025, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },

      {
        target: ethereum.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            PT_sUSDE_27MAR2025,
            [PendleOracle_PT_sUSDe_27MAR2025, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },

      {
        target: COMPTROLLER_ETHENA,
        signature: "setPriceOracle(address)",
        params: [ethereum.RESILIENT_ORACLE],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.POOL_REGISTRY,
        signature: "addPool(string,address,uint256,uint256,uint256)",
        params: ["Ethena", COMPTROLLER_ETHENA, parseUnits("0.5", 18), parseUnits("1.04", 18), parseUnits("100", 18)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [PT_USDe_27MAR2025, parseUnits("10619.584104736976014893", 18), ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: PT_USDe_27MAR2025,
        signature: "approve(address,uint256)",
        params: [ethereum.POOL_REGISTRY, 0],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: PT_USDe_27MAR2025,
        signature: "approve(address,uint256)",
        params: [ethereum.POOL_REGISTRY, parseUnits("10619.584104736976014893", 18)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: VPT_USDe_27MAR2025_ETHENA,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["7200"],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VPT_USDe_27MAR2025_ETHENA,
            parseUnits("0.86", 18),
            parseUnits("0.88", 18),
            parseUnits("10619.584104736976014893", 18),
            VTOKEN_RECEIVER,
            parseUnits("850000", 18),
            parseUnits("0", 18),
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [PT_sUSDE_27MAR2025, parseUnits("10653.072723772024710328", 18), ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: PT_sUSDE_27MAR2025,
        signature: "approve(address,uint256)",
        params: [ethereum.POOL_REGISTRY, 0],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: PT_sUSDE_27MAR2025,
        signature: "approve(address,uint256)",
        params: [ethereum.POOL_REGISTRY, parseUnits("10653.072723772024710328", 18)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: VPT_sUSDE_27MAR2025_ETHENA,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["7200"],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VPT_sUSDE_27MAR2025_ETHENA,
            parseUnits("0.85", 18),
            parseUnits("0.87", 18),
            parseUnits("10653.072723772024710328", 18),
            VTOKEN_RECEIVER,
            parseUnits("12000000", 18),
            parseUnits("0", 18),
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },

      {
        target: VPT_USDe_27MAR2025_ETHENA,
        signature: "setProtocolSeizeShare(uint256)",
        params: [parseUnits("0.004", 18)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: VPT_sUSDE_27MAR2025_ETHENA,
        signature: "setProtocolSeizeShare(uint256)",
        params: [parseUnits("0.004", 18)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: COMPTROLLER_ETHENA,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[VPT_USDe_27MAR2025_ETHENA, VPT_sUSDE_27MAR2025_ETHENA], [2, 2], true],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: COMPTROLLER_ETHENA,
        signature: "setPrimeToken(address)",
        params: [PRIME],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip411;
