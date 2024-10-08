import { ethers } from "hardhat";

import { cutParams as params } from "../../simulations/vip-361/utils/cut-params-testnet.json";
import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const UNITROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
export const IL_ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
export const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
export const FAST_TRACK_TIMELOCK = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";
export const CRITICAL_TIMELOCK = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";
export const vLUNA = "0x9C3015191d39cF1930F92EB7e7BCbd020bCA286a";
export const vUST = "0xF206af85BC2761c4F876d27Bd474681CfB335EfA";
export const COMPTROLLER_IMPL = "0x912c97B168286F550fd7b9588b2069319F1C88a2";
export const COMPTROLLER_BEACON = "0xdddd7725c073105fb2abfcbdec16708fc4c24b74";
export const cutParams = params;

export const vip361 = () => {
  const meta = {
    version: "v2",
    title: "VIP-361 Unlist Market",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[])",
        params: [cutParams],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, "unlistMarket(address)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, "unlistMarket(address)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, "unlistMarket(address)", CRITICAL_TIMELOCK],
      },
      {
        target: IL_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "unlistMarket(address)", NORMAL_TIMELOCK],
      },
      {
        target: IL_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "unlistMarket(address)", FAST_TRACK_TIMELOCK],
      },
      {
        target: IL_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "unlistMarket(address)", CRITICAL_TIMELOCK],
      },
      {
        target: UNITROLLER,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[vLUNA, vUST], [0, 1, 2, 3, 4, 5, 6, 7, 8], true],
      },
      {
        target: UNITROLLER,
        signature: "unlistMarket(address)",
        params: [vLUNA],
      },
      {
        target: UNITROLLER,
        signature: "unlistMarket(address)",
        params: [vUST],
      },
      {
        target: COMPTROLLER_BEACON,
        signature: "upgradeTo(address)",
        params: [COMPTROLLER_IMPL],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip361;
