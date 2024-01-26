import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const VAI_CONTROLLER = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE";

export const vip228 = () => {
  const meta = {
    version: "v2",
    title: "VIP-228 Adjust minting VAI for Prime holders (1/2)",
    description: `If passed, this VIP will reduce the minting cap of VAI to zero. Related to [VIP-225](https://app.venus.io/#/governance/proposal/225?chainId=56). There will be a second VIP enabling minting VAI for Prime holders with a mint cap of 10M, following the proposal in the Community post [[VIP] Re-enable VAI Minting and Adjust VAI Base Rate](https://community.venus.io/t/vip-re-enable-vai-minting-and-adjust-vai-base-rate/3935).

VIP simulation: [https://github.com/VenusProtocol/vips/pull/153](https://github.com/VenusProtocol/vips/pull/153)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: VAI_CONTROLLER,
        signature: "setMintCap(uint256)",
        params: ["0"],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};
