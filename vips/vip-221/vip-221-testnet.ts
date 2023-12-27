import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const VBUSD = "0x08e0A5575De71037aE36AbfAfb516595fE68e5e4";
const VXVS = "0x6d6F697e34145Bb95c54E77482d97cc261Dc237E";
const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const NEW_BUSD_COLLATERAL_FACTOR = parseUnits("0.3", 18);
const NEW_XVS_SUPPLY_CAP = parseUnits("3750000", 18);

export const vip221Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-221 Risk Parameters Adjustments (BUSD, XVS)",
    description: `This VIP will perform the following Risk Parameter actions as per Chaos Labs’ latest recommendations in this Venus community forum publication: [Risk Parameter Updates 12/19/2023](https://community.venus.io/t/chaos-labs-risk-parameter-updates-12-19-23/3994).

- [BUSD (Core pool)](https://bscscan.com/address/0x95c78222B3D6e262426483D42CfA53685A67Ab9D)
    - Reduce collateral factor, from 0.72 to 0.3
- [XVS (Core pool)](https://bscscan.com/address/0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D)
    - Increase supply cap, from 1,500,000 XVS to 3,750,000 XVS (specific for testnet)

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: https://github.com/VenusProtocol/vips/pull/138`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VBUSD, NEW_BUSD_COLLATERAL_FACTOR],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[VXVS], [NEW_XVS_SUPPLY_CAP]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
