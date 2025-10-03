import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const ACM = "0x4788629abc6cfca10f9f969efdeaa1cf70c23555";

// BTC emode group
export const vBTC = "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B";
export const vSolvBTC = "0xf841cb62c19fCd4fF5CD0AaB5939f3140BaaC3Ea";
export const vxSolvBTC = "0xd804dE60aFD05EE6B89aab5D152258fD461B07D5";
export const EMODE_POOL = {
  label: "BTC",
  id: 2,
  allowCorePoolFallback: true,
  markets: [vBTC, vSolvBTC, vxSolvBTC],
  marketConfig: {
    vBTC: {
      address: vBTC,
      collateralFactor: parseUnits("0", 18),
      liquidationThreshold: parseUnits("0", 18),
      liquidationIncentive: parseUnits("1", 18),
      borrowAllowed: true,
    },
    vSolvBTC: {
      address: vSolvBTC,
      collateralFactor: parseUnits("0.83", 18),
      liquidationThreshold: parseUnits("0.85", 18),
      liquidationIncentive: parseUnits("1.04", 18),
      borrowAllowed: false,
    },
    vxSolvBTC: {
      address: vxSolvBTC,
      collateralFactor: parseUnits("0.81", 18),
      liquidationThreshold: parseUnits("0.83", 18),
      liquidationIncentive: parseUnits("1.04", 18),
      borrowAllowed: false,
    },
  },
};

export const vip551 = () => {
  const meta = {
    version: "v2",
    title: "VIP-551 [BNB Chain] Enable BTC E-Mode group",
    description: `#### Summary

If passed, this VIP will add the following markets to the new "BTC" E-Mode group on the BNB Chain Core pool, following [this community proposal](https://community.venus.io/t/e-mode-and-liquidation-threshold-in-the-bnb-chain-core-pool/5339/7) ([snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0x0fe626f2a7979d6ff63333523e77c12187ad987485b1bd609c45fb0a1fc090b6)), and the [Chaos Labs recommendations](https://community.venus.io/t/e-mode-and-liquidation-threshold-in-the-bnb-chain-core-pool/5339/13):

- [BTCB](https://app.venus.io/#/pool/0xfD36E2c2a6789Db23113685031d7F16329158384/market/0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B?chainId=56&tab=supply)
- [SolvBTC](https://app.venus.io/#/pool/0xfD36E2c2a6789Db23113685031d7F16329158384/market/0xf841cb62c19fCd4fF5CD0AaB5939f3140BaaC3Ea?chainId=56&tab=supply)
- [xSolvBTC](https://app.venus.io/#/pool/0xfD36E2c2a6789Db23113685031d7F16329158384/market/0xd804dE60aFD05EE6B89aab5D152258fD461B07D5?chainId=56&tab=supply)

#### Description

The risk parameters of the markets added to the “BTC” E-Mode group, in that group, are:

- BTCB
    - Collateral Factor: 0%
    - Liquidation Threshold: 0%
    - Liquidation Incentive: 0%
    - It can be borrowed but it cannot be used as collateral
- SolvBTC
    - Collateral Factor: 83%
    - Liquidation Threshold: 85%
    - Liquidation Incentive: 4%
    - It cannot be borrowed but it can be used as collateral
- xSolvBTC
    - Collateral Factor: 81%
    - Liquidation Threshold: 83%
    - Liquidation Incentive: 4%
    - It cannot be borrowed but it can be used as collateral

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- No changes in the deployed codebase.
- **VIP execution simulation**: in a simulation environment, validating that the expected markets are added to the BTC E-Mode pool
- **Deployment on testnet**: the same changes have been performed on BNB Chain testnet, and used in the Venus Protocol testnet deployment

#### References

- [E-Mode feature](https://github.com/VenusProtocol/venus-protocol/pull/614)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/618)
- [Upgrade on BNB Chain testnet](https://testnet.bscscan.com/tx/0x5af998d2edff44a969ec17a5c63684af3aa3cc487fef7850414f34d88a8b6473)
- [Technical article about E-Mode](https://docs-v4.venus.io/technical-reference/reference-technical-articles/emode)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // BTC Emode Group
      {
        target: bscmainnet.UNITROLLER,
        signature: "createPool(string)",
        params: [EMODE_POOL.label],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "addPoolMarkets(uint96[],address[])",
        params: [Array(EMODE_POOL.markets.length).fill(EMODE_POOL.id), EMODE_POOL.markets],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setCollateralFactor(uint96,address,uint256,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketConfig.vSolvBTC.address,
          EMODE_POOL.marketConfig.vSolvBTC.collateralFactor,
          EMODE_POOL.marketConfig.vSolvBTC.liquidationThreshold,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setCollateralFactor(uint96,address,uint256,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketConfig.vxSolvBTC.address,
          EMODE_POOL.marketConfig.vxSolvBTC.collateralFactor,
          EMODE_POOL.marketConfig.vxSolvBTC.liquidationThreshold,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketConfig.vBTC.address,
          EMODE_POOL.marketConfig.vBTC.liquidationIncentive,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketConfig.vSolvBTC.address,
          EMODE_POOL.marketConfig.vSolvBTC.liquidationIncentive,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketConfig.vxSolvBTC.address,
          EMODE_POOL.marketConfig.vxSolvBTC.liquidationIncentive,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setAllowCorePoolFallback(uint96,bool)",
        params: [EMODE_POOL.id, EMODE_POOL.allowCorePoolFallback],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setIsBorrowAllowed(uint96,address,bool)",
        params: [EMODE_POOL.id, EMODE_POOL.marketConfig.vBTC.address, EMODE_POOL.marketConfig.vBTC.borrowAllowed],
      },
      {
        target: ACM,
        signature: "revokeCallPermission(address,string,address)",
        params: [bscmainnet.UNITROLLER, "_supportMarket(address)", bscmainnet.FAST_TRACK_TIMELOCK],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip551;
