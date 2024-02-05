import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const COMPTROLLER_BEACON = "0x38B4Efab9ea1bAcD19dC81f19c4D1C2F9DeAe1B2";
const NEW_COMPTROLLER_IMPLEMENTATION = "0x69Ca940186C29b6a9D64e1Be1C59fb7A466354E2";
const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const POOL_STABLECOIN = "0x94c1495cD4c557f1560Cbd68EAB0d197e6291571";
const POOL_DEFI = "0x3344417c9360b963ca93A4e8305361AEde340Ab9";
const POOL_GAMEFI = "0x1b43ea8622e76627B81665B1eCeBB4867566B963";
const POOL_LIQUID_STAKED_BNB = "0xd933909A4a2b7A4638903028f44D1d38ce27c352";
const POOL_TRON = "0x23b4404E4E5eC5FF5a6FFb70B7d14E3FabF237B0";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";

interface GrantAccess {
  target: string;
  signature: string;
  params: Array<string>;
}

const grantAccessControl = (contract: string) => {
  const accessProposals: Array<GrantAccess> = [];
  [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK].map(target => {
    accessProposals.push({
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [contract, "setForcedLiquidation(address,bool)", target],
    });
  });

  return accessProposals;
};

export const vip186 = () => {
  const meta = {
    version: "v2",
    title: "VIP-186 Add forced liquidations feature into the Isolated pools",
    description: `#### Summary

If passed, this VIP will upgrade the implementation of the Comptroller contracts of the Isolated pools, including the feature “forced liquidations”. This feature was already added to the Comptroller contract of the Core pool in the [VIP-172](https://app.venus.io/#/governance/proposal/172). Forced liquidations will be initially disabled for every market in Isolated pools. To enable it, a new VIP would be needed.

#### Description

This VIP upgrades the implementation of the Comptroller contracts in the Isolated pools, including the feature “forced liquidations”, that will be **initially disabled for every market**.

You can read more about this feature in the [VIP-172](https://app.venus.io/#/governance/proposal/172), and in the [public documentation site](https://docs-v4.venus.io/guides/liquidation#forced-liquidations).

Finally, this VIP will authorize Normal, Fast-track and Critical timelocks to enable and disable the forced liquidations on any market of the Isolated pools.

**Security and additional considerations**

We applied the following security procedures for this upgrade:

- **Behavior post upgrade**: in a simulation environment, validating “forced liquidations” work as expected after the upgrade
- **Deployment on testnet**: the same implementation has been deployed to testnet, and used in the Venus Protocol testnet deployment
- **Audit: Certik has audited the deployed code**

**Audit reports**

- [Certik audit report (2023/10/16)](https://github.com/VenusProtocol/isolated-pools/blob/41a96ca24b0e32b8087ea7b916ae2864cbf1a05f/audits/078_forcedLiquidations_certik_20231016.pdf)

**Deployed contracts**

- [New Comptroller implementation - mainnet](https://bscscan.com/address/0x69Ca940186C29b6a9D64e1Be1C59fb7A466354E2)
- [New Comptroller implementation - testnet](https://testnet.bscscan.com/address/0x11a92852fA7D70C220Dada69969b2f1C4e18e663)

**References**

- [Pull request with the changeset](https://github.com/VenusProtocol/isolated-pools/pull/305)
- [Simulation post upgrade](https://github.com/VenusProtocol/vips/pull/74)
- [Old Comptroller implementation](https://bscscan.com/address/0x17a6ac4f7f01387303deb1d78f01ac0a0c1a75b0#code)
- [Beacon contract](https://bscscan.com/address/0x38B4Efab9ea1bAcD19dC81f19c4D1C2F9DeAe1B2)
- [Documentation](https://docs-v4.venus.io/guides/liquidation#forced-liquidations)`,

    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER_BEACON,
        signature: "upgradeTo(address)",
        params: [NEW_COMPTROLLER_IMPLEMENTATION],
      },
      ...grantAccessControl(POOL_STABLECOIN),
      ...grantAccessControl(POOL_DEFI),
      ...grantAccessControl(POOL_GAMEFI),
      ...grantAccessControl(POOL_LIQUID_STAKED_BNB),
      ...grantAccessControl(POOL_TRON),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
