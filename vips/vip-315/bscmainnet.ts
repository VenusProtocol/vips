import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const vWBNB_IR = "0x8037f793A298789736fc1cb7e3154573647CDD11";
export const vWBNB = "0xe10E80B7FD3a29fE46E16C30CC8F4dd938B742e2";
export const vWBNB_RF = parseUnits("0.05", 18);
export const LT = parseUnits("0.93", 18);
export const CF = parseUnits("0.9", 18);
export const vslisBNB = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";
export const vstkBNB = "0xcc5D9e502574cda17215E70bC0B4546663785227";
export const vBNBx = "0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791";
export const vankrBNB = "0xBfe25459BA784e70E2D7a718Be99a1f3521cA17f";
export const COMPTROLLER = "0xd933909A4a2b7A4638903028f44D1d38ce27c352";
export const stkBNB_SUPPLY_CAP = parseUnits("50", 18);
export const stkBNB_BORROW_CAP = parseUnits("0", 18);

const vip315 = () => {
  const meta = {
    version: "v2",
    title: "VIP-315 Chaos Labs Recommendation",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: vWBNB,
        signature: "setInterestRateModel(address)",
        params: [vWBNB_IR],
      },
      {
        target: vWBNB,
        signature: "setReserveFactor(uint256)",
        params: [vWBNB_RF],
      },
      {
        target: COMPTROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vslisBNB, CF, LT],
      },
      {
        target: COMPTROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vstkBNB, CF, LT],
      },
      {
        target: COMPTROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vBNBx, CF, LT],
      },
      {
        target: COMPTROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vankrBNB, CF, LT],
      },
      {
        target: COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[vstkBNB], [stkBNB_SUPPLY_CAP]],
      },
      {
        target: COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[vstkBNB], [stkBNB_BORROW_CAP]],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip315;
