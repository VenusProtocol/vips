import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const CORE_COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const vSOLVBTC_CORE = "0xf841cb62c19fCd4fF5CD0AaB5939f3140BaaC3Ea";

export const vSOLVBTC_CORE_SUPPLY_CAP = parseUnits("400", 18);
export const vSOLVBTC_CORE_BORROW_CAP = parseUnits("110", 18);

export const vip416 = () => {
  const meta = {
    version: "v2",
    title: "VIP-416 [BNB Chain] Risk Parameters Adjustments (SolvBTC)",
    description: `If passed, this VIP will perform the following actions as per Chaos Labs’ latest recommendations in this Venus community forum publication: [Chaos Labs - Risk Parameter Updates - 12/31/2024](https://community.venus.io/t/chaos-labs-risk-parameter-updates-12-31-2024/4806)

- [SolvBTC (Core pool)](https://bscscan.com/address/0xf841cb62c19fCd4fF5CD0AaB5939f3140BaaC3Ea):
    - Increase supply cap, from 200 SolvBTC to 400 SolvBTC
    - Increase borrow cap, from 55 SolvBTC to 110 SolvBTC

Complete analysis and details of these recommendations are available in the above publications.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/449](https://github.com/VenusProtocol/vips/pull/449)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: CORE_COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[vSOLVBTC_CORE], [vSOLVBTC_CORE_SUPPLY_CAP]],
      },
      {
        target: CORE_COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[vSOLVBTC_CORE], [vSOLVBTC_CORE_BORROW_CAP]],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip416;
