import { ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { ACCESS_CONTROL_MANAGER, NORMAL_TIMELOCK, GUARDIAN } = NETWORK_ADDRESSES.bsctestnet;

export { ACCESS_CONTROL_MANAGER, NORMAL_TIMELOCK, GUARDIAN };

export const SMART_DCA = "0xc039F3D5C111a7e6B1B9515CcFe6Ae4C564c4546"; // SmartDCA proxy

// PLACEHOLDERS
export const KEEPER_1 = "0x1000000000000000000000000000000000000002"; // TBD: first backend keeper wallet
export const KEEPER_2 = "0x1000000000000000000000000000000000000003"; // TBD: second backend keeper wallet

// Tokens
export const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c"; // 6 decimals on testnet
export const USDC = "0x16227D60f7a0e586C66B005219dfc887D13C9531"; // 6 decimals on testnet
export const U = "0x180Bc1a9843A65D4116e44886FD3558515a56A49";
export const BTCB = "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4";
export const WBNB = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";

// Yield sources
// Testnet has a Hub for USDT only, so USDC and U wait in Core
export const HUB_USDT = "0x7cE6ADF754D0eC81A6CF8ACd9C7454F45077dc61";
export const vUSDC = "0xD5C4C2e2facBEB59D0216D0595d63FcDc6F9A1a7";
export const vU = "0x93969F17d4c1C7B22000eA26D5C2766E0f616D90";
export const vBTC = "0xb6e9322C49FD75a367Fcb17B0Fcd62C5070EbCBe";
export const vWBNB = "0xd9E77847ec815E56ae2B9E69596C69b6972b0B1C";

// ISmartDCA.SourceKind
export const HUB = 1;
export const CORE = 2;

// Swaps
export const PCS_V3_ROUTER = "0x1b81D678ffb9C0263b24A97847620C99d213eB14";

// USDT-WBNB 0.01% is the only PancakeSwap V3 pool among these tokens with liquidity on testnet
export const USDT_WBNB_PAIR_ID = 2;
export const USDT_WBNB_PATH = ethers.utils.solidityPack(["address", "uint24", "address"], [USDT, 100, WBNB]);

// /find-swap routes can call a token directly, so the tokens are allowlisted with the router
export const ALLOWED_ROUTERS = [PCS_V3_ROUTER, USDT, USDC, U, BTCB, WBNB];

// Settings
// 10 tokens per buy, in each stable's decimals; must be above 0 or addPair reverts
export const MIN_AMOUNT_PER_BUY = [
  { stable: USDT, amount: parseUnits("10", 6) },
  { stable: USDC, amount: parseUnits("10", 6) },
  { stable: U, amount: parseUnits("10", 18) },
];

// Fee on yield, in bps; capped by maxFeeRateBps (2000 by default)
export const FEE_RATE_BPS = 0;

// Most a keeper swap's minOut can be below the oracle value of its part, in bps; the mainnet value
export const MAX_ORACLE_DEVIATION_BPS = 100;

// ACM
// Every ACM-checked SmartDCA function; on testnet both accounts get all of them
export const SMART_DCA_PERMISSIONS = [
  "addPair(address,address,uint8,address,uint8,address)",
  "setYieldSource(uint32,uint8,uint8,address)",
  "setPairEnabled(uint32,bool)",
  "setMinAmountPerBuy(address,uint256)",
  "setBuyBounds(uint8,uint8)",
  "setKeeper(address,bool)",
  "setAllowedRouter(address,bool)",
  "setFallbackRoute(uint32,address,bytes)",
  "setFallbackSlippage(uint16)",
  "setMaxSlippage(uint16)",
  "setMaxOracleDeviation(uint16)",
  "setMaxParts(uint8)",
  "setFeeRate(uint16)",
  "setMaxFeeRate(uint16)",
  "setReserve(address)",
  "sweepToken(address,address)",
  "pause()",
  "unpause()",
  "forceBuy(uint32,uint8)",
];

export const vip684 = () => {
  const meta = {
    version: "v2",
    title: "VIP-684 [BNB Chain Testnet] Configure Smart DCA",
    description: `#### Summary

Takes ownership of Smart DCA on BNB Chain Testnet, grants its ACM permissions and adds 6 pairs: USDT, USDC and U, each buying BTCB and WBNB.

#### Actions

1. Accept ownership of [Smart DCA](https://testnet.bscscan.com/address/${SMART_DCA}) by the Normal Timelock.
2. Grant the 19 Smart DCA admin functions to the Normal Timelock and the Guardian.
3. Set the minimum amount per buy for USDT, USDC and U to 10 tokens.
4. Set the fee on yield to 0.
5. Set the oracle band on keeper swaps to 1%, as on mainnet.
6. Add the 6 pairs. USDT waits in the USDT Liquidity Hub, USDC and U in their Core pool markets, and the bought assets in their Core pool markets.
7. Set the \`forceBuy\` route of the USDT/WBNB pair to the PancakeSwap V3 USDT-WBNB 0.01% pool, the only one with liquidity.
8. Add the 2 keepers (TBD).
9. Allow the PancakeSwap V3 router and the 5 tokens in keeper swaps.

#### Notes

- Testnet only.
- Only USDT/WBNB has a \`forceBuy\` route, as it is the only PancakeSwap V3 pool among these tokens with liquidity on testnet.
- No ETH pairs: vETH minting is paused on testnet, so their rounds could not settle.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // 1. Ownership
      { target: SMART_DCA, signature: "acceptOwnership()", params: [] },

      // 2. ACM permissions
      ...SMART_DCA_PERMISSIONS.map(sig => ({
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [SMART_DCA, sig, NORMAL_TIMELOCK],
      })),
      ...SMART_DCA_PERMISSIONS.map(sig => ({
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [SMART_DCA, sig, GUARDIAN],
      })),

      // 3. Minimum amount per buy, before addPair: it reverts for a stable without one
      ...MIN_AMOUNT_PER_BUY.map(({ stable, amount }) => ({
        target: SMART_DCA,
        signature: "setMinAmountPerBuy(address,uint256)",
        params: [stable, amount],
      })),

      // 4. Fee on yield
      { target: SMART_DCA, signature: "setFeeRate(uint16)", params: [FEE_RATE_BPS] },

      // 5. Oracle band on keeper swaps
      { target: SMART_DCA, signature: "setMaxOracleDeviation(uint16)", params: [MAX_ORACLE_DEVIATION_BPS] },

      // 6. Pairs, ids 1 to 6 in this order. Params: stable, asset, stable source kind, stable source, asset source kind, asset source
      {
        target: SMART_DCA,
        signature: "addPair(address,address,uint8,address,uint8,address)",
        params: [USDT, BTCB, HUB, HUB_USDT, CORE, vBTC], // 1
      },
      {
        target: SMART_DCA,
        signature: "addPair(address,address,uint8,address,uint8,address)",
        params: [USDT, WBNB, HUB, HUB_USDT, CORE, vWBNB], // 2
      },
      {
        target: SMART_DCA,
        signature: "addPair(address,address,uint8,address,uint8,address)",
        params: [USDC, BTCB, CORE, vUSDC, CORE, vBTC], // 3
      },
      {
        target: SMART_DCA,
        signature: "addPair(address,address,uint8,address,uint8,address)",
        params: [USDC, WBNB, CORE, vUSDC, CORE, vWBNB], // 4
      },
      {
        target: SMART_DCA,
        signature: "addPair(address,address,uint8,address,uint8,address)",
        params: [U, BTCB, CORE, vU, CORE, vBTC], // 5
      },
      {
        target: SMART_DCA,
        signature: "addPair(address,address,uint8,address,uint8,address)",
        params: [U, WBNB, CORE, vU, CORE, vWBNB], // 6
      },

      // 7. forceBuy route
      {
        target: SMART_DCA,
        signature: "setFallbackRoute(uint32,address,bytes)",
        params: [USDT_WBNB_PAIR_ID, PCS_V3_ROUTER, USDT_WBNB_PATH],
      },

      // 8. Keepers
      { target: SMART_DCA, signature: "setKeeper(address,bool)", params: [KEEPER_1, true] },
      { target: SMART_DCA, signature: "setKeeper(address,bool)", params: [KEEPER_2, true] },

      // 9. Keeper swap allowlist
      ...ALLOWED_ROUTERS.map(router => ({
        target: SMART_DCA,
        signature: "setAllowedRouter(address,bool)",
        params: [router, true],
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip684;
