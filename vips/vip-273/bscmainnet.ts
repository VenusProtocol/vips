import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const XVSBridgeAdmin_Proxy = "0x70d644877b7b73800E9073BCFCE981eAaB6Dbc21";

export const SINGLE_SEND_LIMIT = parseUnits("100000", 18);
export const MAX_DAILY_SEND_LIMIT = parseUnits("1000000", 18);
export const SINGLE_RECEIVE_LIMIT = parseUnits("100000", 18);
export const MAX_DAILY_RECEIVE_LIMIT = parseUnits("1000000", 18);
export const DEST_CHAIN_ID = 101;

export const vip273 = () => {
  const meta = {
    version: "v2",
    title: "VIP-273 Risk Parameters Adjustments (XVS Ethereum bridge limits)",
    description: `This VIP will perform the following Risk Parameter actions as per Chaos Labs’ latest recommendations in the Venus community forum publication [XVS Bridge Limits Increase Recommendation](https://community.venus.io/t/xvs-bridge-limits-increase-recommendation/4209)

- Single transaction limit: increase from 10,000 USD to 100,000 USD
- 24-hour limit: increase from 50,000 USD to 1,000,000 USD

Complete analysis and details of these recommendations are available in the above publication.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/231)
- [Documentation about XVS bridge](https://docs-v4.venus.io/technical-reference/reference-technical-articles/xvs-bridge)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: XVSBridgeAdmin_Proxy,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [DEST_CHAIN_ID, MAX_DAILY_SEND_LIMIT],
      },
      {
        target: XVSBridgeAdmin_Proxy,
        signature: "setMaxSingleTransactionLimit(uint16,uint256)",
        params: [DEST_CHAIN_ID, SINGLE_SEND_LIMIT],
      },
      {
        target: XVSBridgeAdmin_Proxy,
        signature: "setMaxDailyReceiveLimit(uint16,uint256)",
        params: [DEST_CHAIN_ID, MAX_DAILY_RECEIVE_LIMIT],
      },
      {
        target: XVSBridgeAdmin_Proxy,
        signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
        params: [DEST_CHAIN_ID, SINGLE_RECEIVE_LIMIT],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip273;
