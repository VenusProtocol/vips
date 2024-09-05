import { parseUnits } from "ethers/lib/utils";

import { cutParams as params } from "../../simulations/vip-357/utils/cut-params-testnet.json";
import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const UNITROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const vBUSD = "0x08e0A5575De71037aE36AbfAfb516595fE68e5e4";
export const vAAVE = "0x714db6c38A17883964B68a07d56cE331501d9eb6";
export const vADA = "0x37C28DE42bA3d22217995D146FC684B2326Ede64";
export const vBNB = "0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c";
export const vBTC = "0xb6e9322C49FD75a367Fcb17B0Fcd62C5070EbCBe";
export const vDOGE = "0xF912d3001CAf6DC4ADD366A62Cc9115B4303c9A9";
export const vETH = "0x162D005F0Fff510E54958Cfc5CF32A3180A84aab";
export const vLTC = "0xAfc13BC065ABeE838540823431055D2ea52eBA52";
export const vMATIC = "0x3619bdDc61189F33365CC572DF3a68FB3b316516";
export const vTRX = "0x6AF3Fdb3282c5bb6926269Db10837fa8Aec67C04";
export const vUSDC = "0xD5C4C2e2facBEB59D0216D0595d63FcDc6F9A1a7";
export const vUSDT = "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A";
export const vXRP = "0x488aB2826a154da01CC4CC16A8C83d4720D3cA2C";

export const vAAVE_BORROW_CAP = parseUnits("1000000", 18);
export const vADA_BORROW_CAP = parseUnits("1000000", 18);
export const vBNB_BORROW_CAP = parseUnits("1000000", 18);
export const vBTC_BORROW_CAP = parseUnits("1000000", 18);
export const vDOGE_BORROW_CAP = parseUnits("1000000", 8);
export const vETH_BORROW_CAP = parseUnits("1000000", 18);
export const vLTC_BORROW_CAP = parseUnits("1000000", 18);
export const vMATIC_BORROW_CAP = parseUnits("1000000", 18);
export const vTRX_BORROW_CAP = parseUnits("1000000", 6);
export const vUSDC_BORROW_CAP = parseUnits("1000000", 6);
export const vUSDT_BORROW_CAP = parseUnits("1000000", 6);
export const vXRP_BORROW_CAP = parseUnits("1000000", 18);

export const cutParams = params;

export const vip357 = () => {
  const meta = {
    version: "v2",
    title: "VIP-357 Fix Market Caps",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: UNITROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[vBUSD], [0]],
      },
      {
        target: UNITROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [
          [vAAVE, vADA, vBNB, vBTC, vDOGE, vETH, vLTC, vMATIC, vTRX, vUSDC, vUSDT, vXRP],
          [
            vAAVE_BORROW_CAP,
            vADA_BORROW_CAP,
            vBNB_BORROW_CAP,
            vBTC_BORROW_CAP,
            vDOGE_BORROW_CAP,
            vETH_BORROW_CAP,
            vLTC_BORROW_CAP,
            vMATIC_BORROW_CAP,
            vTRX_BORROW_CAP,
            vUSDC_BORROW_CAP,
            vUSDT_BORROW_CAP,
            vXRP_BORROW_CAP,
          ],
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip357;
