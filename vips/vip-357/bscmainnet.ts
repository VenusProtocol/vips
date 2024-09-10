import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";
import { CRITICAL_TIMELOCK, FAST_TRACK_TIMELOCK, NORMAL_TIMELOCK } from "src/vip-framework";

export const ACM = "0x4788629abc6cfca10f9f969efdeaa1cf70c23555";
export const PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";
export const RISK_FUND = "0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42";
export const OLD_RISK_FUND_IMPL = "0x2F377545Fd095fA59A56Cb1fD7456A2a0B781Cb6";
export const NEW_RISK_FUND_IMPL = "0x7Ef5ABbcC9A701e728BeB7Afd4fb5747fAB15A28";
export const LIQUIDATOR_CONTRACT = "0x0870793286aada55d39ce7f82fb2766e8004cf43";

export const EXPLOITER_WALLET = "0x489A8756C18C0b8B24EC2a2b9FF3D4d447F79BEc";

export const vip357 = async () => {
  const meta = {
    version: "v2",
    title: "VIP-357 Extend accessibility to the risk funds",
    description: `If passed, this VIP will upgrade the [RiskFund contract](https://bscscan.com/address/0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42), enabling funds to be extracted through Fast-track and Critical VIPs, in addition to the current method of using Normal VIPs.

Moreover, this VIP would authorize the Venus Governance to liquidate the BNB Exploiter account via any type of VIP’s, and to change the percentage of the liquidation fee for the protocol with Fast-track and Critical VIP’s. This would effectively allow Venus to be the liquidator of that account and to keep the seized BNB supplied to Venus.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

* **Audits:** [Certik](https://www.certik.com/) has audited the changes in the RiskFund contract.
* **VIP execution simulation:** in a simulation environment, validating the new implementation works as expected
* **Deployment on testnet:** the same contract has been deployed to BNB testnet, and used in the Venus Protocol testnet deployment

#### Audit reports

* [Certik audit report - 2024/08/26](https://github.com/VenusProtocol/protocol-reserve/blob/477e0f80384461163a5140c7e7f69e44c324bd91/audits/117_riskFundUpgrade_certik_20240826.pdf)

#### Deployed contracts

* [New RiskFund implementation on BNB Chain](https://bscscan.com/address/0x7Ef5ABbcC9A701e728BeB7Afd4fb5747fAB15A28)
* [New RiskFund implementation on BNB testnet ](https://testnet.bscscan.com/address/0x394C9a8cDbbFcAbEAb21fB105311B6B1f09b667a)

#### References

* [VIP simulation](https://github.com/VenusProtocol/vips/pull/358)
* [Execution on testnet](https://testnet.bscscan.com/tx/0x7241fe30b49b11fcbfa4359fd02aff0cc33dc85d0f94e1f21fe959e54fc61e85)
`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [RISK_FUND, NEW_RISK_FUND_IMPL],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_FUND, "sweepTokenFromPool(address,address,address,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_FUND, "sweepTokenFromPool(address,address,address,uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [RISK_FUND, "sweepTokenFromPool(address,address,address,uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR_CONTRACT, "setTreasuryPercent(uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [LIQUIDATOR_CONTRACT, "setTreasuryPercent(uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: LIQUIDATOR_CONTRACT,
        signature: "addToAllowlist(address,address)",
        params: [EXPLOITER_WALLET, NORMAL_TIMELOCK],
      },
      {
        target: LIQUIDATOR_CONTRACT,
        signature: "addToAllowlist(address,address)",
        params: [EXPLOITER_WALLET, FAST_TRACK_TIMELOCK],
      },
      {
        target: LIQUIDATOR_CONTRACT,
        signature: "addToAllowlist(address,address)",
        params: [EXPLOITER_WALLET, CRITICAL_TIMELOCK],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip357;
