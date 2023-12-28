import { makeProposal } from "../../../src/utils";

export interface VenusMarket {
  name: string;
  address: string;
}

const ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
const PROTOCOL_SHARE_RESERVE = "0xbea70755cc3555708ca11219adB0db4C80F6721B";
const POOL_REGISTRY = "0x758f5715d817e02857Ba40889251201A5aE3E186";
const VTREASURY = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";
const SEPOLIA_MULTISIG = "0x94fa6078b6b8a26F0B6EDFFBE6501B22A10470fB";

const MARKETS: VenusMarket[] = [
  {
    name: "vCRV_Core",
    address: "0x121E3be152F283319310D807ed847E8b98319C1e",
  },
  {
    name: "vcrvUSD_Core",
    address: "0xA09cFAd2e138fe6d8FF62df803892cbCb79ED082",
  },
  {
    name: "vUSDC_Core",
    address: "0xF87bceab8DD37489015B426bA931e08A4D787616",
  },
  {
    name: "vUSDT_Core",
    address: "0x19252AFD0B2F539C400aEab7d460CBFbf74c17ff",
  },
  {
    name: "vWBTC_Core",
    address: "0x74E708A7F5486ed73CCCAe54B63e71B1988F1383",
  },
  {
    name: "vWETH_Core",
    address: "0xc2931B1fEa69b6D6dA65a50363A8D75d285e4da9",
  },
  {
    name: "vcrvUSD_Stablecoins",
    address: "0x9C5e7a3B4db931F07A6534f9e44100DDDc78c408",
  },
  {
    name: "vUSDC_Stablecoins",
    address: "0xD5f83FCbb4a62779D0B37b9E603CD19Ad84884F0",
  },
  {
    name: "vUSDT_Stablecoins",
    address: "0x93dff2053D4B08823d8B39F1dCdf8497f15200f4",
  },
  {
    name: "vCRV_Curve",
    address: "0x9Db62c5BBc6fb79416545FcCBDB2204099217b78",
  },
  {
    name: "vcrvUSD_Curve",
    address: "0xc7be132027e191636172798B933202E0f9CAD548",
  },
];

// ProtocolShareReserve post-deployment configuration
export const vip005 = () => {
  return makeProposal([
    {
      target: PROTOCOL_SHARE_RESERVE,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PROTOCOL_SHARE_RESERVE, "addOrUpdateDistributionConfigs(DistributionConfig[])", SEPOLIA_MULTISIG],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [PROTOCOL_SHARE_RESERVE, "removeDistributionConfig(Schema,address)", SEPOLIA_MULTISIG],
    },
    {
      target: PROTOCOL_SHARE_RESERVE,
      signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
      params: [
        [
          [0, 10000, VTREASURY],
          [1, 10000, VTREASURY],
        ],
      ],
    },
    {
      target: PROTOCOL_SHARE_RESERVE,
      signature: "setPoolRegistry(address)",
      params: [POOL_REGISTRY],
    },
    ...MARKETS.map(market => {
      return {
        target: market.address,
        signature: "setProtocolShareReserve(address)",
        params: [PROTOCOL_SHARE_RESERVE],
      };
    }),
  ]);
};
