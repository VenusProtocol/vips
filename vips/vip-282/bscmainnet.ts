import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const XVS_VAULT_TREASURY = "0x269ff7818DB317f60E386D2be0B259e1a324a40a";
export const XVS_VAULT_TREASURY_NEW_IMPLEMENTATION = "0xA95a4F34337d8FaC283C3e3D2a605b95DA916cD6";
export const DEFAULT_PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";

const vip282 = () => {
  const meta = {
    version: "v2",
    title: "VIP-282 Upgrade the XVSVaultTreasury contract",
    description: `#### Summary

If passed, this VIP will upgrade the implementation of the [XVSVaultTreasury](https://bscscan.com/address/0x269ff7818DB317f60E386D2be0B259e1a324a40a) contract, allowing [Governance](https://bscscan.com/address/0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396) to transfer any tokens held by that contract to arbitrary wallets.

#### Details

The current implementation of the [XVSVaultTreasury](https://bscscan.com/address/0x269ff7818DB317f60E386D2be0B259e1a324a40a) contract only allows the transfer of XVS tokens to the [XVSStore](https://bscscan.com/address/0x1e25CF968f12850003Db17E0Dba32108509C4359) contract (used by the [XVSVault](https://bscscan.com/address/0x051100480289e704d20e9DB4804837068f3f9204) contract as the source of rewards). If any token is sent to the XVSVaultTreasury by mistake, or if the Venus Community wants to transfer some XVS tokens from the XVSVaultTreasury to any other wallet, it would need the new function added with the new implementation.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, validating the new implementation is properly configured after the execution
- **Deployment on testnet**: the same contract has been upgraded on BNB testnet, using the same new implementation, and used in the Venus Protocol testnet environment

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/253)
- [New XVSVaultTreasury implementation](https://bscscan.com/address/0xA95a4F34337d8FaC283C3e3D2a605b95DA916cD6)
- [Code of the new XVSVaultTreasury contract](https://github.com/VenusProtocol/protocol-reserve/pull/84/)
- [VIP executed on BNB testnet](https://testnet.bscscan.com/tx/0x6572038297b7974531a9858dbf141c132778659f343615da9bd0f4bb583bbc58)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [XVS_VAULT_TREASURY, XVS_VAULT_TREASURY_NEW_IMPLEMENTATION],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip282;
