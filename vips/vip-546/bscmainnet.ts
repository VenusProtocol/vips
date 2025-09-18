import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const vSolvBTC = "0xf841cb62c19fCd4fF5CD0AaB5939f3140BaaC3Ea";
export const SUPPLY_CAP = parseUnits("3000", 18);

const { bscmainnet } = NETWORK_ADDRESSES;

export const vip546 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-546 [BNB Chain] Chaos Labs recommendations (SolvBTC)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in the Venus community forum publication [Chaos Labs - Risk Parameter Updates - 9/17/25](https://community.venus.io/t/chaos-labs-risk-parameter-updates-9-17-25/5361):

- [SolvBTC (Core pool)](https://app.venus.io/#/pool/0xfD36E2c2a6789Db23113685031d7F16329158384/market/0xf841cb62c19fCd4fF5CD0AaB5939f3140BaaC3Ea?chainId=56&tab=supply): increase the Supply Cap, from 2,000 SolvBTC to 3,000 SolvBTC

Complete analysis and details of these recommendations are available in the above publication.

### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/614)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.UNITROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[vSolvBTC], [SUPPLY_CAP]],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip546;
