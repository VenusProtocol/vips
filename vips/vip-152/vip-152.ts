import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const BEACON = "0x38B4Efab9ea1bAcD19dC81f19c4D1C2F9DeAe1B2";
const NEW_IMPL_COMP = "0x4E78A2a804F0c87Fa9e1b08f70733fB775b4f920";
const OLD_IMPL_COMP = "0x939C05e2E694db68cE54d80bf29926b09190aA0F";
const COMPTROLLER_DEFI = "0x3344417c9360b963ca93A4e8305361AEde340Ab9";
const VBIFI = "0xC718c51958d3fd44f5F9580c9fFAC2F89815C909";
const BIFI = "0xCa3F508B8e4Dd382eE878A314789373D80A5190A";
const ACCESS_CONTROL_MANAGER = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const POOL_REGISTRY_PROXY = "0x9F7b01A536aFA00EF10310A162877fd792cD0666";
const POOL_REGISTRY_NEW_IMPL = "0xA5501fEDb2C265091123C6EF8Ed5897A020B5590";
const POOL_REGISTRY_OLD_IMPL = "0xc4953e157D057941A9a71273B0aF4d4477ED2770";
const PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";

export const vip152 = () => {
  const meta = {
    version: "v2",
    title: "VIP-152 Unlink BIFI market from DeFi pool",
    description: `#### Summary

If passed, this VIP will remove every record of the BIFI market from the DeFi pool

#### Description

In the [VIP-139](https://app.venus.io/governance/proposal/139) the BIFI market was paused and at the same time it was removed from the [Venus UI](https://app.venus.io). The only liquidity provided was the bootstrap liquidity, and the BIFI project has already withdrawn it. There isn’t any loan in that market. So, now it’s safe to remove this market from the list of markets in the DeFi Comptroller.

VIP execution on testnet: [https://testnet.venus.io/governance/proposal/266](https://testnet.venus.io/governance/proposal/266) 

Simulation of the VIP: [https://github.com/VenusProtocol/vips/pull/45](https://github.com/VenusProtocol/vips/pull/45)
`,
    forDescription: "Process to remove BIFI from the DeFi pool",
    againstDescription: "Defer removing BIFI from the DeFi pool",
    abstainDescription: "No opinion on the matter",
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
