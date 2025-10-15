import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { cutParams as params } from "./cut-params-mainnet.json";

const { bscmainnet } = NETWORK_ADDRESSES;

export const vBNB_ADMIN = "0x9A7890534d9d91d473F28cB97962d176e2B65f1d";
export const vBNB_ADMIN_IMPL = "0xae2713FbdF95d914182f7055ec1Ff6C64F41c275";
export const DEFAULT_PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";
export const DIAMOND = "0xb61a58aCA9F39dEA8C22F4c9a377C68a1Ea3723C";
export const COMPTROLLER_LENS = "0x9D228f57227839a9c514077c3909c9992F7900Af";
export const LIQUIDATOR = "0x0870793286aada55d39ce7f82fb2766e8004cf43";
export const LIQUIDATOR_IMPL = "0x1da2Fe628F50C14bc2A873A96B6D10392830621f";
export const LIQUIDATOR_PROXY_ADMIN = "0x2b40B43AC5F7949905b0d2Ed9D6154a8ce06084a";
export const VAI_CONTROLLER = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE";
export const VAI_CONTROLLER_IMPL = "0xE4109433CEE11172dcCaE80d9c3bcDDFF4A7Cf57";
export const VTOKEN_DELEGATE = "0xA674296091B703e38dB2f3a937f02334627dCdaD";

export const vTokens = {
  vAAVE: "0x26DA28954763B92139ED49283625ceCAf52C6f94",
  vADA: "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec",
  vasBNB: "0xCC1dB43a06d97f736C7B045AedD03C6707c09BDF",
  vBCH: "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176",
  vBETH: "0x972207A639CC1B374B893cc33Fa251b55CEB7c07",
  vBTC: "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B",
  vBUSD: "0x95c78222B3D6e262426483D42CfA53685A67Ab9D",
  vCAKE: "0x86aC3974e2BD0d60825230fa6F355fF11409df5c",
  vDAI: "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1",
  vDOGE: "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71",
  vDOT: "0x1610bc33319e9398de5f57B33a5b184c806aD217",
  vETH: "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8",
  vFDUSD: "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba",
  vFIL: "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343",
  vLINK: "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f",
  vlisUSD: "0x689E0daB47Ab16bcae87Ec18491692BF621Dc6Ab",
  vLTC: "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B",
  vMATIC: "0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8",
  "vPT-sUSDE-26JUN2025": "0x9e4E5fed5Ac5B9F732d0D850A615206330Bf1866",
  vSOL: "0xBf515bA4D1b52FFdCeaBF20d31D705Ce789F2cEC",
  vSolvBTC: "0xf841cb62c19fCd4fF5CD0AaB5939f3140BaaC3Ea",
  vsUSDe: "0x699658323d58eE25c69F1a29d476946ab011bD18",
  vSXP: "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0",
  vTHE: "0x86e06EAfa6A1eA631Eab51DE500E3D474933739f",
  vTRX: "0xC5D3466aA484B040eE977073fcF337f2c00071c1",
  vTRXOLD: "0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93",
  vTUSD: "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E",
  vTUSDOLD: "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3",
  vTWT: "0x4d41a36D04D97785bcEA57b057C412b278e6Edcc",
  vUNI: "0x27FF564707786720C71A2e5c1490A63266683612",
  vUSDC: "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8",
  vUSDe: "0x74ca6930108F775CC667894EEa33843e691680d7",
  vUSDT: "0xfD5840Cd36d94D7229439859C0112a4185BC0255",
  vUSD1: "0x0C1DA220D301155b87318B90692Da8dc43B67340",
  vWBETH: "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0",
  vWBNB: "0x6bCa74586218dB34cdB402295796b79663d816e9",
  vXRP: "0xB248a295732e0225acd3337607cc01068e3b9c10",
  vxSolvBTC: "0xd804dE60aFD05EE6B89aab5D152258fD461B07D5",
  vXVS: "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D",
};

export const vip545 = () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-545 [BNB Chain] Upgrade Solidity Version for Venus Core Pool Smart Contracts",
    description: `#### Summary

If passed, following the community proposal “[Proposal: Upgrade Solidity Version for Venus Core Pool Smart Contracts on BNB Chain](https://community.venus.io/t/proposal-upgrade-solidity-version-for-venus-core-pool-smart-contracts-on-bnb-chain/5272) ”, this VIP will upgrade the implementation of the following contracts on BNB Chain:

- [Core Pool Comptroller](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384)
- [VBNBAdmin](https://bscscan.com/address/0x9A7890534d9d91d473F28cB97962d176e2B65f1d)
- [Liquidator](https://bscscan.com/address/0x0870793286aada55d39ce7f82fb2766e8004cf43)
- [VAIController](http://bscscan.com/address/0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE)
- Every VToken in the BNB Chain Core pool

No new features are included. The only changes are those required after updating the Solidity version from 0.5.16 to 0.8.25.

#### Description

Why this upgrade:

- **Modern, Secure Language Version**: Solidity 0.8.25 includes many improvements in **safety**, **performance**, and **readability**, and comes with **built-in overflow checks**, which remove the need for third-party libraries like 'SafeMath'.
- **Proven Stability**: This version has been **battle-tested** across the Ethereum ecosystem since its release in [2024](https://soliditylang.org/blog/2024/03/14/solidity-0.8.25-release-announcement/). It’s already in use across multiple parts of Venus, including the **Oracles**.
- **Developer Efficiency**: Standardizing on a modern version of Solidity will make it easier for developers to maintain, audit, and extend the protocol going forward.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Audits**: [Certik](https://www.certik.com/), [Quantstamp](https://quantstamp.com/) and [HashDit](https://www.hashdit.io/) have audited the deployed code
- **VIP execution simulation**: in a simulation environment, validating the new implementations and the usual behaviour of the protocol
- **Deployment on testnet**: the same upgrades have been performed on BNB Chain testnet, and used in the Venus Protocol testnet deployment

#### Audit reports

- [Certik audit report](https://github.com/VenusProtocol/venus-protocol/blob/develop/audits/142_upgradeSolidity8_certik_20250824.pdf) (2025/08/24)
- [Quantstamp audit report](https://github.com/VenusProtocol/venus-protocol/blob/develop/audits/143_upgradeSolidity8_quantstamp_20250829.pdf) (2025/08/29)

#### Deployed contracts

BNB Chain new implementations:

- [vBNBAdmin](http://bscscan.com/address/0xae2713FbdF95d914182f7055ec1Ff6C64F41c275)
- [Diamond](https://bscscan.com/address/0xb61a58aCA9F39dEA8C22F4c9a377C68a1Ea3723C) (Unitroller implementation)
- [Liquidator](https://bscscan.com/address/0x1da2Fe628F50C14bc2A873A96B6D10392830621f)
- [VAIController](https://bscscan.com/address/0xE4109433CEE11172dcCaE80d9c3bcDDFF4A7Cf57)
- [VTokenDelegate](https://bscscan.com/address/0xA674296091B703e38dB2f3a937f02334627dCdaD)
- Facets:
    - [Market facet](https://bscscan.com/address/0xd47c074c219E6947BB350D9aD220eE20fCCC6549)
    - [Setter facet](https://bscscan.com/address/0x92B26cb819335DA336f59480F0ca30F9a3f18E0a)
    - [Policy facet](https://bscscan.com/address/0xF2095BeCa3030D43976ED46D5ca488D58354E8c9)
    - [Reward facet](https://bscscan.com/address/0x05e4C8f3dbb6c2eaD4eB1f28611FA7180e79f428)

BNB Chain testnet new implementations:

- [vBNBAdmin](https://testnet.bscscan.com/address/0x04109575c1dbB4ac2e59e60c783800ea10441BBe)
- [Diamond](https://testnet.bscscan.com/address/0x649616739bab52E2A98BC74d93c896Ca45944359) (Unitroller implementation)
- [Liquidator](https://testnet.bscscan.com/address/0xe442A62E3B1956EC5B42e06aA0E293A0cB300406)
- [VAIController](https://testnet.bscscan.com/address/0x5864e8BE0d4AD825feD65115a4f109f850A65aF7)
- [VTokenDelegate](https://testnet.bscscan.com/address/0x585C508aF088123d990182a19e655ebB0e540CA1)
- Facets:
    - [Market facet](https://testnet.bscscan.com/address/0x1c7B1e28A43619123F0bF9DB8aeEc64aA535b9EC)
    - [Setter facet](https://testnet.bscscan.com/address/0xeD1fd1D134b10dF8F84BbC3C89881A929B0c6F47)
    - [Policy facet](https://testnet.bscscan.com/address/0x642EE02aFBE47C69c0980Ea61131cD97884058a7)
    - [Reward facet](https://testnet.bscscan.com/address/0x1C10F03827530f514Ba14065ec3D5f1496f35418)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/610)
- [Solidity 0.8 codebase](https://github.com/VenusProtocol/venus-protocol/pull/607)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: bscmainnet.UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[])",
        params: [params],
      },
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [vBNB_ADMIN, vBNB_ADMIN_IMPL],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "_setPendingImplementation(address)",
        params: [DIAMOND],
      },
      {
        target: DIAMOND,
        signature: "_become(address)",
        params: [bscmainnet.UNITROLLER],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "_setComptrollerLens(address)",
        params: [COMPTROLLER_LENS],
      },
      {
        target: LIQUIDATOR_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [LIQUIDATOR, LIQUIDATOR_IMPL],
      },
      {
        target: VAI_CONTROLLER,
        signature: "_setPendingImplementation(address)",
        params: [VAI_CONTROLLER_IMPL],
      },
      {
        target: VAI_CONTROLLER_IMPL,
        signature: "_become(address)",
        params: [VAI_CONTROLLER],
      },
      ...Object.values(vTokens).map(vToken => ({
        target: vToken,
        signature: "_setImplementation(address,bool,bytes)",
        params: [VTOKEN_DELEGATE, false, "0x"],
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip545;
