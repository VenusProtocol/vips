import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const vxSolvBTC_BSC = "0xd804dE60aFD05EE6B89aab5D152258fD461B07D5";
export const vxSolvBTC_BSC_SUPPLY_CAP = parseUnits("150", 18);

export const vip513 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-513 [BNB Chain] Risk Parameters Adjustments (xSolvBTC)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in the Venus community forum publication [Chaos Labs - Risk Parameter Updates - 06/10/25](https://community.venus.io/t/chaos-labs-risk-parameter-updates-06-10-25/5143):

- [xSolvBTC (Core pool)](https://app.venus.io/#/core-pool/market/0xd804dE60aFD05EE6B89aab5D152258fD461B07D5?chainId=56): increase the Supply Cap, from 100 xSolvBTC to 150 xSolvBTC

Complete analysis and details of this recommendation are available in the above publication.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/574)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.UNITROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[vxSolvBTC_BSC], [vxSolvBTC_BSC_SUPPLY_CAP]],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip513;
