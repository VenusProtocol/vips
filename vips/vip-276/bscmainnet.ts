import { ZERO_ADDRESS } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { cutParams as params } from "../../simulations/vip-276/utils/bscmainnet-cut-params.json";
import { accounts1, accounts2 } from "./users";

export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
export const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
export const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
export const ACM = "0x4788629abc6cfca10f9f969efdeaa1cf70c23555";

export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
export const XVSVTOKEN = "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D";
export const DIAMOND = "0x347ba9559fFC65A94af0F6a513037Cd4982b7b18";

export const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const NEW_VBEP20_DELEGATE_IMPL = "0x6E5cFf66C7b671fA1D5782866D80BD15955d79F6";

export const COMPTROLLER_BEACON = "0x38B4Efab9ea1bAcD19dC81f19c4D1C2F9DeAe1B2";
export const VTOKEN_BEACON = "0x2b8A1C539ABaC89CbF7E2Bc6987A0A38A5e660D4";
export const NEW_COMPTROLLER_IMPLEMENTATION = "0x011a2ED16EBCbcAE5CC97B1d4c7319d19a9fad06";
export const NEW_VTOKEN_IMPLEMENTATION = "0x1EC822383805FfDb9dC2Ae456DF8C0Ca2Bf14d7d";
export const NATIVE_TOKEN_GATEWAY = "0x24896601A4bf1b6a27E51Cb3eff750Bd9FE00d08";

export const CORE_MARKETS = [
  {
    name: "vAAVE",
    address: "0x26da28954763b92139ed49283625cecaf52c6f94",
    holder: "0xf68a4b64162906eff0ff6ae34e2bb1cd42fef62d",
  },
  {
    name: "vADA",
    address: "0x9a0af7fdb2065ce470d72664de73cae409da28ec",
    holder: "0x86523c87c8ec98c7539e2c58cd813ee9d1a08d96",
  },
  {
    name: "vBCH",
    address: "0x5f0388ebc2b94fa8e123f404b79ccf5f40b29176",
    holder: "0xf977814e90da44bfa03b6295a0616a897441acec",
  },
  {
    name: "vBETH",
    address: "0x972207a639cc1b374b893cc33fa251b55ceb7c07",
    holder: "0xf977814e90da44bfa03b6295a0616a897441acec",
  },
  {
    name: "vBTC",
    address: "0x882c173bc7ff3b7786ca16dfed3dfffb9ee7847b",
    holder: "0xf977814e90da44bfa03b6295a0616a897441acec",
  },
  {
    name: "vBUSD",
    address: "0x95c78222b3d6e262426483d42cfa53685a67ab9d",
    holder: "0x0000000000000000000000000000000000001004",
  },
  {
    name: "vCAKE",
    address: "0x86ac3974e2bd0d60825230fa6f355ff11409df5c",
    holder: "0x000000000000000000000000000000000000dead",
  },
  {
    name: "vDAI",
    address: "0x334b3ecb4dca3593bccc3c7ebd1a1c1d1780fbf1",
    holder: "0xf977814e90da44bfa03b6295a0616a897441acec",
  },
  {
    name: "vDOGE",
    address: "0xec3422ef92b2fb59e84c8b02ba73f1fe84ed8d71",
    holder: "0x0000000000000000000000000000000000001004",
  },
  {
    name: "vDOT",
    address: "0x1610bc33319e9398de5f57b33a5b184c806ad217",
    holder: "0x835678a611b28684005a5e2233695fb6cbbb0007",
  },
  {
    name: "vETH",
    address: "0xf508fcd89b8bd15579dc79a6827cb4686a3592c8",
    holder: "0xf977814e90da44bfa03b6295a0616a897441acec",
  },
  {
    name: "vFDUSD",
    address: "0xc4ef4229fec74ccfe17b2bdef7715fac740ba0ba",
    holder: "0xf977814e90da44bfa03b6295a0616a897441acec",
  },
  {
    name: "vFIL",
    address: "0xf91d58b5ae142dacc749f58a49fcbac340cb0343",
    holder: "0x835678a611b28684005a5e2233695fb6cbbb0007",
  },
  {
    name: "vLINK",
    address: "0x650b940a1033b8a1b1873f78730fcfc73ec11f1f",
    holder: "0xf977814e90da44bfa03b6295a0616a897441acec",
  },
  {
    name: "vLTC",
    address: "0x57a5297f2cb2c0aac9d554660acd6d385ab50c6b",
    holder: "0xf977814e90da44bfa03b6295a0616a897441acec",
  },
  {
    name: "vMATIC",
    address: "0x5c9476fcd6a4f9a3654139721c949c2233bbbbc8",
    holder: "0xf89d7b9c864f589bbf53a82105107622b35eaa40",
  },
  {
    name: "vSXP",
    address: "0x2ff3d0f6990a40261c66e1ff2017acbc282eb6d0",
    holder: "0x44cf30ea4e58818bfae4b8499be409cd4fdd5a20",
  },
  {
    name: "vTRX",
    address: "0xc5d3466aa484b040ee977073fcf337f2c00071c1",
    holder: "0xf977814e90da44bfa03b6295a0616a897441acec",
  },
  {
    name: "vTRXOLD",
    address: "0x61edcfe8dd6ba3c891cb9bec2dc7657b3b422e93",
    holder: "0xe2fc31f816a9b94326492132018c3aecc4a93ae1",
  },
  {
    name: "vTUSD",
    address: "0xbf762cd5991ca1dcddac9ae5c638f5b5dc3bee6e",
    holder: "0xf977814e90da44bfa03b6295a0616a897441acec",
  },
  {
    name: "vTUSDOLD",
    address: "0x08ceb3f4a7ed3500ca0982bcd0fc7816688084c3",
    holder: "0x2e28b9b74d6d99d4697e913b82b41ef1cac51c6c",
  },
  {
    name: "vUNI",
    address: "0x27ff564707786720c71a2e5c1490a63266683612",
    holder: "0x0000000000000000000000000000000000001004",
  },
  {
    name: "vUSDC",
    address: "0xeca88125a5adbe82614ffc12d0db554e2e2867c8",
    holder: "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3",
  },
  {
    name: "vUSDT",
    address: "0xfd5840cd36d94d7229439859c0112a4185bc0255",
    holder: "0xee5b5b923ffce93a870b3104b7ca09c3db80047a",
  },
  {
    name: "vWBETH",
    address: "0x6cfdec747f37daf3b87a35a1d9c8ad3063a1a8a0",
    holder: "0xf977814e90da44bfa03b6295a0616a897441acec",
  },
  {
    name: "vXRP",
    address: "0xb248a295732e0225acd3337607cc01068e3b9c10",
    holder: "0x5a52e96bacdabb82fd05763e25335261b270efcb",
  },
  {
    name: "vXVS",
    address: "0x151b1e2635a717bcdc836ecd6fbb62b674fe3e1d",
    holder: "0xfd36e2c2a6789db23113685031d7f16329158384",
  },
];

export const vip276 = () => {
  const meta = {
    version: "v2",
    title: "VIP-276 Recover XVS rewards from bad debtors and enable the NativeTokenGateway on the WBNB market",
    description: `#### Summary

Following this [Community’s proposal](https://community.venus.io/t/proposal-bnb-bridge-exploiter-account-remediation/3974), if this VIP passes, it will perform the following actions:

- Upgrade the implementations of the Comptroller and VTokens in the core pool, and the Comptrollers and the VTokens in the Isolated pools, adding the following features:
    - Allow the Venus Community to recover XVS rewards allocated to wallets
    - Integration of the NativeTokenGateway contracts, which will allow users to interact with "wrap markets" (like WBNB) using the native token (i.e. BNB)
- Recover all XVS rewards from 6 wallets whose bad debt was removed in the [VIP-244](https://app.venus.io/#/governance/proposal/244), for an estimated total of 254,000 XVS.
- Enable the NativeTokenGateway contract for the WBNB market on the [Liquid Staked BNB](https://app.venus.io/#/isolated-pools/pool/0xd933909A4a2b7A4638903028f44D1d38ce27c352?chainId=56) pool

#### Description

In [VIP-244](https://app.venus.io/#/governance/proposal/244), the bad debt of 19 accounts was moved from their balances. These accounts accrued XVS rewards in the past. This VIP will recover the XVS rewards allocated to 6 of these accounts. In a different VIP (due to gas cost limitations), the XVS rewards of the rest of the accounts involved in the VIP-244 will be recovered.

The recovered XVS (around 254K) will be sent to the [XVS Distributor contract](https://bscscan.com/address/0xfD36E2c2a6789Db23113685031d7F16329158384), on BNB Chain.

Wrapped tokens of the native tokens (for example WBNB for BNB on BNB Chain, or WETH for ETH on Ethereum) are usual on DeFi protocols. They introduce an extra step for the users, who have to wrap the native token into the wrapped version before interacting with the protocol. The new [NativeTokenGateway](https://github.com/VenusProtocol/isolated-pools/blob/main/contracts/Gateway/NativeTokenGateway.sol) contract (one per "wrap market") will simplify this process, allowing the users to interact with the WBNB market, for example, directly using BNBs. The following flows are available:

1. **Supply native tokens to the "wrap market"**. For example, the user will be able to supply BNB into the WBNB market
2. **Withdraw native tokens from a "wrap market"**. For example, the user will be able to receive directly BNB withdrawing from the WBNB market
3. **Borrow native tokens from a "wrap market"**. For example, the user will be able to receive directly BNB borrowing from the WBNB market
4. **Repay with native tokens debt in a "wrap market"**. For example, the user will be able to repay with BNB the debt on the WBNB market

The NativeTokenGateway contract uses a new feature available in the new Comptrollers (Core pool and Isolated pools): **approve delegates**, who will be authorized to borrow and redeem on behalf of the original wallet. The NativeTokenGateway contracts must be authorized by the user (flow integrated in the [official Venus UI](https://app.venus.io/)), before enabling flows 2 and 3 previously mentioned.

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Audits**: [Quantstamp](https://quantstamp.com/), [Certik](https://www.certik.com/), and [Pessimistic](https://pessimistic.io/) have audited the deployed code
- **VIP execution simulation**: in a simulation environment, validating the upgrades are performed as expected, and the new features are available
- **Deployment on testnet**: the same upgrades have been performed on BNB testnet, and used in the Venus Protocol testnet environment

#### Audit reports

- [Quantstamp audit audit report](https://github.com/VenusProtocol/isolated-pools/blob/0ec94f4636e51d68197fe6918df096864acd0a23/audits/096_nativeTokenGateway_quantstamp_20240301.pdf) (2024/03/01)
- [Certik audit audit report](https://github.com/VenusProtocol/isolated-pools/blob/652459fed7269dab84628f70c44d8fa56b34203e/audits/092_nativeTokenGateway_certik_20240226.pdf) (2024/02/26)
- [Pessimistic audit audit report](https://github.com/VenusProtocol/isolated-pools/blob/652459fed7269dab84628f70c44d8fa56b34203e/audits/095_nativeTokenGateway_pessimistic_20240229.pdf) (2024/02/29)

#### Deployed contracts

- [NativeTokenGateway for the WBNB market in the Liquid Staked BNB pool](https://bscscan.com/address/0x24896601A4bf1b6a27E51Cb3eff750Bd9FE00d08)
- [New implementation of the Comptroller in the Core pool](https://bscscan.com/address/0x347ba9559fFC65A94af0F6a513037Cd4982b7b18)
- [New implementation of the VTokens in the Core pool](https://bscscan.com/address/0x6E5cFf66C7b671fA1D5782866D80BD15955d79F6)
- [New implementation of the Comptrollers in the Isolated pools](https://bscscan.com/address/0x011a2ED16EBCbcAE5CC97B1d4c7319d19a9fad06)
- [New implementation of the VTokens in the Isolated pools](https://bscscan.com/address/0x1EC822383805FfDb9dC2Ae456DF8C0Ca2Bf14d7d)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/195)
- [Documentation](https://docs-v4.venus.io/technical-reference/reference-technical-articles/native-token-gateway)
- [NativeTokenGateway source code](https://github.com/VenusProtocol/isolated-pools/blob/main/contracts/Gateway/NativeTokenGateway.sol)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: UNITROLLER,
        signature: "_setPendingImplementation(address)",
        params: [DIAMOND],
      },
      {
        target: DIAMOND,
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
      {
        target: COMPTROLLER_BEACON,
        signature: "upgradeTo(address)",
        params: [NEW_COMPTROLLER_IMPLEMENTATION],
      },
      {
        target: VTOKEN_BEACON,
        signature: "upgradeTo(address)",
        params: [NEW_VTOKEN_IMPLEMENTATION],
      },
      {
        target: NATIVE_TOKEN_GATEWAY,
        signature: "acceptOwnership()",
        params: [],
      },

      ...[NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK].map((timelock: string) => ({
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [UNITROLLER, "seizeVenus(address[],address)", timelock],
      })),

      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [ZERO_ADDRESS, "setLastRewardingBlocks(address[],uint32[],uint32[])", NORMAL_TIMELOCK],
      },

      {
        target: UNITROLLER,
        signature: "_setXVSToken(address)",
        params: [XVS],
      },
      {
        target: UNITROLLER,
        signature: "_setXVSVToken(address)",
        params: [XVSVTOKEN],
      },
      {
        target: UNITROLLER,
        signature: "seizeVenus(address[],address)",
        params: [accounts1, UNITROLLER],
      },
      {
        target: UNITROLLER,
        signature: "seizeVenus(address[],address)",
        params: [accounts2, UNITROLLER],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip276;
