import { parseUnits } from "ethers/lib/utils";

import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;
export const PROTOCOL_SHARE_RESERVE_PROXY = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";

export const USDT_PRIME_CONVERTER = "0xD9f101AA67F3D72662609a2703387242452078C3";
export const USDC_PRIME_CONVERTER = "0xa758c9C215B6c4198F0a0e3FA46395Fa15Db691b";
export const BTCB_PRIME_CONVERTER = "0xE8CeAa79f082768f99266dFd208d665d2Dd18f53";
export const XVS_VAULT_CONVERTER = "0xd5b9AE835F4C59272032B3B954417179573331E0";
export const VTREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const RISK_FUND_CONVERTER = "0xA5622D276CcbB8d9BBE3D1ffd1BB11a0032E53F0";
const ETH_PRIME_CONVERTER = "0xca430B8A97Ea918fF634162acb0b731445B8195E";

export const XVS_VAULT_REWARDS_SPEED = "67708333333333334"; // 1,950 XVS/day

const XVS_VAULT_TREASURY = "0x269ff7818DB317f60E386D2be0B259e1a324a40a";
export const XVS_VAULT_TREASURY_RELEASE_AMOUNT = parseUnits("92382.687369423028968977", 18);

const COMPTROLLER_CORE = "0xfd36e2c2a6789db23113685031d7f16329158384";
export const XVS_STORE = "0x1e25CF968f12850003Db17E0Dba32108509C4359";
export const COMPTROLLER_CORE_RELEASE_AMOUNT = parseUnits("153510", 18); // Q3 ->95,550 + Q4 -> 57,960

export const vip332 = () => {
  const meta = {
    version: "v2",
    title: "VIP 332 Quarterly XVS Buyback, Funds Allocation and New Tokenomics",
    description: `#### Summary

This VIP outlines the protocol’s Quarterly Buyback and Funds Allocation strategy as per our [Tokenomics V3](https://snapshot.org/#/venus-xvs.eth/proposal/0xc9d270ccecb7b91c75b95b8d9af24fc7c20cd38c0c0c44888ed4e7724f4e7ce9), emphasizing the following key aspects for Q2 2024:

- **Protocol Reserves:** $5,069,665
- **Liquidation Fees:** $2,558,000
- **Total:** $7,627,666

Tokenomic Allocations:

- **XVS Buyback: 92,382 XVS ($554,296)**
- **Venus Prime: $506,967**
- **Risk Fund: $3,306,866**
- **Treasury: $3,051,066**

*Note: All token prices and amounts will be calculated for Jun-28-2024 12:59:55 AM +UTC, block number 39992639.*

*The XVS Buyback was executed gradually over the quarter. The Venus Prime and the Risk Fund conversions were only partially executed, with over 90% of the tokens still pending conversion.*

If approved, this VIP will perform the following actions:

1. **XVS Buyback Allocation:** Send the 92,382 converted XVS from the [XVS Vault Treasury](https://bscscan.com/address/0x269ff7818DB317f60E386D2be0B259e1a324a40a) to the [XVS Store](https://bscscan.com/address/0x1e25CF968f12850003Db17E0Dba32108509C4359), for the new XVS vault rewards.
2. **XVS Vault Base Rewards:** Send 153,510 XVS from the [XVS Distributor](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384) to the [XVS Store](https://bscscan.com/address/0x1e25CF968f12850003Db17E0Dba32108509C4359) for the new Base rewards allocated for the second half of 2024: 95,550 for Q3 and 57,960 for Q4.
3. **Automatic Income Allocator:** Adjust the contracts for the new [Tokenomics V4](https://snapshot.org/#/venus-xvs.eth/proposal/0x21c89f6b5d7c9e453b3bac64b23c1d81fe52ff4f23ba0b64674c34217c3f9245).
4. **XVS Vault Speed:** Set the new XVS Vault reward speed to 1,950 daily XVS.

#### Context

This quarter, the automatic income allocator has distributed protocol reserves and liquidation fees according to [Tokenomics V3](https://snapshot.org/#/venus-xvs.eth/proposal/0xc9d270ccecb7b91c75b95b8d9af24fc7c20cd38c0c0c44888ed4e7724f4e7ce9). If approved, this VIP will update the tokenomics to [Tokenomics V4](https://snapshot.org/#/venus-xvs.eth/proposal/0x21c89f6b5d7c9e453b3bac64b23c1d81fe52ff4f23ba0b64674c34217c3f9245), modifying the automatic income allocator to reflect the new allocations.

The changes in tokenomic allocations are the following:

**Protocol Reserves:**

- Risk Fund: 0% (-40%)
- Venus Prime: 20% (+10%)
- XVS Buybacks (Vault Rewards): 20% (+10%)
- Treasury: 60% (+20%)

**Liquidation Fees:**

- Risk Fund: 0% (-50%)
- XVS Vault Rewards: 20% (+10%)
- Treasury: 80% (+40%)

**XVS Vault Base Rewards:**

- 630 XVS per day (-40%)

It is important to consider that the XVS Vault Base rewards will only take effect in Q4. This is because the income allocator for Q2 has already been primarily executing the XVS buyback using a 10% allocation. For Q4, the Base rewards will reduce to the amount indicated in the proposal as the XVS buyback allocation will increase to 20% during Q3.

**XVS Vault Base Rewards:**

- Q3: 95,550
- Q4: 57,960
- Total: 153,510

**Protocol Reserves:**

- **BNB:** $4,045,439
- **USDT:** $580,507
- **USDC:** $246,022
- **ETH:** $99,864
- **WBETH:** $34,245
- **Others:** $63,589
- **Total:** $5,069,665

**Liquidation Fees:**

- **BTC:** $813,845
- **WBETH:** $762,869
- **ETH:** $348,238
- **USDC:** $192,491
- **CAKE:** $173,974
- **Others:** $266,583
- **Total:** $2,558,000

**XVS Vault Daily Emission Speed:**

The 92,382 XVS, along with the 95,550 XVS from the XVS Vault Base Rewards, results in a total of 187,933 XVS to be distributed over 95 days. We will consider 5 extra days to secure user rewards while the next allocation is adjusted. With this, the daily emissions will increase from 1,840 XVS to 1,950 XVS, increasing the vault APY from 9.9% to an estimated 10.5%.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/305)
- Snapshot "[Proposal for Revision of Venus Protocol Tokenomics V4](https://snapshot.org/#/venus-xvs.eth/proposal/0x21c89f6b5d7c9e453b3bac64b23c1d81fe52ff4f23ba0b64674c34217c3f9245)"`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: PROTOCOL_SHARE_RESERVE_PROXY,
        signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
        params: [
          [
            [0, 6000, VTREASURY],
            [0, 2000, XVS_VAULT_CONVERTER],
            [0, 0, RISK_FUND_CONVERTER],
            [0, 800, USDC_PRIME_CONVERTER],
            [0, 800, USDT_PRIME_CONVERTER],
            [0, 100, BTCB_PRIME_CONVERTER],
            [0, 300, ETH_PRIME_CONVERTER],
            [1, 0, RISK_FUND_CONVERTER],
            [1, 8000, VTREASURY],
            [1, 2000, XVS_VAULT_CONVERTER],
          ],
        ],
      },
      {
        target: PROTOCOL_SHARE_RESERVE_PROXY,
        signature: "removeDistributionConfig(uint8,address)",
        params: [0, RISK_FUND_CONVERTER],
      },
      {
        target: PROTOCOL_SHARE_RESERVE_PROXY,
        signature: "removeDistributionConfig(uint8,address)",
        params: [1, RISK_FUND_CONVERTER],
      },
      {
        target: XVS_VAULT_TREASURY,
        signature: "fundXVSVault(uint256)",
        params: [XVS_VAULT_TREASURY_RELEASE_AMOUNT],
      },
      {
        target: COMPTROLLER_CORE,
        signature: "_grantXVS(address,uint256)",
        params: [XVS_STORE, COMPTROLLER_CORE_RELEASE_AMOUNT],
      },
      {
        target: bscmainnet.XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [bscmainnet.XVS, XVS_VAULT_REWARDS_SPEED],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip332;
