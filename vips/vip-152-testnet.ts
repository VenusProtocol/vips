import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const RISK_FUND = "0x487CeF72dacABD7E12e633bb3B63815a386f7012";
const NEW_RISK_FUND_IMPLEMENTATION = "0x1E7DEC93C77740c2bB46daf87ef42056E388dA14";
const PROXY_ADMIN = "0x7877fFd62649b6A1557B55D4c20fcBaB17344C91";
const PSR = "0x9B34c7aDCEa239b83Ef364627071Be7665bcb2E9";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const ACM = "0x45f8a08f534f34a97187626e05d4b6648eeaa9aa";
const FAST_TRACK_TIMELOCK = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";
const CRITICAL_TIMELOCK = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";
const POOL_REGISTRY = "0xC85491616Fa949E048F3aAc39fbf5b0703800667";
const TREASURY = "0x8b293600c50d6fbdc6ed4251cc75ece29880276f";
const VBNBAdmin = "0x78459C0a0Fe91d382322D09FF4F86A10dbAF78a4";
const PSR_PROXY_ADMIN = "0xF77810085c7F6323bB19dddaE2d62793E5AE2e3b";
const VBNBAdmin_PROXY_ADMIN = "0x7877fFd62649b6A1557B55D4c20fcBaB17344C91";
const vBNB_ADDRESS = "0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c";

export const vip152Testnet = () => {
  const meta = {
    version: "v2",
    title: "Change vBNB admin to vBNBAdmin and Setup Protocol Share Reserve",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with setting the vBNB admin and setting up PSR",
    againstDescription:
      "I do not think that Venus Protocol should proceed with setting the vBNB admin and setting up PSR",
    abstainDescription:
      "I am indifferent to whether Venus Protocol proceeds with setting the vBNB admin and setting up PSR",
  };

  return makeProposal(
    [
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [RISK_FUND, NEW_RISK_FUND_IMPLEMENTATION],
      },
      {
        target: vBNB_ADDRESS,
        signature: "_setPendingAdmin(address)",
        params: [VBNBAdmin],
      },
      {
        target: VBNBAdmin,
        signature: "_acceptAdmin()",
        params: [],
      },
      {
        target: PSR,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: VBNBAdmin_PROXY_ADMIN,
        signature: "changeProxyAdmin(address,address)",
        params: [VBNBAdmin, PROXY_ADMIN],
      },
      {
        target: VBNBAdmin,
        signature: "setProtocolShareReserve(address)",
        params: [PSR],
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
        target: PSR_PROXY_ADMIN,
        signature: "changeProxyAdmin(address,address)",
        params: [PSR, PROXY_ADMIN],
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
