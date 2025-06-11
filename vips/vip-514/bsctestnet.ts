import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;

export const asBNB = "0xc625f060ad25f4A6c2d9eBF30C133dB61B7AF072";
export const REDUCE_RESERVES_BLOCK_DELTA_BSC = "28800"; // TODO: Ask about this
export const PROTOCOL_SHARE_RESERVE_BSC = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446"; // TODO: Ask about this

export const asBNBMarketSpec = {
  vToken: {
    address: "0x73F506Aefd5e169D48Ea21A373B9B0a200E37585",
    name: "Venus asBNB",
    symbol: "vasBNB",
    underlying: {
      address: asBNB,
      symbol: "asBNB",
      decimals: 18,
    },
    decimals: 18,
    exchangeRate: parseUnits("1", 18), // TODO: Ask about this
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
    vTokensToBurn: parseUnits("0.14", 18), // 0.14 vasBNB // TODO: Ask about this
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
    decimals: 18,
    exchangeRate: parseUnits("1", 18), // TODO: Ask about this
    comptroller: bsctestnet.UNITROLLER,
    isLegacyPool: true,
    interestRateModel: {
      model: "jump",
      baseRatePerYear: "0",
      multiplierPerYear: "0.09",
      jumpMultiplierPerYear: "2",
      kink: "0.5",
    },
    initialSupply: {
      amount: parseUnits("100", 18), // 100 USDF
      vTokensToBurn: parseUnits("100", 18), // 100 vUSDF // TODO: Ask about this
      vTokenReceiver: bsctestnet.VTREASURY,
    },
    riskParameters: {
      supplyCap: parseUnits("30000000", 18), // 30,000,000 USDF
      borrowCap: parseUnits("27000000", 18), // 0 USDF
      collateralFactor: parseUnits("0.6", 18),
      reserveFactor: parseUnits("0.1", 18),
    },
  },
};

export const vip514 = () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-514",
    description: "",
    forDescription: "",
    againstDescription: "",
    abstainDescription: "",
  };

  return makeProposal(
    [
      // Add Market for asBNB
      {
        target: asBNBMarketSpec.vToken.comptroller,
        signature: "_supportMarket(addess)",
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

      // Add Market for USDF
      {
        target: USDFMarketSpec.vToken.comptroller,
        signature: "_supportMarket(address)",
        params: [USDFMarketSpec.vToken.address],
      },
      {
        target: USDFMarketSpec.vToken.comptroller,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[USDFMarketSpec.vToken.address], [USDFMarketSpec.vToken.riskParameters.supplyCap]],
      },
      {
        target: USDFMarketSpec.vToken.comptroller,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[USDFMarketSpec.vToken.address], [USDFMarketSpec.vToken.riskParameters.borrowCap]],
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
        params: [USDFMarketSpec.vToken.riskParameters.reserveFactor],
      },
      {
        target: USDFMarketSpec.vToken.comptroller,
        signature: "_setCollateralFactor(address,uint256)",
        params: [USDFMarketSpec.vToken.address, USDFMarketSpec.vToken.riskParameters.collateralFactor],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip514;
