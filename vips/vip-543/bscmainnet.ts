import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const bscmainnet = NETWORK_ADDRESSES.bscmainnet;
export const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
export const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
export const vWBNB = "0x6bCa74586218dB34cdB402295796b79663d816e9";
export const RATE_MODEL = "0xE82B36f4CE8A9B769036B74354588D427a724763";
export const NATIVE_TOKEN_GATEWAY_VWBNB_CORE = "0x5143eb18aA057Cd8BC9734cCfD2651823e71585f";
export const REDUCE_RESERVES_BLOCK_DELTA = "28800";
export const REDSTONE_BNB_FEED = "0x8dd2D85C7c28F43F965AE4d9545189C7D022ED0e";
export const BOUND_VALIDATOR = "0x6E332fF0bB52475304494E4AE5063c1051c7d735";
export const UPPER_BOUND_RATIO = parseUnits("1.01", 18);
export const LOWER_BOUND_RATIO = parseUnits("0.99", 18);
export const MAX_STALE_PERIOD = 100;

export const WBNBMarketSpec = {
  vToken: {
    address: vWBNB,
    name: "Venus WBNB",
    symbol: "vWBNB",
    underlying: {
      address: WBNB,
      decimals: 18,
      symbol: "WBNB",
    },
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: bscmainnet.UNITROLLER,
    isLegacyPool: true,
  },
  interestRateModel: {
    model: "two-kinks",
    baseRatePerYear: "0",
    multiplierPerYear: "0.045",
    kink: "0.7",
    baseRatePerYear2: "0",
    multiplierPerYear2: "1.4",
    kink2: "0.8",
    jumpMultiplierPerYear: "3",
  },
  riskParameters: {
    collateralFactor: parseUnits("0.8", 18),
    reserveFactor: parseUnits("0.3", 18),
    supplyCap: parseUnits("2672000", 18),
    borrowCap: parseUnits("2008000", 18),
  },
  initialSupply: {
    amount: parseUnits("1", 18),
    vTokenReceiver: bscmainnet.VTREASURY,
    vTokensToBurn: parseUnits("0.1", 8),
  },
};

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

const vTokensMinted = convertAmountToVTokens(WBNBMarketSpec.initialSupply.amount, WBNBMarketSpec.vToken.exchangeRate);
const vTokensRemaining = vTokensMinted.sub(WBNBMarketSpec.initialSupply.vTokensToBurn);

export const vip543 = () => {
  const meta = {
    version: "v2",
    title: "VIP-543 [BNB Chain] New WBNB market in the Core pool",
    description: `#### Summary

If passed, this VIP will add a [WBNB](https://bscscan.com/token/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c) market to the [Core pool on BNB Chain](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384). It will also update the oracle configuration for the WBNB token, using the same oracles as the BNB asset.

#### Description

The [smart contract of the current BNB market in the Core pool](https://bscscan.com/address/0xA07c5b74C9B40447a954e1466938b865b6BBea36) is not upgradeable, which prevents the development of new features and negatively impacts BNB users. The new market will overcome this limitation and support the addition of new features in the future, as with the other markets.

Users will be able to interact with the new market using WBNB tokens or native BNB (using the [Native Token Gateway feature](https://docs-v4.venus.io/technical-reference/reference-technical-articles/native-token-gateway) under the hood).

**Risk parameters**

The risk parameters for the new market are the same as those configured in the [current BNB market in the Core pool](https://bscscan.com/address/0xA07c5b74C9B40447a954e1466938b865b6BBea36), that is:

- Borrow cap: 2,008,000 WBNB
- Supply cap: 2,672,000 WBNB
- Collateral factor: 80%
- Reserve factor: 30%

Interest rate curve parameters::

- base 1 (yearly): 0%
- multiplier 1 (yearly): 4.5%
- kink 1: 70%
- base 2 (yearly): 0%
- multiplier 2 (yearly): 140%
- kink 2: 80%
- jump multiplier (yearly): 300%

Bootstrap liquidity: 1 WBNB, provided by the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9).

Underlying token: [WBNB](https://bscscan.com/token/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c)

**Oracles configuration**

The [ResilientOracle](https://docs-v4.venus.io/risk/resilient-price-oracle) deployed to [BNB Chain](https://bscscan.com/address/0x6592b5DE802159F3E74B2486b091D11a8256ab8A) is used for WBNB, with the following configuration (same as BNB):

- MAIN oracle - [RedStone oracle](https://bscscan.com/address/0x8455EFA4D7Ff63b8BFD96AdD889483Ea7d39B70a)
- PIVOT oracle - [Chainlink oracle](https://bscscan.com/address/0x1B2103441A0A108daD8848D8F5d790e4D402921F)
- FALLBACK oracle - [Binance oracle](https://bscscan.com/address/0x594810b741d136f1960141C0d8Fb4a91bE78A820)

#### Security and additional considerations

We applied the following security procedures for this VIP:

- **Audit**. Certik has audited the updated Native Token Gateway contract, compatible with the BNB Chain Core pool.
- **VIP execution simulation**: in a simulation environment, validating the new market is properly added to the Core pool on BNB Chain, with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same market has been deployed to BNB testnet, and used in the Venus Protocol testnet deployment

#### Deployed contracts

BNB Chain

- vWBNB: [0x6bCa74586218dB34cdB402295796b79663d816e9](https://bscscan.com/address/0x6bCa74586218dB34cdB402295796b79663d816e9)

BNB Chain testnet

- vWBNB: [0xd9E77847ec815E56ae2B9E69596C69b6972b0B1C](https://testnet.bscscan.com/address/0xd9E77847ec815E56ae2B9E69596C69b6972b0B1C)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/611)
- [Audit report from Certik (September 11th, 2025)](https://github.com/VenusProtocol/venus-periphery/blob/fb401caa0cf03eab28a3ac0a0e94b7028f6126bc/audits/152_nativeTokenGateway_certik_20250911.pdf)
- [Documentation](https://docs-v4.venus.io/)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.REDSTONE_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[WBNB, REDSTONE_BNB_FEED, MAX_STALE_PERIOD]],
      },
      {
        target: BOUND_VALIDATOR,
        signature: "setValidateConfig((address,uint256,uint256))",
        params: [[WBNB, UPPER_BOUND_RATIO, LOWER_BOUND_RATIO]],
      },
      {
        target: bscmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            WBNB,
            [bscmainnet.REDSTONE_ORACLE, bscmainnet.CHAINLINK_ORACLE, bscmainnet.BINANCE_ORACLE],
            [true, true, true],
            false,
          ],
        ],
      },
      // Add Market
      {
        target: WBNBMarketSpec.vToken.comptroller,
        signature: "_supportMarket(address)",
        params: [WBNBMarketSpec.vToken.address],
      },
      {
        target: WBNBMarketSpec.vToken.comptroller,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[WBNBMarketSpec.vToken.address], [WBNBMarketSpec.riskParameters.supplyCap]],
      },
      {
        target: WBNBMarketSpec.vToken.comptroller,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[WBNBMarketSpec.vToken.address], [WBNBMarketSpec.riskParameters.borrowCap]],
      },
      {
        target: WBNBMarketSpec.vToken.address,
        signature: "setAccessControlManager(address)",
        params: [bscmainnet.ACCESS_CONTROL_MANAGER],
      },
      {
        target: WBNBMarketSpec.vToken.address,
        signature: "setProtocolShareReserve(address)",
        params: [PROTOCOL_SHARE_RESERVE],
      },
      {
        target: WBNBMarketSpec.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: [REDUCE_RESERVES_BLOCK_DELTA],
      },
      {
        target: WBNBMarketSpec.vToken.address,
        signature: "_setReserveFactor(uint256)",
        params: [WBNBMarketSpec.riskParameters.reserveFactor],
      },
      {
        target: WBNBMarketSpec.vToken.comptroller,
        signature: "_setCollateralFactor(address,uint256)",
        params: [WBNBMarketSpec.vToken.address, WBNBMarketSpec.riskParameters.collateralFactor],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [
          WBNBMarketSpec.vToken.underlying.address,
          WBNBMarketSpec.initialSupply.amount,
          bscmainnet.NORMAL_TIMELOCK,
        ],
      },
      {
        target: WBNBMarketSpec.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [WBNBMarketSpec.vToken.address, WBNBMarketSpec.initialSupply.amount],
      },
      {
        target: WBNBMarketSpec.vToken.address,
        signature: "mint(uint256)",
        params: [WBNBMarketSpec.initialSupply.amount],
      },
      {
        target: WBNBMarketSpec.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [WBNBMarketSpec.vToken.address, 0],
      },
      // Burn some vTokens
      {
        target: WBNBMarketSpec.vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, WBNBMarketSpec.initialSupply.vTokensToBurn],
      },
      // Transfer leftover vTokens to receiver
      {
        target: WBNBMarketSpec.vToken.address,
        signature: "transfer(address,uint256)",
        params: [WBNBMarketSpec.initialSupply.vTokenReceiver, vTokensRemaining],
      },
      // Native Token Gateway
      {
        target: NATIVE_TOKEN_GATEWAY_VWBNB_CORE,
        signature: "acceptOwnership()",
        params: [],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip543;
