import { BigNumber, BigNumberish } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

export const Actions = {
  MINT: 0,
  BORROW: 2,
  ENTER_MARKET: 7,
};

export const PROTOCOL_SHARE_RESERVE = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";
export const REDUCE_RESERVES_BLOCK_DELTA_BSC = "28800";
export const CONVERSION_INCENTIVE = 1e14;

export const MockedUSDF = "0xC7a2b79432Fd3e3d5bd2d96A456c734AB93A0484";
export const MockedUSDFOracleAddress = "0xEca2605f0BCF2BA5966372C99837b1F182d3D620"; // Chainlink Price Feed USDT/USD on BSC Testnet

export const USDFMarketSpec = {
  vToken: {
    address: "0x140d5Da2cE9fb9A8725cabdDB2Fe8ea831342C78",
    name: "Venus USDF",
    symbol: "vUSDF",
    underlying: {
      address: MockedUSDF,
      symbol: "USDF",
      decimals: 18,
    },
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: bsctestnet.UNITROLLER,
    isLegacyPool: true,
  },
  interestRateModel: {
    model: "jump",
    baseRatePerYear: "0",
    multiplierPerYear: "0.09",
    jumpMultiplierPerYear: "2",
    kink: "0.5",
  },
  initialSupply: {
    amount: parseUnits("20100", 18), // 20100 USDF
    vTokensToBurn: parseUnits("100", 8), // 100 vUSDF
    vTokenReceiver: "0xa8c0C6Ee62F5AD95730fe23cCF37d1c1FFAA1c3f",
  },
  riskParameters: {
    supplyCap: parseUnits("30000000", 18), // 30,000,000 USDF
    borrowCap: parseUnits("27000000", 18), // 27,000,000 USDF
    collateralFactor: parseUnits("0.6", 18),
    reserveFactor: parseUnits("0.1", 18),
  },
  priceFeed: {
    redstone: {
      address: MockedUSDFOracleAddress,
      stalePeriod: 26 * 60 * 60, // 26 hours in seconds
    },
  },
};

const WBNB = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";
const BURNING_CONVERTER = "0x42DBA48e7cCeB030eC73AaAe29d4A3F0cD4facba";

export const converterBaseAssets = {
  [BURNING_CONVERTER]: WBNB,
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

export const vip515addendum = () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-515 [BNB Chain] Enable BNB and FDUSD as Prime Markets on BNB Chain",
    description: `VIP-515 [BNB Chain] Enable BNB and FDUSD as Prime Markets on BNB Chain

If passed, this VIP will enable [BNB](https://bscscan.com/address/0xA07c5b74C9B40447a954e1466938b865b6BBea36) and [FDUSD](https://bscscan.com/address/0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba) markets on the Core pool (BNB Chain) as Prime Markets, following these community posts:

- [VRC: Enable BNB as a Prime Market on BNB Chain](https://community.venus.io/t/vrc-enable-bnb-as-a-prime-market-on-bnb-chain/5127) ([snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xb262d9574010ffbe2981bdaf96f26d9cb6769b4f048fb654b4e041f1d1d5f222))
- [Proposal: Add FDUSD as a Prime Market to the Venus Core Pool on BNB Chain](https://community.venus.io/t/proposal-add-fdusd-as-a-prime-market-to-the-venus-core-pool-on-bnb-chain/4989) ([snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xc330c51fa8db6d1485290eacfcb49a493d9ebdf3041dd87be6b5da54a51ae2a7))

Moreover, the [BTCB](https://bscscan.com/address/0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B) and [ETH](https://bscscan.com/address/0xf508fCD89b8bd15579dc79A6827cB4686A3592c8) markets will be removed from the list of Prime Markets. The new reward distribution will be:

Complete analysis and details of these changes are available in the above publications.

**References**:

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/577)
- Execution on testnet ([BNB Chain](https://testnet.bscscan.com/tx/0x))`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Configure converters for USDF
      ...configureConverters([USDFMarketSpec.vToken.underlying.address], CONVERSION_INCENTIVE),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip515addendum;
