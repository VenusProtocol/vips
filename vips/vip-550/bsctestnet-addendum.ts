import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { cutParams as params } from "../../simulations/vip-550/utils/bsctestnet-addendum-cut-params.json";

const bsctestnet = NETWORK_ADDRESSES.bsctestnet;
export const UNITROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const VAI_UNITROLLER = "0xf70C3C6b749BbAb89C081737334E74C9aFD4BE16";

export const NEW_DIAMOND = "0xCe314cA8be79435FB0E4ffc102DAcA172B676a47";
export const NEW_VAI_CONTROLLER = "0xA8122Fe0F9db39E266DE7A5BF953Cd72a87fe345";

export const OLD_DIAMOND = "0x11Aa7fF5990E0A341eCeEeE9ddFdF8cE570DD5FD";
export const OLD_VAI_CONTROLLER = "0x1eA874d53Dad10711Ff69C145bb59d2DFCCD7322";

export const POOL_SPECS = {
  label: "Stablecoins",
  id: 1,
  allowCorePoolFallback: true, // set to true
};

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
        signature: "_setPendingImplementation(address)",
        params: [NEW_DIAMOND],
      },
      {
        target: NEW_DIAMOND,
        signature: "_become(address)",
        params: [UNITROLLER],
      },
      {
        target: UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[])",
        params: [params],
      },
      {
        target: VAI_UNITROLLER,
        signature: "_setPendingImplementation(address)",
        params: [NEW_VAI_CONTROLLER],
      },
      {
        target: NEW_VAI_CONTROLLER,
        signature: "_become(address)",
        params: [VAI_UNITROLLER],
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
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, "setAllowCorePoolFallback(uint96,bool)", bsctestnet.NORMAL_TIMELOCK],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, "setAllowCorePoolFallback(uint96,bool)", bsctestnet.FAST_TRACK_TIMELOCK],
      },
      {
        target: bsctestnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, "setAllowCorePoolFallback(uint96,bool)", bsctestnet.CRITICAL_TIMELOCK],
      },
      {
        target: UNITROLLER,
        signature: "setAllowCorePoolFallback(uint96,bool)",
        params: [POOL_SPECS.id, POOL_SPECS.allowCorePoolFallback],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip550;
