import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const vasBNB = "0xCC1dB43a06d97f736C7B045AedD03C6707c09BDF";
export const asBNB_SUPPLY_CAP = parseUnits("216000", 18);

const { bscmainnet } = NETWORK_ADDRESSES;

export const vip555 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-555 [BNB Chain] Risk Parameters Adjustments (asBNB)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in the Venus community forum publication [Chaos Labs - Risk Parameter Updates - 10/13/25](https://community.venus.io/t/chaos-labs-risk-parameter-updates-10-13-25/5441):

- [asBNB (Core pool)](https://app.venus.io/#/pool/0xfD36E2c2a6789Db23113685031d7F16329158384/market/0xCC1dB43a06d97f736C7B045AedD03C6707c09BDF?chainId=56&tab=supply):
    - increase supply cap, from 108,000 asBNB to 216,000 asBNB

Complete analysis and details of these recommendations are available in the above publication.

### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/626)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.UNITROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[vasBNB], [asBNB_SUPPLY_CAP]],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip555;
