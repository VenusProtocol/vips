import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const bsctestnet = NETWORK_ADDRESSES.bsctestnet;
export const UNITROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const OLD_SETTER_FACET = "0xF1844c6d56314a10C28175db638B51b4Ee14C402";
export const NEW_SETTER_FACET = "0xc352898B455eC325fD1d31f265b53Aa2409B9F68";
const FacetCutAction = { Add: 0, Replace: 1, Remove: 2 };

export const CUT_PARAMS = [
  [
    NEW_SETTER_FACET,
    FacetCutAction.Replace,
    [
      "0xf519fc30",
      "0x2b5d790c",
      "0x317b0b77",
      "0x9bf34cbb",
      "0x522c656b",
      "0x17db2163",
      "0xbb857450",
      "0x607ef6c1",
      "0x51a485e4",
      "0x5f5af1aa",
      "0x55ee1fe1",
      "0x9460c8b5",
      "0x2a6a6065",
      "0xd24febad",
      "0x9cfdd9e6",
      "0x2ec04124",
      "0x4e0853db",
      "0x6662c7c9",
      "0x919a3736",
      "0x4ef233fc",
      "0x24aaa220",
      "0x12348e96",
      "0x5cc4fdeb",
      "0x9159b177",
      "0x8b3113f6",
      "0xa89766dd",
      "0x35439240",
      "0x9bd8f6e8",
      "0x186db48f",
      "0xd136af44",
      "0xfd51a3ad",
      "0x4964f48c",
      "0x530e784f",
      "0xc32094c7",
    ],
  ],
  [NEW_SETTER_FACET, FacetCutAction.Add, ["0xb88d846b"]],
];

export const vip550 = () => {
  const meta = {
    version: "v2",
    title: "Emode in the BNB Core Pool",
    description: "Emode in the BNB Core Pool",
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[])",
        params: [CUT_PARAMS],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, "setPoolLabel(uint96,string)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, "setPoolLabel(uint96,string)", bsctestnet.FAST_TRACK_TIMELOCK],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, "setPoolLabel(uint96,string)", bsctestnet.CRITICAL_TIMELOCK],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip550;
