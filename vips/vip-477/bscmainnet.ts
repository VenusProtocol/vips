import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const BSC_XVS_VAULT_TREASURY = "0x269ff7818DB317f60E386D2be0B259e1a324a40a";
export const ETH_XVS_VAULT_TREASURY = "0xaE39C38AF957338b3cEE2b3E5d825ea88df02EfE";
export const ARB_XVS_VAULT_TREASURY = "0xb076D4f15c08D7A7B89466327Ba71bc7e1311b58";
export const BSC_XVS_STORE = "0x1e25CF968f12850003Db17E0Dba32108509C4359";
export const ARB_XVS_STORE = "0x507D9923c954AAD8eC530ed8Dedb75bFc893Ec5e";
export const XVS_BRIDGE = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";

export const BSC_RELEASE_AMOUNT = parseUnits("111845", 18);
export const ETH_RELEASE_AMOUNT = parseUnits("5932", 18);
export const ARB_RELEASE_AMOUNT = parseUnits("470", 18);

export const BSC_XVS_STORE_AMOUNT = parseUnits("27783", 18);
export const ARB_XVS_STORE_AMOUNT = parseUnits("770", 18);

export const BSC_DISTRIBUTION_SPEED = "57256944444444445";
export const ETH_DISTRIBUTION_SPEED = "25208333333333334";
export const ARB_DISTRIBUTION_SPEED = "340277777777778";
export const ZKSYNC_DISTRIBUTION_SPEED = "280092592592593";

export const ADAPTER_PARAMS = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
const BRIDGE_FEES = parseUnits("0.5", 18);

const { zksyncmainnet, ethereum, arbitrumone, bscmainnet } = NETWORK_ADDRESSES;

export const vip477 = () => {
  const meta = {
    version: "v2",
    title: "VIP-477 Quarterly XVS Buyback and Funds Allocation",
    description: `#### Summary

This VIP outlines the protocol’s Quarterly Buyback and Funds Allocation strategy as per our [Tokenomics V4](https://docs-v4.venus.io/governance/tokenomics), emphasizing the following key aspects for Q1 2025:

#### BNB Chain

**Protocol Reserves & Liquidation Fees**

- Protocol Reserves: $2,508,091
- Liquidation Fees: $1,242,475
- Total: $3,750,567

**Tokenomic Allocations:**

- XVS Buyback: $750,113 (111,845 XVS)
- Venus Prime: $501,618
- Treasury: $2,498,834

#### Ethereum

**Protocol Reserves & Liquidation Fees**

- Protocol Reserves: $57,378
- Liquidation Fees: $6,486
- Total: $63,864

**Tokenomic Allocations:**

- XVS Buyback: 5,932 XVS
- Venus Prime: $11,475
- Treasury: $39,614

#### Arbitrum one

**Protocol Reserves & Liquidation Fees**

- Protocol Reserves: $9,247
- Liquidation Fees: $2,455
- Total: $11,702

**Tokenomic Allocations:**

- XVS Buyback: $2,340 (470 XVS)
- Venus Prime: $1,849
- Treasury: $7,512

#### ZKsync Era

**Protocol Reserves & Liquidation Fees**

- Protocol Reserves: $39,905
- Liquidation Fees: $17,100
- Total: $57,005

**Tokenomic Allocations:**

- XVS Buyback: $11,401
- Venus Prime: $7,981
- Treasury: $37,623

*Note: All token prices and amounts will be calculated based on the monthly closing prices for all tokens from January to March 2025.*

The XVS Buyback was executed gradually over the quarter.

If approved, this VIP will perform the following actions:

**BNB Chain:**

- XVS Buyback Allocation: Send the buyback 111,845 XVS from the [XVS Vault Treasury](https://bscscan.com/address/0x269ff7818DB317f60E386D2be0B259e1a324a40a) to the [XVS Store](https://bscscan.com/address/0x1e25CF968f12850003Db17E0Dba32108509C4359), for the new XVS vault rewards.
- XVS Vault Base Rewards: Send 27,783 XVS from the [Core pool Comptroller](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384) to the [XVS Store](https://bscscan.com/address/0x1e25CF968f12850003Db17E0Dba32108509C4359) on BNB Chain (308.7 XVS/day, for Q2, 90 days). [VIP-419](https://app.venus.io/#/governance/proposal/419?chainId=56) only transferred the XVS Vault Base Rewards for Q1
- XVS Vault Speed: Set the new XVS Vault reward speed to **1,649 daily XVS.**

**Ethereum:**

- XVS Buyback Allocation: Send the buyback 5,932 XVS from the [XVS Vault Treasury](https://etherscan.io/address/0xaE39C38AF957338b3cEE2b3E5d825ea88df02EfE) to the [XVS Store](https://etherscan.io/address/0x1Db646E1Ab05571AF99e47e8F909801e5C99d37B), for the new XVS vault rewards.
- XVS Vault Speed: Set the new XVS Vault reward speed to **181.5 daily XVS.**

**Arbitrum one:**

- XVS Buyback Allocation: Send the buyback 470 XVS from the [XVS Vault Treasury](https://arbiscan.io/address/0xb076D4f15c08D7A7B89466327Ba71bc7e1311b58) to the [XVS Store](https://arbiscan.io/address/0x507D9923c954AAD8eC530ed8Dedb75bFc893Ec5e), for the new XVS vault rewards.
- Send 770 XVS from the [Core pool Comptroller](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384) to the [XVS Store](https://arbiscan.io/address/0x507D9923c954AAD8eC530ed8Dedb75bFc893Ec5e) on Arbitrum one, needed to cover the schedule rewards for Q2
- XVS Vault Speed: Set the new XVS Vault reward speed to **29.4 daily XVS.**

**ZKsync Era:**

- Token converters have yet to be deployed for this chain. All allocations for XVS vault rewards for this quarter will be used in the next.
- XVS Vault Speed: Set the new XVS Vault reward speed to **24.2 daily XVS.**

For all chains, XVS Vault rewards were adjusted as per [VIP 471](https://app.venus.io/#/governance/proposal/471?chainId=56). The new speeds will include these changes.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/532)
- [Tokenomics V4](https://docs-v4.venus.io/governance/tokenomics)
- [VIP-471 Emissions Adjustments Across All Chains](https://app.venus.io/#/governance/proposal/471?chainId=56)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // transfer funds to the XVS Stores
      {
        target: bscmainnet.UNITROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [BSC_XVS_STORE, BSC_XVS_STORE_AMOUNT],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [bscmainnet.NORMAL_TIMELOCK, ARB_XVS_STORE_AMOUNT],
      },
      {
        target: bscmainnet.XVS,
        signature: "approve(address,uint256)",
        params: [XVS_BRIDGE, ARB_XVS_STORE_AMOUNT],
      },
      {
        target: XVS_BRIDGE,
        signature: "sendFrom(address,uint16,bytes32,uint256,(address,address,bytes))",
        params: [
          bscmainnet.NORMAL_TIMELOCK,
          LzChainId.arbitrumone,
          ethers.utils.defaultAbiCoder.encode(["address"], [arbitrumone.VTREASURY]),
          ARB_XVS_STORE_AMOUNT,
          [bscmainnet.NORMAL_TIMELOCK, ethers.constants.AddressZero, ADAPTER_PARAMS],
        ],
        value: BRIDGE_FEES.toString(),
      },
      {
        target: arbitrumone.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [arbitrumone.XVS, ARB_XVS_STORE_AMOUNT, ARB_XVS_STORE],
        dstChainId: LzChainId.arbitrumone,
      },

      // release funds from the XVSVaultTreasury and set reward speeds
      {
        target: BSC_XVS_VAULT_TREASURY,
        signature: "fundXVSVault(uint256)",
        params: [BSC_RELEASE_AMOUNT],
      },
      {
        target: bscmainnet.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [bscmainnet.XVS, BSC_DISTRIBUTION_SPEED],
      },
      {
        target: ETH_XVS_VAULT_TREASURY,
        signature: "fundXVSVault(uint256)",
        params: [ETH_RELEASE_AMOUNT],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [ethereum.XVS, ETH_DISTRIBUTION_SPEED],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ARB_XVS_VAULT_TREASURY,
        signature: "fundXVSVault(uint256)",
        params: [ARB_RELEASE_AMOUNT],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: arbitrumone.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [arbitrumone.XVS, ARB_DISTRIBUTION_SPEED],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: zksyncmainnet.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [zksyncmainnet.XVS, ZKSYNC_DISTRIBUTION_SPEED],
        dstChainId: LzChainId.zksyncmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip477;
