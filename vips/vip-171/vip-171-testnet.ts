import { ethers } from "hardhat";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const NEW_VBEP20_DELEGATE_IMPL = "0xAC5CFaC96871f35f7ce4eD2b46484Db34B548b40";
const ACCESS_CONTROL_MANAGER = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const TREASURY = "0x8b293600c50d6fbdc6ed4251cc75ece29880276f";

interface AssetConfig {
  name: string;
  address: string;
  reduceReservesBlockDelta: number;
  acceptAdmin: boolean;
}

export const CORE_MARKETS: AssetConfig[] = [
  {
    name: "vSXP",
    address: "0x74469281310195A04840Daf6EdF576F559a3dE80",
    reduceReservesBlockDelta: 840000,
    acceptAdmin: true,
  },
  {
    name: "vTRX",
    address: "0x369Fea97f6fB7510755DCA389088d9E2e2819278",
    reduceReservesBlockDelta: 840000,
    acceptAdmin: false,
  },
  {
    name: "vTUSD",
    address: "0xEFAACF73CE2D38ED40991f29E72B12C74bd4cf23",
    reduceReservesBlockDelta: 840000,
    acceptAdmin: false,
  },
  {
    name: "vUSDC",
    address: "0xD5C4C2e2facBEB59D0216D0595d63FcDc6F9A1a7",
    reduceReservesBlockDelta: 840000,
    acceptAdmin: true,
  },
  {
    name: "vUSDT",
    address: "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A",
    reduceReservesBlockDelta: 840000,
    acceptAdmin: false,
  },
  {
    name: "vWBETH",
    address: "0x35566ED3AF9E537Be487C98b1811cDf95ad0C32b",
    reduceReservesBlockDelta: 840000,
    acceptAdmin: false,
  },
];

function filterAssets(assets: AssetConfig[]) {
  return assets.filter(asset => asset.acceptAdmin);
}

const MARKETS_WITH_ACCEPT_ADMIN = filterAssets(CORE_MARKETS);

export const vip171Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-171 VToken Upgrade of AIA",
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

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setReduceReservesBlockDelta(uint256)", NORMAL_TIMELOCK],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setProtocolShareReserve(address)", NORMAL_TIMELOCK],
      },

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
          params: [TREASURY],
        };
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
