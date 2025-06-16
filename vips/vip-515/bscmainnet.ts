import { BigNumber, BigNumberish } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

export const Actions = {
  MINT: 0,
  BORROW: 2,
  ENTER_MARKET: 7,
};

export const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
const REDUCE_RESERVES_BLOCK_DELTA_BSC = "28800";
export const CONVERSION_INCENTIVE = 1e14;

export const asBNBMarketSpec = {
  vToken: {
    address: "0xCC1dB43a06d97f736C7B045AedD03C6707c09BDF",
    name: "Venus asBNB",
    symbol: "vasBNB",
    underlying: {
      address: "0x77734e70b6E88b4d82fE632a168EDf6e700912b6",
      symbol: "asBNB",
      decimals: 18,
    },
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: bscmainnet.UNITROLLER,
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
  },
  riskParameters: {
    supplyCap: parseUnits("2000", 18), // 2000 asBNB
    borrowCap: parseUnits("0", 18), // 0 asBNB
    collateralFactor: parseUnits("0.72", 18),
    reserveFactor: parseUnits("0.1", 18),
  },
};

// TODO: Change to the USDF oracle
export const RedstoneUSDFOracleAddress = "0xB97Ad0E74fa7d920791E90258A6E2085088b4320"; // Chainlink Price Feed USDT/USD on BSC Mainnet

export const USDFMarketSpec = {
  vToken: {
    address: "0x553910c0d80bB2dd92D6C7D05112757C7dB9aa76",
    name: "Venus USDF",
    symbol: "vUSDF",
    underlying: {
      address: "0x5A110fC00474038f6c02E89C707D638602EA44B5",
      symbol: "USDF",
      decimals: 18,
    },
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: bscmainnet.UNITROLLER,
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
      address: RedstoneUSDFOracleAddress,
      stalePeriod: 26 * 60 * 60, // 26 hours in seconds
    },
  },
};

const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";

const RISK_FUND_CONVERTER = "0xA5622D276CcbB8d9BBE3D1ffd1BB11a0032E53F0";
const USDT_PRIME_CONVERTER = "0xD9f101AA67F3D72662609a2703387242452078C3";
const USDC_PRIME_CONVERTER = "0xa758c9C215B6c4198F0a0e3FA46395Fa15Db691b";
const BTCB_PRIME_CONVERTER = "0xE8CeAa79f082768f99266dFd208d665d2Dd18f53";
const ETH_PRIME_CONVERTER = "0xca430B8A97Ea918fF634162acb0b731445B8195E";
const XVS_VAULT_CONVERTER = "0xd5b9AE835F4C59272032B3B954417179573331E0";

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

export const vip515 = (overrides: { maxStalePeriod?: number }) => {
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

  const redstoneStalePeriod = overrides?.maxStalePeriod ?? USDFMarketSpec.priceFeed.redstone.stalePeriod;

  return makeProposal(
    [
      // Configure Oracle for USDF
      {
        target: bscmainnet.REDSTONE_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [
          [USDFMarketSpec.vToken.underlying.address, USDFMarketSpec.priceFeed.redstone.address, redstoneStalePeriod],
        ],
      },
      {
        target: bscmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            USDFMarketSpec.vToken.underlying.address,
            [bscmainnet.REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
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
        params: [bscmainnet.ACCESS_CONTROL_MANAGER],
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
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [
          asBNBMarketSpec.vToken.underlying.address,
          asBNBMarketSpec.initialSupply.amount,
          bscmainnet.NORMAL_TIMELOCK,
        ],
      },
      {
        target: asBNBMarketSpec.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [asBNBMarketSpec.vToken.address, asBNBMarketSpec.initialSupply.amount],
      },
      {
        target: asBNBMarketSpec.vToken.address,
        signature: "mintBehalf(address,uint256)",
        params: [bscmainnet.NORMAL_TIMELOCK, asBNBMarketSpec.initialSupply.amount],
      },
      {
        target: asBNBMarketSpec.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [asBNBMarketSpec.vToken.address, 0],
      },
      // Burn initial supply of asBNB
      {
        target: asBNBMarketSpec.vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, asBNBMarketSpec.initialSupply.vTokensToBurn],
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
        params: [bscmainnet.ACCESS_CONTROL_MANAGER],
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
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [
          USDFMarketSpec.vToken.underlying.address,
          USDFMarketSpec.initialSupply.amount,
          bscmainnet.NORMAL_TIMELOCK,
        ],
      },
      {
        target: USDFMarketSpec.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [USDFMarketSpec.vToken.address, USDFMarketSpec.initialSupply.amount],
      },
      {
        target: USDFMarketSpec.vToken.address,
        signature: "mintBehalf(address,uint256)",
        params: [bscmainnet.NORMAL_TIMELOCK, USDFMarketSpec.initialSupply.amount],
      },
      {
        target: USDFMarketSpec.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [USDFMarketSpec.vToken.address, 0],
      },
      // Burn 100 vUSDF
      {
        target: USDFMarketSpec.vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, USDFMarketSpec.initialSupply.vTokensToBurn],
      },
      // Transfer remaining vTokens to receiver
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

export default vip515;
