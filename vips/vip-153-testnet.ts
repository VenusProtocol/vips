import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const PSR = "0xa7D2A407A40A071681CeeEaa9C6C59259eaF0597";
const ACM = "0x45f8a08f534f34a97187626e05d4b6648eeaa9aa";
const FAST_TRACK_TIMELOCK = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";
const CRITICAL_TIMELOCK = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const RISK_FUND = "0x487CeF72dacABD7E12e633bb3B63815a386f7012";
const TREASURY = "0x8b293600c50d6fbdc6ed4251cc75ece29880276f";
const VBNBAdmin = "0x7575D142AAb97229e5928f94c03da39b34Bb0E96";
const NEW_VBNBAdmin = "0x7Ef464ac0BE8A0dC1e90185bf92a20e769f3B114";

export const vip153Testnet = () => {
  const meta = {
    version: "v2",
    title: "Upgrade vBNBAdmin and Setup Protocol Share Reserve",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with setting the PSR",
    againstDescription: "I do not think that Venus Protocol should proceed with setting the PSR",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with setting the PSR",
  };

  return makeProposal(
    [
      {
        target: NEW_VBNBAdmin,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: VBNBAdmin,
        signature: "_setPendingAdmin(address)",
        params: [NEW_VBNBAdmin],
      },
      {
        target: NEW_VBNBAdmin,
        signature: "_acceptAdmin()",
        params: [],
      },
      {
        target: NEW_VBNBAdmin,
        signature: "setProtocolShareReserve(address)",
        params: [PSR],
      },
      {
        target: PSR,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSR, "addOrUpdateDistributionConfigs(DistributionConfig[])", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSR, "addOrUpdateDistributionConfigs(DistributionConfig[])", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSR, "addOrUpdateDistributionConfigs(DistributionConfig[])", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSR, "removeDistributionConfig(Schema,address)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSR, "removeDistributionConfig(Schema,address)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSR, "removeDistributionConfig(Schema,address)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSR, "addOrRemoveAssetFromPrime(address,bool)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSR, "addOrRemoveAssetFromPrime(address,bool)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PSR, "addOrRemoveAssetFromPrime(address,bool)", NORMAL_TIMELOCK],
      },
      {
        target: PSR,
        signature: "addOrUpdateDistributionConfigs((uint8,uint8,address)[])",
        params: [
          [
            [0, 50, RISK_FUND],
            [0, 50, TREASURY],
            [1, 40, RISK_FUND],
            [1, 60, TREASURY],
          ],
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
