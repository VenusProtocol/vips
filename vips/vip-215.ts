import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const CONFIGURE_ATTACKER_COMPTROLLER_IMPL = "0xAE37464537fDa217258Bb2Cd70e4f8ffC7E95790";
const DIAMOND_IMPL = "0xD93bFED40466c9A9c3E7381ab335a08807318a1b";
const MOVE_DEBT_DELEGATE = "0x89621C48EeC04A85AfadFD37d32077e65aFe2226";

const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";

export const vip215 = () => {
  const meta = {
    version: "v2",
    title: "VIP-215 BUSD debt mitigation",
    description: `#### Summary

If passed this VIP will perform the following actions:

* Authorize the MoveDebtDelegate contract, to borrow USDT or USDC on behalf of the account [0x489A8756C18C0b8B24EC2a2b9FF3D4d447F79BEc](https://bscscan.com/address/0x489A8756C18C0b8B24EC2a2b9FF3D4d447F79BEc)
* Accept the ownership of the MoveDebtDelegate ([Governance](https://bscscan.com/address/0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396) will be the owner of this contract)

#### Details

At block [34266181](https://bscscan.com/block/34266181) (Dec-11-2023 04:56:57 PM +UTC) the shortfall in the [Venus BUSD market](https://app.venus.io/#/core-pool/market/0x95c78222B3D6e262426483D42CfA53685A67Ab9D) was 7,221,907 BUSD:

* 4,848,819 BUSD supplied by BUSD suppliers
* 2,373,087 BUSD allocated to the protocol reserves

The liquidity of the market is almost 0.

[Binance will cease support for BUSD products on 2023-12-15](https://www.binance.com/en/support/announcement/notice-regarding-the-removal-of-busd-and-conversion-of-busd-to-fdusd-1c98ce7bb464422dbbaeda7066ae445b). Given this context, this VIP aims to help provide liquidity to the BUSD market as soon as possible to allow BUSD suppliers to have access to their funds in the market.

The MoveDebtDelegate is a permissionless contract that will allow any wallet to interact with it via the function moveDebt. The expected flow is:

1. External BUSD providers (any wallet) repay BUSD borrows on behalf of BUSD borrowers, via the MoveDebtDelegate contract
2. In the same transaction, the MoveDebtDelegate contract will borrow the equivalent amount of USDT or USDC, on behalf of the account 0x489a8756c18c0b8b24ec2a2b9ff3d4d447f79bec, and it will send those tokens to the external BUSD provider, to compensate for their contribution

At the end of the operation, when every BUSD borrow is repaid:

* BUSD suppliers will be able to withdraw 100% of their funds. The BUSD shortfall will be zero
* The BUSD providers will receive in USDT and USDC the same amount provided in BUSD. Net value for these providers: 0
* The debt of the account 0x489a8756c18c0b8b24ec2a2b9ff3d4d447f79bec will be increased, distributed between USDT and USDC

There isn’t any economical incentive to interact with the MoveDebtDelegate: the USDT or USDC received from the MoveDebtDelegate contract will be the equivalent amount to the BUSD provided (according to the Venus oracles).

#### Security and additional considerations

We applied the following security procedures for this VIP:

* **VIP simulation:** in a simulation environment, validating the behavior of the MoveDebtDelegate contract is the expected one after the VIP
* **SwapDebtDelegate,** a contract similar to MoveDebtDelegate, was used in the [VIP-99 Whitelist BNB Chain to swap BUSD debt from 0x489A8756C18C0b8B24EC2a2b9FF3D4d447F79BEc](https://app.venus.io/#/governance/proposal/99)

#### Deployed contracts on mainnet

* [MoveDebtDelegate](https://bscscan.com/address/0x89621C48EeC04A85AfadFD37d32077e65aFe2226)

#### References

* [VIP simulation](https://github.com/VenusProtocol/vips/pull/128)
* [Source code of the MoveDebtDelegate contract](https://github.com/VenusProtocol/venus-protocol/pull/406)
* [Community post](https://community.venus.io/t/busd-debt-mitigation/3962)
* Previous shortfall repayments:
    * [VIP-204 Repay BUSD debt on behalf borrower](https://app.venus.io/#/governance/proposal/204)
    * [VIP-121 BTC Shortfall Repayment](https://app.venus.io/#/governance/proposal/121)
    * [VIP-118 ETH Shortfall Repayment](https://app.venus.io/#/governance/proposal/118)
* [VIP-191 Enable forced liquidations on the BUSD market](https://app.venus.io/#/governance/proposal/191)
`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this proposal",
  };

  return makeProposal(
    [
      {
        target: MOVE_DEBT_DELEGATE,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: MOVE_DEBT_DELEGATE,
        signature: "setBorrowAllowed(address,bool)",
        params: [VUSDC, true],
      },
      {
        target: MOVE_DEBT_DELEGATE,
        signature: "setBorrowAllowed(address,bool)",
        params: [VUSDT, true],
      },
      {
        target: COMPTROLLER,
        signature: "_setPendingImplementation(address)",
        params: [CONFIGURE_ATTACKER_COMPTROLLER_IMPL],
      },
      {
        target: CONFIGURE_ATTACKER_COMPTROLLER_IMPL,
        signature: "_become(address)",
        params: [COMPTROLLER],
      },
      {
        target: COMPTROLLER,
        signature: "setDelegateForBNBHacker(address)",
        params: [MOVE_DEBT_DELEGATE],
      },
      {
        target: COMPTROLLER,
        signature: "_setPendingImplementation(address)",
        params: [DIAMOND_IMPL],
      },
      {
        target: DIAMOND_IMPL,
        signature: "_become(address)",
        params: [COMPTROLLER],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
