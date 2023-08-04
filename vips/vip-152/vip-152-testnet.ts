import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const BEACON = "0xdDDD7725C073105fB2AbfCbdeC16708fC4c24B74";
const NEW_IMPL_COMP = "0xc340b7d3406502F43dC11a988E4EC5bbE536E642";
const OLD_IMPL_COMP = "0x80691DaD6dAb8a028FFE68bb8045f2547d210f9D";
const COMPTROLLER_DEFI = "0x23a73971A6B9f6580c048B9CB188869B2A2aA2aD";
const VBIFI = "0xEF949287834Be010C1A5EDd757c385FB9b644E4A";
const BIFI = "0x5B662703775171c4212F2FBAdb7F92e64116c154";
const ACCESS_CONTROL_MANAGER = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const POOL_REGISTRY_PROXY = "0xC85491616Fa949E048F3aAc39fbf5b0703800667";
const POOL_REGISTRY_NEW_IMPL = "0x77c580e90D425e650A90b01473E0bA0604fc1926";
const POOL_REGISTRY_OLD_IMPL = "0xed659A02c5f63f299C28F6A246143326b922e3d9";
const PROXY_ADMIN = "0xef480a5654b231ff7d80A0681F938f3Db71a6Ca6";

export const vip152Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-152 remove BIFI market from DeFi Pool",
    description: `upgrade the implementation of the DeFi Comptroller contract, with a new version adding the feature to remove a market from the Comptroller
    execute the new function on the Comptroller contract associated with the DeFi pool, to remove the vBIFI market.`,
    forDescription: "I agree that Venus Protocol should proceed with remove BIFI market from DeFi Pool",
    againstDescription: "I do not think that Venus Protocol should proceed with remove BIFI market from DeFi Pool",
    abstainDescription:
      "I am indifferent to whether Venus Protocol proceeds with remove BIFI market from DeFi Pool or not",
  };

  return makeProposal(
    [
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [COMPTROLLER_DEFI, "removeMarket(address)", NORMAL_TIMELOCK],
      },
      {
        target: BEACON,
        signature: "upgradeTo(address)",
        params: [NEW_IMPL_COMP],
      },
      {
        target: COMPTROLLER_DEFI,
        signature: "removeMarket(address)",
        params: [VBIFI],
      },
      {
        target: BEACON,
        signature: "upgradeTo(address)",
        params: [OLD_IMPL_COMP],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "revokeCallPermission(address,string,address)",
        params: [COMPTROLLER_DEFI, "removeMarket(address)", NORMAL_TIMELOCK],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [POOL_REGISTRY_PROXY, "removeMarket(address,address)", NORMAL_TIMELOCK],
      },
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [POOL_REGISTRY_PROXY, POOL_REGISTRY_NEW_IMPL],
      },
      {
        target: POOL_REGISTRY_PROXY,
        signature: "removeMarket(address,address)",
        params: [COMPTROLLER_DEFI, BIFI],
      },
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [POOL_REGISTRY_PROXY, POOL_REGISTRY_OLD_IMPL],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "revokeCallPermission(address,string,address)",
        params: [POOL_REGISTRY_PROXY, "removeMarket(address,address)", NORMAL_TIMELOCK],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
