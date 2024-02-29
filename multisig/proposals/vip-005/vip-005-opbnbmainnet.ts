import { NETWORK_ADDRESSES } from "../../../src/networkAddresses";
import { makeProposal } from "../../../src/utils";

const { opbnbmainnet } = NETWORK_ADDRESSES;

export interface VenusMarket {
  name: string;
  address: string;
}

export const ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
export const PROTOCOL_SHARE_RESERVE = "0xA2EDD515B75aBD009161B15909C19959484B0C1e";
export const POOL_REGISTRY = "0x345a030Ad22e2317ac52811AC41C1A63cfa13aEe";
export const VTREASURY = "0xDDc9017F3073aa53a4A8535163b0bf7311F72C52";
export const OPBNBMAINNET_MULTISIG = opbnbmainnet.NORMAL_TIMELOCK;

export const MARKETS: VenusMarket[] = [
  {
    name: "VToken_vBTCB_Core",
    address: "0xED827b80Bd838192EA95002C01B5c6dA8354219a",
  },
  {
    name: "VToken_vETH_Core",
    address: "0x509e81eF638D489936FA85BC58F52Df01190d26C",
  },
  {
    name: "VToken_vUSDT_Core",
    address: "0xb7a01Ba126830692238521a1aA7E7A7509410b8e",
  },
  {
    name: "VToken_vFDUSD_Core",
    address: "0x13B492B8A03d072Bab5C54AC91Dba5b830a50917",
  },
  {
    name: "VToken_vWBNB_Core",
    address: "0x53d11cB8A0e5320Cd7229C3acc80d1A0707F2672",
  },
];

export const vip005 = () => {
  return makeProposal([
    {
      target: PROTOCOL_SHARE_RESERVE,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: PROTOCOL_SHARE_RESERVE,
      signature: "setAccessControlManager(address)",
      params: [ACM],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PROTOCOL_SHARE_RESERVE, "addOrUpdateDistributionConfigs(DistributionConfig[])", OPBNBMAINNET_MULTISIG],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PROTOCOL_SHARE_RESERVE, "removeDistributionConfig(Schema,address)", OPBNBMAINNET_MULTISIG],
    },
    {
      target: PROTOCOL_SHARE_RESERVE,
      signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
      params: [
        [
          [0, 10000, VTREASURY],
          [1, 10000, VTREASURY],
        ],
      ],
    },
    {
      target: PROTOCOL_SHARE_RESERVE,
      signature: "setPoolRegistry(address)",
      params: [POOL_REGISTRY],
    },
    ...MARKETS.map(market => {
      return {
        target: market.address,
        signature: "setProtocolShareReserve(address)",
        params: [PROTOCOL_SHARE_RESERVE],
      };
    }),
  ]);
};
