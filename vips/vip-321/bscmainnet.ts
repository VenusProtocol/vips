import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";

export const DEV_WALLET = "0x16A623C5a73E335a089C2B5AcDe167C4d749FC05";
export const CERTIK = "0x4cf605b238e9c3c72d0faed64d12426e4a54ee12";

export const VTREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";

export const THE_GRAPH_USDC_AMOUNT = parseUnits("18000", 18);
export const CERTIK_AMOUNT = parseUnits("17500", 18);

export const vip321 = () => {
  const meta = {
    version: "v2",
    title: "VIP-321 Fund Dev Wallet to deploy subgraphs on The Graph's decentralized network and other payments",
    description: `#### Summary

If passed this VIP will perform the following actions:

  - Transfer 17,500 USDT to Certik for the retainer program
  - Transfer 18,000 USDC to Venus Dev Wallet for funding Venus subgraphs on The Graph Network

#### Details

**Certik - retainer program**
  - Auditor: [Certik](https://certik.com)
  - Concept: Retainer program - monthly payment of May 2024
  - Cost: 17,500 USDT, to be sent to the BEP20 address ${CERTIK}

**Venus Dev Wallet - Venus subgraphs on The Graph Network**
  - Concept: Venus subgraphs on The Graph Network
  - References:
    - [Proposal in the community forum](https://community.venus.io/t/request-for-funds-to-maintain-venus-subgraphs-on-the-graph-network/4386/1)
    - [Snapshot vote](https://snapshot.org/#/venus-xvs.eth/proposal/0x8800dfe286f107b696c27529c58940d681a81075718bc477a617ca3de824efba)
  - Cost: 18,000 USDC, to be sent to the BEP20 address: ${DEV_WALLET}
    

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/298)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, THE_GRAPH_USDC_AMOUNT, DEV_WALLET],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, CERTIK_AMOUNT, CERTIK],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip321;
