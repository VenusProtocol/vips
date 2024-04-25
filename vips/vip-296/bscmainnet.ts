import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const GAMEFI_COMPTROLLER = "0x1b43ea8622e76627B81665B1eCeBB4867566B963";
export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const vUSDT_GAMEFI = "0x4978591f17670A846137d9d613e333C38dc68A37";
export const vUNI = "0x27FF564707786720C71A2e5c1490A63266683612";
export const vCAKE = "0x86aC3974e2BD0d60825230fa6F355fF11409df5c";
export const SUPPLY_CAP_USDT_GAMEFI = parseUnits("2000000", 18);
export const SUPPLY_CAP_UNI = parseUnits("500000", 18);
export const SUPPLY_CAP_CAKE = parseUnits("24000000", 18);
export const BORROW_CAP_USDT_GAMEFI = parseUnits("1900000", 18);

export const vip296 = () => {
  const meta = {
    version: "v2",
    title: "VIP-296 Update supply and borrow cap of USDT(GameFi), UNI and CAKE markets",
    description: `
      If pass this VIP will update :-
    
        * Supply cap of UNI : 500,000
        * Supply cap of CAKE : 24,000,000
        * Supply cap of USDT(GameFi) : 2,000,000
        * Borrow cap of USDT(GameFi) : 1,900,000
`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [
          [vUNI, vCAKE],
          [SUPPLY_CAP_UNI, SUPPLY_CAP_CAKE],
        ],
      },
      {
        target: GAMEFI_COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[vUSDT_GAMEFI], [SUPPLY_CAP_USDT_GAMEFI]],
      },
      {
        target: GAMEFI_COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[vUSDT_GAMEFI], [BORROW_CAP_USDT_GAMEFI]],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip296;
