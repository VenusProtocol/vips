import { BigNumber, BigNumberish } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const {
  RESILIENT_ORACLE,
  REDSTONE_ORACLE,
  UNITROLLER,
  ACCESS_CONTROL_MANAGER,
  VTREASURY,
  NORMAL_TIMELOCK,
  CHAINLINK_ORACLE,
} = NETWORK_ADDRESSES.bscmainnet;
export const BOUND_VALIDATOR = "0x6E332fF0bB52475304494E4AE5063c1051c7d735";
export const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
export const USD1 = "0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d";
export const VUSD1 = "0x0C1DA220D301155b87318B90692Da8dc43B67340";
export const REDUCE_RESERVES_BLOCK_DELTA = "28800";
export const USD1_REDSTONE_FEED = "0x6A1c87d11dDe3D1d52c24f8EC59B91019f14170D";
export const USD1_CHAINLINK_FEED = "0xaD8b4e59A7f25B68945fAf0f3a3EAF027832FFB0";
export const REDSTONE_MAX_STALE_PERIOD = 25200; // 7 hours max stale period
export const CHAINLINK_MAX_STALE_PERIOD = 93600; // 26 hours max stale period
const UPPER_BOUND_RATIO = parseUnits("1.01", 18);
const LOWER_BOUND_RATIO = parseUnits("0.99", 18);

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
export const VANGUARD_VANTAGE_AMOUNT_USDT = parseUnits("5000", 18);

export const converterBaseAssets = {
  [RISK_FUND_CONVERTER]: USDT,
  [USDT_PRIME_CONVERTER]: USDT,
  [USDC_PRIME_CONVERTER]: USDC,
  [BTCB_PRIME_CONVERTER]: BTCB,
  [ETH_PRIME_CONVERTER]: ETH,
  [XVS_VAULT_CONVERTER]: XVS,
};

export const marketSpec = {
  vToken: {
    address: VUSD1,
    name: "Venus USD1",
    symbol: "vUSD1",
    underlying: {
      address: USD1,
      decimals: 18,
      symbol: "USD1",
    },
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: UNITROLLER,
    isLegacyPool: true,
  },
  interestRateModel: {
    model: "jump",
    baseRatePerYear: "0",
    multiplierPerYear: "0.1",
    jumpMultiplierPerYear: "2.5",
    kink: "0.8",
  },
  initialSupply: {
    amount: parseUnits("4988.032727667459257279", 18),
    vTokensToBurn: parseUnits("100", 8), // Approximately $100
    vTokenReceiver: VTREASURY,
  },
  riskParameters: {
    supplyCap: parseUnits("16000000", 18),
    borrowCap: parseUnits("14400000", 18),
    collateralFactor: parseUnits("0", 18),
    reserveFactor: parseUnits("0.25", 18),
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

export const vip493 = (maxStalePeriod?: number) => {
  const meta = {
    version: "v2",
    title: "VIP-493 [BNB Chain] New USD1 market",
    description: `#### Summary

If passed, this VIP will add a market for [USD1](https://bscscan.com/address/0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d) to the Core pool on BNB Chain, following the Community proposal “[[IDEA] Add Support USD1 on Venus](https://community.venus.io/t/idea-add-support-usd1-on-venus/5039)” and [the associated snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0x62532df111b2b5f50353f8441ff0040e41fbaa903ea454a3f1fbd6faa389e705).

#### Risk parameters for USD1

Following [Chaos Labs recommendations](https://community.venus.io/t/idea-add-support-usd1-on-venus/5039/13), the risk parameters for the new market are:

Underlying token: [USD1](https://bscscan.com/address/0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d)

- Borrow cap: 14,400,000 USD1
- Supply cap: 16,000,000 USD1
- Collateral factor: 0%
- Reserve factor: 25%

Bootstrap liquidity: 4,988 USD1 provided by the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9) (Vanguard Treasury should be refunded with 5,000 USDT, because they provided the bootstrap liquidity [here](https://bscscan.com/tx/0x10ed7ba6f76cb89884bb1f5a9cfc53455e83a60b656c00d236e767207fe2cf9c))

Interest rate curve for the new market:

- kink: 80%
- base (yearly): 0%
- multiplier (yearly): 10%
- jump multiplier (yearly): 250%

#### Oracles configuration for USD1

The [ResilientOracle](https://docs-v4.venus.io/risk/resilient-price-oracle) deployed to [BNB Chain](https://bscscan.com/address/0x6592b5DE802159F3E74B2486b091D11a8256ab8A) is used for USD1, using the following configuration:

- Main oracle: [RedStoneOracle](https://bscscan.com/address/0x8455EFA4D7Ff63b8BFD96AdD889483Ea7d39B70a)
    - Feed: [0x6A1c87d11dDe3D1d52c24f8EC59B91019f14170D](https://bscscan.com/address/0x6A1c87d11dDe3D1d52c24f8EC59B91019f14170D)
    - Max stale period: 7 hours
- Pivot and fallback oracle: [ChainlinkOracle](https://bscscan.com/address/0x1B2103441A0A108daD8848D8F5d790e4D402921F)
    - Feed: [0xaD8b4e59A7f25B68945fAf0f3a3EAF027832FFB0](https://bscscan.com/address/0xaD8b4e59A7f25B68945fAf0f3a3EAF027832FFB0)
    - Max staled period: 26 hours
- Bound validator:
    - Upper bound: 1.01
    - Lower bound: 0.99

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, validating the new market is properly added to the Core pool on BNB Chain, with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same market has been deployed to testnet, and used in the Venus Protocol testnet deployment

#### Deployed contracts

BNB Chain

- vUSD1: [0x0C1DA220D301155b87318B90692Da8dc43B67340](https://bscscan.com/address/0x0C1DA220D301155b87318B90692Da8dc43B67340)

BNB Chain testnet

- vUSD1: [0x519e61D2CDA04184FB086bbD2322C1bfEa0917Cf](https://testnet.bscscan.com/address/0x519e61D2CDA04184FB086bbD2322C1bfEa0917Cf)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/548)
- [Deployment of USD1 to BNB Chain testnet](https://testnet.bscscan.com/tx/0x3b0f5d5600eb427dc09cbc9f976dde549e131225cc5f74127aae08d65b35f3e3)
- [Documentation](https://docs-v4.venus.io/)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Configure Oracle
      {
        target: REDSTONE_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [
          [marketSpec.vToken.underlying.address, USD1_REDSTONE_FEED, maxStalePeriod || REDSTONE_MAX_STALE_PERIOD],
        ],
      },
      {
        target: CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [
          [marketSpec.vToken.underlying.address, USD1_CHAINLINK_FEED, maxStalePeriod || CHAINLINK_MAX_STALE_PERIOD],
        ],
      },
      {
        target: BOUND_VALIDATOR,
        signature: "setValidateConfig((address,uint256,uint256))",
        params: [[marketSpec.vToken.underlying.address, UPPER_BOUND_RATIO, LOWER_BOUND_RATIO]],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            marketSpec.vToken.underlying.address,
            [REDSTONE_ORACLE, CHAINLINK_ORACLE, CHAINLINK_ORACLE],
            [true, true, true],
          ],
        ],
      },
      // Add Market
      {
        target: marketSpec.vToken.comptroller,
        signature: "_supportMarket(address)",
        params: [marketSpec.vToken.address],
      },
      {
        target: marketSpec.vToken.comptroller,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[marketSpec.vToken.address], [marketSpec.riskParameters.supplyCap]],
      },
      {
        target: marketSpec.vToken.comptroller,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[marketSpec.vToken.address], [marketSpec.riskParameters.borrowCap]],
      },
      {
        target: marketSpec.vToken.address,
        signature: "setAccessControlManager(address)",
        params: [ACCESS_CONTROL_MANAGER],
      },
      {
        target: marketSpec.vToken.address,
        signature: "setProtocolShareReserve(address)",
        params: [PROTOCOL_SHARE_RESERVE],
      },
      {
        target: marketSpec.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: [REDUCE_RESERVES_BLOCK_DELTA],
      },
      {
        target: marketSpec.vToken.address,
        signature: "_setReserveFactor(uint256)",
        params: [marketSpec.riskParameters.reserveFactor],
      },
      {
        target: marketSpec.initialSupply.vTokenReceiver,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [marketSpec.vToken.underlying.address, marketSpec.initialSupply.amount, NORMAL_TIMELOCK],
      },
      {
        target: marketSpec.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [marketSpec.vToken.address, marketSpec.initialSupply.amount],
      },
      {
        target: marketSpec.vToken.address,
        signature: "mintBehalf(address,uint256)",
        params: [NORMAL_TIMELOCK, marketSpec.initialSupply.amount],
      },
      {
        target: marketSpec.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [marketSpec.vToken.address, 0],
      },
      {
        target: marketSpec.vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, marketSpec.initialSupply.vTokensToBurn],
      },
      (() => {
        const vTokensMinted = convertAmountToVTokens(marketSpec.initialSupply.amount, marketSpec.vToken.exchangeRate);
        const vTokensRemaining = vTokensMinted.sub(marketSpec.initialSupply.vTokensToBurn);
        return {
          target: marketSpec.vToken.address,
          signature: "transfer(address,uint256)",
          params: [marketSpec.initialSupply.vTokenReceiver, vTokensRemaining],
        };
      })(),
      ...configureConverters([marketSpec.vToken.underlying.address]),
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, VANGUARD_VANTAGE_AMOUNT_USDT, VANGUARD_VANTAGE_TREASURY],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip493;
