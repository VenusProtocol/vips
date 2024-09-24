import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const POOL_REGISTRY = "0x9F7b01A536aFA00EF10310A162877fd792cD0666";
export const COMPTROLLER = "0xBE609449Eb4D76AD8545f957bBE04b596E8fC529";
export const PRIME = "0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC";
export const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
export const TREASURY = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";
export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
export const WSTETH = "0x26c5e01524d2E6280A48F2c50fF6De7e52E9611C";
export const WEETH = "0x04C0599Ae5A44757c0af6F9eC3b93da8976c150A";
export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const WSTETH_VTOKEN = "0x94180a3948296530024Ef7d60f60B85cfe0422c8";
export const WEETH_VTOKEN = "0xc5b24f347254bD8cF8988913d1fd0F795274900F";
export const ETH_VTOKEN = "0xeCCACF760FEA7943C5b0285BD09F601505A29c05";

export const SWAP_ROUTER = "0xfb4A3c6D25B4f66C103B4CD0C0D58D24D6b51dC1";

export const BOUND_VALIDATOR = "0x6E332fF0bB52475304494E4AE5063c1051c7d735";
export const UPPER_BOUND_RATIO = parseUnits("1.01", 18);
export const LOWER_BOUND_RATIO = parseUnits("0.99", 18);
export const WSTETH_ONEJUMP_REDSTONE_ORACLE = "0x90dd7ae1137cC072F7740Ee0b264f2351515B98A";
export const WEETH_ONEJUMP_REDSTONE_ORACLE = "0xb661102c399630420A4B9fa0a5cF57161e5452F5";
export const WSTETH_ONEJUMP_CHAINLINK_ORACLE = "0x3C9850633e8Cb5ac5c3Da833C947E7c91EED15C4";
export const WEETH_ONEJUMP_CHAINLINK_ORACLE = "0x3b3241698692906310A65ACA199701843404E175";

export const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
export const WSTETH_CHAINLINK_FEED = "0x4c75d01cfa4D998770b399246400a6dc40FB9645";
export const WEETH_CHAINLINK_FEED = "0xF37Be32598E9851f785acA86c2162e7C1A8466dd";
export const CHAINLINK_STALE_PERIOD = 26 * 60 * 60; // 26 hours

export const REDSTONE_ORACLE = "0x8455EFA4D7Ff63b8BFD96AdD889483Ea7d39B70a";
export const WSTETH_REDSTONE_FEED = "0xa76dB2Cb356ba111cCB5a7Ca369D17E1592f42Dd";
export const WEETH_REDSTONE_FEED = "0x9b2C948dbA5952A1f5Ab6fA16101c1392b8da1ab";
export const REDSTONE_STALE_PERIOD = 7 * 60 * 60; // 7 hours

export const RISK_FUND_CONVERTER = "0xA5622D276CcbB8d9BBE3D1ffd1BB11a0032E53F0";
export const USDT_PRIME_CONVERTER = "0xD9f101AA67F3D72662609a2703387242452078C3";
export const USDC_PRIME_CONVERTER = "0xa758c9C215B6c4198F0a0e3FA46395Fa15Db691b";
export const BTCB_PRIME_CONVERTER = "0xE8CeAa79f082768f99266dFd208d665d2Dd18f53";
export const ETH_PRIME_CONVERTER = "0xca430B8A97Ea918fF634162acb0b731445B8195E";
export const XVS_VAULT_CONVERTER = "0xd5b9AE835F4C59272032B3B954417179573331E0";

export const FIXED_LST_PRICE = parseUnits("1.1", 18); // if wstETH price is hardcoded for the simulation
export const CLOSE_FACTOR = parseUnits("0.5", 18);
export const LIQUIDATION_INCENTIVE = parseUnits("1.02", 18);
export const MIN_LIQUIDATABLE_COLLATERAL = parseUnits("100", 18);

const commonSpec = {
  decimals: 8,
  exchangeRate: parseUnits("1", 28),
  comptroller: COMPTROLLER,
};

export const newMarkets = {
  wstETH: {
    vToken: {
      address: WSTETH_VTOKEN,
      name: "Venus wstETH (Liquid Staked ETH)",
      symbol: "vwstETH_LiquidStakedETH",
      underlying: {
        address: WSTETH,
        decimals: 18,
        symbol: "wstETH",
      },
      ...commonSpec,
    },
    riskParameters: {
      collateralFactor: parseUnits("0.9", 18),
      liquidationThreshold: parseUnits("0.93", 18),
      supplyCap: parseUnits("50", 18),
      borrowCap: parseUnits("5", 18),
      reserveFactor: parseUnits("0.25", 18),
      protocolSeizeShare: parseUnits("0.01", 18),
    },
    initialSupply: {
      amount: parseUnits("3.55", 18),
      vTokenReceiver: "0x5A9d695c518e95CD6Ea101f2f25fC2AE18486A61",
    },
    interestRateModel: {
      address: "0x7DE84548C2BaDC047C5e7F0B7f9a4ba660d10dAD",
      base: "0",
      multiplier: "0.09",
      jump: "0.75",
      kink: "0.45",
    },
  },
  weETH: {
    vToken: {
      address: WEETH_VTOKEN,
      name: "Venus weETH (Liquid Staked ETH)",
      symbol: "vweETH_LiquidStakedETH",
      underlying: {
        address: WEETH,
        decimals: 18,
        symbol: "weETH",
      },
      ...commonSpec,
    },
    riskParameters: {
      collateralFactor: parseUnits("0.9", 18),
      liquidationThreshold: parseUnits("0.93", 18),
      supplyCap: parseUnits("400", 18),
      borrowCap: parseUnits("200", 18),
      reserveFactor: parseUnits("0.25", 18),
      protocolSeizeShare: parseUnits("0.01", 18),
    },
    initialSupply: {
      amount: parseUnits("4.43236349753311919", 18),
      vTokenReceiver: "0x46cba1e9b1e5db32da28428f2fb85587bcb785e7",
    },
    interestRateModel: {
      address: "0x7DE84548C2BaDC047C5e7F0B7f9a4ba660d10dAD",
      base: "0",
      multiplier: "0.09",
      jump: "0.75",
      kink: "0.45",
    },
  },
  ETH: {
    vToken: {
      address: ETH_VTOKEN,
      name: "Venus ETH (Liquid Staked ETH)",
      symbol: "vETH_LiquidStakedETH",
      underlying: {
        address: ETH,
        decimals: 18,
        symbol: "ETH",
      },
      ...commonSpec,
    },
    riskParameters: {
      collateralFactor: parseUnits("0", 18),
      liquidationThreshold: parseUnits("0", 18),
      supplyCap: parseUnits("450", 18),
      borrowCap: parseUnits("400", 18),
      reserveFactor: parseUnits("0.15", 18),
      protocolSeizeShare: parseUnits("0.01", 18),
    },
    initialSupply: {
      amount: parseUnits("2", 18),
      vTokenReceiver: TREASURY,
    },
    interestRateModel: {
      address: "0xf03DAB984aCC5761df5f71Cc67fEA8F185f578fd",
      base: "0",
      multiplier: "0.035",
      jump: "0.8",
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

const vip400 = (overrides: { chainlinkStalePeriod?: number; redstoneStalePeriod?: number }) => {
  const meta = {
    version: "v2",
    title: "VIP-400",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  const chainlinkStalePeriod = overrides.chainlinkStalePeriod || CHAINLINK_STALE_PERIOD;
  const redstoneStalePeriod = overrides.redstoneStalePeriod || REDSTONE_STALE_PERIOD;

  return makeProposal(
    [
      // Oracle config
      {
        target: CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[WEETH, WEETH_CHAINLINK_FEED, chainlinkStalePeriod]],
      },
      {
        target: CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[WSTETH, WSTETH_CHAINLINK_FEED, chainlinkStalePeriod]],
      },
      {
        target: REDSTONE_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[WEETH, WEETH_REDSTONE_FEED, redstoneStalePeriod]],
      },
      {
        target: REDSTONE_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[WSTETH, WSTETH_REDSTONE_FEED, redstoneStalePeriod]],
      },
      ...[WSTETH, WEETH].map((token: string) => ({
        target: BOUND_VALIDATOR,
        signature: "setValidateConfig((address,uint256,uint256))",
        params: [[token, UPPER_BOUND_RATIO, LOWER_BOUND_RATIO]],
      })),
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            WSTETH,
            [WSTETH_ONEJUMP_CHAINLINK_ORACLE, WSTETH_ONEJUMP_REDSTONE_ORACLE, WSTETH_ONEJUMP_REDSTONE_ORACLE],
            [true, true, true],
          ],
        ],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            WEETH,
            [WEETH_ONEJUMP_REDSTONE_ORACLE, WEETH_ONEJUMP_CHAINLINK_ORACLE, WEETH_ONEJUMP_CHAINLINK_ORACLE],
            [true, true, true],
          ],
        ],
      },

      // Swap router
      {
        target: SWAP_ROUTER,
        signature: "acceptOwnership()",
        params: [],
      },

      // Liquid Staked ETH pool
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
        params: ["Liquid Staked ETH", COMPTROLLER, CLOSE_FACTOR, LIQUIDATION_INCENTIVE, MIN_LIQUIDATABLE_COLLATERAL],
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
          target: TREASURY,
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

      // Conversions Config
      ...Object.entries(converterBaseAssets).map(([converter, baseAsset]: [string, string]) => {
        const tokens = [WSTETH, WEETH];
        const conversionConfigs = tokens.map(() => [0, ConversionAccessibility.ALL]);
        return {
          target: converter,
          signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
          params: [baseAsset, tokens, conversionConfigs],
        };
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip400;
