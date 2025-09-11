import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const bsctestnet = NETWORK_ADDRESSES.bsctestnet;
export const PROTOCOL_SHARE_RESERVE = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";
export const WBNB = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";
export const vWBNB = "0xd9E77847ec815E56ae2B9E69596C69b6972b0B1C";
export const RATE_MODEL = "0xa84848Bd2E24a829D97c882Fb86AF90F811540F3";
export const REDUCE_RESERVES_BLOCK_DELTA = "28800";
export const NATIVE_TOKEN_GATEWAY_VWBNB_CORE = "0xF34AAfc540Adc827A84736553BD29DE87a117558";

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
    comptroller: bsctestnet.UNITROLLER,
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
    vTokenReceiver: bsctestnet.VTREASURY,
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
        params: [bsctestnet.ACCESS_CONTROL_MANAGER],
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
        target: bsctestnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [
          WBNBMarketSpec.vToken.underlying.address,
          WBNBMarketSpec.initialSupply.amount,
          bsctestnet.NORMAL_TIMELOCK,
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
      // Burn some vTokens (on testnet transfer to VTreasury)
      {
        target: WBNBMarketSpec.vToken.address,
        signature: "transfer(address,uint256)",
        params: [bsctestnet.VTREASURY, WBNBMarketSpec.initialSupply.vTokensToBurn],
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
