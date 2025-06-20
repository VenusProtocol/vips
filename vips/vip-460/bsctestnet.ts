import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { berachainbepolia } = NETWORK_ADDRESSES;

export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const ACM_AGGREGATOR = "0x1EAA596ad8101bb321a5999e509A61747893078B";
export const ACM = "0x243313C1cC198FF80756ed2ef14D9dcd94Ee762b";
export const PSR = "0xC081DF6860E7E537b0330cD6c1b6529378838D5e";
export const NATIVE_TOKEN_GATEWAY_CORE_POOL = "0x54EBb1FF397e395e752986B73D515963bA2F6AC8";
export const COMPTROLLER_CORE = "0x2cAD397672BD86269E0fD41E4c61D91974e78FD0";

export const MOCK_USDCe = "0xEf368e4c1f9ACC9241E66CD67531FEB195fF7536";
export const VUSDCe = "0xe803c6d3F68c6F7f63624F7d1c60EBf5C64eC669";
export const WETH = "0x434BB500fA491Daa03375D2B9762dD6080064e2D";
export const VWETH = "0xbadbf9421301467ec6d4634864e0D8780dBbC5B0";
export const WBERA = "0x6969696969696969696969696969696969696969";
export const VWBERA = "0x6C015F64af86e335a20cC6AA74A1094f49b6201b";

const vip453 = () => {
  const meta = {
    version: "v2",
    title: "VIP-4539",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: ACM,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [2],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: ACM,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: PSR,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: PSR,
        signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
        params: [
          [
            [0, 10000, berachainbepolia.VTREASURY],
            [1, 10000, berachainbepolia.VTREASURY],
          ],
        ],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: PSR,
        signature: "setPoolRegistry(address)",
        params: [berachainbepolia.POOL_REGISTRY],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: NATIVE_TOKEN_GATEWAY_CORE_POOL,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.berachainbepolia,
      },

      {
        target: berachainbepolia.POOL_REGISTRY,
        signature: "acceptOwnership()",
        params: [],
        dstChainId: LzChainId.berachainbepolia,
      },
      { target: COMPTROLLER_CORE, signature: "acceptOwnership()", params: [], dstChainId: LzChainId.berachainbepolia },
      {
        target: COMPTROLLER_CORE,
        signature: "setPriceOracle(address)",
        params: [berachainbepolia.RESILIENT_ORACLE],
        dstChainId: LzChainId.berachainbepolia,
      },

      // Add pool
      {
        target: berachainbepolia.POOL_REGISTRY,
        signature: "addPool(string,address,uint256,uint256,uint256)",
        params: ["Core", COMPTROLLER_CORE, parseUnits("0.5", 18), parseUnits("1.1", 18), parseUnits("100", 18)],
        dstChainId: LzChainId.berachainbepolia,
      },

      // Add USDC.e market
      {
        target: MOCK_USDCe,
        signature: "faucet(uint256)",
        params: [parseUnits("5000", 6)],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: MOCK_USDCe,
        signature: "approve(address,uint256)",
        params: [berachainbepolia.POOL_REGISTRY, 0],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: MOCK_USDCe,
        signature: "approve(address,uint256)",
        params: [berachainbepolia.POOL_REGISTRY, parseUnits("5000", 6)],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: VUSDCe,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["86400"],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: berachainbepolia.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VUSDCe,
            parseUnits("0.78", 18), // CF
            parseUnits("0.8", 18), // LT
            parseUnits("5000", 6), // INITIAL_SUPPLY
            berachainbepolia.VTREASURY,
            parseUnits("20000000", 6), // SUPPLY_CAP
            parseUnits("18000000", 6), // BORROW_CAP
          ],
        ],
        dstChainId: LzChainId.berachainbepolia,
      },

      // Add WETH market
      {
        target: WETH,
        signature: "faucet(uint256)",
        params: [parseUnits("2", 18)],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: WETH,
        signature: "approve(address,uint256)",
        params: [berachainbepolia.POOL_REGISTRY, 0],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: WETH,
        signature: "approve(address,uint256)",
        params: [berachainbepolia.POOL_REGISTRY, parseUnits("2", 18)],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: VWETH,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["86400"],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: berachainbepolia.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VWETH,
            parseUnits("0.78", 18), // CF
            parseUnits("0.8", 18), // LT
            parseUnits("2", 18), // INITIAL_SUPPLY
            berachainbepolia.VTREASURY,
            parseUnits("700", 18), // SUPPLY_CAP
            parseUnits("350", 18), // BORROW_CAP
          ],
        ],
        dstChainId: LzChainId.berachainbepolia,
      },

      // Add WBERA market
      {
        target: WBERA,
        signature: "deposit()",
        params: [],
        dstChainId: LzChainId.berachainbepolia,
        value: parseUnits("0.05", 18).toString(),
      },
      {
        target: WBERA,
        signature: "approve(address,uint256)",
        params: [berachainbepolia.POOL_REGISTRY, 0],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: WBERA,
        signature: "approve(address,uint256)",
        params: [berachainbepolia.POOL_REGISTRY, parseUnits("0.05", 18)],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: VWBERA,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["86400"],
        dstChainId: LzChainId.berachainbepolia,
      },
      {
        target: berachainbepolia.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            VWBERA,
            parseUnits("0.78", 18), // CF
            parseUnits("0.8", 18), // LT
            parseUnits("0.05", 18), // INITIAL_SUPPLY
            berachainbepolia.VTREASURY,
            parseUnits("4000000", 18), // SUPPLY_CAP
            parseUnits("3500000", 18), // BORROW_CAP
          ],
        ],
        dstChainId: LzChainId.berachainbepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip453;
