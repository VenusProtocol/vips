import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { cutParams as params } from "../../simulations/vip-567/utils/bscmainnet-cut-params.json";

const { bscmainnet } = NETWORK_ADDRESSES;

export const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const NEW_VBEP20_DELEGATE_IMPL = "0x33D17F1E6107CD4d711b56eB0094bf39a471a8B5";
export const NEW_DIAMOND_IMPLEMENTATION = "0xB2243Da976F2cbAAa4dd1a76BF7F6EFbe22c4CFc";
export const NEW_COMPTROLLER_LENS = "0x732138e18fa6f8f8E456ad829DB429A450a79758";

export const CORE_MARKETS = [
  {
    symbol: "vUSDC",
    underlying: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    address: "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8",
  },
  {
    symbol: "vUSDT",
    underlying: "0x55d398326f99059fF775485246999027B3197955",
    address: "0xfD5840Cd36d94D7229439859C0112a4185BC0255",
  },
  {
    symbol: "vBUSD",
    underlying: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    address: "0x95c78222B3D6e262426483D42CfA53685A67Ab9D",
  },
  {
    symbol: "vSXP",
    underlying: "0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A",
    address: "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0",
  },
  {
    symbol: "vXVS",
    underlying: "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63",
    address: "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D",
  },
  {
    symbol: "vBTC",
    underlying: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    address: "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B",
  },
  {
    symbol: "vETH",
    underlying: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    address: "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8",
  },
  {
    symbol: "vLTC",
    underlying: "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94",
    address: "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B",
  },
  {
    symbol: "vXRP",
    underlying: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
    address: "0xB248a295732e0225acd3337607cc01068e3b9c10",
  },
  {
    symbol: "vBCH",
    underlying: "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf",
    address: "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176",
  },
  {
    symbol: "vDOT",
    underlying: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
    address: "0x1610bc33319e9398de5f57B33a5b184c806aD217",
  },
  {
    symbol: "vLINK",
    underlying: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
    address: "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f",
  },
  {
    symbol: "vDAI",
    underlying: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
    address: "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1",
  },
  {
    symbol: "vFIL",
    underlying: "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153",
    address: "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343",
  },
  {
    symbol: "vBETH",
    underlying: "0x250632378E573c6Be1AC2f97Fcdf00515d0Aa91B",
    address: "0x972207A639CC1B374B893cc33Fa251b55CEB7c07",
  },
  {
    symbol: "vADA",
    underlying: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
    address: "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec",
  },
  {
    symbol: "vDOGE",
    underlying: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
    address: "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71",
  },
  {
    symbol: "vMATIC",
    underlying: "0xCC42724C6683B7E57334c4E856f4c9965ED682bD",
    address: "0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8",
  },
  {
    symbol: "vCAKE",
    underlying: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    address: "0x86aC3974e2BD0d60825230fa6F355fF11409df5c",
  },
  {
    symbol: "vAAVE",
    underlying: "0xfb6115445Bff7b52FeB98650C87f44907E58f802",
    address: "0x26DA28954763B92139ED49283625ceCAf52C6f94",
  },
  {
    symbol: "vTUSDOLD",
    underlying: "0x14016E85a25aeb13065688cAFB43044C2ef86784",
    address: "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3",
  },
  {
    symbol: "vTRXOLD",
    underlying: "0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B",
    address: "0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93",
  },
  {
    symbol: "vTRX",
    underlying: "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3",
    address: "0xC5D3466aA484B040eE977073fcF337f2c00071c1",
  },
  {
    symbol: "vWBETH",
    underlying: "0xa2E3356610840701BDf5611a53974510Ae27E2e1",
    address: "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0",
  },
  {
    symbol: "vTUSD",
    underlying: "0x40af3827F39D0EAcBF4A168f8D4ee67c121D11c9",
    address: "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E",
  },
  {
    symbol: "vUNI",
    underlying: "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1",
    address: "0x27FF564707786720C71A2e5c1490A63266683612",
  },
  {
    symbol: "vFDUSD",
    underlying: "0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409",
    address: "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba",
  },
  {
    symbol: "vTWT",
    underlying: "0x4B0F1812e5Df2A09796481Ff14017e6005508003",
    address: "0x4d41a36D04D97785bcEA57b057C412b278e6Edcc",
  },
  {
    symbol: "vSolvBTC",
    underlying: "0x4aae823a6a0b376De6A78e74eCC5b079d38cBCf7",
    address: "0xf841cb62c19fCd4fF5CD0AaB5939f3140BaaC3Ea",
  },
  {
    symbol: "vTHE",
    underlying: "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11",
    address: "0x86e06EAfa6A1eA631Eab51DE500E3D474933739f",
  },
  {
    symbol: "vSOL",
    underlying: "0x570A5D26f7765Ecb712C0924E4De545B89fD43dF",
    address: "0xBf515bA4D1b52FFdCeaBF20d31D705Ce789F2cEC",
  },
  {
    symbol: "vlisUSD",
    underlying: "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5",
    address: "0x689E0daB47Ab16bcae87Ec18491692BF621Dc6Ab",
  },
  {
    symbol: "vPT-sUSDE-26JUN2025",
    underlying: "0xDD809435ba6c9d6903730f923038801781cA66ce",
    address: "0x9e4E5fed5Ac5B9F732d0D850A615206330Bf1866",
  },
  {
    symbol: "vsUSDe",
    underlying: "0x211Cc4DD073734dA055fbF44a2b4667d5E5fE5d2",
    address: "0x699658323d58eE25c69F1a29d476946ab011bD18",
  },
  {
    symbol: "vUSDe",
    underlying: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
    address: "0x74ca6930108F775CC667894EEa33843e691680d7",
  },
  {
    symbol: "vUSD1",
    underlying: "0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d",
    address: "0x0C1DA220D301155b87318B90692Da8dc43B67340",
  },
  {
    symbol: "vxSolvBTC",
    underlying: "0x1346b618dC92810EC74163e4c27004c921D446a5",
    address: "0xd804dE60aFD05EE6B89aab5D152258fD461B07D5",
  },
  {
    symbol: "vasBNB",
    underlying: "0x77734e70b6E88b4d82fE632a168EDf6e700912b6",
    address: "0xCC1dB43a06d97f736C7B045AedD03C6707c09BDF",
  },
  {
    symbol: "vWBNB",
    underlying: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    address: "0x6bCa74586218dB34cdB402295796b79663d816e9",
  },
  {
    symbol: "vslisBNB",
    underlying: "0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B",
    address: "0x89c910Eb8c90df818b4649b508Ba22130Dc73Adc",
  },
  {
    symbol: "vPT-USDe-30OCT2025",
    underlying: "0x607C834cfb7FCBbb341Cbe23f77A6E83bCf3F55c",
    address: "0x6D0cDb3355c93A0cD20071aBbb3622731a95c73E",
  },
];

export const vip567 = () => {
  const meta = {
    version: "v2",
    title: "VIP-567 [BNB Chain] Flash loan feature for all markets on BSC Mainnet",
    description: `#### Summary

If passed, following the community proposal “[Flashloan in the BNB Chain Core pool]()” ([snapshot]()), this VIP will upgrade the implementations of the following contracts on BNB Chain, including support for [Flashloan](https://docs-v4.venus.io/whats-new/emode):

- [Unitroller](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384)
- VTokens. Every current market on BNB Chain Core Pool, other than vBNB

- This upgrade implements the flash loan infrastructure that allows users to borrow assets without collateral as long as they repay the loan within the same transaction.

#### Description

This VIP will perform the following key actions:

- **Upgrade Unitroller implementation**: Deploy new Diamond-based implementation with flash loan facets
- **Update all vToken contracts**: Upgrade to new implementation supporting flash loan functionality  
- **Configure flash loan permissions**: Grant flash loan management permissions to governance timelocks and guardian
- **Update Comptroller Lens**: Deploy new lens contract

**Granted permissions**

- Normal, Fast-track, Critical timelocks and Guardian are authorized to execute the following functions:
    - "setWhiteListFlashLoanAccount(address,bool)"
    - "setFlashLoanPaused(bool)"
    - "setFlashLoanEnabled(bool)"
    - "setFlashLoanFeeMantissa(uint256,uint256)"

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Audits:** [Certik](https://www.certik.com/), [Quantstamp](https://quantstamp.com/) and [HashDit](https://www.hashdit.io/) have audited the deployed code
- **VIP execution simulation**: in a simulation environment, validating that the new implementations (including the Comptroller facets), the updated permissions and the risk parameters are properly set on BNB Chain
- **Deployment on testnet**: the same upgrade has been performed on BNB Chain testnet, and used in the Venus Protocol testnet deployment

#### Audit reports

- [Certik audit audit report (2025/10/14)](https://github.com/VenusProtocol/venus-protocol/blob/648e794cf1b422650d11c4d0c947ba2aaf1f290d/audits/153_flashloan_certik_20251014.pdf)
- [HashDit audit report (2025/10/16)](https://github.com/VenusProtocol/venus-protocol/blob/648e794cf1b422650d11c4d0c947ba2aaf1f290d/audits/155_flashloan_hashdit_20251016.pdf)
- [Quantstamp (2025/10/22)](https://github.com/VenusProtocol/venus-protocol/blob/648e794cf1b422650d11c4d0c947ba2aaf1f290d/audits/154_flashloan_quantstamp_20252210.pdf)

#### Deployed contracts

BNB Chain

- [Unitroller implementation (Diamond)](https://bscscan.com/address/0xB2243Da976F2cbAAa4dd1a76BF7F6EFbe22c4CFc)
- Facets:
    - [MarketFacet](https://bscscan.com/address/0x7ec871BA4248CC443a994f2febeDFB96DAe444F1)
    - [PolicyFacet](https://bscscan.com/address/0x3C115aA5800A589D1E0c3163f3f562D5544F060f)
    - [RewardFacet](https://bscscan.com/address/0x7fcEc39e83f17469069b7A0f24A59B5BbEC0faBb)
    - [SetterFacet](https://bscscan.com/address/0x11B38582c61058eDd9a526561567B4c7b02060e7)
    - [FlashLoanFacet](https://bscscan.com/address/0x72a284f144F2BE56549573DDFac2A90F8D662ed1)
- [VBep20 (VToken implementation)](https://bscscan.com/address/0x33D17F1E6107CD4d711b56eB0094bf39a471a8B5)
- [ComptrollerLens](https://bscscan.com/address/0x732138e18fa6f8f8E456ad829DB429A450a79758)

BNB Chain testnet

- [Unitroller implementation (Diamond)](http://testnet.bscscan.com/address/0x1774f993861B14B7C3963F3e09f67cfBd2B32198)
- Facets:
    - [MarketFacet](https://testnet.bscscan.com/address/0x0A7A88aB6aB40417Bd6bF1EB3907EFF06D24C2FC)
    - [PolicyFacet](https://testnet.bscscan.com/address/0xf8d94ef23c1188f8ab1009E56D558d7834d1F019)
    - [RewardFacet](https://testnet.bscscan.com/address/0x0bc7922Cc08Ea32E196d25805558a84dF54beC6a)
    - [SetterFacet](https://testnet.bscscan.com/address/0x4fc4C41388237D13A430879417f143EF54e5BB05)
    - [FlashLoanFacet](https://testnet.bscscan.com/address/0x32348c5bB52E5468A11901e70BdE061192feCAf4)
- [VBep20 (VToken implementation)](https://testnet.bscscan.com/address/0xb941C5D148c65Ce49115D12B5148247AaCeFF375)
- [ComptrollerLens](https://testnet.bscscan.com/address/0x72dCB93F8c3fB00D31076e93b6E87C342A3eCC9c)

#### References

- [Flashloan feature](https://github.com/VenusProtocol/venus-protocol/pull/545)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/609)
- [Upgrade on BNB Chain testnet](https://testnet.bscscan.com/tx/0x46016e8d58873c93864bc725b425fc878e20097d90c0e1d247fab072be7fcedc)`,
    forDescription: "Execute",
    againstDescription: "Do not execute",
    abstainDescription: "Abstain",
  };
  return makeProposal(
    [
      {
        target: UNITROLLER,
        signature: "_setPendingImplementation(address)",
        params: [NEW_DIAMOND_IMPLEMENTATION],
      },
      {
        target: NEW_DIAMOND_IMPLEMENTATION,
        signature: "_become(address)",
        params: [UNITROLLER],
      },
      {
        target: UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[])",
        params: [params],
      },
      ...CORE_MARKETS.map(vToken => {
        return {
          target: vToken.address,
          signature: "_setImplementation(address,bool,bytes)",
          params: [NEW_VBEP20_DELEGATE_IMPL, false, "0x"],
        };
      }),
      ...[
        bscmainnet.NORMAL_TIMELOCK,
        bscmainnet.FAST_TRACK_TIMELOCK,
        bscmainnet.CRITICAL_TIMELOCK,
        bscmainnet.GUARDIAN,
      ].map((timelock: string) => ({
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, "setWhiteListFlashLoanAccount(address,bool)", timelock],
      })),
      ...[
        bscmainnet.NORMAL_TIMELOCK,
        bscmainnet.FAST_TRACK_TIMELOCK,
        bscmainnet.CRITICAL_TIMELOCK,
        bscmainnet.GUARDIAN,
      ].map((timelock: string) => ({
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, "setFlashLoanPaused(bool)", timelock],
      })),
      ...[
        bscmainnet.NORMAL_TIMELOCK,
        bscmainnet.FAST_TRACK_TIMELOCK,
        bscmainnet.CRITICAL_TIMELOCK,
        bscmainnet.GUARDIAN,
      ].map((timelock: string) => ({
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setFlashLoanEnabled(bool)", timelock],
      })),
      ...[
        bscmainnet.NORMAL_TIMELOCK,
        bscmainnet.FAST_TRACK_TIMELOCK,
        bscmainnet.CRITICAL_TIMELOCK,
        bscmainnet.GUARDIAN,
      ].map((timelock: string) => ({
        target: bscmainnet.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setFlashLoanFeeMantissa(uint256,uint256)", timelock],
      })),
      {
        target: UNITROLLER,
        signature: "_setComptrollerLens(address)",
        params: [NEW_COMPTROLLER_LENS],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip567;
