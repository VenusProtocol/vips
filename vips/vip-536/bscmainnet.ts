import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const vasBNB = "0xCC1dB43a06d97f736C7B045AedD03C6707c09BDF";
export const vSOL = "0xBf515bA4D1b52FFdCeaBF20d31D705Ce789F2cEC";
export const asBNB_SUPPLY_CAP = parseUnits("72000", 18);
export const SOL_BORROW_CAP = parseUnits("18000", 18);

const { bscmainnet } = NETWORK_ADDRESSES;

export const vip536 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-536",
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
        params: [[vasBNB], [asBNB_SUPPLY_CAP]],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[vSOL], [SOL_BORROW_CAP]],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip536;
