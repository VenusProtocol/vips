import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { cutParams as params } from "./cut-params-testnet.json";

const { bsctestnet } = NETWORK_ADDRESSES;

export const vBNBAdmin = "0x04109575c1dbB4ac2e59e60c783800ea10441BBe";
export const vBNBAdminImpl = "0x920863fB3965fc411A1c0aC610C768F4347570fE";
export const DefaultProxyAdmin = "0x7877ffd62649b6a1557b55d4c20fcbab17344c91";
export const DIAMOND = "0xc3c4fc65102409EF0E93660eBDaF9D4dbb2bc52A";
export const COMPTROLLER_LENS = "0x3ec96D6a9a14ee57aB83F81BB7386EBE515936D1";

export const vip541 = () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-541",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: bsctestnet.UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[])",
        params: [params],
      },
      {
        target: DefaultProxyAdmin,
        signature: "upgrade(address,address)",
        params: [vBNBAdmin, vBNBAdminImpl],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "_setPendingImplementation(address)",
        params: [DIAMOND],
      },
      {
        target: DIAMOND,
        signature: "_become(address)",
        params: [bsctestnet.UNITROLLER],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "_setComptrollerLens(address)",
        params: [COMPTROLLER_LENS],
      }
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip541;
