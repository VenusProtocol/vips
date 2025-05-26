import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const VUSD1 = "0x0C1DA220D301155b87318B90692Da8dc43B67340";

export const vip501 = () => {
  const meta = {
    version: "v2",
    title: "VIP-501 [BNB Chain] Risk Parameters Adjustments (USD1)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in the Venus community forum publication [Chaos Labs - USD1 Parameter Updates - 23/05/25](https://community.venus.io/t/chaos-labs-usd1-parameter-updates-23-05-25/5120):

- [USD1 (Core pool)](https://app.venus.io/#/core-pool/market/0x0C1DA220D301155b87318B90692Da8dc43B67340?chainId=56): update the Collateral Factor, from 0% to 50%

Complete analysis and details of this recommendation are available in the above publication.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/563)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: NETWORK_ADDRESSES.bscmainnet.UNITROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VUSD1, parseUnits("0.5", 18)],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip501;
