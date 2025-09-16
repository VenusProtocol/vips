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
    title: "VIP-545",
    description: ``,
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
