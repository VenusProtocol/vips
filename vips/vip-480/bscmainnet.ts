import { BigNumber, BigNumberish } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const {
  VTREASURY,
  RESILIENT_ORACLE,
  REDSTONE_ORACLE,
  CHAINLINK_ORACLE,
  UNITROLLER,
  ACCESS_CONTROL_MANAGER,
  NORMAL_TIMELOCK,
} = NETWORK_ADDRESSES.bscmainnet;
export const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";

const REDUCE_RESERVES_BLOCK_DELTA = "28800";

// Oracles
export const SUSDE_ONEJUMP_REDSTONE_ORACLE = "0xA1dF2F18C74dB5Bed3A7752547F6Cc3094a1A2d5";
export const SUSDE_ONEJUMP_CHAINLINK_ORACLE = "0xBBe2Dc15A533DEF04D7e84Ad8aF89d62a0E5662f";
export const PT_SUSDE_PENDLE_ORACLE = "0x176ca46D7DcB4e001b8ee5F12d0fcd6D279214f4";
export const BOUND_VALIDATOR = "0x6E332fF0bB52475304494E4AE5063c1051c7d735";
const UPPER_BOUND_RATIO = parseUnits("1.01", 18);
const LOWER_BOUND_RATIO = parseUnits("0.99", 18);
export const PT_SUSDE_FIXED_PRICE = parseUnits("1.05", 18);

// USDe oracles
export const USDE_REDSTONE_FEED = "0x0d9b42a2a73Ec528759701D0B70Ccf974a327EBb";
export const USDE_REDSTONE_MAX_STALE_PERIOD = 7 * 60 * 60; // 7 hours
export const USDE_CHAINLINK_FEED = "0x10402B01cD2E6A9ed6DBe683CbC68f78Ff02f8FC";
export const USDE_CHAINLINK_MAX_STALE_PERIOD = 26 * 60 * 60; // 26 hours

// sUSDe oracles
export const SUSDE_REDSTONE_FEED = "0x5ED849a45B4608952161f45483F4B95BCEa7f8f0";
export const SUSDE_REDSTONE_MAX_STALE_PERIOD = 7 * 60 * 60; // 7 hours
export const SUSDE_CHAINLINK_FEED = "0x1a269eA1b209DA2c12bDCDab22635C9e6C5028B2";
export const SUSDE_CHAINLINK_MAX_STALE_PERIOD = 26 * 60 * 60; // 26 hours

// Converters
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
const RISK_FUND_CONVERTER = "0xA5622D276CcbB8d9BBE3D1ffd1BB11a0032E53F0";
const USDT_PRIME_CONVERTER = "0xD9f101AA67F3D72662609a2703387242452078C3";
const USDC_PRIME_CONVERTER = "0xa758c9C215B6c4198F0a0e3FA46395Fa15Db691b";
const BTCB_PRIME_CONVERTER = "0xE8CeAa79f082768f99266dFd208d665d2Dd18f53";
const ETH_PRIME_CONVERTER = "0xca430B8A97Ea918fF634162acb0b731445B8195E";
const XVS_VAULT_CONVERTER = "0xd5b9AE835F4C59272032B3B954417179573331E0";
export const CONVERSION_INCENTIVE = 1e14;

// Refunds
export const VANGUARD_VANTAGE_TREASURY = "0xf645a387180F5F74b968305dF81d54EB328d21ca";
export const PT_SUSDE_PROVIDER = "0x63f6D9E7d3953106bCaf98832BD9C88A54AfCc9D";
export const VANGUARD_VANTAGE_AMOUNT_USDT = parseUnits("10000", 18);
export const PT_SUSDE_PROVIDER_AMOUNT_USDT = parseUnits("100", 18);

export const converterBaseAssets = {
  [RISK_FUND_CONVERTER]: USDT,
  [USDT_PRIME_CONVERTER]: USDT,
  [USDC_PRIME_CONVERTER]: USDC,
  [BTCB_PRIME_CONVERTER]: BTCB,
  [ETH_PRIME_CONVERTER]: ETH,
  [XVS_VAULT_CONVERTER]: XVS,
};

const commonSpec = {
  decimals: 8,
  comptroller: UNITROLLER,
  isLegacyPool: true,
};

export const tokens = {
  "PT-sUSDE-26JUN2025": {
    address: "0xDD809435ba6c9d6903730f923038801781cA66ce",
    decimals: 18,
    symbol: "PT-sUSDE-26JUN2025",
  },
  sUSDe: {
    address: "0x211Cc4DD073734dA055fbF44a2b4667d5E5fE5d2",
    decimals: 18,
    symbol: "sUSDe",
  },
  USDe: {
    address: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
    decimals: 18,
    symbol: "USDe",
  },
};

export const marketSpecs = {
  "PT-sUSDE-26JUN2025": {
    vToken: {
      address: "0x9e4E5fed5Ac5B9F732d0D850A615206330Bf1866",
      name: "Venus PT-sUSDE-26JUN2025",
      symbol: "vPT-sUSDE-26JUN2025",
      underlying: tokens["PT-sUSDE-26JUN2025"],
      exchangeRate: parseUnits("1.0000000000003908632302865096", 28),
      ...commonSpec,
    },
    interestRateModel: {
      address: "0x62A8919C4C413fd4F9aef7348540Bc4B1b5CC805",
      base: "0",
      multiplier: "0.1",
      jump: "2.5",
      kink: "0.8",
    },
    initialSupply: {
      amount: parseUnits("10424.583228294074586275", 18),
      vTokensToBurn: parseUnits("100", 8), // Approximately $100
      vTokenReceiver: PT_SUSDE_PROVIDER,
    },
    riskParameters: {
      collateralFactor: parseUnits("0.7", 18),
      reserveFactor: parseUnits("0", 18),
      supplyCap: parseUnits("2000000", 18),
      borrowCap: parseUnits("0", 18),
    },
  },
  sUSDe: {
    vToken: {
      address: "0x699658323d58eE25c69F1a29d476946ab011bD18",
      name: "Venus sUSDe",
      symbol: "vsUSDe",
      underlying: tokens.sUSDe,
      exchangeRate: parseUnits("1.0000000000012074977831117236", 28),
      ...commonSpec,
    },
    interestRateModel: {
      address: "0x62A8919C4C413fd4F9aef7348540Bc4B1b5CC805",
      base: "0",
      multiplier: "0.1",
      jump: "2.5",
      kink: "0.8",
    },
    initialSupply: {
      amount: parseUnits("4293.918338835184896875", 18),
      vTokensToBurn: parseUnits("100", 8), // Approximately $100
      vTokenReceiver: VTREASURY,
    },
    riskParameters: {
      collateralFactor: parseUnits("0.75", 18),
      reserveFactor: parseUnits("0", 18),
      supplyCap: parseUnits("2000000", 18),
      borrowCap: parseUnits("0", 18),
    },
  },
  USDe: {
    vToken: {
      address: "0x74ca6930108F775CC667894EEa33843e691680d7",
      name: "Venus USDe",
      symbol: "vUSDe",
      underlying: tokens.USDe,
      exchangeRate: parseUnits("1.0000000000007469910987686835", 28),
      ...commonSpec,
    },
    interestRateModel: {
      address: "0xF874A969d504e0b1b2021d76A2c438B841124715",
      base: "0",
      multiplier: "0.075",
      jump: "0.5",
      kink: "0.8",
    },
    initialSupply: {
      amount: parseUnits("5003.493736623737565284", 18),
      vTokensToBurn: parseUnits("100", 8), // Approximately $100
      vTokenReceiver: VTREASURY,
    },
    riskParameters: {
      collateralFactor: parseUnits("0.75", 18),
      reserveFactor: parseUnits("0.25", 18),
      supplyCap: parseUnits("2000000", 18),
      borrowCap: parseUnits("1600000", 18),
    },
  },
};

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

const configureConverters = (fromAssets: string[], incentive: BigNumberish = CONVERSION_INCENTIVE) => {
  enum ConversionAccessibility {
    NONE = 0,
    ALL = 1,
    ONLY_FOR_CONVERTERS = 2,
    ONLY_FOR_USERS = 3,
  }

  return Object.entries(converterBaseAssets).map(([converter, baseAsset]: [string, string]) => {
    const conversionConfigs = fromAssets.map(() => [incentive, ConversionAccessibility.ALL]);
    return {
      target: converter,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [baseAsset, fromAssets, conversionConfigs],
    };
  });
};

/**
 * The PendleOracle.getPtToSyRate uses under the hood the `BnbMultiFeedAdapterWithoutRoundsV2` contract deployed at 0x66bc141ce144e4b909f8c40c951750936d5f9664.
 * That contract has a check on staleness, reverting the transaction if the prices wasn't updated in the last 30 hours. That is incompatible with the full
 * Governance process for a Normal VIP. So, only for the simulation, setting `mockPendleOracleConfiguration` true, the price of the PT token will be fixed.
 */
const getPendleOracleCommand = (mockPendleOracleConfiguration: boolean) => {
  if (mockPendleOracleConfiguration) {
    return [
      {
        target: REDSTONE_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [tokens["PT-sUSDE-26JUN2025"].address, PT_SUSDE_FIXED_PRICE],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            tokens["PT-sUSDE-26JUN2025"].address,
            [REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
      },
    ];
  } else {
    return [
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            tokens["PT-sUSDE-26JUN2025"].address,
            [PT_SUSDE_PENDLE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
      },
    ];
  }
};

const getOracleCommands = (overrides: { maxStalePeriod?: number; mockPendleOracleConfiguration?: boolean }) => {
  return [
    // Configure Oracle for USDe
    {
      target: REDSTONE_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[tokens.USDe.address, USDE_REDSTONE_FEED, overrides?.maxStalePeriod || USDE_REDSTONE_MAX_STALE_PERIOD]],
    },
    {
      target: CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [
        [tokens.USDe.address, USDE_CHAINLINK_FEED, overrides?.maxStalePeriod || USDE_CHAINLINK_MAX_STALE_PERIOD],
      ],
    },
    {
      target: BOUND_VALIDATOR,
      signature: "setValidateConfig((address,uint256,uint256))",
      params: [[tokens.USDe.address, UPPER_BOUND_RATIO, LOWER_BOUND_RATIO]],
    },
    {
      target: RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [[tokens.USDe.address, [REDSTONE_ORACLE, CHAINLINK_ORACLE, CHAINLINK_ORACLE], [true, true, true]]],
    },

    // Configure Oracle for sUSDe
    {
      target: REDSTONE_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [
        [tokens.sUSDe.address, SUSDE_REDSTONE_FEED, overrides?.maxStalePeriod || SUSDE_REDSTONE_MAX_STALE_PERIOD],
      ],
    },
    {
      target: CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [
        [tokens.sUSDe.address, SUSDE_CHAINLINK_FEED, overrides?.maxStalePeriod || SUSDE_CHAINLINK_MAX_STALE_PERIOD],
      ],
    },
    {
      target: BOUND_VALIDATOR,
      signature: "setValidateConfig((address,uint256,uint256))",
      params: [[tokens.sUSDe.address, UPPER_BOUND_RATIO, LOWER_BOUND_RATIO]],
    },
    {
      target: RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          tokens.sUSDe.address,
          [SUSDE_ONEJUMP_REDSTONE_ORACLE, SUSDE_ONEJUMP_CHAINLINK_ORACLE, SUSDE_ONEJUMP_CHAINLINK_ORACLE],
          [true, true, true],
        ],
      ],
    },

    // Configure Oracle for PT-sUSDe-26JUN2026
    ...getPendleOracleCommand(!!overrides?.mockPendleOracleConfiguration),
  ];
};

export const vip480OnlyOracles = (overrides: { maxStalePeriod?: number; mockPendleOracleConfiguration?: boolean }) => {
  const meta = {
    version: "v2",
    title: "VIP-480 Ethena oracles",
    description: `VIP-480 Ethena oracles`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(getOracleCommands(overrides), meta, ProposalType.CRITICAL);
};

export const vip480 = (overrides: { maxStalePeriod?: number; mockPendleOracleConfiguration?: boolean }) => {
  const meta = {
    version: "v2",
    title: "VIP-480 [BNB Chain] New sUSDe, USDe and PT-sUSDE-26JUN2025 markets in the Core pool",
    description: `#### Summary

If passed, this VIP will add three new markets to the Core pool on BNB Chain, for the following underlying assets:

- [USDe](https://bscscan.com/address/0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34)
- [sUSDe](https://bscscan.com/address/0x211cc4dd073734da055fbf44a2b4667d5e5fe5d2)
- [PT-sUSDE-26JUN2025](https://bscscan.com/address/0xdd809435ba6c9d6903730f923038801781ca66ce)

Community posts associated with these markets:

- [Proposal: Listing PT-sUSDe (26 June) on Venus BNB Core Pool](https://community.venus.io/t/proposal-listing-pt-susde-26-june-on-venus-bnb-core-pool/5026)
- [Proposal: Listing sUSDe and USDe on Venus BNB Core Pool](https://community.venus.io/t/proposal-listing-susde-and-usde-on-venus-bnb-core-pool/5018)

#### Description

**Risk parameters of the new markets**

Underlying token: [PT-sUSDE-26JUN2025](https://bscscan.com/address/0xdd809435ba6c9d6903730f923038801781ca66ce)

- Borrow cap: 0
- Supply cap: 2,000,000
- Collateral factor: 0.7
- Reserve factor: 0
- Bootstrap liquidity: 10,424.58 PT-sUSDE-26JUN2025 - provided by the market supporter [0x63f6D9E7d3953106bCaf98832BD9C88A54AfCc9D](https://bscscan.com/address/0x63f6D9E7d3953106bCaf98832BD9C88A54AfCc9D)
- Interest rates (not relevant, because the asset is not borrowable, but configured anyway):
    - kink: 0.8
    - base (yearly): 0
    - multiplier (yearly): 0.1
    - jump multiplier (yearly): 2.5

Underlying token: [sUSDe](https://bscscan.com/address/0x211cc4dd073734da055fbf44a2b4667d5e5fe5d2)

- Borrow cap: 0
- Supply cap: 2,000,000
- Collateral factor: 0.75
- Reserve factor: 0
- Bootstrap liquidity: 4,293.91 sUSDe - provided by the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9)
- Interest rates (not relevant, because the asset is not borrowable, but configured anyway):
    - kink: 0.8
    - base (yearly): 0
    - multiplier (yearly): 0.1
    - jump multiplier (yearly): 2.5

Underlying token: [USDe](https://bscscan.com/address/0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34)

- Borrow cap: 1,600,000
- Supply cap: 2,000,000
- Collateral factor: 0.75
- Reserve factor: 0.25
- Bootstrap liquidity: 5,003.49 USDe - provided by the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9)
- Interest rates (not relevant, because the asset is not borrowable, but configured anyway):
    - kink: 0.8
    - base (yearly): 0
    - multiplier (yearly): 0.075
    - jump multiplier (yearly): 0.5

**Oracle configuration**

- PT-sUSDE-26JUN2025
    - Main oracle: [PendleOracle](https://bscscan.com/address/0x176ca46D7DcB4e001b8ee5F12d0fcd6D279214f4), that will internally use the ratio PT-USDe-26JUN2025/sUSDe/USDe ([oracle](https://bscscan.com/address/0x9a9Fa8338dd5E5B2188006f1Cd2Ef26d921650C2), [market](https://bscscan.com/address/0x8557D39d4BAB2b045ac5c2B7ea66d12139da9Af4), [underlying token](https://bscscan.com/address/0x211Cc4DD073734dA055fbF44a2b4667d5E5fE5d2), twap duration: 1,800 seconds)
- sUSDe
    - Main oracle: [OneJumpOracle](https://bscscan.com/address/0xa1df2f18c74db5bed3a7752547f6cc3094a1a2d5)
        - Correlated token: [sUSDe](https://bscscan.com/address/0x211cc4dd073734da055fbf44a2b4667d5e5fe5d2)
        - Underlying token: [USDe](https://bscscan.com/address/0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34)
        - Intermediate oracle: [RedStoneOracle](https://bscscan.com/address/0x8455EFA4D7Ff63b8BFD96AdD889483Ea7d39B70a), using its price feed [sUSDe/USDe](https://bscscan.com/address/0x5ED849a45B4608952161f45483F4B95BCEa7f8f0)
    - Pivot and fallback oracles: [OneJumpOracle](https://bscscan.com/address/0xBBe2Dc15A533DEF04D7e84Ad8aF89d62a0E5662f)
        - Correlated token: [sUSDe](https://bscscan.com/address/0x211cc4dd073734da055fbf44a2b4667d5e5fe5d2)
        - Underlying token: [USDe](https://bscscan.com/address/0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34)
        - Intermediate oracle: [ChainlinkOracle](https://bscscan.com/address/0x1B2103441A0A108daD8848D8F5d790e4D402921F), using its price feed [sUSDe/USDe](https://bscscan.com/address/0x1a269eA1b209DA2c12bDCDab22635C9e6C5028B2)
- USDe
    - Main oracle: [RedStoneOracle](https://bscscan.com/address/0x8455EFA4D7Ff63b8BFD96AdD889483Ea7d39B70a) ([feed](https://bscscan.com/address/0x0d9b42a2a73Ec528759701D0B70Ccf974a327EBb))
    - Pivot and fallback oracles: [ChainlinkOracle](https://bscscan.com/address/0x1B2103441A0A108daD8848D8F5d790e4D402921F) ([feed](https://bscscan.com/address/0x10402B01cD2E6A9ed6DBe683CbC68f78Ff02f8FC))

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, validating the new markets are properly added to the Core pool on BNB Chain, with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same markets have been deployed to testnet, and used in the Venus Protocol testnet deployment

#### Contracts on mainnet

- VToken_vPT-USDE-26JUN2025: [0x9e4E5fed5Ac5B9F732d0D850A615206330Bf1866](https://bscscan.com/address/0x9e4E5fed5Ac5B9F732d0D850A615206330Bf1866)
- VToken_vsUSDe: [0x699658323d58eE25c69F1a29d476946ab011bD18](https://bscscan.com/address/0x699658323d58eE25c69F1a29d476946ab011bD18)
- VToken_vUSDe: [0x74ca6930108F775CC667894EEa33843e691680d7](https://bscscan.com/address/0x74ca6930108F775CC667894EEa33843e691680d7)

#### Contracts on testnet

- VToken_vPT-USDE-26JUN2025: [0x90535B06ddB00453a5e5f2bC094d498F1cc86032](https://testnet.bscscan.com/address/0x90535B06ddB00453a5e5f2bC094d498F1cc86032)
- VToken_vsUSDe: [0x8c8A1a0b6e1cb8058037F7bF24de6b79Aca5B7B0](https://testnet.bscscan.com/address/0x8c8A1a0b6e1cb8058037F7bF24de6b79Aca5B7B0)
- VToken_vUSDe: [0x86f8DfB7CA84455174EE9C3edd94867b51Da46BD](https://testnet.bscscan.com/address/0x86f8DfB7CA84455174EE9C3edd94867b51Da46BD)

#### Refunds

- [Vanguard Treasury](https://bscscan.com/address/0xf645a387180F5F74b968305dF81d54EB328d21ca) will be refunded in this VIP with 10,000 USDT, because it provided the bootstrap liquidity for USDe and sUSDe to the Venus Treasury (the minted VTokens will be held by the Treasury):
    - 5,003.49 USDe [here](https://bscscan.com/tx/0xfb6e338a60723add772e7958be09d0644f3bcfd5f6c370d1dc4d5be48137ce53)
    - 4,293.91 sUSDe [here](https://bscscan.com/tx/0xd825ff3f5f2d45111f63d2257fc074dbc3c7eeceb0d6cea84eb5c38a723cc643)
- [0x63f6D9E7d3953106bCaf98832BD9C88A54AfCc9D](https://bscscan.com/address/0x63f6D9E7d3953106bCaf98832BD9C88A54AfCc9D) will be refunded in this VIP with 100 USDT, because it provided the bootstrap liquidity for PT-sUSDE-26JUN2025 ([here](https://bscscan.com/tx/0x74508b81e7e5c9fe23c2d2ae4ffefee51879806e92ab33aec17cc0ea9a905ba4)), and it will receive the minted VTokens, except $100 that will be burnt for security reasons.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/537)
- [Source code of the PendleOracle](https://github.com/VenusProtocol/oracle/blob/main/contracts/oracles/PendleOracle.sol)
- [Execution of the proposal enabling the markets on testnet](https://testnet.bscscan.com/tx/0x7ba30a7db615032d4317b280b4a8512bf37cfc6f1314b0e1edb24e6b5439b3b6)
- [Chaos Labs recommendations about PT-sUSDE-26JUN2025](https://community.venus.io/t/proposal-listing-pt-susde-26-june-on-venus-bnb-core-pool/5026/7)
- [Chaos Labs recommendations about sUSDe and USDe](https://community.venus.io/t/proposal-listing-susde-and-usde-on-venus-bnb-core-pool/5018/6)
- Snapshot “[Proposal: Listing PT-sUSDe (26 June) on Venus BNB Core Pool](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xab21fef6201727fc4059943e7ebe8a958b83a57edd8425f89056c0b5320274c5)”
- Snapshot “[Proposal: Listing sUSDe and USDe on Venus BNB Core Pool](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xb7f66266542ed23ec10b5fbaea65eb56ec9a030b86290f53734560f3de554375)”
- [Documentation](https://docs.venus.io/whats-new/isolated-pools)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      ...getOracleCommands(overrides),

      // Add Markets
      ...Object.values(marketSpecs).flatMap(({ vToken, initialSupply, riskParameters }) => [
        {
          target: vToken.comptroller,
          signature: "_supportMarket(address)",
          params: [vToken.address],
        },

        {
          target: vToken.comptroller,
          signature: "_setMarketSupplyCaps(address[],uint256[])",
          params: [[vToken.address], [riskParameters.supplyCap]],
        },

        {
          target: vToken.comptroller,
          signature: "_setMarketBorrowCaps(address[],uint256[])",
          params: [[vToken.address], [riskParameters.borrowCap]],
        },

        {
          target: vToken.comptroller,
          signature: "_setCollateralFactor(address,uint256)",
          params: [vToken.address, riskParameters.collateralFactor],
        },

        {
          target: vToken.address,
          signature: "setAccessControlManager(address)",
          params: [ACCESS_CONTROL_MANAGER],
        },
        {
          target: vToken.address,
          signature: "setProtocolShareReserve(address)",
          params: [PROTOCOL_SHARE_RESERVE],
        },

        {
          target: vToken.address,
          signature: "setReduceReservesBlockDelta(uint256)",
          params: [REDUCE_RESERVES_BLOCK_DELTA],
        },
        {
          target: vToken.address,
          signature: "_setReserveFactor(uint256)",
          params: [riskParameters.reserveFactor],
        },

        // Mint initial supply
        {
          target: VTREASURY,
          signature: "withdrawTreasuryBEP20(address,uint256,address)",
          params: [vToken.underlying.address, initialSupply.amount, NORMAL_TIMELOCK],
        },
        {
          target: vToken.underlying.address,
          signature: "approve(address,uint256)",
          params: [vToken.address, initialSupply.amount],
        },
        {
          target: vToken.address,
          signature: "mintBehalf(address,uint256)",
          params: [NORMAL_TIMELOCK, initialSupply.amount],
        },
        {
          target: vToken.underlying.address,
          signature: "approve(address,uint256)",
          params: [vToken.address, 0],
        },

        // Burn some vtokens
        {
          target: vToken.address,
          signature: "transfer(address,uint256)",
          params: [ethers.constants.AddressZero, initialSupply.vTokensToBurn],
        },
        (() => {
          const vTokensMinted = convertAmountToVTokens(initialSupply.amount, vToken.exchangeRate);
          const vTokensRemaining = vTokensMinted.sub(initialSupply.vTokensToBurn);
          return {
            target: vToken.address,
            signature: "transfer(address,uint256)",
            params: [initialSupply.vTokenReceiver, vTokensRemaining],
          };
        })(),
      ]),

      // Pause actions
      {
        target: UNITROLLER,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[marketSpecs.sUSDe.vToken.address, marketSpecs["PT-sUSDE-26JUN2025"].vToken.address], [2], true],
      },

      ...configureConverters(Object.values(tokens).map(({ address }) => address)),

      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, VANGUARD_VANTAGE_AMOUNT_USDT, VANGUARD_VANTAGE_TREASURY],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, PT_SUSDE_PROVIDER_AMOUNT_USDT, PT_SUSDE_PROVIDER],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip480;
