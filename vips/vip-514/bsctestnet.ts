import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;

export const vxSolvBTC_BSC = "0x97cB97B05697c377C0bd09feDce67DBd86B7aB1e";
export const vxSolvBTC_BSC_SUPPLY_CAP = parseUnits("150", 18);

export const vip514 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-514 [BNB Chain] Risk Parameters Adjustments (vxSolvBTC)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in the Venus community forum publication [Chaos Labs - Risk Parameter Updates - 06/09/25](https://community.venus.io/):

- [vxSolvBTC (Core pool)](https://testnet.bscscan.com/address/${vxSolvBTC_BSC}): increase the supply cap from 100 vxSolvBTC to 150 vxSolvBTC

Complete analysis and details of these recommendations are available in the above publications.


- [VIP simulation](https://github.com/VenusProtocol/vips/pull/)
    `,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: bsctestnet.UNITROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[vxSolvBTC_BSC], [vxSolvBTC_BSC_SUPPLY_CAP]],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip514;
