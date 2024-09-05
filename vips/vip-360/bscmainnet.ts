import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const vUNI = "0x27FF564707786720C71A2e5c1490A63266683612";
export const vDOGE = "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71";
export const vFLOKI = "0xc353B7a1E13dDba393B5E120D4169Da7185aA2cb";
export const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const GAMEFI_COMPTROLLER = "0x1b43ea8622e76627B81665B1eCeBB4867566B963";
export const vUNI_SUPPLY_CAP = parseUnits("900000", 18);
export const vDOGE_SUPPLY_CAP = parseUnits("120000000", 8);
export const vFLOKI_BORROW_CAP = parseUnits("4000000000", 9);

const vip318 = () => {
  const meta = {
    version: "v2",
    title: "VIP-360",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: UNITROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [
          [vUNI, vDOGE],
          [vUNI_SUPPLY_CAP, vDOGE_SUPPLY_CAP],
        ],
      },
      {
        target: GAMEFI_COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[vFLOKI], [vFLOKI_BORROW_CAP]],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip318;
