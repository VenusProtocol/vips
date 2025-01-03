import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { sepolia } = NETWORK_ADDRESSES;
export const DEFAULT_PROXY_ADMIN = "0xe98a3110929c6650c73031756288Ec518f65e846";
export const CONVERTERS = [
  "0xCCB08e5107b406E67Ad8356023dd489CEbc79B40",
  "0x3716C24EA86A67cAf890d7C9e4C4505cDDC2F8A2",
  "0x511a559a699cBd665546a1F75908f7E9454Bfc67",
  "0x8a3937F27921e859db3FDA05729CbCea8cfd82AE",
  "0x274a834eFFA8D5479502dD6e78925Bc04ae82B46",
  "0xc203bfA9dCB0B5fEC510Db644A494Ff7f4968ed2",
];
export const SINGLE_TOKEN_CONVERTER_BEACON = "0xb86e532a5333d413A1c35d86cCdF1484B40219eF";
export const CONVERTER_NETWORK = "0xB5A4208bFC4cC2C4670744849B8fC35B21A690Fa";
export const PRIME = "0x2Ec432F123FEbb114e6fbf9f4F14baF0B1F14AbC";
export const PLP = "0x15242a55Ad1842A1aEa09c59cf8366bD2f3CE9B4";
export const REWARD_DISTRIBUTORS = [
  "0xB60666395bEFeE02a28938b75ea620c7191cA77a",
  "0x341f52BfecC10115087e46eB94AA06E384b8925E",
  "0x67dA6435b35d43081c7c27685fAbb2662b7f1290",
  "0xF6D57F8e37b1cb627470b5254fAb08dE07B49A0F",
  "0x4597B9287fE0DF3c5513D66886706E0719bD270f",
  "0xec594364d2B7eB3678f351Ac632cC71E718E0F89",
  "0x92e8E3C202093A495e98C10f9fcaa5Abe288F74A",
];
export const PSR = "0xbea70755cc3555708ca11219adB0db4C80F6721B";
export const COMPTROLLER_BEACON = "0x6cE54143a88CC22500D49D744fb6535D66a8294F";
export const VTOKEN_BEACON = "0x0463a7E5221EAE1990cEddB51A5821a68cdA6008";
export const ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
export const POOL_REGISTRY = "0x758f5715d817e02857Ba40889251201A5aE3E186";

export const COMPTROLLERS = ["0x7Aa39ab4BcA897F403425C9C6FDbd0f882Be0D70"];

export const VTOKENS = [
  "0xA09cFAd2e138fe6d8FF62df803892cbCb79ED082",
  "0x121E3be152F283319310D807ed847E8b98319C1e",
  "0xfe050f628bF5278aCfA1e7B13b59fF207e769235",
  "0xE23A1fC1545F1b072308c846a38447b23d322Ee2",
  "0xF87bceab8DD37489015B426bA931e08A4D787616",
  "0x19252AFD0B2F539C400aEab7d460CBFbf74c17ff",
  "0x74E708A7F5486ed73CCCAe54B63e71B1988F1383",
  "0xc2931B1fEa69b6D6dA65a50363A8D75d285e4da9",
  "0x33942B932159A67E3274f54bC4082cbA4A704340",
  "0x18995825f033F33fa30CF59c117aD21ff6BdB48c",
  "0xc7be132027e191636172798B933202E0f9CAD548",
  "0x9Db62c5BBc6fb79416545FcCBDB2204099217b78",
  "0xF4C1B7528f8B266D8ADf1a85c91d93114FeDbA2A",
  "0x3AF2bE7AbEF0f840b196D99d79F4B803a5dB14a1",
  "0x20a83DE526F2CF2fCec2131E07b11F956d8f3Cdf",
  "0x83F63118dcAAdAACBFF36D78ffB88dd474309e70",
  "0x9f6213dFa9069a5426Fe8fAE73857712E1259Ed4",
  "0x0a95088403229331FeF1EB26a11F9d6C8E73f23D",
  "0x30c31bA6f4652B548fe7a142A949987c3f3Bf80b",
  "0x9C5e7a3B4db931F07A6534f9e44100DDDc78c408",
  "0xD5f83FCbb4a62779D0B37b9E603CD19Ad84884F0",
  "0x93dff2053D4B08823d8B39F1dCdf8497f15200f4",
  "0xB3A201887396F57bad3fF50DFd02022fE1Fd1774",
  "0x6DB4aDbA8F144a57a397b57183BF619e957040B1",
  "0x315F064cF5B5968fE1655436e1856F3ca558d395",
  "0xf2C00a9C3314f7997721253c49276c8531a30803",
  "0x6c87587b1813eAf5571318E2139048b04eAaFf97",
  "0xF87bceab8DD37489015B426bA931e08A4D787616",
  "0x466fe60aE3d8520e49D67e3483626786Ba0E6416",
  "0x8E6241389e823111259413810b81a050bd45e5cE",
  "0x1E4d64B7c6f1F71969E5137B5Ee8cBa9Ab9c9356",
  "0x643a2BE96e7675Ca34bcceCB33F4f0fECA1ba9fC"
];
export const XVS_STORE = "0x03B868C7858F50900fecE4eBc851199e957b5d3D";
export const XVS_BRIDGE_ADMIN_PROXY = "0xd3c6bdeeadB2359F726aD4cF42EAa8B7102DAd9B";
export const XVS = "0x66ebd019E86e0af5f228a0439EBB33f045CBe63E";
export const BOUND_VALIDATOR = "0x60c4Aa92eEb6884a76b309Dd8B3731ad514d6f9B";
export const SFrxETHOracle = "0x61EB836afA467677e6b403D504fe69D6940e7996";

export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const NTGs = [
  "0xb8fD67f215117FADeF06447Af31590309750529D",
  "0x1FD30e761C3296fE36D9067b1e398FD97B4C0407"
]

const vip071 = () => {
  return makeProposal([
    {
      target: DEFAULT_PROXY_ADMIN,
      signature: "transferOwnership(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },
    {
      target: SINGLE_TOKEN_CONVERTER_BEACON,
      signature: "transferOwnership(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },
    {
      target: CONVERTER_NETWORK,
      signature: "transferOwnership(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },
    ...CONVERTERS.map(converter => {
      return {
        target: converter,
        signature: "transferOwnership(address)",
        params: [sepolia.NORMAL_TIMELOCK],
      };
    }),
    {
      target: PRIME,
      signature: "transferOwnership(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },
    {
      target: PLP,
      signature: "transferOwnership(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },
    ...REWARD_DISTRIBUTORS.map(rewardDistributor => {
      return {
        target: rewardDistributor,
        signature: "transferOwnership(address)",
        params: [sepolia.NORMAL_TIMELOCK],
      };
    }),
    {
      target: PSR,
      signature: "transferOwnership(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },
    {
      target: COMPTROLLER_BEACON,
      signature: "transferOwnership(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },
    {
      target: VTOKEN_BEACON,
      signature: "transferOwnership(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },
    {
      target: POOL_REGISTRY,
      signature: "transferOwnership(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },
    ...COMPTROLLERS.map(comptroller => {
      return {
        target: comptroller,
        signature: "transferOwnership(address)",
        params: [sepolia.NORMAL_TIMELOCK],
      };
    }),
    ...VTOKENS.map(comptroller => {
      return {
        target: comptroller,
        signature: "transferOwnership(address)",
        params: [sepolia.NORMAL_TIMELOCK],
      };
    }),
    {
      target: sepolia.XVS_VAULT_PROXY,
      signature: "_setPendingAdmin(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },
    {
      target: XVS_STORE,
      signature: "setPendingAdmin(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },
    {
      target: XVS_BRIDGE_ADMIN_PROXY,
      signature: "transferOwnership(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },
    {
      target: XVS,
      signature: "transferOwnership(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.RESILIENT_ORACLE,
      signature: "transferOwnership(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.CHAINLINK_ORACLE,
      signature: "transferOwnership(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },
    {
      target: sepolia.REDSTONE_ORACLE,
      signature: "transferOwnership(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },
    {
      target: BOUND_VALIDATOR,
      signature: "transferOwnership(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },
    {
      target: SFrxETHOracle,
      signature: "transferOwnership(address)",
      params: [sepolia.NORMAL_TIMELOCK],
    },
    ...NTGs.map(NTG => {
      return {
        target: NTG,
        signature: "transferOwnership(address)",
        params: [sepolia.NORMAL_TIMELOCK],
      };
    })
  ]);
};

export default vip071;
