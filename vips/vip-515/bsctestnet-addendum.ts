import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { ConversionAccessibility } from "./bsctestnet";

export const CONVERSION_INCENTIVE = 1e14;

const MockedUSDF = "0xC7a2b79432Fd3e3d5bd2d96A456c734AB93A0484";
export const WBNB = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";
export const BURNING_CONVERTER = "0x42DBA48e7cCeB030eC73AaAe29d4A3F0cD4facba";

export const vip515addendum = () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-515 Addendum to configure USDF conversions on WBNBBurnConverter",
    description: `VIP-515 Addendum to configure USDF conversions on WBNBBurnConverter`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Configure converters for USDF
      {
        target: BURNING_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [WBNB, [MockedUSDF], [[CONVERSION_INCENTIVE, ConversionAccessibility.ALL]]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip515addendum;
