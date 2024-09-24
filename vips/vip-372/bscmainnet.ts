import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const vETH = "0xeCCACF760FEA7943C5b0285BD09F601505A29c05";
export const vweETH = "0xc5b24f347254bD8cF8988913d1fd0F795274900F";
export const vwstETH = "0x94180a3948296530024Ef7d60f60B85cfe0422c8";
export const COMPTROLLER = "0xBE609449Eb4D76AD8545f957bBE04b596E8fC529";
export const ETH_SUPPLY_CAP = parseUnits("3600", 18);
export const ETH_BORROW_CAP = parseUnits("3250", 18);
export const weETH_SUPPLY_CAP = parseUnits("120", 18);
export const weETH_BORROW_CAP = parseUnits("60", 18);
export const wstETH_SUPPLY_CAP = parseUnits("3200", 18);
export const wstETH_BORROW_CAP = parseUnits("320", 18);

const XVS_BRIDGE_ADMIN = "0x70d644877b7b73800E9073BCFCE981eAaB6Dbc21";
export const SINGLE_SEND_LIMIT = parseUnits("20000", 18);
export const MAX_DAILY_SEND_LIMIT = parseUnits("100000", 18);
export const SINGLE_RECEIVE_LIMIT = parseUnits("20400", 18);
export const MAX_DAILY_RECEIVE_LIMIT = parseUnits("102000", 18);

export const vip372 = () => {
  const meta = {
    version: "v2",
    title: "VIP-372 Risk Parameters Adjustments",
    description: `#### Summary

If passed, this VIP will perform the following actions:

- Update the supply and borrow caps of the markets for ETH, wstETH and weETH on BNB Chain (Liquid Staked ETH pool), following the [Chaos labs recommendations](https://community.venus.io/t/support-lido-wsteth-token-in-a-new-venus-protocol-bnbchain-lst-eth-pool/4526/8)
- Increase the limits in the XVS bridge among zkSync and the rest of supported networks: Ethereum, BNB Chain, Arbitrum and opBNB, following the [Chaos labs recommendations](https://community.venus.io/t/deploy-venus-protocol-on-zksync-era/4472/12)

#### Description

This VIP will perform the following Risk Parameter actions as per Chaos Labs’ latest recommendations in this Venus community forum publication: [Chaos Labs - Risk Parameter Updates - 09/23/24](https://community.venus.io/t/support-lido-wsteth-token-in-a-new-venus-protocol-bnbchain-lst-eth-pool/4526/8).

- [ETH (Liquid Staked ETH)](https://bscscan.com/address/0xeCCACF760FEA7943C5b0285BD09F601505A29c05)
    - Increase supply cap from 450 ETH to 3,600 ETH
    - Increase borrow cap from 400 ETH to 3,250 ETH
- [wstETH (Liquid Staked ETH)](https://bscscan.com/address/0x94180a3948296530024Ef7d60f60B85cfe0422c8)
    - Increase supply cap from 50 wstETH to 3,200 wstETH
    - Increase borrow cap from 5 wstETH to 320 wstETH
- [weETH (Liquid Staked ETH)](https://bscscan.com/address/0xc5b24f347254bD8cF8988913d1fd0F795274900F)
    - Decrease supply cap from 400 weETH to 120 weETH
    - Decrease borrow cap from 200 weETH to 60 weETH

This VIP should be executed after executing the [VIP-370](https://app.venus.io/#/governance/proposal/370?chainId=56), where the affected markets will be enabled.

Regarding the limits of the XVS bridge among zkSync and the rest of supported networks, in the [VIP-358](https://app.venus.io/#/governance/proposal/358?chainId=56) the single transaction and daily limits were set to half of the amounts recommended by Chaos labs. In this VIP, these limits are set to the expected values:

- Maximum bridged XVS in a single transaction: 20,000 USD
- Maximum bridged XVS in 24 hours: 100,000 USD

Complete analysis and details of these recommendations are available in the above publications.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/356)
- [VIP-358 XVS bridge between zkSync Era and BNB Chain, Ethereum, Arbitrum one and opBNB](https://app.venus.io/#/governance/proposal/358?chainId=56)
- [VIP-370: Add Liquid Staked ETH pool to BNB chain](https://app.venus.io/#/governance/proposal/370?chainId=56)
- [Technical documentation about the XVS bridge](https://docs-v4.venus.io/technical-reference/reference-technical-articles/xvs-bridge)

#### Disclaimer for Ethereum, opBNB, Arbitrum one and zkSync Era commands

Privilege commands on Ethereum, opBNB, Arbitrum one and zkSync Era will be executed by the Guardian wallets ([Ethereum](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), [opBNB](https://opbnbscan.com/address/0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207), [Arbitrum one](https://arbiscan.io/address/0x14e0e151b33f9802b3e75b621c1457afc44dcaa0), [zkSync Era](https://explorer.zksync.io/address/0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa)), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled.

If this VIP passes, the following multisig transactions will be executed. Otherwise, they will be rejected.

- [Ethereum](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x78510629ca377b93f9d5496ec249201ecc5f30745af0d8c2ea0b5c5fdd6904ae)
- [opBNB](https://multisig.bnbchain.org/transactions/tx?safe=opbnb:0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207&id=multisig_0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207_0x65a1c5369b8e13abda41fa6d16b09a3eaa4aac8137083690dda880b8a861b299)
- [Arbitrum one](https://app.safe.global/transactions/tx?safe=arb1:0x14e0E151b33f9802b3e75b621c1457afc44DcAA0&id=multisig_0x14e0E151b33f9802b3e75b621c1457afc44DcAA0_0xa09d784e2a6a49865571d803ca778376bd928bb7e16381c5ebd4b273e5e6f0e0)
- [zkSync Era](https://app.safe.global/transactions/tx?safe=zksync:0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa&id=multisig_0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa_0x85a47f4c749c7be79ee92fe13ebfd4283481894c4745ca1ded4c8130864f82d3)
`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: XVS_BRIDGE_ADMIN,
        signature: "setMaxDailyLimit(uint16,uint256)",
        params: [LzChainId.zksyncmainnet, MAX_DAILY_SEND_LIMIT],
      },
      {
        target: XVS_BRIDGE_ADMIN,
        signature: "setMaxSingleTransactionLimit(uint16,uint256)",
        params: [LzChainId.zksyncmainnet, SINGLE_SEND_LIMIT],
      },
      {
        target: XVS_BRIDGE_ADMIN,
        signature: "setMaxDailyReceiveLimit(uint16,uint256)",
        params: [LzChainId.zksyncmainnet, MAX_DAILY_RECEIVE_LIMIT],
      },
      {
        target: XVS_BRIDGE_ADMIN,
        signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
        params: [LzChainId.zksyncmainnet, SINGLE_RECEIVE_LIMIT],
      },
      {
        target: COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [
          [vETH, vweETH, vwstETH],
          [ETH_SUPPLY_CAP, weETH_SUPPLY_CAP, wstETH_SUPPLY_CAP],
        ],
      },
      {
        target: COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [
          [vETH, vweETH, vwstETH],
          [ETH_BORROW_CAP, weETH_BORROW_CAP, wstETH_BORROW_CAP],
        ],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip372;
