import { ethers } from "hardhat";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const VTOKEN_BEACON = "0xBF85A90673E61956f8c79b9150BAB7893b791bDd";
const NEW_IMPL_VTOKEN = "0x37130dd8181477Be3dDe8b22A32FE302ca602BA7";
const ACCESS_CONTROL_MANAGER = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const PROTOCOL_SHARE_RESERVE = "0x8b293600c50d6fbdc6ed4251cc75ece29880276f";

interface AssetConfig {
  name: string;
  address: string;
  reduceReservesBlockDelta: number;
}

export const IL_MARKETS: AssetConfig[] = [
  {
    name: "vHAY",
    address: "0x170d3b2da05cc2124334240fB34ad1359e34C562",
    reduceReservesBlockDelta: 8640000,
  },
  {
    name: "vUSDD",
    address: "0x899dDf81DfbbF5889a16D075c352F2b959Dd24A4",
    reduceReservesBlockDelta: 8640000,
  },
  {
    name: "vUSDT",
    address: "0x3338988d0beb4419Acb8fE624218754053362D06",
    reduceReservesBlockDelta: 8640000,
  },
  {
    name: "vWIN_Tron",
    address: "0xEe543D5de2Dbb5b07675Fc72831A2f1812428393",
    reduceReservesBlockDelta: 8640000,
  },
  {
    name: "vUSDD_Tron",
    address: "0xD804F74fe21290d213c46610ab171f7c2EeEBDE7",
    reduceReservesBlockDelta: 8640000,
  },
  {
    name: "vUSDT_Tron",
    address: "0x712774CBFFCBD60e9825871CcEFF2F917442b2c3",
    reduceReservesBlockDelta: 8640000,
  },
  {
    name: "vTRX_Tron",
    address: "0x410286c43a525E1DCC7468a9B091C111C8324cd1",
    reduceReservesBlockDelta: 8640000,
  },
  {
    name: "vBTT_Tron",
    address: "0x47793540757c6E6D84155B33cd8D9535CFdb9334",
    reduceReservesBlockDelta: 8640000,
  },
  {
    name: "vWBNB_LiquidStakedBNB",
    address: "0x231dED0Dfc99634e52EE1a1329586bc970d773b3",
    reduceReservesBlockDelta: 8640000,
  },
  {
    name: "vBNBx_LiquidStakedBNB",
    address: "0x644A149853E5507AdF3e682218b8AC86cdD62951",
    reduceReservesBlockDelta: 8640000,
  },
  {
    name: "vstkBNB_LiquidStakedBNB",
    address: "0x75aa42c832a8911B77219DbeBABBB40040d16987",
    reduceReservesBlockDelta: 8640000,
  },
  {
    name: "vankrBNB_LiquidStakedBNB",
    address: "0x57a664Dd7f1dE19545fEE9c86C949e3BF43d6D47",
    reduceReservesBlockDelta: 8640000,
  },
  {
    name: "vFLOKI_GameFi",
    address: "0xef470AbC365F88e4582D8027172a392C473A5B53",
    reduceReservesBlockDelta: 8640000,
  },
  {
    name: "vUSDD_GameFi",
    address: "0xdeDf3B2bcF25d0023115fd71a0F8221C91C92B1a",
    reduceReservesBlockDelta: 8640000,
  },
  {
    name: "vRACA_GameFi",
    address: "0x1958035231E125830bA5d17D168cEa07Bb42184a",
    reduceReservesBlockDelta: 8640000,
  },
  {
    name: "vUSDT_GameFi",
    address: "0x0bFE4e0B8A2a096A27e5B18b078d25be57C08634",
    reduceReservesBlockDelta: 8640000,
  },
  {
    name: "vUSDT_DeFi",
    address: "0x80CC30811e362aC9aB857C3d7875CbcCc0b65750",
    reduceReservesBlockDelta: 8640000,
  },
  {
    name: "vankrBNB_DeFi",
    address: "0xe507B30C41E9e375BCe05197c1e09fc9ee40c0f6",
    reduceReservesBlockDelta: 8640000,
  },
  {
    name: "vUSDD_DeFi",
    address: "0xa109DE0abaeefC521Ec29D89eA42E64F37A6882E",
    reduceReservesBlockDelta: 8640000,
  },
  {
    name: "vANKR_DeFi",
    address: "0xb677e080148368EeeE70fA3865d07E92c6500174",
    reduceReservesBlockDelta: 8640000,
  },
  {
    name: "vBSW_DeFi",
    address: "0x5e68913fbbfb91af30366ab1B21324410b49a308",
    reduceReservesBlockDelta: 8640000,
  },
  {
    name: "vALPACA_DeFi",
    address: "0xb7caC5Ef82cb7f9197ee184779bdc52c5490C02a",
    reduceReservesBlockDelta: 8640000,
  },
];

export const vip170Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-170 VToken Upgrade of AIA",
    description: `upgrade the implementation of the Vtoken core supportimg Automatic income allocation feature.`,
    forDescription: "I agree that Venus Protocol should proceed with VToken Upgrade of AIA",
    againstDescription: "I do not think that Venus Protocol should proceed with VToken Upgrade of AIA",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with VToken Upgrade of AIA or not",
  };

  return makeProposal(
    [
      {
        target: VTOKEN_BEACON,
        signature: "upgradeTo(address)",
        params: [NEW_IMPL_VTOKEN],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setReduceReservesBlockDelta(uint256)", NORMAL_TIMELOCK],
      },
      ...IL_MARKETS.map(asset => {
        return {
          target: asset.address,
          signature: "setReduceReservesBlockDelta(uint256)",
          params: [asset.reduceReservesBlockDelta],
        };
      }),
      ...IL_MARKETS.map(asset => {
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
