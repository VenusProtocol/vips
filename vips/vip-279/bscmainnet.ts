import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const vFDUSD = "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba";
export const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
export const vWBETH = "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0";

export const OLD_FDUSD_BORROW_CAP = parseUnits("16000000", 18);
export const FDUSD_BORROW_CAP = parseUnits("24000000", 18);

export const OLD_USDT_SUPPLY_CAP = parseUnits("400000000", 18);
export const USDT_SUPPLY_CAP = parseUnits("500000000", 18);

export const OLD_USDT_BORROW_CAP = parseUnits("300000000", 18);
export const USDT_BORROW_CAP = parseUnits("450000000", 18);

export const OLD_WBETH_BORROW_CAP = parseUnits("8000", 18);
export const WBETH_BORROW_CAP = parseUnits("16000", 18);

const vip279 = () => {
  const meta = {
    version: "v2",
    title: "VIP-279 Risk Parameters Adjustments",
    description: `This VIP will perform the following Risk Parameter actions as per Chaos Labs’ latest recommendations in this Venus community forum publication: [Risk Parameter Updates 04/01/24](https://community.venus.io/t/chaos-labs-risk-parameter-updates-04-01-24/4238).

- [FDUSD (Core pool)](https://bscscan.com/address/0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba)
    - Increase borrow cap, from 16M FDUSD to 24M FDUSD
- [USDT (Core pool)](https://bscscan.com/address/0xfD5840Cd36d94D7229439859C0112a4185BC0255)
    - Increase supply cap, from 400M USDT to 500M USDT
    - Increase borrow cap, from 300M USDT to 450M USDT
- [WBETH (Core pool)](https://bscscan.com/address/0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0)
    - Increase borrow cap, from 8000 WBETH to 16000 WBETH

Complete analysis and details of these recommendations are available in the above publication.
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
        params: [[vUSDT], [USDT_SUPPLY_CAP]],
      },
      {
        target: COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [
          [vFDUSD, vUSDT, vWBETH],
          [FDUSD_BORROW_CAP, USDT_BORROW_CAP, WBETH_BORROW_CAP],
        ],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip279;
