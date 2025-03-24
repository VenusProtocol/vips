import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";
import { NORMAL_TIMELOCK } from "src/vip-framework";

const { VTREASURY, RESILIENT_ORACLE, UNITROLLER, ACCESS_CONTROL_MANAGER, CHAINLINK_ORACLE } =
  NETWORK_ADDRESSES.bscmainnet;
export const VANGUARD_TREASURY = "0xf645a387180F5F74b968305dF81d54EB328d21ca";
export const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
export const SOL_CHAINLINK_FEED = "0x0E8a53DD9c13589df6382F13dA6B3Ec8F919B323";
const CHAINLINK_STALE_PERIOD = 15 * 60; // 15 minutes
const REDUCE_RESERVES_BLOCK_DELTA = "28800";

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

export const VANGUARD_REFUND_AMOUNT = parseUnits("5000", 18);

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
    address: "0xBf515bA4D1b52FFdCeaBF20d31D705Ce789F2cEC",
    name: "Venus SOL",
    symbol: "vSOL",
    underlying: {
      address: "0x570A5D26f7765Ecb712C0924E4De545B89fD43dF",
      decimals: 18,
      symbol: "SOL",
    },
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: UNITROLLER,
    isLegacyPool: true,
  },
  interestRateModel: {
    address: "0x2dE4739a9C68B02B54C0d8323752551d724b3cc2",
    base: "0.02",
    multiplier: "0.2",
    jump: "3",
    kink: "0.5",
  },
  initialSupply: {
    amount: parseUnits("21.2829576", 18),
    vTokenReceiver: "0xF322942f644A996A617BD29c16bd7d231d9F35E9",
  },
  riskParameters: {
    collateralFactor: parseUnits("0.72", 18),
    reserveFactor: parseUnits("0.2", 18),
    supplyCap: parseUnits("18000", 18),
    borrowCap: parseUnits("9000", 18),
  },
};

const configureConverters = (fromAssets: string[]) => {
  enum ConversionAccessibility {
    NONE = 0,
    ALL = 1,
    ONLY_FOR_CONVERTERS = 2,
    ONLY_FOR_USERS = 3,
  }

  return Object.entries(converterBaseAssets).map(([converter, baseAsset]: [string, string]) => {
    const conversionConfig = [[CONVERSION_INCENTIVE, ConversionAccessibility.ALL]];
    return {
      target: converter,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [baseAsset, fromAssets, conversionConfig],
    };
  });
};

export const vip443 = (overrides: { chainlinkStalePeriod?: number }) => {
  const meta = {
    version: "v2",
    title: "VIP-443 [BNB Chain] New Solana (SOL) market in the Core pool",
    description: `#### Summary

If passed, this VIP will add a market for [SOL](https://bscscan.com/address/0x570A5D26f7765Ecb712C0924E4De545B89fD43dF) to the Core pool on BNB Chain, following the Community proposal “[Add support for binance pegged SOL to Venus core pool on BNB chain](https://community.venus.io/t/add-support-for-binance-pegged-sol-to-venus-core-pool-on-bnb-chain/4843)” and [the associated snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xf201cf1a278e7d27b6cb4709d444a5649abbc9bc9f07a4c194edeecd9c86e3d0).

#### Description

**Risk parameters for SOL**

Following [Chaos Labs recommendations](https://community.venus.io/t/add-support-for-binance-pegged-sol-to-venus-core-pool-on-bnb-chain/4843/8), the risk parameters for the new market are:

Underlying token: [SOL](https://bscscan.com/address/0x570A5D26f7765Ecb712C0924E4De545B89fD43dF)

- Borrow cap: 9,000 SOL
- Supply cap: 18,000 SOL
- Collateral factor: 72%
- Reserve factor: 20%

Bootstrap liquidity: 21.2829576 SOL provided by the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9) (refunding 5,000 USDT to the Vanguard Treasury, [that provided the liquidity](https://bscscan.com/tx/0xf2b4c2866bdf9f2e8c64cc74d888c904f3bb928da8754f7097eb7e9f2fbda007))

Interest rate curve for the new market:

- kink: 50%
- base (yearly): 2%
- multiplier (yearly): 20%
- jump multiplier (yearly): 300%

**Oracles configuration for SOL**

The [ResilientOracle](https://docs-v4.venus.io/risk/resilient-price-oracle) deployed to [BNB Chain](https://bscscan.com/address/0x6592b5DE802159F3E74B2486b091D11a8256ab8A) is used for SOL, using under the hood the Chainlink price ([feed](https://bscscan.com/address/0x0E8a53DD9c13589df6382F13dA6B3Ec8F919B323)).

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, validating the new market is properly added to the Core pool on BNB Chain, with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same markets have been deployed to testnet, and used in the Venus Protocol testnet deployment

#### Deployed contracts

BNB Chain

- vSOL: [0xBf515bA4D1b52FFdCeaBF20d31D705Ce789F2cEC](https://bscscan.com/address/0xBf515bA4D1b52FFdCeaBF20d31D705Ce789F2cEC)

BNB Chain testnet

- vSOL: [0xbd9EB061444665Df7282Ec0888b72D60aC41Eb8C](https://testnet.bscscan.com/address/0xbd9EB061444665Df7282Ec0888b72D60aC41Eb8C)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/474)
- [Deployment to BNB Chain testnet](https://testnet.bscscan.com/tx/0x443fe4a8e7e5ca3a43e7d1af607837d0dc32aecc2155e0eed3e7ac349236315d)
- [Documentation](https://docs-v4.venus.io/)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  const chainlinkStalePeriod = overrides?.chainlinkStalePeriod || CHAINLINK_STALE_PERIOD;

  return makeProposal(
    [
      {
        target: CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[marketSpec.vToken.underlying.address, SOL_CHAINLINK_FEED, chainlinkStalePeriod]],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            marketSpec.vToken.underlying.address,
            [CHAINLINK_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
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
        params: [USDT, VANGUARD_REFUND_AMOUNT, VANGUARD_TREASURY],
      },

      ...configureConverters([marketSpec.vToken.underlying.address]),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip443;
