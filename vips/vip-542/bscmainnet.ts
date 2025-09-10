import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const vxSolvBTC = "0xd804dE60aFD05EE6B89aab5D152258fD461B07D5";
export const SUPPLY_CAP = parseUnits("2000", 18);

const { bscmainnet } = NETWORK_ADDRESSES;

export const vip542 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-542 [BNB Chain] Risk Parameters Adjustments (xSolvBTC)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in the Venus community forum publication [Chaos Labs - Risk Parameter Updates - 9/10/25](https://community.venus.io/t/chaos-labs-risk-parameter-updates-9-10-25/5346):

- [xSolvBTC (Core pool)](https://app.venus.io/#/pool/0xfD36E2c2a6789Db23113685031d7F16329158384/market/0xd804dE60aFD05EE6B89aab5D152258fD461B07D5?chainId=56):
    - increase supply cap, from 1,250 xSolvBTC to 1,375 xSolvBTC

Complete analysis and details of this recommendation are available in the above publication.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/612)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.UNITROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[vxSolvBTC], [SUPPLY_CAP]],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip542;
