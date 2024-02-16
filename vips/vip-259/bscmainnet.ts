import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const USDT = "0x55d398326f99059ff775485246999027b3197955";
const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
const PESSIMISTIC_RECEIVER = "0x1B3bCe9Bd90cF6598bCc0321cC10b48bfD6Cf12f";
const FAIRYPROOF_RECEIVER = "0x060a08fff78aedba4eef712533a324272bf68119";
const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";

export const vip259 = () => {
  const meta = {
    version: "v2",
    title: "VIP-259 Payments Issuance for audits and other expenses",
    description: `#### Description

If passed this VIP will perform the following actions:

- Transfer 5,000 USDT to Pessimistic for the audit of the NativeTokenGateway contract
- Transfer 15,000 USDT to Fairyproof for the audit of the Time-based contracts and other changes
- Transfer 3 BNB, 2.4083847 ETH and 2,895 USDT to the Community Walled, to refund it several costs

#### Details

Pessimistic - NativeTokenGateway

- Auditor: Pessimistic ([https://pessimistic.io](https://pessimistic.io/))
- Payload: NativeTokenGateway ([Core pool](https://github.com/VenusProtocol/venus-protocol/pull/442) and [Isolated pools](https://github.com/VenusProtocol/isolated-pools/pull/361)). This new contract will allow the interaction with the WETH market using ETH directly, in a transparent way
- Status: audit starts on February 20th, 2024. ETA: March 1st, 2024
- Cost: 5,000 USDT, to be sent to the BEP20 address 0x1B3bCe9Bd90cF6598bCc0321cC10b48bfD6Cf12f

Fairyproof - Time-based contracts and other changes

- Auditor: Fairyproof ([https://www.fairyproof.com](https://www.fairyproof.com/))
- Payload:
    - [Timestamp-based Isolated lending contracts](https://github.com/VenusProtocol/isolated-pools/pull/324)
    - [Time-based XVSVault](https://github.com/VenusProtocol/venus-protocol/pull/418)
    - Reduce reserves with available cash ([Core pool](https://github.com/VenusProtocol/venus-protocol/pull/414) and [Isolated pools](https://github.com/VenusProtocol/isolated-pools/pull/337)
    - [Add Arbitrum sequencer downtime validation for Chainlink Oracle](https://github.com/VenusProtocol/oracle/pull/128)
    - [Seize XVS rewards](https://github.com/VenusProtocol/venus-protocol/pull/417)
    - [Dynamically Set Addresses for XVS and XVSVToken](https://github.com/VenusProtocol/venus-protocol/pull/410)
- Status: audit starts on February 16th, 2024. ETA: February 28th, 2024
- Cost: 15,000 USDT (10 working days), to be sent to the BEP20 address 0x060a08fff78aedba4eef712533a324272bf68119

Community Wallet

- Refund [Community Wallet](https://bscscan.com/address/0xc444949e0054A23c44Fc45789738bdF64aed2391) several costs
    - Funding Dev team with BNB to pay the gas used in deployments: [1 BNB](https://bscscan.com/tx/0x0f16e262c2ba7bc0c428128548a08c0812f5c7b35095e7268f914123e29aed49), [1 BNB](https://bscscan.com/tx/0xe7cf73adac68676a5abda51dbae49d7293dc995dc2129cf5aca614e1ee00180a), [1 BNB](https://bscscan.com/tx/0x8ecc0fccbd37d7d100e6626c51e357c14291495d6965fec056a85a60177a22e0)
    - Funding Dev team with ETH to pay the gas used in deployments: [0.3 ETH](https://etherscan.io/tx/0xa9b1b48f53c55b4764897975650357387b4c8be6a3cd799df0392e48be6c3881), [0.2898073 ETH](https://etherscan.io/tx/0x7c2b4cf16c06c51e8ba53508e6b7d5883e55d6ab7d5dcd5b6f98712d05058c48), [0.3185774 ETH](https://etherscan.io/tx/0x9cfde50cf79ec31ecbb1ee09d1d513ba8505260de1a53d7085a9ff215537443c), [1 ETH](https://etherscan.io/tx/0x35ca4c8285de2361436df0fb010335296d76dcb9f83db4aa56e6191bec4e4650), [0.05 ETH](https://etherscan.io/tx/0x9cc52298e5646e9aac5ac226587f879c18c02eaafab434c26d8ec5c226973e81), [0.45 ETH](https://etherscan.io/tx/0x3cc060a90140f86865a657330aca8354df02c59a25a47d742229de2897a32396)
    - ETH Treasury Funding: [200 USDT](https://bscscan.com/tx/0xeaf29f5ab71ce6320df41546076054d37f27f2c8f87614047416dd737a6c52dc)
    - Donation to the vTUSD market, to allow the execution of the [VIP-253](https://app.venus.io/#/governance/proposal/253?chainId=56): [2695 USDT](https://bscscan.com/tx/0xc49707ff7b5bca0c3b191bb49c44e8f991297d03a5eaa585efce4131d1cc8f54)
- Totals:
    - 3 BNB
    - 2.4083847 ETH
    - 2,895 USDT
- to be sent to the BEP20 address 0xc444949e0054A23c44Fc45789738bdF64aed2391`,
    forDescription: "I agree that Venus Protocol should proceed with these payments",
    againstDescription: "I do not think that Venus Protocol should proceed with these payments",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with these payments",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("5000", 18), PESSIMISTIC_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("15000", 18), FAIRYPROOF_RECEIVER],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("2895", 18), COMMUNITY_WALLET],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [ETH, parseUnits("2.4083847", 18), COMMUNITY_WALLET],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBNB(uint256,address)",
        params: [parseUnits("3", 18), COMMUNITY_WALLET],
        value: "0",
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip259;
