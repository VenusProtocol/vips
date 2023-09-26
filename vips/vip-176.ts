import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

export const VAI_CONTROLLER_PROXY = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE";
export const OLD_BASE_RATE_MANTISSA = parseUnits("0.04", 18); // Old Base Rate 4%
export const NEW_BASE_RATE_MANTISSA = parseUnits("0.03", 18); // New Base Rate 3%

export const OLD_FLOAT_RATE_MANTISSA = parseUnits("2.25", 18); // Old Float Rate 225%
export const NEW_FLOAT_RATE_MANTISSA = parseUnits("40", 18); // New Float Rate 4000%

export const vip176 = () => {
  const meta = {
    version: "v2",
    title: "VIP-176 Update VAI Floating and Base Rates",
    description: `#### Summary

This VIP will perform the following updates as per Steakhouse latest recommendations in this Venus community forum publication: [[VIP] Changing the interest rate parameters for VAI](https://community.venus.io/t/vip-changing-the-interest-rate-parameters-for-vai/3735)

- Set VAI Floating Rate: 4,000% (from 225%)
- Set VAI Base Rate: 3% (from 4%)

Complete analysis and details of these recommendations are available in the above publication. Snapshot: [here](https://snapshot.org/#/venus-xvs.eth/proposal/0x2c07b7e19032692e3193565ae43e06bf57a503729ca2c0919eb0b15cfb52331d)

VIP simulation: [https://github.com/VenusProtocol/vips/pull/77](https://github.com/VenusProtocol/vips/pull/77)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: VAI_CONTROLLER_PROXY,
        signature: "setBaseRate(uint256)",
        params: [NEW_BASE_RATE_MANTISSA],
      },
      {
        target: VAI_CONTROLLER_PROXY,
        signature: "setFloatRate(uint256)",
        params: [NEW_FLOAT_RATE_MANTISSA],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};
