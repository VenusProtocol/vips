import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const VUNI = "0x171B468b52d7027F12cEF90cd065d6776a25E24e";
const NEW_SUPPLY_CAP = parseUnits("100000", 18);
const NEW_BORROW_CAP = parseUnits("50000", 18);

export const vip208Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-208 Risk Parameters Adjustments (UNI)",
    description: `This VIP will perform the following Risk Parameter actions as per Chaos Labs’ latest recommendations in this Venus community forum publication: [Risk Parameter Updates 11/21/2023](https://community.venus.io/t/chaos-labs-risk-parameter-updates-11-21-2023/3918).

- **[UNI (Core pool)](https://bscscan.com/address/0x27FF564707786720C71A2e5c1490A63266683612)**
    - **Increase supply cap from 50,000 UNI to 100,000 UNI**
    - **Increase borrow cap from 30,000 UNI to 50,000 UNI**

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: https://github.com/VenusProtocol/vips/pull/111`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[VUNI], [NEW_SUPPLY_CAP]],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[VUNI], [NEW_BORROW_CAP]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
