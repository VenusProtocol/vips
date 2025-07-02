import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const vasBNB_BSC = "0xCC1dB43a06d97f736C7B045AedD03C6707c09BDF";
export const vasBNB_BSC_SUPPLY_CAP = parseUnits("48000", 18);

export const vip527 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-527 [BNB Chain] Risk Parameters Adjustments (asBNB)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in the Venus community forum publication [Chaos Labs - Risk Parameter Updates - 07/01/25](https://community.venus.io/t/chaos-labs-risk-parameter-updates-07-01-25/5185):

- [asBNB (Core pool)](https://app.venus.io/#/core-pool/market/0xCC1dB43a06d97f736C7B045AedD03C6707c09BDF?chainId=56): increase the Supply Cap, from 24,000 asBNB to 48,000 asBNB

Complete analysis and details of this recommendation are available in the above publication.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/588)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.UNITROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[vasBNB_BSC], [vasBNB_BSC_SUPPLY_CAP]],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip527;
