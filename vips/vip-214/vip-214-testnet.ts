import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const PRIME_PROXY = "0xe840F8EC2Dc50E7D22e5e2991975b9F6e34b62Ad";
const VAI_CONTROLLER_PROXY = "0xf70C3C6b749BbAb89C081737334E74C9aFD4BE16";
const PLP_PROXY = "0xAdeddc73eAFCbed174e6C400165b111b0cb80B7E";
const NEW_PRIME_IMPLEMENTATION = "0xFa32e28b54B489CB72cF4BF956600A0910CCDb81";
const NEW_VAI_CONTROLLER_IMPLEMENTATION = "0x1A81C74Cc669172D89d0C8ed7D9Fd960fcba1A38";
const NEW_PLP_IMPLEMENTATION = "0x29406DD113B5E90f56Fa7E1E1Ca148DB8B4E6E7F";
const DEFAULT_PROXY_ADMIN = "0x7877fFd62649b6A1557B55D4c20fcBaB17344C91";
const ACM = "0x45f8a08f534f34a97187626e05d4b6648eeaa9aa";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const FAST_TRACK_TIMELOCK = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";
const CRITICAL_TIMELOCK = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";

export const vip214 = () => {
  const meta = {
    version: "v2",
    title: "VAI Controller and Prime Upgrade",
    description:
      "This VIP upgrades the VAI Controller and Prime contracts. The VAI controller will now be able to only allow Prime users to mint VAI.",
    forDescription: "I agree that Venus Protocol should proceed with upgrading Prime and VAI Controller",
    againstDescription: "I do not think that Venus Protocol should proceed with upgrading Prime and VAI Controller",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with upgrading Prime and VAI Controller",
  };

  return makeProposal(
    [
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [PRIME_PROXY, NEW_PRIME_IMPLEMENTATION],
      },
      {
        target: VAI_CONTROLLER_PROXY,
        signature: "_setPendingImplementation(address)",
        params: [NEW_VAI_CONTROLLER_IMPLEMENTATION],
      },
      {
        target: NEW_VAI_CONTROLLER_IMPLEMENTATION,
        signature: "_become(address)",
        params: [VAI_CONTROLLER_PROXY],
      },
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [PLP_PROXY, NEW_PLP_IMPLEMENTATION],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_CONTROLLER_PROXY, "toggleOnlyPrimeHolderMint()", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_CONTROLLER_PROXY, "toggleOnlyPrimeHolderMint()", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_CONTROLLER_PROXY, "toggleOnlyPrimeHolderMint()", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_CONTROLLER_PROXY, "setMintCap(uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_CONTROLLER_PROXY, "setBaseRate(uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_CONTROLLER_PROXY, "setFloatRate(uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_CONTROLLER_PROXY, "setMintCap(uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: VAI_CONTROLLER_PROXY,
        signature: "_setPrimeToken(address)",
        params: [PRIME_PROXY],
      },
      {
        target: VAI_CONTROLLER_PROXY,
        signature: "toggleOnlyPrimeHolderMint()",
        params: [],
      },
      {
        target: VAI_CONTROLLER_PROXY,
        signature: "setBaseRate(uint256)",
        params: ["70000000000000000"],
      },
      {
        target: VAI_CONTROLLER_PROXY,
        signature: "setMintCap(uint256)",
        params: ["20000000000000000000000000"],
      },
      {
        target: COMPTROLLER,
        signature: "_setVAIMintRate(uint256)",
        params: ["1000000000000000000"],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
