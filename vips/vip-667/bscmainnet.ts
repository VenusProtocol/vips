import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;
export const vETH = "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8";
export const vWBETH = "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0";
export const EMODE_POOL = {
  label: "ETH",
  id: 16,
  markets: [vETH, vWBETH],
  allowCorePoolFallback: true,
  marketsConfig: {
    vETH: {
      address: vETH,
      collateralFactor: parseUnits("0", 18),
      liquidationThreshold: parseUnits("0", 18),
      liquidationIncentive: parseUnits("1", 18),
      borrowAllowed: true,
    },
    vWBETH: {
      address: vWBETH,
      collateralFactor: parseUnits("0.93", 18),
      liquidationThreshold: parseUnits("0.95", 18),
      liquidationIncentive: parseUnits("1.02", 18),
      borrowAllowed: false,
    },
  },
};

export const vip667 = () => {
  const meta = {
    version: "v2",
    title: "VIP-667 [BNB Chain] Enable ETH E-Mode group",
    description: `#### Summary

If passed, this VIP will add the following markets to the new "ETH" E-Mode group on the BNB Chain Core pool, following [TODO: community proposal](TODO) and the [TODO: Chaos Labs recommendations](TODO):

- [ETH](https://app.venus.io/#/pool/0xfD36E2c2a6789Db23113685031d7F16329158384/market/0xf508fCD89b8bd15579dc79A6827cB4686A3592c8?chainId=56&tab=supply)
- [WBETH](https://app.venus.io/#/pool/0xfD36E2c2a6789Db23113685031d7F16329158384/market/0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0?chainId=56&tab=supply)

#### Description

The risk parameters of the markets added to the "ETH" E-Mode group, in that group, are:

- ETH
    - Collateral Factor: 0%
    - Liquidation Threshold: 0%
    - Liquidation Incentive: 0%
    - It can be borrowed but it cannot be used as collateral
- WBETH
    - Collateral Factor: 93%
    - Liquidation Threshold: 95%
    - Liquidation Incentive: 2%
    - It cannot be borrowed but it can be used as collateral

Core pool fallback is enabled for this group: users in it can still use markets outside the group as collateral, with their Core pool risk parameters.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- No changes in the deployed codebase.
- **VIP execution simulation**: in a simulation environment, validating that the expected markets are added to the ETH E-Mode pool with the expected risk parameters, and that users in the group can borrow ETH against WBETH but cannot borrow other markets
- **Deployment on testnet**: the same changes have been performed on BNB Chain testnet, and used in the Venus Protocol testnet deployment

#### References

- [E-Mode feature](https://github.com/VenusProtocol/venus-protocol/pull/614)
- [VIP simulation](TODO)
- [Upgrade on BNB Chain testnet](TODO)
- [Technical article about E-Mode](https://docs-v4.venus.io/technical-reference/reference-technical-articles/emode)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
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
          EMODE_POOL.marketsConfig.vWBETH.address,
          EMODE_POOL.marketsConfig.vWBETH.collateralFactor,
          EMODE_POOL.marketsConfig.vWBETH.liquidationThreshold,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketsConfig.vETH.address,
          EMODE_POOL.marketsConfig.vETH.liquidationIncentive,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setLiquidationIncentive(uint96,address,uint256)",
        params: [
          EMODE_POOL.id,
          EMODE_POOL.marketsConfig.vWBETH.address,
          EMODE_POOL.marketsConfig.vWBETH.liquidationIncentive,
        ],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setIsBorrowAllowed(uint96,address,bool)",
        params: [EMODE_POOL.id, EMODE_POOL.marketsConfig.vETH.address, EMODE_POOL.marketsConfig.vETH.borrowAllowed],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "setAllowCorePoolFallback(uint96,bool)",
        params: [EMODE_POOL.id, EMODE_POOL.allowCorePoolFallback],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip667;
