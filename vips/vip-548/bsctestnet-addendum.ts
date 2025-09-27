import { BigNumberish } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;
export const PT_USDe_30Oct2025 = "0x0c98334aCF440b9936D9cc1d99dc1A77bf26a93B";

// Converters
const WBNB = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";
const WBNB_BURN_CONVERTER = "0x42DBA48e7cCeB030eC73AaAe29d4A3F0cD4facba";
export const CONVERSION_INCENTIVE = 1e14;

export const converterBaseAssets = {
  [WBNB_BURN_CONVERTER]: WBNB,
};

// stablecoin emode group
export const vUSDT = "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A";
export const vUSDC = "0xD5C4C2e2facBEB59D0216D0595d63FcDc6F9A1a7";

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

export const vip548 = () => {
  const meta = {
    version: "v2",
    title: "VIP-548 [BNB Chain] Add PT-USDe-30Oct2025 markets to the Core pool - addendum",
    description:
      "Configure the WBNBBurnConverter and fix the Liquidation Incentive for USDC and USDT in the Stablecoins emode group",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Configure converters
      ...configureConverters([PT_USDe_30Oct2025]),

      {
        target: bsctestnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [1, vUSDT, parseUnits("1", 18)],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [1, vUSDC, parseUnits("1", 18)],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip548;
