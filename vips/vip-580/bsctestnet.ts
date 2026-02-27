import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { cutParams } from "../../simulations/vip-580/utils/cut-params-bsctestnet.json";
import CORE_POOL_VTOKENS from "../../simulations/vip-580/utils/market.json";

const { bsctestnet } = NETWORK_ADDRESSES;

const ACM = bsctestnet.ACCESS_CONTROL_MANAGER;
const LIQUIDATOR = bsctestnet.LIQUIDATOR;
const UNITROLLER = bsctestnet.UNITROLLER;
const VAI_UNITROLLER = bsctestnet.VAI_UNITROLLER;

const NORMAL_TIMELOCK = bsctestnet.NORMAL_TIMELOCK;
const FAST_TRACK_TIMELOCK = bsctestnet.FAST_TRACK_TIMELOCK;
const CRITICAL_TIMELOCK = bsctestnet.CRITICAL_TIMELOCK;

export const LIQUIDATOR_PROXY_ADMIN = "0x1469AeB2768931f979a1c957692e32Aa802dd55a";
export const LIQUIDATION_MANAGER = "0x03CF41c8777A4e359147309F74a53c8b6b4c6969";
export const NEW_COMPTROLLER_LENS = "0x9D542132fa552B6b416944501bF0D689286E1535";
export const NEW_DIAMOND = "0xe492CCD207760fE4Dfa9B83Fd1590632dDE33BAB";
export const NEW_LIQUIDATOR_IMPL = "0xbC89aA9ab926b8491CB7E613A56A13A14BCfa8bc";
export const NEW_VAI_CONTROLLER = "0xBc98737283f10Dd759DB79cD5f8d11Da909D992b";
export const NEW_VTOKEN_IMPLEMENTATION = "0xC0c413F41281C61E160c47FCC215D9d0BC6AC72d";

const PAUSE_GUARDIAN_MULTISIG = bsctestnet.GUARDIAN;

interface AccessControl {
  target: string;
  signature: string;
  params: Array<string>;
}

const revokeAccessControl = () => {
  const accessProposals: Array<AccessControl> = [];
  [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, PAUSE_GUARDIAN_MULTISIG].map(target => {
    accessProposals.push({
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [UNITROLLER, "setLiquidationIncentive(address,uint256)", target],
    });
    accessProposals.push({
      target: ACM,
      signature: "revokeCallPermission(address,string,address)",
      params: [UNITROLLER, "setLiquidationIncentive(uint96,address,uint256)", target],
    });
  });

  return accessProposals;
};

const grantAccessControl = () => {
  const accessProposals: Array<AccessControl> = [];
  [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, PAUSE_GUARDIAN_MULTISIG].map(target => {
    accessProposals.push({
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [UNITROLLER, "setMarketMaxLiquidationIncentive(address,uint256)", target],
    });
    accessProposals.push({
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [UNITROLLER, "setMarketMaxLiquidationIncentive(uint96,address,uint256)", target],
    });
    accessProposals.push({
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [UNITROLLER, "setLiquidationManager(address)", target],
    });
    accessProposals.push({
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [UNITROLLER, "setDynamicCloseFactorEnabled(address,bool)", target],
    });
    accessProposals.push({
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [UNITROLLER, "setDynamicLiquidationIncentiveEnabled(address,bool)", target],
    });
  });

  return accessProposals;
};

export const vip580 = () => {
  const meta = {
    version: "v2",
    title: "VIP-580 Liquidation improvements for Core Pool on BNB Chain Testnet",
    description: `#### Summary

This VIP introduces enhanced liquidation mechanisms to the Venus Core Pool on BNB Chain Testnet, implementing the following improvements:

#### Description

- **Liquidation Threshold**: Adds the concept of liquidation threshold to the Core Pool, enabling more granular control over when positions become eligible for liquidation
- **Dynamic Liquidation Incentive**: Implements dynamic liquidation incentives that adjust based on market conditions and users account health factors
- **Dynamic Close Factor**: Introduces dynamic close factors that vary based on borrowers health factor, allowing for more flexible liquidation amounts
- **Maximum Liquidation Incentive**: Defines maximum liquidation incentive per seized asset to protect borrowers from excessive liquidation penalties

#### Contract Upgrades

This VIP will perform the following:

- Upgrade Comptroller (Unitroller) to new Diamond implementation with updated facets
- Deploy and configure the new Liquidation Manager contract
- Upgrade VAI Controller with updated liquidation logic
- Upgrade Liquidator contract to support dynamic incentives
- Upgrade all Core Pool vTokens to new implementation
- Update Comptroller Lens to reflect new liquidation parameters
- Configure new access controls for liquidation parameters

#### References

- [VIP Pull Request](https://github.com/VenusProtocol/venus-protocol/pull/604)
- [Community Forum Discussion](https://community.venus.io)
`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // Set new implementation for unitroller
      {
        target: UNITROLLER,
        signature: "_setPendingImplementation(address)",
        params: [NEW_DIAMOND],
      },
      {
        target: NEW_DIAMOND,
        signature: "_become(address)",
        params: [UNITROLLER],
      },

      // Configure facets and functions selectors
      {
        target: UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[])",
        params: [cutParams],
      },

      // Grant access to the new functions
      ...grantAccessControl(),

      // Set liquidation manager in comptroller
      {
        target: UNITROLLER,
        signature: "setLiquidationManager(address)",
        params: [LIQUIDATION_MANAGER],
      },

      // Set new implementation for comptroller lens
      {
        target: UNITROLLER,
        signature: "_setComptrollerLens(address)",
        params: [NEW_COMPTROLLER_LENS],
      },

      // Set new implementation for vai controller
      {
        target: VAI_UNITROLLER,
        signature: "_setPendingImplementation(address)",
        params: [NEW_VAI_CONTROLLER],
      },
      {
        target: NEW_VAI_CONTROLLER,
        signature: "_become(address)",
        params: [VAI_UNITROLLER],
      },

      // Set new implementation for liquidator
      {
        target: LIQUIDATOR_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [LIQUIDATOR, NEW_LIQUIDATOR_IMPL],
      },

      // Set new implementation for core pool vtokens
      ...CORE_POOL_VTOKENS.map(vToken => ({
        target: vToken.address,
        signature: "_setImplementation(address,bool,bytes)",
        params: [NEW_VTOKEN_IMPLEMENTATION, false, "0x"],
      })),

      // Revoke access to the removed functions
      ...revokeAccessControl(),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip580;
