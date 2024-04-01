import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const BINANCE_ORACLE = "0xB58BFDCE610042311Dc0e034a80Cc7776c1D68f5";
export const VTOKEN_BEACON = "0xBF85A90673E61956f8c79b9150BAB7893b791bDd";
export const TEMP_VTOKEN_IMPL = "0x3b8b6E96e57f0d1cD366AaCf4CcC68413aF308D0";
export const vagEUR = "0x4E1D35166776825402d50AfE4286c500027211D1";
export const VTOKEN_IMPL = "0xa60b28FDDaAB87240C3AF319892e7A4ad6FbF41F";

export const vip278 = () => {
  const meta = {
    version: "v2",
    title: "VIP-278",
    description: "",
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["EURA", 1500],
      },
      {
        target: VTOKEN_BEACON,
        signature: "upgradeTo(address)",
        params: [TEMP_VTOKEN_IMPL],
      },
      {
        target: vagEUR,
        signature: "setName(string)",
        params: ["Venus EURA (Stablecoins)"],
      },
      {
        target: vagEUR,
        signature: "setSymbol(string)",
        params: ["vEURA_Stablecoins"],
      },
      {
        target: VTOKEN_BEACON,
        signature: "upgradeTo(address)",
        params: [VTOKEN_IMPL],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip278;
