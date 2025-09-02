import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const vBTCB = "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B";
export const IRM = "0x71b006ce7d5E9C69c14c8195684783Cb06b80c9e";
export const RESERVE_FACTOR = parseUnits("0.3", 18);
export const vxSolvBTC = "0xd804dE60aFD05EE6B89aab5D152258fD461B07D5";
export const SUPPLY_CAP = parseUnits("1375", 18);

const { bscmainnet } = NETWORK_ADDRESSES;

export const vip539 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-539",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: vBTCB,
        signature: "_setInterestRateModel(address)",
        params: [
          IRM,
        ],
      },
      {
        target: vBTCB,
        signature: "_setReserveFactor(uint256)",
        params: [
          RESERVE_FACTOR,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [
          [vxSolvBTC],
          [SUPPLY_CAP],
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip539;
