import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";
import { CRITICAL_TIMELOCK, FAST_TRACK_TIMELOCK, NORMAL_TIMELOCK } from "src/vip-framework";

export const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
export const PROXY_ADMIN = "0x7877ffd62649b6a1557b55d4c20fcbab17344c91";
export const RISK_FUND = "0x487CeF72dacABD7E12e633bb3B63815a386f7012";
export const OLD_RISK_FUND_IMPL = "0xcA2A023FBe3be30b7187E88D7FDE1A9a4358B509";
export const NEW_RISK_FUND_IMPL = "0x394C9a8cDbbFcAbEAb21fB105311B6B1f09b667a";
export const LIQUIDATOR_CONTRACT = "0x55AEABa76ecf144031Ef64E222166eb28Cb4865F";

export const vip357 = async () => {
  const meta = {
    version: "v2",
    title: "VIP-357",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [RISK_FUND, NEW_RISK_FUND_IMPL],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_FUND, "sweepTokenFromPool(address,address,address,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_FUND, "sweepTokenFromPool(address,address,address,uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_FUND, "sweepTokenFromPool(address,address,address,uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR_CONTRACT, "setTreasuryPercent(uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR_CONTRACT, "setTreasuryPercent(uint256)", CRITICAL_TIMELOCK],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip357;
