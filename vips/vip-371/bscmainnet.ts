import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

// For bridge purpose
export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const XVS_BRIDGE = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";
export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
export const ARBITRUM_TREASURY = "0x8a662ceAC418daeF956Bc0e6B2dd417c80CDA631";
export const ARBITRUM_XVS_RECEIVER = ethers.utils.defaultAbiCoder.encode(["address"], [ARBITRUM_TREASURY]);
export const BRIDGE_XVS_AMOUNT = parseUnits("15308", 18);
export const DEST_CHAIN_ID = 110;
export const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
export const BSC_TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";

export const vip371 = () => {
  const meta = {
    version: "v2",
    title: "VIP-371 [Arbitrum] Market Emission Adjustment",
    description: `#### Summary

If passed, this VIP will adjust XVS emissions on the Arbitrum Core Pool by reducing them by 25%. This will be the first adjustment for the Arbitrum Core Pool, and the reduction will be based on an analysis of TVL. The analysis details and recommendations are as follows:

**Core Pool Markets**:
* **ARB** New emissions: 319 XVS per month. (-25%)
* **WETH** New emissions: 319 XVS per month. (-25%)
* **WBTC** New emissions: 638 XVS per month. (-25%)
* **USDT** New emissions: 638 XVS per month. (-25%)
* **USDC** New emissions: 638 XVS per month. (-25%)

New Total per month: 2,552 XVS corresponding to a reduction of 25% in emissions.

#### Details

**TVL Analysis:** The TVL participation for each market was analyzed to filter out the most significant markets. The goal was to identify markets that hold a significant portion of the total TVL and categorize them into two tiers.

#### Recommendations

All markets in the core pool have significant participation. Therefore, as this is the first emission adjustment, the recommendation is to apply a unified 25% reduction across all markets. The market's response will be evaluated, and further actions will be taken to fine-tune the optimal settings to support the growth of the Arbitrum deployment.

#### Funding

This proposal requests XVS funding to support the proposed incentives until January 2025. Additionally, XVS funding for the Liquid Staked ETH pool will be requested to extend rewards until January, ensuring synchronization of both emission adjustments and funding calendars. The required amounts per distributor are as follows:

* **Core Pool**: 2,552 XVS per month for a total of 10,208 XVS over 4 months.
* **LST Pool**: 5,100 XVS per month for a total of 5,100 XVS over 4 months.
* **Total:** 7,652 XVS per month for a total of 15,308 XVS over 4 months.

#### References

- Community post "[Emissions Adjustments for Arbitrum](https://community.venus.io/t/emissions-adjustments-for-arbitrum/4579)"

#### Disclaimer for Arbitrum one VIPs

Privilege commands on Arbitrum one will be executed by the [Guardian wallet](https://arbiscan.io/address/0x14e0E151b33f9802b3e75b621c1457afc44DcAA0), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, this multisig transaction will be executed. Otherwise, it will be rejected.`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [NORMAL_TIMELOCK, BRIDGE_XVS_AMOUNT],
      },

      {
        target: XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE, BRIDGE_XVS_AMOUNT],
      },

      {
        target: XVS_BRIDGE,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          NORMAL_TIMELOCK,
          DEST_CHAIN_ID,
          ARBITRUM_XVS_RECEIVER,
          BRIDGE_XVS_AMOUNT,
          [BSC_TREASURY, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: parseUnits("0.5", 18).toString(),
      },

      {
        target: XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE, 0],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip371;
