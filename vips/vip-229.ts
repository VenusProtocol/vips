import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const VAI_CONTROLLER = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE";

export const vip229 = () => {
  const meta = {
    version: "v2",
    title: "VIP-229 Adjust minting VAI for Prime holders (2/2)",
    description: `If passed, this VIP will set the minting cap of VAI to 10M, following the proposal in the Community post [[VIP] Re-enable VAI Minting and Adjust VAI Base Rate](https://community.venus.io/t/vip-re-enable-vai-minting-and-adjust-vai-base-rate/3935). Moreover, it will adjust the VAI mint rate to 100%.

Related to [VIP-228](https://app.venus.io/#/governance/proposal/228).

VIP simulation: [https://github.com/VenusProtocol/vips/pull/153](https://github.com/VenusProtocol/vips/pull/153)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setVAIMintRate(uint256)",
        params: ["10000"],
      },
      {
        target: VAI_CONTROLLER,
        signature: "setMintCap(uint256)",
        params: [parseUnits("10000000", 18)],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
