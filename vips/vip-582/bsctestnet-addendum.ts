import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const BSCTESTNET_VTOKEN_BEACON = "0xBF85A90673E61956f8c79b9150BAB7893b791bDd";
export const BSCTESTNET_VSLIS_BEACON = "0x1103Bec24Eb194d69ae116d62DD9559412E7C23A";
export const BSCTESTNET_VPLANET_BEACON = "0x6f48cf8e94562b5c37be1d0b6c50c845118cc498";
export const BSCTESTNET_NEW_VTOKEN_IMPLEMENTATION = "0xA8365BFC43cb814F4780127aaD44ecaa8651Fd71";

export const vip582Addendum = () => {
  const meta = {
    version: "v2",
    title: "VIP-582 Addendum: Upgrade VToken implementations on BSC Testnet",
    description: `This proposal upgrades the VToken implementations for VTOKENS to correct the incorrect MAX_BORROW_RATE_MANTISSA value introduced in the earlier implementations deployed through [VIP-572](https://venus-testnet.vercel.app/#/governance/proposal/643?chainId=97) on the BSC Testnet as part of the BNB block rate (Fermi) upgrade.`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: BSCTESTNET_VTOKEN_BEACON,
        signature: "upgradeTo(address)",
        params: [BSCTESTNET_NEW_VTOKEN_IMPLEMENTATION],
      },
      // VSLIS & VPLANET is pointing to different Beacon
      {
        target: BSCTESTNET_VSLIS_BEACON,
        signature: "upgradeTo(address)",
        params: [BSCTESTNET_NEW_VTOKEN_IMPLEMENTATION],
      },
      {
        target: BSCTESTNET_VPLANET_BEACON,
        signature: "upgradeTo(address)",
        params: [BSCTESTNET_NEW_VTOKEN_IMPLEMENTATION],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip582Addendum;
