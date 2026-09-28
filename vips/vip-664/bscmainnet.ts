import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { FRV_ABSOLUTE_CAP } from "../vip-650/addresses/bscmainnet";
import { U_FRV_SOURCE, U_HUB } from "../vip-657/bscmainnet";
import { treasuryMigrationCommands } from "./treasury";

export const U_FRV_PERCENTAGE_CAP_BPS = 9_000;

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
      collateralFactor: parseUnits("0.90", 18),
      liquidationThreshold: parseUnits("0.93", 18),
      liquidationIncentive: parseUnits("1.04", 18),
      borrowAllowed: false,
    },
  },
};

export const vip664 = () => {
  const meta = {
    version: "v2",
    title: "VIP-664 [BNB Chain] ETH E-Mode, Treasury Hub migration and U FRV cap",
    description: `#### Summary

If passed, this VIP will enable an opt-in "ETH" E-Mode group in the BNB Chain Core pool, migrate the Treasury stablecoin positions specified below into Liquidity Hub, and raise the U Hub Fixed-Rate Vault (FRV) allocation cap.

The new E-Mode group includes:

- [ETH](https://app.venus.io/#/pool/0xfD36E2c2a6789Db23113685031d7F16329158384/market/0xf508fCD89b8bd15579dc79A6827cB4686A3592c8?chainId=56&tab=supply)
- [WBETH](https://app.venus.io/#/pool/0xfD36E2c2a6789Db23113685031d7F16329158384/market/0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0?chainId=56&tab=supply)

#### Description

The risk parameters of the markets added to the "ETH" E-Mode group, in that group, are:

- ETH
    - Collateral Factor: 0%
    - Liquidation Threshold: 0%
    - Liquidation Incentive: 1.00 (0% bonus)
    - It can be borrowed but it cannot be used as collateral
- WBETH
    - Collateral Factor: 90%
    - Liquidation Threshold: 93%
    - Liquidation Incentive: 1.04 (4% bonus)
    - It cannot be borrowed but it can be used as collateral

Core pool fallback is enabled for this group: users in it can still use markets outside the group as collateral, with their Core pool risk parameters.

Entering the group is opt-in. This VIP does not change Core pool risk parameters or supply caps. The recommended reduction of the WBETH Core collateral factor from 80% to 75%, with its liquidation threshold unchanged, is intended for a separate VIP approximately one week after the group is enabled.

#### Treasury deposits into Liquidity Hub

This VIP also deposits the Treasury's USDT, USDC and U balances and migrates its vUSDT, vUSDC and vU positions into their corresponding Liquidity Hubs. All resulting vhUSDT, vhUSDC and vhU shares are minted directly to the original Treasury (${bscmainnet.VTREASURY}). No swaps or new contract deployments are involved.

Amounts are the full balances at BNB Chain block 124482582 (18 decimals for assets, 8 for vTokens):

- USDT: 738,684.512559003748986493 USDT and 137,795.78716278 vUSDT
- USDC: 91,884.384017371969374252 USDC and 30,500,264.58872009 vUSDC
- U: 288,921.382312112220008143 U and 90 vU

The Normal Timelock withdraws each fixed amount, deposits the liquid asset, then uses the existing Migrator to redeem the vToken position and deposit its full actual proceeds, including interest accrued before execution. Each migration enforces a minimum share output equal to 99.5% of the snapshot estimate. Approvals are cleared in the same atomic proposal. Treasury income received after the snapshot remains in Treasury; this is not an execution-time balance sweep. Treasury balances, redemption liquidity and share floors should be checked again before execution.

#### U Hub Fixed-Rate Vault cap

Raise the U Hub FRV percentage cap from 50% to 90% (5000 to 9000 bps), keeping the absolute cap at 5,000,000 U. The effective ceiling is the lower of 5,000,000 U and 90% of Hub TVL. The existing deposit queues are unchanged: this raises allocation headroom and does not itself reallocate funds into FRV. USDT and USDC FRV caps are unchanged.

#### Security and additional considerations

The proposal includes the following security checks and considerations:

- No changes in the deployed codebase.
- **VIP execution simulation**: in a simulation environment, validating that the expected markets are added to the ETH E-Mode pool with the expected risk parameters, and that users in the group can borrow ETH against WBETH but cannot borrow other markets. The simulation also checks that Hub shares return to the Treasury, the full vToken redemption proceeds are deposited, migration balances and approvals are cleared, and deposit queues and unrelated FRV caps remain unchanged.
- **Testnet scope**: the testnet proposal covers the ETH E-Mode configuration only. Treasury migration and the U Hub cap change are mainnet-only.

#### References

- [E-Mode feature](https://github.com/VenusProtocol/venus-protocol/pull/614)
- [VIP proposal and simulation](https://github.com/VenusProtocol/vips/pull/625)
- [Technical article about E-Mode](https://docs-v4.venus.io/technical-reference/reference-technical-articles/emode)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      ...treasuryMigrationCommands(),
      {
        target: U_HUB,
        signature: "raiseYieldGroupCap(address,uint256,uint16)",
        params: [U_FRV_SOURCE, FRV_ABSOLUTE_CAP, U_FRV_PERCENTAGE_CAP_BPS],
      },
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

export default vip664;
