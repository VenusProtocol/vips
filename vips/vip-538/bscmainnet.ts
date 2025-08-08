import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const vSolvBTC = "0xf841cb62c19fCd4fF5CD0AaB5939f3140BaaC3Ea";
export const vSolvBTC_SUPPLY_CAP = parseUnits("2000", 18);

export const vxSolvBTC = "0xd804dE60aFD05EE6B89aab5D152258fD461B07D5";
export const vxSolvBTC_SUPPLY_CAP = parseUnits("1250", 18);

export const vip538 = async () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-538 [BNB Chain] Risk Parameters Adjustments (SolvBTC, xSolvBTC)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in the Venus community forum publication [Chaos Labs - Risk Parameter Updates - 8/8/25](https://community.venus.io/t/chaos-labs-risk-parameter-updates-8-8-25/5271):

- [SolvBTC (Core pool)](https://app.venus.io/#/pools/pool/0xfD36E2c2a6789Db23113685031d7F16329158384/market/0xf841cb62c19fCd4fF5CD0AaB5939f3140BaaC3Ea?chainId=56): increase the Supply Cap, from 1,720 SolvBTC to 2,000 SolvBTC
- [xSolvBTC (Core pool)](https://app.venus.io/#/pools/pool/0xfD36E2c2a6789Db23113685031d7F16329158384/market/0xd804dE60aFD05EE6B89aab5D152258fD461B07D5?chainId=56): increase the Supply Cap, from 750 xSolvBTC to 1,250 xSolvBTC

Complete analysis and details of these recommendations are available in the above publication.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/600)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.UNITROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [
          [vSolvBTC, vxSolvBTC],
          [vSolvBTC_SUPPLY_CAP, vxSolvBTC_SUPPLY_CAP],
        ],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip538;
