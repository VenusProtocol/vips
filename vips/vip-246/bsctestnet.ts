import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const VAI_CONTROLLER_PROXY = "0xf70C3C6b749BbAb89C081737334E74C9aFD4BE16";
export const OLD_BASE_RATE_MANTISSA = parseUnits("0.07", 18); // Old Base Rate 7%
export const NEW_BASE_RATE_MANTISSA = parseUnits("0.03", 18); // New Base Rate 3%

export const OLD_FLOAT_RATE_MANTISSA = parseUnits("0", 18); // Old Float Rate 0%
export const NEW_FLOAT_RATE_MANTISSA = parseUnits("50", 18); // New Float Rate 5000%

export const vip246 = () => {
  const meta = {
    version: "v2",
    title: "VIP-246 Update VAI Float and Base Rates",
    description: `
This VIP will perform the following updates as per Steakhouse latest recommendations in this Venus community forum publication: [[VIP] Adjust VAI Base and Float Rate](https://community.venus.io/t/vip-adjust-vai-base-and-float-rate/4056)

- Set VAI Base Rate: 3% (from 7%)
- Set Float Rate: 5,000% (from 4,000%)

Complete analysis and details of these recommendations are available in the above publication.

#### References
* [VIP Simulation](https://github.com/VenusProtocol/vips/pull/180)
  `,
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
    ProposalType.REGULAR,
  );
};

export default vip246;
