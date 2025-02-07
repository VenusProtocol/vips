import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { POOL_REGISTRY, VTREASURY, REDSTONE_ORACLE, RESILIENT_ORACLE } = NETWORK_ADDRESSES["bscmainnet"];

export const COMPTROLLER = "0x9DF11376Cf28867E2B0741348044780FbB7cb1d6";
export const SWAP_ROUTER = "0x70D06f42a463f0f398eCBc6abfDFbbd726626346";

export const PRIME = "0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC";
export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

export const REDSTONE_STALE_PERIOD = 7 * 60 * 60; // 7 hours
export const SOLVBTC_BBN_ONEJUMP_REDSTONE_ORACLE = "0x98B9bC5a1e7E439ebEB0BEdB7e9f6b24fEc1E8B4";
export const SOLVBTC_BBN_REDSTONE_FEED = "0xBf3bA2b090188B40eF83145Be0e9F30C6ca63689";
export const PT_SOLVBTC_BBN_PENDLE_ORACLE = "0xE11965a3513F537d91D73d9976FBe8c0969Bb252";

export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const RISK_FUND_CONVERTER = "0xA5622D276CcbB8d9BBE3D1ffd1BB11a0032E53F0";
export const USDT_PRIME_CONVERTER = "0xD9f101AA67F3D72662609a2703387242452078C3";
export const USDC_PRIME_CONVERTER = "0xa758c9C215B6c4198F0a0e3FA46395Fa15Db691b";
export const BTCB_PRIME_CONVERTER = "0xE8CeAa79f082768f99266dFd208d665d2Dd18f53";
export const ETH_PRIME_CONVERTER = "0xca430B8A97Ea918fF634162acb0b731445B8195E";
export const XVS_VAULT_CONVERTER = "0xd5b9AE835F4C59272032B3B954417179573331E0";

export const CLOSE_FACTOR = parseUnits("0.5", 18);
export const LIQUIDATION_INCENTIVE = parseUnits("1.03", 18);
export const MIN_LIQUIDATABLE_COLLATERAL = parseUnits("100", 18);
export const CONVERSION_INCENTIVE = 1e14;

const commonSpec = {
  decimals: 8,
  exchangeRate: parseUnits("1", 28),
  comptroller: COMPTROLLER,
};

export const tokens = {
  "PT-SolvBTC.BBN-27MAR2025": {
    address: "0x541B5eEAC7D4434C8f87e2d32019d67611179606",
    decimals: 18,
    symbol: "PT-SolvBTC.BBN-27MAR2025",
  },
  "SolvBTC.BBN": {
    address: "0x1346b618dC92810EC74163e4c27004c921D446a5",
    decimals: 18,
    symbol: "SolvBTC.BBN",
  },
  BTCB: {
    address: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    decimals: 18,
    symbol: "BTCB",
  },
};

export const newMarkets = {
  "vPT-SolvBTC.BBN-27MAR2025_BTC": {
    vToken: {
      address: "0x02243F036897E3bE1cce1E540FA362fd58749149",
      name: "Venus PT-SolvBTC.BBN-27MAR2025 (BTC)",
      symbol: "vPT-SolvBTC.BBN-27MAR2025_BTC",
      underlying: tokens["PT-SolvBTC.BBN-27MAR2025"],
      ...commonSpec,
    },
    riskParameters: {
      collateralFactor: parseUnits("0.8", 18),
      liquidationThreshold: parseUnits("0.85", 18),
      supplyCap: parseUnits("80", 18),
      borrowCap: parseUnits("0", 18),
      reserveFactor: parseUnits("0", 18),
      protocolSeizeShare: parseUnits("0.015", 18),
    },
    initialSupply: {
      amount: parseUnits("0.110483117280995732", 18),
      vTokenReceiver: "0x63f6D9E7d3953106bCaf98832BD9C88A54AfCc9D",
    },
    interestRateModel: {
      address: "0x0B42C0340CbC6CE1c0fc7302D9Ad0ba4A6F89c98",
      base: "0",
      multiplier: "0.0875",
      jump: "2.0",
      kink: "0.8",
    },
  },
  vBTCB_BTC: {
    vToken: {
      address: "0x8F2AE20b25c327714248C95dFD3b02815cC82302",
      name: "Venus BTCB (BTC)",
      symbol: "vBTCB_BTC",
      underlying: tokens["BTCB"],
      ...commonSpec,
    },
    riskParameters: {
      collateralFactor: parseUnits("0", 18),
      liquidationThreshold: parseUnits("0", 18),
      supplyCap: parseUnits("175", 18),
      borrowCap: parseUnits("140", 18),
      reserveFactor: parseUnits("0.2", 18),
      protocolSeizeShare: parseUnits("0.015", 18),
    },
    initialSupply: {
      amount: parseUnits("0.1", 18),
      vTokenReceiver: VTREASURY,
    },
    interestRateModel: {
      address: "0x0B42C0340CbC6CE1c0fc7302D9Ad0ba4A6F89c98",
      base: "0",
      multiplier: "0.0875",
      jump: "2.0",
      kink: "0.8",
    },
  },
};

export const converterBaseAssets = {
  [RISK_FUND_CONVERTER]: USDT,
  [USDT_PRIME_CONVERTER]: USDT,
  [USDC_PRIME_CONVERTER]: USDC,
  [BTCB_PRIME_CONVERTER]: BTCB,
  [ETH_PRIME_CONVERTER]: ETH,
  [XVS_VAULT_CONVERTER]: XVS,
};

enum ConversionAccessibility {
  NONE = 0,
  ALL = 1,
  ONLY_FOR_CONVERTERS = 2,
  ONLY_FOR_USERS = 3,
}

const vip414 = (overrides: { redstoneStalePeriod?: number }) => {
  const meta = {
    version: "v2",
    title: "VIP-414 Add BTC pool to BNB chain",
    description: `#### Summary

If passed, this VIP will perform the following actions:

- Add pool "BTC" to the [PoolRegistry contract](https://bscscan.com/address/0x9F7b01A536aFA00EF10310A162877fd792cD0666) on BNB chain
- Add the following markets to the new pool, following the [Chaos labs recommendations](https://community.venus.io/t/proposal-create-new-pendle-s-pt-solvbtc-bbn-isolated-pool-on-bnb-chain/4671/5):
    - [PT-SolvBTC.BBN-27MAR2025](https://bscscan.com/address/0x541B5eEAC7D4434C8f87e2d32019d67611179606)
    - [BTCB](https://bscscan.com/address/0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c)

#### Description

Initial risk parameters for the new pool:

- Close factor: 50%
- Liquidation incentive: 3%

#### Risk parameters of the new markets

**Underlying token: [PT-SolvBTC.BBN-27MAR2025](https://bscscan.com/token/0x541B5eEAC7D4434C8f87e2d32019d67611179606)**

- Borrow cap: 0
- Supply cap: 80
- Collateral factor: 0.8
- Liquidation threshold: 0.85
- Reserve factor: 0
- Bootstrap liquidity: 0.110483117280995732 PT-SolvBTC.BBN-27MAR2025 - provided by the [Pendle Treasury](https://bscscan.com/address/0x63f6D9E7d3953106bCaf98832BD9C88A54AfCc9D).
- Interest rates (not relevant, because the asset is not borrowable, but configured anyway):
    - kink: 0.8
    - base (yearly): 0
    - multiplier (yearly): 0.0875
    - jump multiplier (yearly): 2
- Liquidation incentive sent to the protocol: 1.5%

**Underlying token: [BTCB](https://bscscan.com/address/0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c)**

- Borrow cap: 140
- Supply cap: 175
- Collateral factor: 0
- Liquidation threshold: 0
- Reserve factor: 0.2
- Bootstrap liquidity: 0.1 BTCB - provided by the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9).
- Interest rates:
    - kink: 0.8
    - base (yearly): 0
    - multiplier (yearly): 0.0875
    - jump multiplier (yearly): 2
- Liquidation incentive sent to the protocol: 1.5%

#### Oracle configuration

- PT-SolvBTC.BBN-27MAR2025
    - Main oracle: [PendleOracle](https://bscscan.com/address/0xE11965a3513F537d91D73d9976FBe8c0969Bb252), that will internally use the ratio PT-SolvBTC.BBN-27MAR2025/SolvBTC.BBN ([oracle](https://bscscan.com/address/0x9a9fa8338dd5e5b2188006f1cd2ef26d921650c2), [market](https://bscscan.com/address/0x9dAA2878A8739E66e08e7ad35316C5143c0ea7C7), [underlying token](https://bscscan.com/address/0x1346b618dC92810EC74163e4c27004c921D446a5), twap duration: 900 seconds)
- SolvBTC.BBN
    - Main oracle: [OneJumpOracle](https://bscscan.com/address/0x98B9bC5a1e7E439ebEB0BEdB7e9f6b24fEc1E8B4), that will internally use the ratio SolvBTC.BBN/BTCB provided by RedStone ([feed](https://bscscan.com/address/0xBf3bA2b090188B40eF83145Be0e9F30C6ca63689))
- BTCB
    - Main oracle: [RedStoneOracle](https://bscscan.com/address/0x8455EFA4D7Ff63b8BFD96AdD889483Ea7d39B70a) ([feed](https://bscscan.com/address/0xa51738d1937FFc553d5070f43300B385AA2D9F55))
    - Pivot and fallback oracles: [ChainlinkOracle](https://bscscan.com/address/0x1B2103441A0A108daD8848D8F5d790e4D402921F) ([feed](https://bscscan.com/address/0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf))

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **No changes in the deployed code.** The deployed contracts (markets, comptroller, etc.) have not been modified. It’s the same codebase used for the rest of the pools on BNB chain.
- **Audit:** Certik, Peckshield, Hacken and Code4rena have audited the deployed code
- **VIP execution simulation:** in a simulation environment, validating the markets are properly added to the pool with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet:** the same pool has been deployed to testnet, and used in the Venus Protocol testnet deployment
- **Fork tests:** in a simulation environment, verifying the main actions of the protocol are executable as expected with real data

The ownership of every contract has been transferred to Governance.

#### Audit reports

- [Certik audit report](https://github.com/VenusProtocol/isolated-pools/blob/1d60500e28d4912601bac461870c754dd9e72341/audits/036_isolatedPools_certik_20230619.pdf) (2023/June/19)
- [Code4rena contest](https://code4rena.com/contests/2023-05-venus-protocol-isolated-pools) (2023/May/05)
- [Hacken audit report](https://github.com/VenusProtocol/isolated-pools/blob/c801e898e034e313e885c5d486ed27c15e7e2abf/audits/016_isolatedPools_hacken_20230426.pdf) (2023/April/26)
- [Peckshield audit report 1](https://github.com/VenusProtocol/isolated-pools/blob/c801e898e034e313e885c5d486ed27c15e7e2abf/audits/003_isolatedPools_peckshield_20230112.pdf) (2023/January/12)
- [Peckshield audit report 2](https://github.com/VenusProtocol/isolated-pools/blob/1d60500e28d4912601bac461870c754dd9e72341/audits/037_isolatedPools_peckshield_20230625.pdf) (2023/June/25)

#### Contracts on mainnet

- Comptroller: [0x9DF11376Cf28867E2B0741348044780FbB7cb1d6](https://bscscan.com/address/0x9DF11376Cf28867E2B0741348044780FbB7cb1d6)
- Markets:
    - vPT-SolvBTC.BBN-27MAR2025_BTC: [0x02243F036897E3bE1cce1E540FA362fd58749149](https://bscscan.com/address/0x02243F036897E3bE1cce1E540FA362fd58749149)
    - vBTCB_BTC: [0x8F2AE20b25c327714248C95dFD3b02815cC82302](https://bscscan.com/address/0x8F2AE20b25c327714248C95dFD3b02815cC82302)
- Swap router: [0x70D06f42a463f0f398eCBc6abfDFbbd726626346](https://bscscan.com/address/0x70D06f42a463f0f398eCBc6abfDFbbd726626346)

#### Contracts on testnet

- Comptroller: [0xfE87008bf29DeCACC09a75FaAc2d128367D46e7a](https://testnet.bscscan.com/address/0xfE87008bf29DeCACC09a75FaAc2d128367D46e7a)
- Markets:
    - vPT-SolvBTC.BBN-27MAR2025_BTC: [0xf3bF150A7D3d42E8C712e2461102593Dc50266Bb](https://testnet.bscscan.com/address/0xf3bF150A7D3d42E8C712e2461102593Dc50266Bb)
    - vBTCB_BTC: [0x138500e8502f32f004F79507143E4FaaCA03E26d](https://testnet.bscscan.com/address/0x138500e8502f32f004F79507143E4FaaCA03E26d)
- Swap router: [0x98C108285E389A5a12EdDa585b70b30C786AFb86](https://testnet.bscscan.com/address/0x98C108285E389A5a12EdDa585b70b30C786AFb86)

#### References

- [Repository](https://github.com/VenusProtocol/isolated-pools)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/442)
- [Chaos labs recommendations](https://community.venus.io/t/proposal-create-new-pendle-s-pt-solvbtc-bbn-isolated-pool-on-bnb-chain/4671/5)
- Snapshot “[Create new Pendle’s PT-solvBTC.BBN Isolated Pool on BNB Chain](https://snapshot.box/#/s:venus-xvs.eth/proposal/0x9e2e2c33d9893bb3a48ef038cea93c110d4b77e12aff88c9c8109312704254d0)”
- [Documentation](https://docs.venus.io/whats-new/isolated-pools)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  const redstoneStalePeriod = overrides?.redstoneStalePeriod || REDSTONE_STALE_PERIOD;

  return makeProposal(
    [
      // Oracle config
      {
        target: REDSTONE_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[tokens["SolvBTC.BBN"].address, SOLVBTC_BBN_REDSTONE_FEED, redstoneStalePeriod]],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            tokens["SolvBTC.BBN"].address,
            [SOLVBTC_BBN_ONEJUMP_REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            tokens["PT-SolvBTC.BBN-27MAR2025"].address,
            [PT_SOLVBTC_BBN_PENDLE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
      },

      // Swap router
      {
        target: SWAP_ROUTER,
        signature: "acceptOwnership()",
        params: [],
      },

      // BTC pool
      {
        target: COMPTROLLER,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: COMPTROLLER,
        signature: "setPriceOracle(address)",
        params: [RESILIENT_ORACLE],
      },
      {
        target: POOL_REGISTRY,
        signature: "addPool(string,address,uint256,uint256,uint256)",
        params: ["BTC", COMPTROLLER, CLOSE_FACTOR, LIQUIDATION_INCENTIVE, MIN_LIQUIDATABLE_COLLATERAL],
      },
      {
        target: COMPTROLLER,
        signature: "setPrimeToken(address)",
        params: [PRIME],
      },

      // Markets
      ...Object.values(newMarkets).flatMap(({ vToken, initialSupply, riskParameters }) => [
        {
          target: vToken.address,
          signature: "setReduceReservesBlockDelta(uint256)",
          params: ["28800"],
        },
        {
          target: vToken.address,
          signature: "setReserveFactor(uint256)",
          params: [riskParameters.reserveFactor],
        },
        {
          target: VTREASURY,
          signature: "withdrawTreasuryBEP20(address,uint256,address)",
          params: [vToken.underlying.address, initialSupply.amount, NORMAL_TIMELOCK],
        },
        {
          target: vToken.underlying.address,
          signature: "approve(address,uint256)",
          params: [POOL_REGISTRY, initialSupply.amount],
        },
        {
          target: POOL_REGISTRY,
          signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
          params: [
            [
              vToken.address,
              riskParameters.collateralFactor,
              riskParameters.liquidationThreshold,
              initialSupply.amount,
              initialSupply.vTokenReceiver,
              riskParameters.supplyCap,
              riskParameters.borrowCap,
            ],
          ],
        },
        {
          target: vToken.underlying.address,
          signature: "approve(address,uint256)",
          params: [POOL_REGISTRY, 0],
        },
        {
          target: vToken.address,
          signature: "setProtocolSeizeShare(uint256)",
          params: [riskParameters.protocolSeizeShare],
        },
      ]),

      {
        target: COMPTROLLER,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[newMarkets["vPT-SolvBTC.BBN-27MAR2025_BTC"].vToken.address], [2], true],
      },

      // Conversions Config
      ...Object.entries(converterBaseAssets).map(([converter, baseAsset]: [string, string]) => {
        const tokensToConfigure = [tokens["PT-SolvBTC.BBN-27MAR2025"].address]; // BTCB is already configured
        const conversionConfigs = tokensToConfigure.map(() => [CONVERSION_INCENTIVE, ConversionAccessibility.ALL]);
        return {
          target: converter,
          signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
          params: [baseAsset, tokensToConfigure, conversionConfigs],
        };
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip414;
