import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const VBUSD = "0x95c78222B3D6e262426483D42CfA53685A67Ab9D";
const VXVS = "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D";
const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const NEW_BUSD_COLLATERAL_FACTOR = parseUnits("0.3", 18);
const NEW_XVS_SUPPLY_CAP = parseUnits("1750000", 18);

export const vip221 = () => {
  const meta = {
    version: "v2",
    title: "VIP-221 Risk Parameters Adjustments (BUSD, XVS)",
    description: `This VIP will perform the following Risk Parameter actions as per Chaos Labs’ latest recommendations in this Venus community forum publication: [Risk Parameter Updates 12/19/2023](https://community.venus.io/t/chaos-labs-risk-parameter-updates-12-19-23/3994).

- [BUSD (Core pool)](https://bscscan.com/address/0x95c78222B3D6e262426483D42CfA53685A67Ab9D)
    - Reduce collateral factor, from 0.72 to 0.3
- [XVS (Core pool)](https://bscscan.com/address/0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D)
    - Increase supply cap, from 1,500,000 XVS to 1,750,000 XVS

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
    ProposalType.FAST_TRACK,
  );
};
