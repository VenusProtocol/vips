import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;

export const REDUCE_RESERVES_BLOCK_DELTA_BSC = "28800";
export const PROTOCOL_SHARE_RESERVE_BSC = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";

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
    amount: parseUnits("100", 18), // 100 USDF
    vTokensToBurn: parseUnits("100", 18), // 100 vUSDF
    vTokenReceiver: bsctestnet.VTREASURY,
  },
  riskParameters: {
    supplyCap: parseUnits("30000000", 18), // 30,000,000 USDF
    borrowCap: parseUnits("27000000", 18), // 0 USDF
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

export const vip514 = (overrides: { maxStalePeriod?: number }) => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-514",
    description: "",
    forDescription: "",
    againstDescription: "",
    abstainDescription: "",
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
        params: [PROTOCOL_SHARE_RESERVE_BSC],
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
        signature: "mintBehalf(address,uint256)", // TODO: Ask why some vips use `mintBehalf` and others use `mint`
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
        params: [PROTOCOL_SHARE_RESERVE_BSC],
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
        signature: "mintBehalf(address,uint256)", // TODO: Ask why some vips use `mintBehalf` and others use `mint`
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
        params: [USDFMarketSpec.initialSupply.vTokenReceiver, USDFMarketSpec.initialSupply.vTokensToBurn],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip514;
