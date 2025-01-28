import { BigNumberish } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";
import { NORMAL_TIMELOCK } from "src/vip-framework";

import vip435ArbitrumOneCommands from "./arbitrumone-commands";

const { VTREASURY, RESILIENT_ORACLE, REDSTONE_ORACLE, UNITROLLER, ACCESS_CONTROL_MANAGER } =
  NETWORK_ADDRESSES.bscmainnet;
export const VANGUARD_TREASURY = "0xf645a387180F5F74b968305dF81d54EB328d21ca";
export const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
export const THE_REDSTONE_FEED = "0xFB1267A29C0aa19daae4a483ea895862A69e4AA5";
const THE_MAX_STALE_PERIOD = 30 * 60; // 30 minutes
const REDUCE_RESERVES_BLOCK_DELTA = "28800";

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

export const THE_INCENTIVES = parseUnits("105361", 18);

export const CONVERSION_INCENTIVE = 1e14;
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
    address: "0x86e06EAfa6A1eA631Eab51DE500E3D474933739f",
    name: "Venus THE",
    symbol: "vTHE",
    underlying: {
      address: "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11",
      decimals: 18,
      symbol: "THE",
    },
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: UNITROLLER,
    isLegacyPool: true,
  },
  interestRateModel: {
    address: "0x77C50b4d5d8b84511a4787aaF5BC22E5A496B1Ef",
    base: "0",
    multiplier: "0.09",
    jump: "3.5",
    kink: "0.45",
  },
  initialSupply: {
    amount: parseUnits("12286", 18),
    vTokenReceiver: "0x1c6C2498854662FDeadbC4F14eA2f30ca305104b",
  },
  riskParameters: {
    collateralFactor: parseUnits("0.53", 18),
    reserveFactor: parseUnits("0.25", 18),
    supplyCap: parseUnits("2400000", 18),
    borrowCap: parseUnits("1200000", 18),
  },
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

export const vip435 = (overrides: { chainlinkStalePeriod?: number }) => {
  const meta = {
    version: "v2",
    title: "VIP-435 [BNB Chain][Arbitrum] New Thena and gmBTC markets",
    description: `#### Summary

If passed, this VIP will add a market for [Thena (THE)](https://bscscan.com/address/0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11) to the Core pool on BNB Chain, following the Community proposal “[Add a Core Pool market for $THE (Thena.fi) on Venus](https://community.venus.io/t/add-a-core-pool-market-for-the-thena-fi-on-venus/3671)” and [the associated snapshot](https://snapshot.org/#/s:venus-xvs.eth/proposal/0xe9c800c283a6fd8ffb71ab042f77cb9380fc310cb8cdc839fb020f681f27aebe). Moreover, this VIP would transfer 105,361 [THE](https://bscscan.com/address/0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11) tokens from the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9) to the [Vanguard Treasury](https://bscscan.com/address/0xf645a387180F5F74b968305dF81d54EB328d21ca) to be used as incentives, with [Merkl](https://merkl.xyz/) campaigns.

Regarding gmBTC, if passed, this VIP will add a market for [gmBTC (BTC-USDC)](https://arbiscan.io/address/0x47c031236e19d024b42f8AE6780E44A573170703) to the Core pool on Arbitrum one, following the Community proposal “[Add gmBTC on Venus Protocol](https://community.venus.io/t/add-gmbtc-on-venus-protocol/4693)” and [the associated snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0xdd099e5ecdcc88e67c3e4d3db8b321052b62bb4bab10350c07f6710201143bcf). Moreover, this VIP would transfer 10,000 [gmBTC (BTC-BTC)](https://arbiscan.io/address/0x7C11F78Ce78768518D743E81Fdfa2F860C6b9A77) tokens from the [Venus Treasury](https://arbiscan.io/address/0x8a662ceac418daef956bc0e6b2dd417c80cda631) to the [GMX.io](https://arbiscan.io/address/0xe1f7c5209938780625E354dc546E28397F6Ce174) project. They [provided these tokens](https://arbiscan.io/tx/0xa535d07c55541295db25da471547346b4f2db24344fb99e1ce30384740912e0c), but they are now unnecessary to launch the new market.

#### Description

**Risk parameters for Thena**

Following [Chaos Labs recommendations](https://community.venus.io/t/the-listing-on-bnb-core-pool/4835), the risk parameters for the new market are:

Underlying token: [THE](https://bscscan.com/address/0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11)

- Borrow cap: 1,200,000 THE
- Supply cap: 2,400,000 THE
- Collateral factor: 53%
- Reserve factor: 25%

Bootstrap liquidity: 12,286 THE provided by the [Thena project](https://bscscan.com/address/0x1c6C2498854662FDeadbC4F14eA2f30ca305104b).

The interest rate curve for the new market is not relevant because the asset is not borrowable, but these parameters will be set anyway:

- kink: 45%
- base (yearly): 0%
- multiplier (yearly): 9%
- jump multiplier (yearly): 350%

**Oracles configuration for Thena**

The [ResilientOracle](https://docs-v4.venus.io/risk/resilient-price-oracle) deployed to [BNB Chain](https://bscscan.com/address/0x6592b5DE802159F3E74B2486b091D11a8256ab8A) is used for THE, using under the hood the RedStone price ([feed](https://bscscan.com/address/0xFB1267A29C0aa19daae4a483ea895862A69e4AA5)).

**Risk parameters for gmBTC**

Following [Chaos Labs recommendations](https://community.venus.io/t/add-gmbtc-on-venus-protocol/4693/9), the risk parameters for the new market are:

Underlying token: [gmBTC (BTC-USDC)](https://arbiscan.io/address/0x47c031236e19d024b42f8AE6780E44A573170703)

- Borrow cap: 0 gmBTC (BTC-USDC)
- Supply cap: 2,650,000 gmBTC (BTC-USDC)
- Collateral factor: 55%
- Liquidation threshold: 60%
- Reserve factor: - (not relevant because the asset won’t be borrowable)

Bootstrap liquidity: 4,800 gmBTC (BTC-USDC) provided by [GMX.io](https://arbiscan.io/address/0xe1f7c5209938780625E354dc546E28397F6Ce174).

The interest rate curve for the new market is not relevant because the asset is not borrowable, but these parameters will be set anyway:

- kink: 45%
- base (yearly): 0%
- multiplier (yearly): 15%
- jump multiplier (yearly): 250%

**Oracles configuration for gmBTC**

The [ResilientOracle](https://docs-v4.venus.io/risk/resilient-price-oracle) deployed to [Arbitrum one](https://arbiscan.io/address/0xd55A98150e0F9f5e3F6280FC25617A5C93d96007) is used for gmBTC (BTC-USDC), using under the hood the Chainlink price ([feed](https://arbiscan.io/address/0x395D5c5D552Df670dc4B2B1cef0c4EABfFba492f)).

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, validating the new markets are properly added to the Core pool on BNB Chain (THE) and to the Core pool on Arbitrum one (gmBTC), with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same markets have been deployed to testnet, and used in the Venus Protocol testnet deployment

#### Deployed contracts

BNB Chain

- vTHE: [0x86e06EAfa6A1eA631Eab51DE500E3D474933739f](https://bscscan.com/address/0x86e06EAfa6A1eA631Eab51DE500E3D474933739f)

BNB Chain testnet

- vTHE: [0x39A239F5117BFaC7a1b0b3A517c454113323451d](https://testnet.bscscan.com/address/0x39A239F5117BFaC7a1b0b3A517c454113323451d)

Arbitrum one

- vgmBTC-USDC_Core: [0x4f3a73f318C5EA67A86eaaCE24309F29f89900dF](https://arbiscan.io/address/0x4f3a73f318C5EA67A86eaaCE24309F29f89900dF)

Arbitrum sepolia

- vgmBTC-USDC_Core: [0x6089B1F477e13459C4d1D1f767c974e5A72a541F](https://arbiscan.io/address/0x6089B1F477e13459C4d1D1f767c974e5A72a541F)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/468)
- [Deployment of gmBTC to Arbitrum Sepolia](https://sepolia.arbiscan.io/tx/0x7499aab5859f5a2e59b3c698cdcbf1392ed4e05660f3517bb0448ccdaba0be0b)
- [Deployment of THE to BNB Chain testnet](https://testnet.bscscan.com/tx/0xd48f6e8fa7a422abc6d9c95f567952055e8804c1b2bc5f0cb91726b006ff6d8f)
- [Documentation](https://docs-v4.venus.io/)
`,
    forDescription: "Process to configure and launch the new markets",
    againstDescription: "Defer configuration and launch of the new markets",
    abstainDescription: "No opinion on the matter",
  };

  return makeProposal(
    [
      // Configure Oracle
      {
        target: REDSTONE_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[marketSpec.vToken.underlying.address, THE_REDSTONE_FEED, THE_MAX_STALE_PERIOD]],
      },

      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            marketSpec.vToken.underlying.address,
            [REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
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
        target: marketSpec.vToken.comptroller,
        signature: "_setCollateralFactor(address,uint256)",
        params: [marketSpec.vToken.address, marketSpec.riskParameters.collateralFactor],
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

      // Mint initial supply
      {
        target: VTREASURY,
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
        params: [marketSpec.initialSupply.vTokenReceiver, marketSpec.initialSupply.amount],
      },
      {
        target: marketSpec.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [marketSpec.vToken.address, 0],
      },

      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [marketSpec.vToken.underlying.address, THE_INCENTIVES, VANGUARD_TREASURY],
      },

      ...configureConverters([marketSpec.vToken.underlying.address]),

      ...vip435ArbitrumOneCommands(overrides),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip435;
