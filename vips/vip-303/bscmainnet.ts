import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const GAME_FI_COMPTROLLER = "0x1b43ea8622e76627B81665B1eCeBB4867566B963";
export const GAME_FI_VUSDT = "0x4978591f17670A846137d9d613e333C38dc68A37";
export const CORE_COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const CORE_VXVS = "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D";
export const CORE_VFDUSD = "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba";

export const GAME_FI_VUSDT_SUPPLY_CAP = parseUnits("3000000", 18);
export const GAME_FI_VUSDT_BORROW_CAP = parseUnits("2800000", 18);
export const CORE_VXVS_SUPPLY_CAP = parseUnits("1850000", 18);
export const CORE_VFDUSD_SUPPLY_CAP = parseUnits("45000000", 18);
export const CORE_VFDUSD_BORROW_CAP = parseUnits("40000000", 18);

const vip303 = () => {
  const meta = {
    version: "v2",
    title: "VIP-303 Updated Caps",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this proposal",
  };

  return makeProposal(
    [
      {
        target: GAME_FI_COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[GAME_FI_VUSDT], [GAME_FI_VUSDT_SUPPLY_CAP]],
      },
      {
        target: GAME_FI_COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[GAME_FI_VUSDT], [GAME_FI_VUSDT_BORROW_CAP]],
      },
      {
        target: CORE_COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [
          [CORE_VXVS, CORE_VFDUSD],
          [CORE_VXVS_SUPPLY_CAP, CORE_VFDUSD_SUPPLY_CAP],
        ],
      },
      {
        target: CORE_COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[CORE_VFDUSD], [CORE_VFDUSD_BORROW_CAP]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip303;
