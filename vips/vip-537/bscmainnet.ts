import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const vasBNB = "0xCC1dB43a06d97f736C7B045AedD03C6707c09BDF";
export const vSOL = "0xBf515bA4D1b52FFdCeaBF20d31D705Ce789F2cEC";
export const asBNB_SUPPLY_CAP = parseUnits("72000", 18);
export const SOL_BORROW_CAP = parseUnits("18000", 18);

const { bscmainnet } = NETWORK_ADDRESSES;

export const vip537 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-537 [BNB Chain] Risk Parameters Adjustments (asBNB, SOL)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in the Venus community forum publication [Chaos Labs - Risk Parameter Updates - 08/04/25](https://community.venus.io/t/chaos-labs-risk-parameter-updates-08-04-25/5263):

- [asBNB (Core pool)](https://app.venus.io/#/pools/pool/0xfD36E2c2a6789Db23113685031d7F16329158384/market/0xCC1dB43a06d97f736C7B045AedD03C6707c09BDF?chainId=56): increase the Supply Cap, from 48,000 asBNB to 72,000 asBNB
- [SOL (Core pool)](https://app.venus.io/#/pools/pool/0xfD36E2c2a6789Db23113685031d7F16329158384/market/0xBf515bA4D1b52FFdCeaBF20d31D705Ce789F2cEC?chainId=56): increase the Borrow Cap, from 9,000 SOL to 18,000 SOL

Complete analysis and details of this recommendation are available in the above publication.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/598)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.UNITROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[vasBNB], [asBNB_SUPPLY_CAP]],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[vSOL], [SOL_BORROW_CAP]],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip537;
