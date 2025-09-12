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

export const vip545 = () => {
  const meta = {
    version: "v2",
    title: "VIP-545 [BNB Chain] Add WBNB markets to the Core pool",
    description: "VIP-545 [BNB Chain] Add WBNB markets to the Core pool",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
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

export default vip545;
