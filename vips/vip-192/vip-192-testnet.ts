import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";
import { cutParams as params } from "../../simulations/vip-192/vip-192-testnet/utils/cut-params.json";
import { ethers } from "hardhat";

const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const ACM = "0x45f8a08f534f34a97187626e05d4b6648eeaa9aa";
const FAST_TRACK_TIMELOCK = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";
const CRITICAL_TIMELOCK = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";
const UNITROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const XVS_VAULT_PROXY = "0x9aB56bAD2D7631B2A857ccf36d998232A8b82280";
const XVS_VAULT_IMPL = "0x37BB5aBBDfFD81372fBeA830B9d5b38B98551c06";
const PRIME_LIQUIDITY_PROVIDER = "0xce20cACeF98DC03b2e30cD63b7B56B018d171E9c";
const PRIME = "0xb13Ea8C39594449B2AB5555769580BDB23f5E2Cf";

const ETH ="0x98f7A83361F7Ac8765CcEBAB1425da6b341958a7";
const BTC = "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4";
const USDC = "0x16227D60f7a0e586C66B005219dfc887D13C9531";
const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";

const vETH = "0x162D005F0Fff510E54958Cfc5CF32A3180A84aab";
const vBTC = "0xb6e9322C49FD75a367Fcb17B0Fcd62C5070EbCBe";
const vUSDC = "0xD5C4C2e2facBEB59D0216D0595d63FcDc6F9A1a7";
const vUSDT = "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A";

const PREVIOUSLY_STAKED_USER = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";
const STAKED_AT = "1698270716";

const cutParams = params;

export const vip192Testnet = () => {
  const meta = {
    version: "v2",
    title: "Prime Program Setup",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with setting the prime program",
    againstDescription:
      "I do not think that Venus Protocol should proceed with setting the prime program",
    abstainDescription:
      "I am indifferent to whether Venus Protocol proceeds with setting the prime program",
  };

  return makeProposal(
    [
      {
        target: UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[])",
        params: [cutParams],
      },
      {
        target: XVS_VAULT_PROXY,
        signature: "_setPendingImplementation(address)",
        params: [XVS_VAULT_IMPL],
      },
      {
        target: XVS_VAULT_IMPL,
        signature: "_become(address)",
        params: [XVS_VAULT_PROXY],
      },
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME_LIQUIDITY_PROVIDER, "setTokensDistributionSpeed(address[],uint256[])", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME_LIQUIDITY_PROVIDER, "pauseFundsTransfer()", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME_LIQUIDITY_PROVIDER, "resumeFundsTransfer()", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME_LIQUIDITY_PROVIDER, "setTokensDistributionSpeed(address[],uint256[])", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME_LIQUIDITY_PROVIDER, "pauseFundsTransfer()", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME_LIQUIDITY_PROVIDER, "resumeFundsTransfer()", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME_LIQUIDITY_PROVIDER, "setTokensDistributionSpeed(address[],uint256[])", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME_LIQUIDITY_PROVIDER, "pauseFundsTransfer()", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME_LIQUIDITY_PROVIDER, "resumeFundsTransfer()", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME, "updateAlpha(uint128,uint128)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME, "updateMultipliers(address,uint256,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME, "setStakedAt(address[],uint256[])", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME, "addMarket(address,uint256,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME, "setLimit(uint256,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME, "setMaxLoopsLimit(uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME, "issue(bool,address[])", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME, "burn(address)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME, "togglePause()", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME, "updateAlpha(uint128,uint128)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME, "updateMultipliers(address,uint256,uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME, "setStakedAt(address[],uint256[])", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME, "addMarket(address,uint256,uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME, "setLimit(uint256,uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME, "setMaxLoopsLimit(uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME, "issue(bool,address[])", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME, "burn(address)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME, "togglePause()", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME, "updateAlpha(uint128,uint128)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME, "updateMultipliers(address,uint256,uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME, "setStakedAt(address[],uint256[])", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME, "addMarket(address,uint256,uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME, "setLimit(uint256,uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME, "setMaxLoopsLimit(uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME, "issue(bool,address[])", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME, "burn(address)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME, "togglePause()", CRITICAL_TIMELOCK],
      },
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "setPrimeToken(address)",
        params: [PRIME],
      },
      {
        target: UNITROLLER,
        signature: "_setPrimeToken(address)",
        params: [PRIME],
      },
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "initializeTokens(address[])",
        params: [[
          ETH,
          BTC,
          USDC,
          USDT
        ]],
      },
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "setTokensDistributionSpeed(address[],uint256[])",
        params: [[
          ETH,
          BTC,
          USDC,
          USDT
        ], [
          0,0,0,0
        ]],
      },
      {
        target: PRIME,
        signature: "addMarket(address,uint256,uint256)",
        params: [
          vETH,
          ethers.utils.parseEther("2"),
          ethers.utils.parseEther("4"),
        ]
      },
      {
        target: PRIME,
        signature: "addMarket(address,uint256,uint256)",
        params: [
          vBTC,
          ethers.utils.parseEther("2"),
          ethers.utils.parseEther("4"),
        ]
      },
      {
        target: PRIME,
        signature: "addMarket(address,uint256,uint256)",
        params: [
          vUSDC,
          ethers.utils.parseEther("2"),
          ethers.utils.parseEther("4"),
        ]
      },
      {
        target: PRIME,
        signature: "addMarket(address,uint256,uint256)",
        params: [
          vUSDT,
          ethers.utils.parseEther("1"),
          ethers.utils.parseEther("1"),
        ]
      },
      {
        target: PRIME,
        signature: "setLimit(uint256,uint256)",
        params: [
          0, // irrevocable
          500 // revocable
        ]
      },
      {
        target: PRIME,
        signature: "setStakedAt(address[],uint256[])",
        params: [
          [PREVIOUSLY_STAKED_USER], [STAKED_AT]
        ]
      },
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "pauseFundsTransfer()",
        params: []
      }
    ],
    meta,
    ProposalType.REGULAR,
  );
};
