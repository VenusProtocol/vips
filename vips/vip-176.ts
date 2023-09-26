import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

export const VAI_CONTROLLER_PROXY = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE";
export const OLD_BASE_RATE_MANTISSA = parseUnits("0.04", 18); // Old Base Rate 4%
export const NEW_BASE_RATE_MANTISSA = parseUnits("0.03", 18); // New Base Rate 3%

export const OLD_FLOAT_RATE_MANTISSA = parseUnits("2.25", 18); // New Base Rate 225%
export const NEW_FLOAT_RATE_MANTISSA = parseUnits("40", 18); // New Base Rate 4000%

export const vip176 = () => {
  const meta = {
    version: "v2",
    title: "VIP-176 Update interest rate parameters of VAI",
    description: `**Summary**
    This VIP will update interest rate parameters of VAI relevant to Steakhouse recommendation (https://community.venus.io/t/vip-changing-the-interest-rate-parameters-for-vai/3735)
    If passed this VIP will perform the following actions:

    * Set VAI Base Rate: 3% (from 4%)
    * Set Float Rate: 4000% (from 225%)
    
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
    ProposalType.FAST_TRACK,
  );
};
