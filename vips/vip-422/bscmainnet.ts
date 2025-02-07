import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const BSCMAINNET_XVS_VAULT_TREASURY = "0x269ff7818DB317f60E386D2be0B259e1a324a40a";
export const BSCMAINNET_XVS_AMOUNT = parseUnits("89392", 18);
export const BSCMAINNET_XVS_SPEED = "50000000000000000";

export const ETHEREUM_XVS_VAULT_TREASURY = "0xaE39C38AF957338b3cEE2b3E5d825ea88df02EfE";
export const ETHEREUM_XVS_AMOUNT = parseUnits("3207", 18);
export const ETHEREUM_XVS_SPEED = "27777777777777777";

export const ARBITRUMONE_XVS_VAULT_TREASURY = "0xb076D4f15c08D7A7B89466327Ba71bc7e1311b58";
export const ARBITRUMONE_XVS_AMOUNT = parseUnits("739.739", 18);
export const ARBITRUMONE_XVS_SPEED = "486111111111111";

export const ZKSYNCMAINNET_XVS_SPEED = "405092592592592";

const { bscmainnet, ethereum, arbitrumone, zksyncmainnet } = NETWORK_ADDRESSES;

export const vip422 = () => {
  const meta = {
    version: "v2",
    title: "VIP-422 Quarterly XVS Buyback and Funds Allocation",
    description: `#### Summary

This VIP outlines the protocol’s Quarterly Buyback and Funds Allocation strategy as per our [Tokenomics V4](https://docs-v4.venus.io/governance/tokenomics), emphasizing the following key aspects for Q4 2024:

**BNB Chain:**

**Protocol Reserves & Liquidation Fees**

- Protocol Reserves: $3,375,915
- Liquidation Fees: $328,304
- Total: $3,704,219

**Tokenomic Allocations:**

- XVS Buyback: 89,392 XVS ($740,844)
- Venus Prime: $675,183
- Treasury: $2,288,192

**Ethereum:**

**Protocol Reserves & Liquidation Fees**

- Protocol Reserves: $147,331
- Liquidation Fees: $0
- Total: $147,331

**Tokenomic Allocations:**

- XVS Buyback: $29,466
- Venus Prime: $29,466
- Treasury: $88,399

**Arbitrum one:**

**Protocol Reserves & Liquidation Fees**

- Protocol Reserves: $23,566
- Liquidation Fees: $132
- Total: $23,698

**Tokenomic Allocations:**

- XVS Buyback: $4,740 (740 XVS)
- Venus Prime: $4,713
- Treasury: $14,245

**ZKsync Era:**

**Protocol Reserves & Liquidation Fees**

- Protocol Reserves: $16,097
- Liquidation Fees: $600
- Total: $16,697

**Tokenomic Allocations:**

- XVS Buyback: $3,339
- Venus Prime: $3,219
- Treasury: $10,138

*Note: All token prices and amounts will be calculated based on the monthly closing prices for all tokens from October to December 2024.*

The XVS Buyback was executed gradually over the quarter for BNB Chain and has yet to be converted for Ethereum and ZKsync Era.

**If approved, this VIP will perform the following actions:**

**For all chains, XVS Vault rewards were adjusted as per [VIP 419](https://app.venus.io/#/governance/proposal/419?chainId=56). The new speeds will include these changes.**

**BNB Chain:**

- XVS Buyback Allocation: Send the 89,392 converted XVS from the [XVS Vault Treasury](https://bscscan.com/address/0x269ff7818DB317f60E386D2be0B259e1a324a40a) to the [XVS Store](https://bscscan.com/address/0x1e25CF968f12850003Db17E0Dba32108509C4359), for the new XVS vault rewards.
- XVS Vault Speed: Set the new XVS Vault reward speed to **1,440 daily XVS.**

**Ethereum:**

- XVS Buyback Allocation: Send the 3,207 converted XVS from the [XVS Vault Treasury](https://etherscan.io/address/0xaE39C38AF957338b3cEE2b3E5d825ea88df02EfE) to the [XVS Store](https://etherscan.io/address/0x1Db646E1Ab05571AF99e47e8F909801e5C99d37B), for the new XVS vault rewards.
- XVS Vault Speed: Set the new XVS Vault reward speed to **200 daily XVS.**

**Arbitrum one:**

- XVS Buyback Allocation: Send the 740 converted XVS from the [XVS Vault Treasury](https://arbiscan.io/address/0xb076D4f15c08D7A7B89466327Ba71bc7e1311b58) to the [XVS Store](https://arbiscan.io/address/0x507D9923c954AAD8eC530ed8Dedb75bFc893Ec5e), for the new XVS vault rewards.
- XVS Vault Speed: Set the new XVS Vault reward speed to **42 daily XVS.**

**ZKsync Era:**

- Token converters have yet to be deployed for this chain. All allocations for XVS vault rewards for this quarter will be used in the next.
- XVS Vault Speed: Set the new XVS Vault reward speed to **35 daily XVS.**

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/457)
- [Tokenomics V4](https://docs-v4.venus.io/governance/tokenomics)
- [VIP-419 XVS Emissions Funding Proposal](https://app.venus.io/#/governance/proposal/419?chainId=56)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: BSCMAINNET_XVS_VAULT_TREASURY,
        signature: "fundXVSVault(uint256)",
        params: [BSCMAINNET_XVS_AMOUNT],
      },
      {
        target: bscmainnet.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [bscmainnet.XVS, BSCMAINNET_XVS_SPEED],
      },
      {
        target: ETHEREUM_XVS_VAULT_TREASURY,
        signature: "fundXVSVault(uint256)",
        params: [ETHEREUM_XVS_AMOUNT],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [ethereum.XVS, ETHEREUM_XVS_SPEED],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ARBITRUMONE_XVS_VAULT_TREASURY,
        signature: "fundXVSVault(uint256)",
        params: [ARBITRUMONE_XVS_AMOUNT],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: arbitrumone.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [arbitrumone.XVS, ARBITRUMONE_XVS_SPEED],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: zksyncmainnet.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [zksyncmainnet.XVS, ZKSYNCMAINNET_XVS_SPEED],
        dstChainId: LzChainId.zksyncmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip422;
