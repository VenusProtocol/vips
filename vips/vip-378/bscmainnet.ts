import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const VTOKEN_BEACON = "0x2b8A1C539ABaC89CbF7E2Bc6987A0A38A5e660D4";
export const NEW_VTOKEN_IMPLEMENTATION = "0xB0c4227FA3b7b2a5C298dCa960aB0631763D2839";

export const vip378 = () => {
  const meta = {
    version: "v2",
    title: "VIP-378 Upgrade VToken implementation on Ethereum, BNB Chain and opBNB",
    description: `#### Summary

If passed, this VIP will upgrade the implementation of the VToken contracts on Ethereum, BNB Chain and opBNB:

- On Ethereum, the new VToken implementation includes [this fix](https://github.com/VenusProtocol/isolated-pools/pull/337), to reduce the reserves automatically in the markets **only** if there is enough cash
- On BNB Chain and opBNB, the new VToken implementations wouldn’t add any new features, but will use the codebase already used on the rest of the networks. That would simplify the future upgrades of the code

#### Description

In [VIP-276](https://app.venus.io/#/governance/proposal/276?chainId=56), the implementation of the VToken contracts on the Core pool of BNB Chain were upgraded, and [this fix](https://github.com/VenusProtocol/venus-protocol/pull/414) was included. The code used on the Isolated pools on BNB Chain, and the pools on Arbitrum one, opBNB and zkSync Era already include [this similar fix](https://github.com/VenusProtocol/isolated-pools/pull/337). Only the VToken contracts used on Ethereum don’t include that fix. This VIP will resolve this, upgrading the implementation of the VToken contracts on Ethereum to use the same codebase used on the rest of the networks.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Audits:** [Quantstamp](https://quantstamp.com/), [Certik](https://www.certik.com/), and [Fairyproof](https://www.fairyproof.com/) have audited the deployed code
- **VIP execution simulation:** in a simulation environment, validating the upgrades are performed as expected, and the new features are available
- **Deployment on testnet:** the same upgrades have been performed on Sepolia, BNB Chain testnet and opBNB testnet, and used in the Venus Protocol testnet environment

#### Audit reports

- [Certik audit audit report](https://github.com/VenusProtocol/isolated-pools/blob/aa1f7ae61b07839231ec16e9c4143905785d7aae/audits/088_timeBased_certik_20240117.pdf) (2024/01/17)
- [Quantstamp audit audit report](https://github.com/VenusProtocol/isolated-pools/blob/470416836922656783eab52ded54744489e8c345/audits/089_timeBased_quantstamp_20240319.pdf) (2024/03/19)
- [Fairyproof audit report](https://github.com/VenusProtocol/isolated-pools/blob/aa1f7ae61b07839231ec16e9c4143905785d7aae/audits/094_timeBased_fairyproof_20240304.pdf) (2024/03/04)

#### Deployed contracts

- [New VToken implementation on BNB Chain](https://bscscan.com/address/0xB0c4227FA3b7b2a5C298dCa960aB0631763D2839)
- [New VToken implementation on Ethereum](https://etherscan.io/address/0xefdf5CcC12d8cff4a7ed4e421b95F8f69Cf2F766)
- [New VToken implementation on opBNB](https://opbnbscan.com/address/0x9aBbbc046a5b3d6338cE6fcEf470a0DA35Aa09D3)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/398)
- [Documentation](https://docs-v4.venus.io/)

#### Disclaimer for Ethereum and opBNB VIPs

Privilege commands on Ethereum and opBNB will be executed by the Guardian wallet ([Ethereum](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), [opBNB](https://opbnbscan.com/address/0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207)), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x0b4b4565e869d85edf36bb793195f1728df86114d14b99583dfdb6f151d00ebd) and [this](https://multisig.bnbchain.org/transactions/tx?safe=opbnb:0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207&id=multisig_0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207_0xfee8d2296b712ead1b416cac1eead9374ce335b9943e216002055ce1e3f5a3bc) multisig transactions will be executed. Otherwise, they will be rejected.
`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: VTOKEN_BEACON,
        signature: "upgradeTo(address)",
        params: [NEW_VTOKEN_IMPLEMENTATION],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip378;
