import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";

const { ethereum, arbitrumone, basemainnet } = NETWORK_ADDRESSES;

// The ACM string EBrake checks for the per-pool snapshot reset
export const RESET_POOL_CF_SNAPSHOT = "resetCFSnapshot(address,uint96)";

export const REMOTE_CHAINS = [
  {
    name: "Ethereum",
    dstChainId: LzChainId.ethereum,
    acm: ethereum.ACCESS_CONTROL_MANAGER,
    coreComptroller: ethereum.CORE_COMPTROLLER,
    proxyAdmin: "0xA6a4E5196Fa108008b68fE6D6629D508C902D61c",
    eBrake: "0xCD09042c5DFFed762998Df9a058ec5944e39949B",
    newImplementation: "0x1902BDb7998d4583F01a20A01f5d9CDaF19D2C90",
  },
  {
    name: "Arbitrum One",
    dstChainId: LzChainId.arbitrumone,
    acm: arbitrumone.ACCESS_CONTROL_MANAGER,
    coreComptroller: arbitrumone.CORE_COMPTROLLER,
    proxyAdmin: "0x9fa1031e7f9578e9D4A260CF0dF79D4540CD1836",
    eBrake: "0xFc4CE7Ca9BB5119705Cfb84d6e4476e8a4032b26",
    newImplementation: "0xb61D283D201C2bee9Ed38e9Fb8D919A5F0AFf3eA",
  },
  {
    name: "Base",
    dstChainId: LzChainId.basemainnet,
    acm: basemainnet.ACCESS_CONTROL_MANAGER,
    coreComptroller: basemainnet.CORE_COMPTROLLER,
    proxyAdmin: "0x70d73Ee950F2436483b6E410915CB53D473f6EB1",
    eBrake: "0x062C68Af7B9Fb059DCB7FA4B6b92E633350fb7c2",
    newImplementation: "0x683A15b6F9b989CEc5f255d074050Dd1cb28e564",
  },
];
