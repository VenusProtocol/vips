import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const RESILIENT_ORACLE_BASE_SEPOLIA = "0xC34871C982cf0Bc6e7aCa2c2670Bc319bDA1C744";
export const CHAINLINK_ORACLE_BASE_SEPOLIA = "0x801aB33A69AD867500fbCda7b3dB66C73151494b";
export const REDSTONE_ORACLE_BASE_SEPOLIA = "0x8267FE3f75E0A37ee34e113E767F9C9727206838";
export const BOUND_VALIDATOR_BASE_SEPOLIA = "0xC76284488E57554A457A75a8b166fB2ADAB430dB";
export const DEFAULT_PROXY_ADMIN_BASE_SEPOLIA = "0xB85dD19112c4BF1240FeD0f26E8D0b0576a82546";
export const RESILIENT_ORACLE_IMPLEMENTATION_BASE_SEPOLIA = "0xe8c39006906a9015adC87996AcD1af20f514fdE6";
export const CHAINLINK_ORACLE_IMPLEMENTATION_BASE_SEPOLIA = "0x238F42Bc8E204583877d670891dF1f67a861ef0a";
export const REDSTONE_ORACLE_IMPLEMENTATION_BASE_SEPOLIA = "0x91eEfAb71a8BD1E4f2889D51806407cD55DBF2fC";
export const BOUND_VALIDATOR_IMPLEMENTATION_BASE_SEPOLIA = "0xae3C407A1C30Ac7A55A97B6A55927f6a2580bD4f";
export const wSuperOETHb_ORACLE = "0x6F6e9Fd240372435eb16dBE36362ECdF84AB0399";
export const wSuperOETHb = "0x02B1136d9E223333E0083aeAB76bC441f230a033";
export const wSuperOETHb_Initial_Exchange_Rate = parseUnits("1", 18);
export const wstETHOracle = "0xB242450Ab1CBdd93409ee22c333F6f70aaA6Be08";
export const wstETH = "0xAd69AA3811fE0EE7dBd4e25C4bae40e6422c76C8";
export const ACM_BASE_SEPOLIA = "0x724138223D8F76b519fdE715f60124E7Ce51e051";
export const NORMAL_TIMELOCK_BASE_SEPOLIA = "0xCc84f6122649eDc48f4a426814e6b6C6fF9bBe0a";
export const CRITICAL_TIMELOCK_BASE_SEPOLIA = "0xbeDb7F2d0617292364bA4D73cf016c0f6BB5542E";
export const FASTTRACK_TIMELOCK_BASE_SEPOLIA = "0x3dFA652D3aaDcb93F9EA7d160d674C441AaA8EE2";

export const RESILIENT_ORACLE_OP_SEPOLIA = "0x6c01ECa2B5C97F135406a3A5531445A7d977D28e";
export const CHAINLINK_ORACLE_OP_SEPOLIA = "0x493C3f543AEa37EefF17D823f27Cb1feAB9f3143";
export const BOUND_VALIDATOR_OP_SEPOLIA = "0x482469F1DA6Ec736cacF6361Ec41621f811A6800";
export const DEFAULT_PROXY_ADMIN_OP_SEPOLIA = "0xa9aaf2A1cCf2C3a87997942abaA740887cC89241";
export const RESILIENT_ORACLE_IMPLEMENTATION_OP_SEPOLIA = "0xe36F76dc26885CcEce97B96f80f4FA58c89772Fc";
export const CHAINLINK_ORACLE_IMPLEMENTATION_OP_SEPOLIA = "0x15242a55Ad1842A1aEa09c59cf8366bD2f3CE9B4";
export const BOUND_VALIDATOR_IMPLEMENTATION_OP_SEPOLIA = "0xca8c824E577e1E2EDF4442cB46046ab000FE76CF";
export const ACM_OP_SEPOLIA = "0x1652E12C8ABE2f0D84466F0fc1fA4286491B3BC1";
export const NORMAL_TIMELOCK_OP_SEPOLIA = "0xdDe31d7eEEAD7Cf9790F833C4FF4c6e61404402a";
export const CRITICAL_TIMELOCK_OP_SEPOLIA = "0x45d2263c6E0dbF84eBffB1Ee0b80aC740607990B";
export const FASTTRACK_TIMELOCK_OP_SEPOLIA = "0xe0Fa35b6279dd802C382ae54c50C8B16deaC0885";

export const RESILIENT_ORACLE_UNICHAIN_SEPOLIA = "0xA469E718BDE2C9939bD29529A38184e97dF0A741";
export const REDSTONE_ORACLE_UNICHAIN_SEPOLIA = "0x8683D6902A669Ac479cfcCf2542724a133D4d872";
export const BOUND_VALIDATOR_UNICHAIN_SEPOLIA = "0x51C9F57Ffc0A4dD6d135aa3b856571F5A4e4C6CB";
export const DEFAULT_PROXY_ADMIN_UNICHAIN_SEPOLIA = "0x256735eFdfDf135bD6991854e0065909e57804aa";
export const RESILIENT_ORACLE_IMPLEMENTATION_UNICHAIN_SEPOLIA = "0x4E953e3741a17aFaD69776742d1ED1c0130F43f7";
export const REDSTONE_ORACLE_IMPLEMENTATION_UNICHAIN_SEPOLIA = "0x44A47AfC1A9467Dfe1D5E967cA78432C699a13d9";
export const BOUND_VALIDATOR_IMPLEMENTATION_UNICHAIN_SEPOLIA = "0x15242a55Ad1842A1aEa09c59cf8366bD2f3CE9B4";
export const ACM_UNICHAIN_SEPOLIA = "0x854C064EA6b503A97980F481FA3B7279012fdeDd";
export const NORMAL_TIMELOCK_UNICHAIN_SEPOLIA = "0x5e20F5A2e23463D39287185DF84607DF7068F314";
export const CRITICAL_TIMELOCK_UNICHAIN_SEPOLIA = "0x86C093266e824FA4345484a7B9109e9567923DA6";
export const FASTTRACK_TIMELOCK_UNICHAIN_SEPOLIA = "0x668cDb1A414006D0a26e9e13881D4Cd30B8b2a4A";

export const ACM_OPBNB_TESTNET = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";
export const NORMAL_TIMELOCK_OPBNB_TESTNET = "0x1c4e015Bd435Efcf4f58D82B0d0fBa8fC4F81120";
export const CRITICAL_TIMELOCK_OPBNB_TESTNET = "0xBd06aCDEF38230F4EdA0c6FD392905Ad463e42E3";
export const FASTTRACK_TIMELOCK_OPBNB_TESTNET = "0xB2E6268085E75817669479b22c73C2AfEaADF7A6";

export const increaseExchangeRateByPercentage = (
  exchangeRate: BigNumber,
  percentage: BigNumber, // BPS value (e.g., 10000 for 100%)
) => {
  const increaseAmount = exchangeRate.mul(percentage).div(10000);
  return exchangeRate.add(increaseAmount).toString();
};

export const DAYS_30 = 30 * 24 * 60 * 60;

export const vip497 = () => {
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
        params: [CHAINLINK_ORACLE_BASE_SEPOLIA, CHAINLINK_ORACLE_IMPLEMENTATION_BASE_SEPOLIA],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: DEFAULT_PROXY_ADMIN_BASE_SEPOLIA,
        signature: "upgrade(address,address)",
        params: [REDSTONE_ORACLE_BASE_SEPOLIA, REDSTONE_ORACLE_IMPLEMENTATION_BASE_SEPOLIA],
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
        target: ACM_BASE_SEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", NORMAL_TIMELOCK_BASE_SEPOLIA],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: ACM_BASE_SEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", NORMAL_TIMELOCK_BASE_SEPOLIA],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: ACM_BASE_SEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", NORMAL_TIMELOCK_BASE_SEPOLIA],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: ACM_BASE_SEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", CRITICAL_TIMELOCK_BASE_SEPOLIA],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: ACM_BASE_SEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", CRITICAL_TIMELOCK_BASE_SEPOLIA],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: ACM_BASE_SEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", CRITICAL_TIMELOCK_BASE_SEPOLIA],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: ACM_BASE_SEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", FASTTRACK_TIMELOCK_BASE_SEPOLIA],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: ACM_BASE_SEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", FASTTRACK_TIMELOCK_BASE_SEPOLIA],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: ACM_BASE_SEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", FASTTRACK_TIMELOCK_BASE_SEPOLIA],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: wSuperOETHb_ORACLE,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(wSuperOETHb_Initial_Exchange_Rate, BigNumber.from("111")),
          1746433990,
        ],
        dstChainId: LzChainId.basesepolia,
      },
      {
        target: wSuperOETHb_ORACLE,
        signature: "setGrowthRate(uint256,uint256)",
        params: [parseUnits("0.1426", 18), DAYS_30],
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
        target: ACM_OP_SEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", NORMAL_TIMELOCK_OP_SEPOLIA],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: ACM_OP_SEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", NORMAL_TIMELOCK_OP_SEPOLIA],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: ACM_OP_SEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", NORMAL_TIMELOCK_OP_SEPOLIA],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: ACM_OP_SEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", CRITICAL_TIMELOCK_OP_SEPOLIA],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: ACM_OP_SEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", CRITICAL_TIMELOCK_OP_SEPOLIA],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: ACM_OP_SEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", CRITICAL_TIMELOCK_OP_SEPOLIA],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: ACM_OP_SEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", FASTTRACK_TIMELOCK_OP_SEPOLIA],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: ACM_OP_SEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", FASTTRACK_TIMELOCK_OP_SEPOLIA],
        dstChainId: LzChainId.opsepolia,
      },
      {
        target: ACM_OP_SEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", FASTTRACK_TIMELOCK_OP_SEPOLIA],
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
      {
        target: ACM_UNICHAIN_SEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", NORMAL_TIMELOCK_UNICHAIN_SEPOLIA],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: ACM_UNICHAIN_SEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", NORMAL_TIMELOCK_UNICHAIN_SEPOLIA],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: ACM_UNICHAIN_SEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", NORMAL_TIMELOCK_UNICHAIN_SEPOLIA],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: ACM_UNICHAIN_SEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", CRITICAL_TIMELOCK_UNICHAIN_SEPOLIA],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: ACM_UNICHAIN_SEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", CRITICAL_TIMELOCK_UNICHAIN_SEPOLIA],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: ACM_UNICHAIN_SEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", CRITICAL_TIMELOCK_UNICHAIN_SEPOLIA],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: ACM_UNICHAIN_SEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", FASTTRACK_TIMELOCK_UNICHAIN_SEPOLIA],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: ACM_UNICHAIN_SEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", FASTTRACK_TIMELOCK_UNICHAIN_SEPOLIA],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: ACM_UNICHAIN_SEPOLIA,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", FASTTRACK_TIMELOCK_UNICHAIN_SEPOLIA],
        dstChainId: LzChainId.unichainsepolia,
      },
      {
        target: ACM_OPBNB_TESTNET,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", NORMAL_TIMELOCK_OPBNB_TESTNET],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: ACM_OPBNB_TESTNET,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", NORMAL_TIMELOCK_OPBNB_TESTNET],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: ACM_OPBNB_TESTNET,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", NORMAL_TIMELOCK_OPBNB_TESTNET],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: ACM_OPBNB_TESTNET,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", CRITICAL_TIMELOCK_OPBNB_TESTNET],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: ACM_OPBNB_TESTNET,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", CRITICAL_TIMELOCK_OPBNB_TESTNET],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: ACM_OPBNB_TESTNET,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", CRITICAL_TIMELOCK_OPBNB_TESTNET],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: ACM_OPBNB_TESTNET,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", FASTTRACK_TIMELOCK_OPBNB_TESTNET],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: ACM_OPBNB_TESTNET,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", FASTTRACK_TIMELOCK_OPBNB_TESTNET],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: ACM_OPBNB_TESTNET,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", FASTTRACK_TIMELOCK_OPBNB_TESTNET],
        dstChainId: LzChainId.opbnbtestnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip497;
