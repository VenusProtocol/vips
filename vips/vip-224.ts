import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const LIQUIDATOR_CONTRACT = "0x0870793286aaDA55D39CE7f82fb2766e8004cF43";
const PROXY_ADMIN = "0x1BB765b741A5f3C2A338369DAb539385534E3343";
const MOVE_DEBT_DELEGATE = "0x89621C48EeC04A85AfadFD37d32077e65aFe2226";
const NEW_MOVE_DEBT_DELEGATE_IMPL = "0x8439932C45e646FcC1009690417A65BF48f68Ce7";

const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const VBTC = "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B";
const VETH = "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8";
const VBCH = "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176";
const VDAI = "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1";
const VTUSDOLD = "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3";

const EXPLOITER_WALLET = "0x489A8756C18C0b8B24EC2a2b9FF3D4d447F79BEc";
const NEW_LIQUIDATOR_WALLET = "0x1934057d1DE58cF65fB59277A91f26aC9f8A4282";

const MOVE_DEBT_ALLOWLIST = [
  { borrower: "0xef044206db68e40520bfa82d45419d498b4bc7bf", markets: [VBTC, VETH, VBCH] },
  { borrower: "0x7589dd3355dae848fdbf75044a3495351655cb1a", markets: [VETH] },
  { borrower: "0x24e77e5b74b30b026e9996e4bc3329c881e24968", markets: [VBTC, VETH] },
  { borrower: "0x33df7a7f6d44307e1e5f3b15975b47515e5524c0", markets: [VBTC, VETH] },
  { borrower: "0x1f6d66ba924ebf554883cf84d482394013ed294b", markets: [VUSDC, VUSDT, VETH] },
  { borrower: "0x3b7f525dc67cca55251abb5d04c81a83a6005269", markets: [VUSDT /*,VBNB*/] },
  { borrower: "0x0f2577ccb1e895ed1e8bfd4e709706595831e78a", markets: [VUSDC, VUSDT, /*VBNB,*/ VTUSDOLD] },
  { borrower: "0xbd043882d36b6def4c30f20c613cfa70d3af8bb7", markets: [VUSDC /*,VBNB*/] },
  { borrower: "0x4f381fb46dfde2bc9dcae2d881705749b1ed6e1a", markets: [VUSDT] },
  { borrower: "0x7b899b97afacd8b9654a447b4db016ba430f6d11", markets: [VUSDT] },
  { borrower: "0xe62721e908b7cbd4f92a014d5ccf07adbf71933b", markets: [VDAI] },
  { borrower: "0x8dcf5f960c38fd1861a4d036513adde829d63d81", markets: [VUSDC] },
  { borrower: "0x3762e67e24b9b44cea8e89163aba9d4015e27d40", markets: [VUSDT] },
  { borrower: "0x7eb163e6d0562d8534ab198551b7bf8815371152", markets: [VUSDT] },
  { borrower: "0x55f6dc97d739f52d66c7332c2f93016a4c9d852d", markets: [VUSDC, VUSDT] },
  { borrower: "0xb38a6184069cf136ee9d145c6acf564dd10fd195", markets: [VUSDT] },
  { borrower: "0x1e85d99e182557960e2b86bb53ca417007eed16a", markets: [VUSDC] },
  { borrower: "0x5cf9f8a81eb9a3eff4c72326903b27782eb47be2", markets: [VTUSDOLD] },
];

export const vip224 = () => {
  const meta = {
    version: "v2",
    title: "VIP-224 Enable MoveDebtDelegate for Shortfall Accounts",
    description: `#### Summary

Following BNB Chain’s [proposal](https://community.venus.io/t/proposal-bnb-bridge-exploiter-account-remediation/3974) to liquidate the BNB exploiter’s debts, and the [Community proposal](https://community.venus.io/t/enable-movedebtdelegate-for-btc-and-eth-shortfall-account/4015), this VIP would allow to service most of the shortfall into solvent debt by using the [MoveDebtDelegate](https://app.venus.io/#/governance/proposal/215?chainId=56) contract with the [BNB bridge exploiter’s account](https://bscscan.com/address/0x489a8756c18c0b8b24ec2a2b9ff3d4d447f79bec).

At the end of this operation:

- The BTC and ETH bad debt will be reduced
- Venus maintains the BNB liquidity
- Another whitelisted liquidator in [VIP-79](https://app.venus.io/#/governance/proposal/79?chainId=56) will still manage the BNB exploiter’s account health
- The BNB bridge exploiter will carry additional debt, now defined across other markets

#### Details

If passed, this VIP will:

- upgrade the implementation of the MoveDebtDelegate (related to [VIP-215](https://app.venus.io/#/governance/proposal/215?chainId=56))
    - add ETH and BTC to the list of markets where MoveDebtDelegate will be allowed to borrow on behalf of the BNB bridge exploiter’s account (previously only USDT and USDC were included)
    - set the whitelist of borrowers and markets, considering the biggest bad debts. MoveDebtDelegate will be able to repay only the debt of these wallets. The full list of borrowers and markets are set in the commands of this VIP.
- enable the forced liquidations of the [USDT](https://bscscan.com/address/0x55d398326f99059fF775485246999027B3197955), [USDC](https://bscscan.com/address/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d) borrows of the BNB bridge exploiter’s account, as it was [proposed by BNB Chain](https://community.venus.io/t/proposal-bnb-bridge-exploiter-account-remediation/3974), and [BTC](https://bscscan.com/address/0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c) and [ETH](https://bscscan.com/address/0x2170Ed0880ac9A755fd29B2688956BD959F933F8) borrows of the same wallet, to make [this Community proposal](https://community.venus.io/t/enable-movedebtdelegate-for-btc-and-eth-shortfall-account/4015) doable.
- add 0x1934057d1DE58cF65fB59277A91f26aC9f8A4282 to the list of authorized liquidators for the BNB bridge exploiter’s account.

Regarding MoveDebtDelegate and its use after this VIP: it is a permissionless contract that will allow any wallet to interact with it via the function moveDebt. The interaction with this function, to repay the BTC shortfall for example (it would be similar for the rest of the markets), would be:

1. External BTC providers (any wallet) invoke the moveDebt function on the MoveDebtDelegate contract, sending BTC tokens to the MoveDebtDelegate contract
2. MoveDebtDelegate repays BTC borrows on behalf of the BTC shortfall borrowers
3. In the same transaction, the MoveDebtDelegate contract will borrow the equivalent amount of BTC, ETH, USDC or USDT, on behalf of the BNB bridge exploiter, and it will send those borrowed tokens to the external BTC provider, to compensate for their contribution

There isn’t any economical incentive to interact with the MoveDebtDelegate: the BTC, ETH, USDC or USDT received from the MoveDebtDelegate contract will be the equivalent amount to the BTC provided (according to the [Venus oracles](https://docs-v4.venus.io/risk/resilient-price-oracle)).

VIP simulation: [https://github.com/VenusProtocol/vips/pull/135](https://github.com/VenusProtocol/vips/pull/135)

#### References

- [New MoveDebtDelegate implementation](https://bscscan.com/address/0x8439932C45e646FcC1009690417A65BF48f68Ce7)
- Forced liquidations for individual accounts are available since [VIP-209](https://app.venus.io/#/governance/proposal/209).`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this proposal",
  };

  return makeProposal(
    [
      ...[VUSDC, VUSDT, VBTC, VETH].map((vToken: string) => ({
        target: COMPTROLLER,
        signature: "_setForcedLiquidationForUser(address,address,bool)",
        params: [EXPLOITER_WALLET, vToken, true],
      })),
      {
        target: LIQUIDATOR_CONTRACT,
        signature: "addToAllowlist(address,address)",
        params: [EXPLOITER_WALLET, NEW_LIQUIDATOR_WALLET],
      },
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [MOVE_DEBT_DELEGATE, NEW_MOVE_DEBT_DELEGATE_IMPL],
      },
      ...[VBTC, VETH].map((vToken: string) => ({
        target: MOVE_DEBT_DELEGATE,
        signature: "setBorrowAllowed(address,bool)",
        params: [vToken, true],
      })),
      ...MOVE_DEBT_ALLOWLIST.flatMap(({ borrower, markets }: { borrower: string; markets: string[] }) =>
        markets.map((market: string) => ({
          target: MOVE_DEBT_DELEGATE,
          signature: "setRepaymentAllowed(address,address,bool)",
          params: [market, borrower, true],
        })),
      ),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
