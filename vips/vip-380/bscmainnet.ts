import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { LzChainId, ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const XVS_VAULT_REWARDS_SPEED = "52083333333333334"; // 1,500 XVS/day
const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const XVS_BRIDGE_SRC = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";
export const ARBITRUM_ONE_VTREASURY = "0x8a662ceAC418daeF956Bc0e6B2dd417c80CDA631";
const XVS_VAULT_TREASURY = "0x269ff7818DB317f60E386D2be0B259e1a324a40a";

export const XVS_AMOUNT_TO_BRIDGE = parseUnits("4500", 18);
export const XVS_VAULT_TREASURY_RELEASE_AMOUNT = parseUnits("79822", 18);
const RECEIVER_ADDRESS = ethers.utils.defaultAbiCoder.encode(["address"], [ARBITRUM_ONE_VTREASURY]);
const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
const BRIDGE_FEES = parseUnits("0.05", 18);

export const vip380 = () => {
  const meta = {
    version: "v2",
    title: "VIP-380 Quarterly XVS Buyback and Funds Allocation",
    description: `#### Summary

This VIP outlines the protocol’s Quarterly Buyback and Funds Allocation strategy as per our [Tokenomics V4](https://docs-v4.venus.io/governance/tokenomics), emphasizing the following key aspects for Q3 2024:

**BNB Chain:**

Protocol Reserves & Liquidation Fees

- **Protocol Reserves:** $1,585,318
- **Liquidation Fees:** $1,050,956
- **Total:** $2,636,274

Tokenomic Allocations:

- **XVS Buyback: 79,822 XVS ($615,120)**
- **Venus Prime: $317,063**
- **Treasury: $1,791,956**

**ETH Mainnet:**

Protocol Reserves & Liquidation Fees

- **Protocol Reserves:** $160,440
- **Liquidation Fees:** $282
- **Total:** $160,722

Tokenomic Allocations:

- **XVS Buyback: $32,144**
- **Venus Prime: $32,088**
- **Treasury: $96,490**

**Arbitrum:** Protocol Reserves, Liquidation Fees and Tokenomic Allocation will be accumulated and considered for the next quarter, as not enough time has passed since its deployment

*Note: All token prices and amounts will be calculated for Oct-01-2024 12:59:55 AM +UTC, block number 42711932.*

*The XVS Buyback was executed gradually over the quarter for BNB Chain and has yet to be converted for ETH Mainnet.*

If approved, this VIP will perform the following actions:

**BNB Chain:**

1. **XVS Buyback Allocation:** Send the 79,822 converted XVS from the [XVS Vault Treasury](https://bscscan.com/address/0x269ff7818DB317f60E386D2be0B259e1a324a40a) to the [XVS Store](https://bscscan.com/address/0x1e25CF968f12850003Db17E0Dba32108509C4359), for the new XVS vault rewards.
2. **XVS Vault Speed:** Set the new XVS Vault reward speed to 1,500 daily XVS.

**ETH Mainnet:**

1. **XVS Buyback Allocation:** Send 22,577 XVS from the [XVS Vault Treasury](https://etherscan.io/address/0xaE39C38AF957338b3cEE2b3E5d825ea88df02EfE) to the [XVS Store](https://etherscan.io/address/0x1Db646E1Ab05571AF99e47e8F909801e5C99d37B), for the new XVS vault rewards.
2. **XVS Vault Speed:** Set the new XVS Vault reward speed to 240 daily XVS.

**Arbitrum:**

1. **XVS Vault Rewards for Arbitrum:** Transfer 4,500 XVS from the [Venus Distributor on BNB Chain](https://bscscan.com/address/0xfd36e2c2a6789db23113685031d7f16329158384) to the XVSStore contract in Arbitrum, in preparation for the next quarter following the [Arbitrum Deployment Proposal](https://community.venus.io/t/incentive-model-proposal-for-arbitrum-deployment/4408).

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/402)
- [Tokenomics V4](https://docs-v4.venus.io/governance/tokenomics)

#### Disclaimer for Ethereum and Arbitrum one VIPs

Privilege commands on Ethereum and Arbitrum one will be executed by the Guardian wallet ([Ethereum](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), [Arbitrum one](https://arbiscan.io/address/0x14e0E151b33f9802b3e75b621c1457afc44DcAA0)), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x6aaf585c60ac1a850d180cd3ad5bb5c77960e9570871ca1b11aed545dc8e7587) and [this](https://app.safe.global/transactions/tx?safe=arb1:0x14e0E151b33f9802b3e75b621c1457afc44DcAA0&id=multisig_0x14e0E151b33f9802b3e75b621c1457afc44DcAA0_0x90c5d7eed63bdda3a2762663dbae3348702d3924585ea47a93365d43e7c89682) multisig transactions will be executed. Otherwise, they will be rejected.
`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: XVS_VAULT_TREASURY,
        signature: "fundXVSVault(uint256)",
        params: [XVS_VAULT_TREASURY_RELEASE_AMOUNT],
      },
      {
        target: bscmainnet.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [bscmainnet.XVS, XVS_VAULT_REWARDS_SPEED],
      },
      {
        target: COMPTROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [bscmainnet.NORMAL_TIMELOCK, XVS_AMOUNT_TO_BRIDGE],
      },
      {
        target: bscmainnet.XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE_SRC, XVS_AMOUNT_TO_BRIDGE],
      },
      {
        target: XVS_BRIDGE_SRC,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          bscmainnet.NORMAL_TIMELOCK,
          LzChainId.arbitrumone,
          RECEIVER_ADDRESS,
          XVS_AMOUNT_TO_BRIDGE,
          [bscmainnet.VTREASURY, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: BRIDGE_FEES.toString(),
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip380;
