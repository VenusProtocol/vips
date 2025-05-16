import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const vSOL = "0xBf515bA4D1b52FFdCeaBF20d31D705Ce789F2cEC";
export const vSOL_SUPPLY_CAP = parseUnits("72000", 18);
export const COMPTROLLER_CORE = "0xfD36E2c2a6789Db23113685031d7F16329158384";

export const VBNB_ADMIN = "0x9A7890534d9d91d473F28cB97962d176e2B65f1d";
export const NEW_IR = "0x939c9458Bee63Bc21031be3d56dDD30Af7f2230A";

const vip497 = () => {
  const meta = {
    version: "v2",
    title: "VIP-497",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER_CORE,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[vSOL], [vSOL_SUPPLY_CAP]],
      },
      {
        target: VBNB_ADMIN,
        signature: "_setInterestRateModel(address)",
        params: [NEW_IR],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip497;
