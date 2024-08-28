import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const NEW_VBEP20_DELEGATE_IMPL = "0x8d79C8f4400fE68Fd17040539FE5e1706c1f2850";
const ACCESS_CONTROL_MANAGER = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
const PROTOCOL_SHARE_RESERVE = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";

interface AssetConfig {
  name: string;
  address: string;
  reduceReservesBlockDelta: number;
  acceptAdmin: boolean;
  isMock: boolean; // Defines underlying is MockToken
}

export const CORE_MARKETS: AssetConfig[] = [
  {
    name: "vETH",
    address: "0x162D005F0Fff510E54958Cfc5CF32A3180A84aab",
    reduceReservesBlockDelta: 100,
    acceptAdmin: true,
    isMock: false,
  },
  {
    name: "vLTC",
    address: "0xAfc13BC065ABeE838540823431055D2ea52eBA52",
    reduceReservesBlockDelta: 100,
    acceptAdmin: true,
    isMock: false,
  },
  {
    name: "VBTC",
    address: "0xb6e9322C49FD75a367Fcb17B0Fcd62C5070EbCBe",
    reduceReservesBlockDelta: 100,
    acceptAdmin: true,
    isMock: false,
  },
  {
    name: "vXRP",
    address: "0x488aB2826a154da01CC4CC16A8C83d4720D3cA2C",
    reduceReservesBlockDelta: 100,
    acceptAdmin: true,
    isMock: false,
  },
  {
    name: "vSXP",
    address: "0x74469281310195A04840Daf6EdF576F559a3dE80",
    reduceReservesBlockDelta: 100,
    acceptAdmin: true,
    isMock: true,
  },
  {
    name: "vTRX",
    address: "0x369Fea97f6fB7510755DCA389088d9E2e2819278",
    reduceReservesBlockDelta: 100,
    acceptAdmin: false,
    isMock: true,
  },
  {
    name: "vTUSD",
    address: "0xEFAACF73CE2D38ED40991f29E72B12C74bd4cf23",
    reduceReservesBlockDelta: 100,
    acceptAdmin: false,
    isMock: true,
  },
  {
    name: "vUSDC",
    address: "0xD5C4C2e2facBEB59D0216D0595d63FcDc6F9A1a7",
    reduceReservesBlockDelta: 100,
    acceptAdmin: true,
    isMock: true,
  },
  {
    name: "vUSDT",
    address: "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A",
    reduceReservesBlockDelta: 100,
    acceptAdmin: false,
    isMock: true,
  },
  {
    name: "vWBETH",
    address: "0x35566ED3AF9E537Be487C98b1811cDf95ad0C32b",
    reduceReservesBlockDelta: 100,
    acceptAdmin: false,
    isMock: true,
  },
  {
    name: "vXVS",
    address: "0x6d6F697e34145Bb95c54E77482d97cc261Dc237E",
    reduceReservesBlockDelta: 100,
    acceptAdmin: true,
    isMock: false,
  },
  {
    name: "vDOGE",
    address: "0xF912d3001CAf6DC4ADD366A62Cc9115B4303c9A9",
    reduceReservesBlockDelta: 100,
    acceptAdmin: true,
    isMock: true,
  },
  {
    name: "vMATIC",
    address: "0x3619bdDc61189F33365CC572DF3a68FB3b316516",
    reduceReservesBlockDelta: 100,
    acceptAdmin: true,
    isMock: true,
  },
  {
    name: "vCAKE",
    address: "0xeDaC03D29ff74b5fDc0CC936F6288312e1459BC6",
    reduceReservesBlockDelta: 100,
    acceptAdmin: true,
    isMock: true,
  },
  {
    name: "vADA",
    address: "0x37C28DE42bA3d22217995D146FC684B2326Ede64",
    reduceReservesBlockDelta: 100,
    acceptAdmin: false,
    isMock: true,
  },
  {
    name: "vAAVE",
    address: "0x714db6c38A17883964B68a07d56cE331501d9eb6",
    reduceReservesBlockDelta: 100,
    acceptAdmin: false,
    isMock: true,
  },
  {
    name: "vBUSD",
    address: "0x08e0A5575De71037aE36AbfAfb516595fE68e5e4",
    reduceReservesBlockDelta: 100,
    acceptAdmin: false,
    isMock: true,
  },
];

function filterAssets(assets: AssetConfig[]) {
  return assets.filter(asset => asset.acceptAdmin);
}

const MARKETS_WITH_ACCEPT_ADMIN = filterAssets(CORE_MARKETS);

export const vip193Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-193 VToken Upgrade of AIA Part - 2",
    description: `upgrade the implementation of the Vtoken core supportimg Automatic income allocation feature.`,
    forDescription: "I agree that Venus Protocol should proceed with VToken Upgrade of AIA",
    againstDescription: "I do not think that Venus Protocol should proceed with VToken Upgrade of AIA",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with VToken Upgrade of AIA or not",
  };

  return makeProposal(
    [
      ...MARKETS_WITH_ACCEPT_ADMIN.map(asset => {
        return {
          target: asset.address,
          signature: "_acceptAdmin()",
          params: [],
        };
      }),
      ...CORE_MARKETS.map(asset => {
        return {
          target: asset.address,
          signature: "_setImplementation(address,bool,bytes)",
          params: [NEW_VBEP20_DELEGATE_IMPL, false, "0x"],
        };
      }),

      ...CORE_MARKETS.map(asset => {
        return {
          target: asset.address,
          signature: "setAccessControlManager(address)",
          params: [ACCESS_CONTROL_MANAGER],
        };
      }),

      ...CORE_MARKETS.map(asset => {
        return {
          target: asset.address,
          signature: "setReduceReservesBlockDelta(uint256)",
          params: [asset.reduceReservesBlockDelta],
        };
      }),

      ...CORE_MARKETS.map(asset => {
        return {
          target: asset.address,
          signature: "setProtocolShareReserve(address)",
          params: [PROTOCOL_SHARE_RESERVE],
        };
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
