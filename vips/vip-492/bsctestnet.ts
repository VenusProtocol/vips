import { ethers } from "hardhat";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const RESILIENT_ORACLE_BASE_SEPOLIA = "0xC34871C982cf0Bc6e7aCa2c2670Bc319bDA1C744";
export const CHAINLINK_ORACLE_ORACLE_BASE_SEPOLIA = "0x801aB33A69AD867500fbCda7b3dB66C73151494b";
export const REDSTONE_ORACLE_ORACLE_BASE_SEPOLIA = "0x8267FE3f75E0A37ee34e113E767F9C9727206838";
export const BOUND_VALIDATOR_BASE_SEPOLIA = "0xC76284488E57554A457A75a8b166fB2ADAB430dB";
export const DEFAULT_PROXY_ADMIN_BASE_SEPOLIA = "0xB85dD19112c4BF1240FeD0f26E8D0b0576a82546";
export const RESILIENT_ORACLE_IMPLEMENTATION_BASE_SEPOLIA = "0xe8c39006906a9015adC87996AcD1af20f514fdE6";
export const CHAINLINK_ORACLE_IMPLEMENTATION_BASE_SEPOLIA = "0x238F42Bc8E204583877d670891dF1f67a861ef0a";
export const REDSTONE_ORACLE_IMPLEMENTATION_BASE_SEPOLIA = "0x91eEfAb71a8BD1E4f2889D51806407cD55DBF2fC";
export const BOUND_VALIDATOR_IMPLEMENTATION_BASE_SEPOLIA = "0xae3C407A1C30Ac7A55A97B6A55927f6a2580bD4f";
export const wSuperOETHb_ORACLE = "0x6F6e9Fd240372435eb16dBE36362ECdF84AB0399";
export const wSuperOETHb = "0x02B1136d9E223333E0083aeAB76bC441f230a033";
export const wstETHOracle = "0xB242450Ab1CBdd93409ee22c333F6f70aaA6Be08";
export const wstETH = "0xAd69AA3811fE0EE7dBd4e25C4bae40e6422c76C8";

export const RESILIENT_ORACLE_OP_SEPOLIA = "0x6c01ECa2B5C97F135406a3A5531445A7d977D28e";
export const CHAINLINK_ORACLE_OP_SEPOLIA = "0x493C3f543AEa37EefF17D823f27Cb1feAB9f3143";
export const BOUND_VALIDATOR_OP_SEPOLIA = "0x482469F1DA6Ec736cacF6361Ec41621f811A6800";
export const DEFAULT_PROXY_ADMIN_OP_SEPOLIA = "0xa9aaf2A1cCf2C3a87997942abaA740887cC89241";
export const RESILIENT_ORACLE_IMPLEMENTATION_OP_SEPOLIA = "0xe36F76dc26885CcEce97B96f80f4FA58c89772Fc";
export const CHAINLINK_ORACLE_IMPLEMENTATION_OP_SEPOLIA = "0x15242a55Ad1842A1aEa09c59cf8366bD2f3CE9B4";
export const BOUND_VALIDATOR_IMPLEMENTATION_OP_SEPOLIA = "0xca8c824E577e1E2EDF4442cB46046ab000FE76CF";

export const RESILIENT_ORACLE_UNICHAIN_SEPOLIA = "0xA469E718BDE2C9939bD29529A38184e97dF0A741";
export const REDSTONE_ORACLE_UNICHAIN_SEPOLIA = "0x8683D6902A669Ac479cfcCf2542724a133D4d872";
export const BOUND_VALIDATOR_UNICHAIN_SEPOLIA = "0x51C9F57Ffc0A4dD6d135aa3b856571F5A4e4C6CB";
export const DEFAULT_PROXY_ADMIN_UNICHAIN_SEPOLIA = "0x256735eFdfDf135bD6991854e0065909e57804aa";
export const RESILIENT_ORACLE_IMPLEMENTATION_UNICHAIN_SEPOLIA = "0x4E953e3741a17aFaD69776742d1ED1c0130F43f7";
export const REDSTONE_ORACLE_IMPLEMENTATION_UNICHAIN_SEPOLIA = "0x44A47AfC1A9467Dfe1D5E967cA78432C699a13d9";
export const BOUND_VALIDATOR_IMPLEMENTATION_UNICHAIN_SEPOLIA = "0x15242a55Ad1842A1aEa09c59cf8366bD2f3CE9B4";

export const vip492 = () => {
  const meta = {
    version: "v2",
    title: "",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: DEFAULT_PROXY_ADMIN_BASE_SEPOLIA,
        signature: "upgrade(address,address)",
        params: [RESILIENT_ORACLE_BASE_SEPOLIA, RESILIENT_ORACLE_IMPLEMENTATION_BASE_SEPOLIA],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: DEFAULT_PROXY_ADMIN_BASE_SEPOLIA,
        signature: "upgrade(address,address)",
        params: [CHAINLINK_ORACLE_ORACLE_BASE_SEPOLIA, CHAINLINK_ORACLE_IMPLEMENTATION_BASE_SEPOLIA],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: DEFAULT_PROXY_ADMIN_BASE_SEPOLIA,
        signature: "upgrade(address,address)",
        params: [REDSTONE_ORACLE_ORACLE_BASE_SEPOLIA, REDSTONE_ORACLE_IMPLEMENTATION_BASE_SEPOLIA],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: DEFAULT_PROXY_ADMIN_BASE_SEPOLIA,
        signature: "upgrade(address,address)",
        params: [BOUND_VALIDATOR_BASE_SEPOLIA, BOUND_VALIDATOR_IMPLEMENTATION_BASE_SEPOLIA],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: RESILIENT_ORACLE_BASE_SEPOLIA,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            wSuperOETHb,
            [wSuperOETHb_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: RESILIENT_ORACLE_BASE_SEPOLIA,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            wstETH,
            [wstETHOracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: DEFAULT_PROXY_ADMIN_OP_SEPOLIA,
        signature: "upgrade(address,address)",
        params: [RESILIENT_ORACLE_OP_SEPOLIA, RESILIENT_ORACLE_IMPLEMENTATION_OP_SEPOLIA],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: DEFAULT_PROXY_ADMIN_OP_SEPOLIA,
        signature: "upgrade(address,address)",
        params: [CHAINLINK_ORACLE_OP_SEPOLIA, CHAINLINK_ORACLE_IMPLEMENTATION_OP_SEPOLIA],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: DEFAULT_PROXY_ADMIN_OP_SEPOLIA,
        signature: "upgrade(address,address)",
        params: [BOUND_VALIDATOR_OP_SEPOLIA, BOUND_VALIDATOR_IMPLEMENTATION_OP_SEPOLIA],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: DEFAULT_PROXY_ADMIN_UNICHAIN_SEPOLIA,
        signature: "upgrade(address,address)",
        params: [RESILIENT_ORACLE_UNICHAIN_SEPOLIA, RESILIENT_ORACLE_IMPLEMENTATION_UNICHAIN_SEPOLIA],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: DEFAULT_PROXY_ADMIN_UNICHAIN_SEPOLIA,
        signature: "upgrade(address,address)",
        params: [REDSTONE_ORACLE_UNICHAIN_SEPOLIA, REDSTONE_ORACLE_IMPLEMENTATION_UNICHAIN_SEPOLIA],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: DEFAULT_PROXY_ADMIN_UNICHAIN_SEPOLIA,
        signature: "upgrade(address,address)",
        params: [BOUND_VALIDATOR_UNICHAIN_SEPOLIA, BOUND_VALIDATOR_IMPLEMENTATION_UNICHAIN_SEPOLIA],
        dstChainId: LzChainId.unichainsepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip492;
