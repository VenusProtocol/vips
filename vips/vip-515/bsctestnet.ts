import { BigNumber, BigNumberish } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
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

export const asBNBMarketSpec = {
  vToken: {
    address: "0x73F506Aefd5e169D48Ea21A373B9B0a200E37585",
    name: "Venus asBNB",
    symbol: "vasBNB",
    underlying: {
      address: "0xc625f060ad25f4A6c2d9eBF30C133dB61B7AF072",
      symbol: "asBNB",
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
    amount: parseUnits("0.14", 18), // 0.14 asBNB
    vTokensToBurn: parseUnits("0.14", 8), // 0.14 vasBNB
    vTokenReceiver: bsctestnet.VTREASURY,
  },
  riskParameters: {
    supplyCap: parseUnits("2000", 18), // 2000 asBNB
    borrowCap: parseUnits("0", 18), // 0 asBNB
    collateralFactor: parseUnits("0.72", 18),
    reserveFactor: parseUnits("0.1", 18),
  },
};

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

const ETH = "0x98f7A83361F7Ac8765CcEBAB1425da6b341958a7";
const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
const USDC = "0x16227D60f7a0e586C66B005219dfc887D13C9531";
const BTCB = "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4";
const XVS = "0xB9e0E753630434d7863528cc73CB7AC638a7c8ff";
const RISK_FUND_CONVERTER = "0x32Fbf7bBbd79355B86741E3181ef8c1D9bD309Bb";
const USDT_PRIME_CONVERTER = "0xf1FA230D25fC5D6CAfe87C5A6F9e1B17Bc6F194E";
const USDC_PRIME_CONVERTER = "0x2ecEdE6989d8646c992344fF6C97c72a3f811A13";
const BTCB_PRIME_CONVERTER = "0x989A1993C023a45DA141928921C0dE8fD123b7d1";
const ETH_PRIME_CONVERTER = "0xf358650A007aa12ecC8dac08CF8929Be7f72A4D9";
const XVS_VAULT_CONVERTER = "0x258f49254C758a0E37DAb148ADDAEA851F4b02a2";

export const converterBaseAssets = {
  [RISK_FUND_CONVERTER]: USDT,
  [USDT_PRIME_CONVERTER]: USDT,
  [USDC_PRIME_CONVERTER]: USDC,
  [BTCB_PRIME_CONVERTER]: BTCB,
  [ETH_PRIME_CONVERTER]: ETH,
  [XVS_VAULT_CONVERTER]: XVS,
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

export const vip514 = (overrides: { maxStalePeriod?: number }) => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-514",
    description: `If passed, this VIP will enable [BNB](https://bscscan.com/address/0xA07c5b74C9B40447a954e1466938b865b6BBea36) and [FDUSD](https://bscscan.com/address/0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba) markets on the Core pool (BNB Chain) as Prime Markets, following these community posts:

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

  const redstoneStalePeriod = overrides?.maxStalePeriod ?? USDFMarketSpec.priceFeed.redstone.stalePeriod;

  return makeProposal(
    [
      // Configure Oracle for USDF
      {
        target: bsctestnet.REDSTONE_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [
          [USDFMarketSpec.vToken.underlying.address, USDFMarketSpec.priceFeed.redstone.address, redstoneStalePeriod],
        ],
      },
      {
        target: bsctestnet.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            USDFMarketSpec.vToken.underlying.address,
            [bsctestnet.REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
      },
      // Add Market for asBNB
      {
        target: asBNBMarketSpec.vToken.comptroller,
        signature: "_supportMarket(address)",
        params: [asBNBMarketSpec.vToken.address],
      },
      {
        target: asBNBMarketSpec.vToken.comptroller,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[asBNBMarketSpec.vToken.address], [asBNBMarketSpec.riskParameters.supplyCap]],
      },
      {
        target: asBNBMarketSpec.vToken.comptroller,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[asBNBMarketSpec.vToken.address], [asBNBMarketSpec.riskParameters.borrowCap]],
      },
      {
        target: asBNBMarketSpec.vToken.address,
        signature: "setAccessControlManager(address)",
        params: [bsctestnet.ACCESS_CONTROL_MANAGER],
      },
      {
        target: asBNBMarketSpec.vToken.address,
        signature: "setProtocolShareReserve(address)",
        params: [PROTOCOL_SHARE_RESERVE],
      },
      {
        target: asBNBMarketSpec.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: [REDUCE_RESERVES_BLOCK_DELTA_BSC],
      },
      {
        target: asBNBMarketSpec.vToken.address,
        signature: "_setReserveFactor(uint256)",
        params: [asBNBMarketSpec.riskParameters.reserveFactor],
      },
      {
        target: asBNBMarketSpec.vToken.comptroller,
        signature: "_setCollateralFactor(address,uint256)",
        params: [asBNBMarketSpec.vToken.address, asBNBMarketSpec.riskParameters.collateralFactor],
      },
      {
        target: asBNBMarketSpec.vToken.underlying.address,
        signature: "faucet(uint256)",
        params: [asBNBMarketSpec.initialSupply.amount],
      },
      {
        target: asBNBMarketSpec.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [asBNBMarketSpec.vToken.address, asBNBMarketSpec.initialSupply.amount],
      },
      {
        target: asBNBMarketSpec.vToken.address,
        signature: "mintBehalf(address,uint256)",
        params: [bsctestnet.NORMAL_TIMELOCK, asBNBMarketSpec.initialSupply.amount],
      },
      {
        target: asBNBMarketSpec.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [asBNBMarketSpec.vToken.address, 0],
      },
      {
        target: asBNBMarketSpec.vToken.address,
        signature: "transfer(address,uint256)",
        params: [asBNBMarketSpec.initialSupply.vTokenReceiver, asBNBMarketSpec.initialSupply.vTokensToBurn],
      },
      // Add Market for USDF
      {
        target: USDFMarketSpec.vToken.comptroller,
        signature: "_supportMarket(address)",
        params: [USDFMarketSpec.vToken.address],
      },
      {
        target: USDFMarketSpec.vToken.comptroller,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[USDFMarketSpec.vToken.address], [USDFMarketSpec.riskParameters.supplyCap]],
      },
      {
        target: USDFMarketSpec.vToken.comptroller,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[USDFMarketSpec.vToken.address], [USDFMarketSpec.riskParameters.borrowCap]],
      },
      {
        target: USDFMarketSpec.vToken.address,
        signature: "setAccessControlManager(address)",
        params: [bsctestnet.ACCESS_CONTROL_MANAGER],
      },
      {
        target: USDFMarketSpec.vToken.address,
        signature: "setProtocolShareReserve(address)",
        params: [PROTOCOL_SHARE_RESERVE],
      },
      {
        target: USDFMarketSpec.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: [REDUCE_RESERVES_BLOCK_DELTA_BSC],
      },
      {
        target: USDFMarketSpec.vToken.address,
        signature: "_setReserveFactor(uint256)",
        params: [USDFMarketSpec.riskParameters.reserveFactor],
      },
      {
        target: USDFMarketSpec.vToken.comptroller,
        signature: "_setCollateralFactor(address,uint256)",
        params: [USDFMarketSpec.vToken.address, USDFMarketSpec.riskParameters.collateralFactor],
      },
      {
        target: USDFMarketSpec.vToken.underlying.address,
        signature: "faucet(uint256)",
        params: [USDFMarketSpec.initialSupply.amount],
      },
      {
        target: USDFMarketSpec.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [USDFMarketSpec.vToken.address, USDFMarketSpec.initialSupply.amount],
      },
      {
        target: USDFMarketSpec.vToken.address,
        signature: "mintBehalf(address,uint256)",
        params: [bsctestnet.NORMAL_TIMELOCK, USDFMarketSpec.initialSupply.amount],
      },
      {
        target: USDFMarketSpec.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [USDFMarketSpec.vToken.address, 0],
      },
      {
        target: USDFMarketSpec.vToken.address,
        signature: "transfer(address,uint256)",
        params: [bsctestnet.VTREASURY, USDFMarketSpec.initialSupply.vTokensToBurn],
      },
      (() => {
        const vTokensMinted = convertAmountToVTokens(
          USDFMarketSpec.initialSupply.amount,
          USDFMarketSpec.vToken.exchangeRate,
        );
        const vTokensRemaining = vTokensMinted.sub(USDFMarketSpec.initialSupply.vTokensToBurn);
        return {
          target: USDFMarketSpec.vToken.address,
          signature: "transfer(address,uint256)",
          params: [USDFMarketSpec.initialSupply.vTokenReceiver, vTokensRemaining],
        };
      })(),
      // Configure converters for USDF
      ...configureConverters([USDFMarketSpec.vToken.underlying.address], CONVERSION_INCENTIVE),
      // Pause asBNB market
      {
        target: asBNBMarketSpec.vToken.comptroller,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[asBNBMarketSpec.vToken.address], [Actions.BORROW], true],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip514;
