import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const vTWT = "0x4d41a36D04D97785bcEA57b057C412b278e6Edcc";
export const vasBNB = "0xCC1dB43a06d97f736C7B045AedD03C6707c09BDF";
export const TWT_SUPPLY_CAP = parseUnits("8000000", 18);
export const asBNB_SUPPLY_CAP = parseUnits("108000", 18);

const { bscmainnet } = NETWORK_ADDRESSES;

export const vip551 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-551",
    description: ``,
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

export default vip551;
