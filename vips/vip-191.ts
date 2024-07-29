import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const ACCESS_CONTROL_MANAGER = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const BUSD_LIQUIDATOR = "0x3f033c0827acb54a791EaaaE90d820f223Acf8e3";
const ZERO_RATE_MODEL = "0x93FBc248e83bc8931141ffC7f457EC882595135A";
const VBUSD = "0x95c78222B3D6e262426483D42CfA53685A67Ab9D";

const ACTION_LIQUIDATE = 5;

export const vip191 = () => {
  const meta = {
    version: "v2",
    title: "VIP-191 Enable forced liquidations on the BUSD market",
    description: `#### Summary

If passed, this VIP will enable [forced liquidations](https://docs-v4.venus.io/guides/liquidation#forced-liquidations) on the [BUSD market](https://bscscan.com/address/0x95c78222B3D6e262426483D42CfA53685A67Ab9D), authorizing only a new contract ([BUSDLiquidator](https://bscscan.com/address/0x3f033c0827acb54a791EaaaE90d820f223Acf8e3)) to liquidate BUSD positions. Moreover, it will update the Interest Rate Model of the BUSD market, to stop accruing interests.

This VIP enables the [proposal shared in the community forum](https://community.venus.io/t/busd-deprecation-forced-liquidations/3784/8), following the [Chaos Labs recommendation](https://community.venus.io/t/busd-deprecation-forced-liquidations/3784/1).

#### Description

The specific actions performed in this VIP are:

- Enable forced liquidations on the BUSD market
- Pause liquidations on the BUSD market. This way, regular liquidators won’t be able to liquidate any BUSD position
- Grant the BUSDLiquidator contract to resume/pause liquidations. This way, the BUSDLiquidator contract will be the only one with the capacity to liquidate BUSD positions
- Stop accruing interests in the BUSD market

BUSD liquidations will be performed in a permissionless fashion. Anyone could invoke the BUSDLiquidator contract to liquidate the BUSD positions.

The BUSDLiquidator contract is initially configured to send 1% of the repaid amount to the account invoking it, and the rest to the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9). This percentage can be adjusted with a VIP in the future.

Example of BUSD liquidation performed using the BUSDLiquidator, and distribution of the tokens:

- Let’s assume the collateral to seize in the liquidator is USDT, and 1 BUSD = 1 USDT = 1 USD
- Amount that will be liquidated (repaid): 100 BUSD
- Amount that will be seized: 110 USDT (in vUSDT tokens)
    - 5 USDT (in vUSDT tokens) will be sent automatically to the Venus Treasury
    - 105 USDT (in vUSDT tokens) will be sent to the BUSDLiquidator contract. The BUSDLiquidator contract will send:
        - 4 USDT (in vUSDT tokens) to the Venus Treasury
        - 1 USDT (1% of the repaid amount) (in vUSDT tokens) to the user invoking the BUSDLiquidator contract
- Finally, the user invoking the BUSDLiquidator will receive 101 USDT (in vUSDT tokens). Assuming the user performed the liquidation in the context of a flash swap:
    - The user will redeem the vUSDT tokens and will return 100 USDT to the flash swap provider
    - There will be 1 USDT (in vUSDT tokens) to cover the flash swap fees. If the user didn’t use a flash swap, this will be the incentive to perform the liquidation.

**Security and additional considerations**

We applied the following security procedures for this upgrade:

- **BUSDLiquidator configuration**: in a simulation environment, validating the setup of the BUSDLiquidator contract is the expected one after the VIP, and it can perform forced liquidations on the BUSD market
- **Audit: Peckshield has audited the deployed code**

**Audit reports**

- [Peckshield audit audit report (2023/10/20)](https://github.com/VenusProtocol/venus-protocol/blob/b9dff61b16c4002db4cc01d3f25db160209a3d8d/audits/077_busdLiquidator_peckshield_20231020.pdf)

**Deployed contracts on main net**

- [BUSDLiquidator](https://bscscan.com/address/0x3f033c0827acb54a791EaaaE90d820f223Acf8e3)

**References**

- [Pull request with the BUSDLiquidator contract](https://github.com/VenusProtocol/venus-protocol/pull/362)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/91)
- [Documentation](https://docs-v4.venus.io/guides/liquidation#forced-liquidations)`,

    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: BUSD_LIQUIDATOR,
        signature: "acceptOwnership()",
        params: [],
      },

      {
        target: VBUSD,
        signature: "_setInterestRateModel(address)",
        params: [ZERO_RATE_MODEL],
      },

      {
        target: COMPTROLLER,
        signature: "_setForcedLiquidation(address,bool)",
        params: [VBUSD, true],
      },

      {
        target: COMPTROLLER,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[VBUSD], [ACTION_LIQUIDATE], true],
      },

      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [COMPTROLLER, "_setActionsPaused(address[],uint8[],bool)", BUSD_LIQUIDATOR],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
