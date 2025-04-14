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
const USDT = "0x55d398326f99059fF775485246999027B3197955";
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
      vTokenReceiver: "0x63f6D9E7d3953106bCaf98832BD9C88A54AfCc9D",
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
      exchangeRate: parseUnits("1", 28),
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
      amount: parseUnits("4300", 18),
      vTokensToBurn: parseUnits("100", 8), // Approximately $100
      vTokenReceiver: VTREASURY, // TODO: confirm this
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
      exchangeRate: parseUnits("1", 28),
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
      amount: parseUnits("5000", 18),
      vTokensToBurn: parseUnits("100", 8), // Approximately $100
      vTokenReceiver: VTREASURY, // TODO: confirm this
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
    title: "VIP-480 Ethena markets in the Core pool",
    description: `VIP-480 Ethena markets in the Core pool`,
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
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip480;
