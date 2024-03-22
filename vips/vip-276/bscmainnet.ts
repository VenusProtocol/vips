import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const IL_DEFI_COMPTROLLER = "0x3344417c9360b963ca93A4e8305361AEde340Ab9";
export const IL_GAMEFI_COMPTROLLER = "0x1b43ea8622e76627B81665B1eCeBB4867566B963";

export const vUNI_CORE = "0x27FF564707786720C71A2e5c1490A63266683612";
export const vWBETH_CORE = "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0";
export const vETH_CORE = "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8";
export const vUSDC_CORE = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
export const vFDUSD_CORE = "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba";
export const vTWT_DEFI = "0x736bf1D21A28b5DC19A1aC8cA71Fc2856C23c03F";
export const vUSDT_GAMEFI = "0x4978591f17670A846137d9d613e333C38dc68A37";

export const vUNI_SUPPLY_CAP = parseUnits("400000", 18);
export const vWBETH_BORROW_CAP = parseUnits("8000", 18);
export const vETH_BORROW_CAP = parseUnits("60000", 18);
export const vUSDC_BORROW_CAP = parseUnits("200000000", 18);
export const vFDUSD_SUPPLY_CAP = parseUnits("30000000", 18);
export const vTWT_SUPPLY_CAP = parseUnits("3000000", 18);
export const vUSDT_BORROW_CAP = parseUnits("1100000", 18);

export const vip276 = () => {
  const meta = {
    version: "v2",
    title: "VIP-276 Risk Parameters Adjustments (UNI, WBETH, ETH, USDC, FDUSD, TWT, USDT)",
    description: `This VIP will perform the following Risk Parameter actions as per Chaos Labs’ latest recommendations in this Venus community forum publication: [Risk Parameter Updates 03/21/2024](https://community.venus.io/t/chaos-labs-risk-parameter-updates-03-21-24/4218).

- [UNI (Core pool)](https://bscscan.com/address/0x27FF564707786720C71A2e5c1490A63266683612)
    - Increase supply cap, from 300K UNI to 400K UNI
- [WBETH (Core pool)](https://bscscan.com/address/0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0)
    - Increase borrow cap, from 4K WBETH to 8K WBETH
- [ETH (Code pool)](https://bscscan.com/address/0xf508fCD89b8bd15579dc79A6827cB4686A3592c8)
    - Increase borrow cap, from 40K ETH to 60K ETH
- [USDC (Code pool)](https://bscscan.com/address/0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8)
    - Increase borrow cap, from 124.7M USDC to 200M USDC
- [FDUSD (Code pool)](https://bscscan.com/address/0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba)
    - Increase supply cap, from 20M FDUSD to 30M FDUSD
- [TWT (DeFi pool)](https://bscscan.com/address/0x736bf1D21A28b5DC19A1aC8cA71Fc2856C23c03F)
    - Increase supply cap, from 1.5M TWT to 3M TWT
- [USDT (GameFi pool)](https://bscscan.com/address/0x4978591f17670A846137d9d613e333C38dc68A37)
    - Increase borrow cap, from 800K USDT to 1.1M USDT

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/242](https://github.com/VenusProtocol/vips/pull/242)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: UNITROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [
          [vUNI_CORE, vFDUSD_CORE],
          [vUNI_SUPPLY_CAP, vFDUSD_SUPPLY_CAP],
        ],
      },
      {
        target: UNITROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [
          [vWBETH_CORE, vETH_CORE, vUSDC_CORE],
          [vWBETH_BORROW_CAP, vETH_BORROW_CAP, vUSDC_BORROW_CAP],
        ],
      },
      {
        target: IL_DEFI_COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[vTWT_DEFI], [vTWT_SUPPLY_CAP]],
      },
      {
        target: IL_GAMEFI_COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[vUSDT_GAMEFI], [vUSDT_BORROW_CAP]],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip276;
