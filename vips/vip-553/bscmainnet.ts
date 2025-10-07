import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const vTWT = "0x4d41a36D04D97785bcEA57b057C412b278e6Edcc";
export const vasBNB = "0xCC1dB43a06d97f736C7B045AedD03C6707c09BDF";
export const TWT_SUPPLY_CAP = parseUnits("8000000", 18);
export const asBNB_SUPPLY_CAP = parseUnits("108000", 18);

const { bscmainnet } = NETWORK_ADDRESSES;

export const vip553 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-553 [BNB Chain] Risk Parameters Adjustments (TWT, asBNB)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in the Venus community forum publication [Chaos Labs - Risk Parameter Updates - 10/07/25](https://community.venus.io/t/chaos-labs-risk-parameter-updates-10-07-25/5423/1):

- [TWT (Core pool)](https://app.venus.io/#/pool/0xfD36E2c2a6789Db23113685031d7F16329158384/market/0x4d41a36D04D97785bcEA57b057C412b278e6Edcc?chainId=56&tab=supply):
    - increase supply cap, from 4M TWT to 8M TWT
- [asBNB (Core pool)](https://app.venus.io/#/pool/0xfD36E2c2a6789Db23113685031d7F16329158384/market/0xCC1dB43a06d97f736C7B045AedD03C6707c09BDF?chainId=56&tab=supply):
    - increase supply cap, from 72,000 asBNB to 108,000 asBNB

Complete analysis and details of these recommendations are available in the above publication.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/620)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.UNITROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [
          [vTWT, vasBNB],
          [TWT_SUPPLY_CAP, asBNB_SUPPLY_CAP],
        ],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip553;
