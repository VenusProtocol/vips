import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const VBNBAdmin_ADDRESS = "0x04109575c1dbB4ac2e59e60c783800ea10441BBe";
const RISK_FUND = "0x487CeF72dacABD7E12e633bb3B63815a386f7012";
const PSR = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";
const TREASURY = "0x8b293600C50D6fbdc6Ed4251cc75ECe29880276f";
const POOL_REGISTRY = "0xC85491616Fa949E048F3aAc39fbf5b0703800667";

export const vip153Testnet = () => {
  const meta = {
    version: "v2",
    title: "Use new PSR and Add New Config",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed",
    againstDescription:
      "I do not think that Venus Protocol should proceed ",
    abstainDescription:
      "I am indifferent to whether Venus Protocol proceeds ",
  };

  return makeProposal(
    [
      {
        target: VBNBAdmin_ADDRESS,
        signature: "setProtocolShareReserve(address)",
        params: [PSR],
      },
      {
        target: PSR,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: PSR,
        signature: "addOrUpdateDistributionConfigs((uint8,uint8,address)[])",
        params: [
          [
            [0, 40, RISK_FUND],
            [0, 60, TREASURY],
            [1, 50, RISK_FUND],
            [1, 50, TREASURY],
          ],
        ],
      },
      {
        target: PSR,
        signature: "setPoolRegistry(address)",
        params: [POOL_REGISTRY],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
