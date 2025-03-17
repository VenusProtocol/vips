import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const BNB_CORE_COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const BNB_UNI_CORE = "0x27FF564707786720C71A2e5c1490A63266683612";
export const BNB_UNI_CORE_SUPPLY_CAP = parseUnits("2000000", 18);

export const vip467 = () => {
  const meta = {
    version: "v2",
    title: "VIP-467 [BNB Chain] Risk Parameters Adjustments (UNI)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in the Venus community forum publication [Chaos Labs - Risk Parameter Updates - 03/17/25](https://community.venus.io/t/chaos-labs-risk-parameter-updates-03-17-25/4992):

- [BNB Chain / UNI (Core pool)](https://app.venus.io/#/core-pool/market/0x27FF564707786720C71A2e5c1490A63266683612?chainId=56): increase supply cap from 1.56M UNI to 2M UNI

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/523](https://github.com/VenusProtocol/vips/pull/523)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: BNB_CORE_COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[BNB_UNI_CORE], [BNB_UNI_CORE_SUPPLY_CAP]],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip467;
