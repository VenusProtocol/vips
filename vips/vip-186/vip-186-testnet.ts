import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const COMPTROLLER_BEACON = "0xdddd7725c073105fb2abfcbdec16708fc4c24b74";
const NEW_COMPTROLLER_IMPLEMENTATION = "0x11a92852fA7D70C220Dada69969b2f1C4e18e663";
const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
const POOL_STABLECOIN = "0x10b57706AD2345e590c2eA4DC02faef0d9f5b08B";
const POOL_DEFI = "0x23a73971A6B9f6580c048B9CB188869B2A2aA2aD";
const POOL_GAMEFI = "0x1F4f0989C51f12DAcacD4025018176711f3Bf289";
const POOL_LIQUID_STAKED_BNB = "0x596B11acAACF03217287939f88d63b51d3771704";
const POOL_TRON = "0x11537D023f489E4EF0C7157cc729C7B69CbE0c97";
const FAST_TRACK_TIMELOCK = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";
const CRITICAL_TIMELOCK = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";

interface GrantAccess {
  target: string;
  signature: string;
  params: Array<string>;
}

const grantAccessControl = (contract: string) => {
  const accessProposals: Array<GrantAccess> = [];
  [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK].map(target => {
    accessProposals.push({
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [contract, "setForcedLiquidation(address,bool)", target],
    });
  });

  return accessProposals;
};

export const vip186Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP comptroller beacon upgrade",
    description: `
        Upgardes the implementation contract for comptroller beacon for isolated pools
        Gives call permissions to all three timelocks for setting forced liquidation`,

    forDescription: "I agree that Venus Protocol should proceed with upgrading comptroller beacon",
    againstDescription: "I do not think that Venus Protocol should proceed with upgrading comptroller beacon",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with upgrading comptroller beacon",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER_BEACON,
        signature: "upgradeTo(address)",
        params: [NEW_COMPTROLLER_IMPLEMENTATION],
      },
      ...grantAccessControl(POOL_STABLECOIN),
      ...grantAccessControl(POOL_DEFI),
      ...grantAccessControl(POOL_GAMEFI),
      ...grantAccessControl(POOL_LIQUID_STAKED_BNB),
      ...grantAccessControl(POOL_TRON),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
