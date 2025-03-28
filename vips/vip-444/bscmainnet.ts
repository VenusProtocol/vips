import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const CORE_COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const vTHE_CORE = "0x86e06EAfa6A1eA631Eab51DE500E3D474933739f";

export const vTHE_CORE_SUPPLY_CAP = parseUnits("4800000", 18);
export const vTHE_CORE_BORROW_CAP = parseUnits("2400000", 18);

export const vip444 = () => {
  const meta = {
    version: "v2",
    title: "VIP-444 [BNB Chain] Risk Parameters Adjustments (THE)",
    description: `If passed, this VIP will perform the following actions as per Chaos Labs’ latest recommendations in this Venus community forum publication: [Chaos Labs - Risk Parameter Update - 2/5/25](https://community.venus.io/t/chaos-labs-risk-parameter-update-2-5-25/4863)

- [THE (Core pool)](https://bscscan.com/address/0x86e06EAfa6A1eA631Eab51DE500E3D474933739f):
    - Increase supply cap, from 2,400,000 THE to 4,800,000 THE
    - Increase borrow cap, from 1,200,000 THE to 2,400,000 THE

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/481](https://github.com/VenusProtocol/vips/pull/481)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: CORE_COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[vTHE_CORE], [vTHE_CORE_SUPPLY_CAP]],
      },
      {
        target: CORE_COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[vTHE_CORE], [vTHE_CORE_BORROW_CAP]],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip444;
