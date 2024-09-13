import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const VUSDT_CORE = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
export const VUSDC_CORE = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
export const VDAI_CORE = "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1";
export const VFDUSD_CORE = "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba";
export const VUSDT_STABLECOINS = "0x5e3072305F9caE1c7A82F6Fe9E38811c74922c3B";
export const VUSDT_GAMEFI = "0x4978591f17670A846137d9d613e333C38dc68A37";
export const VUSDT_DEFI = "0x1D8bBDE12B6b34140604E18e9f9c6e14deC16854";

export const RATE_MODELS = {
  JumpRateModel_base0bps_slope875bps_jump25000bps_kink8000bps: "0xBe4609d972FdEBAa9DC870F4A957F40C301bEb1D",
  JumpRateModel_base0bps_slope875bps_jump50000bps_kink8000bps: "0xE19C14171C2aC6CA63E008133e4B0D8571164BA3",
  JumpRateModelV2_base0bps_slope1000bps_jump25000bps_kink8000bps: "0x2ba0F45f7368d2A56d0c9e5a29af363987BE1d02",
  JumpRateModelV2_base200bps_slope1500bps_jump25000bps_kink8000bps: "0x5ECa0FBBc5e7bf49dbFb1953a92784F8e4248eF6",

  JumpRateModel_base0bps_slope1000bps_jump25000bps_kink8000bps: "0x62A8919C4C413fd4F9aef7348540Bc4B1b5CC805",
  JumpRateModel_base0bps_slope750bps_jump50000bps_kink8000bps: "0xdEf4b9462223c9a44E61d217a145063C7836FD7B",
  JumpRateModelV2_base0bps_slope375bps_jump25000bps_kink8000bps: "0xb36b273601Ac5e0CaBD0845b7B8caa3426611Ca0",
  JumpRateModelV2_base200bps_slope1350bps_jump25000bps_kink8000bps: "0x3aB2e4594D9C81455b330B423Dec61E49EB11667",
};

const vip354 = () => {
  const meta = {
    version: "v2",
    title: "VIP-354 Risk Parameters Adjustments (Stablecoins)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in this Venus community forum publication: [Chaos Labs - Interest Rate Curve Amendment for Stablecoins on Venus](https://community.venus.io/t/chaos-labs-interest-rate-curve-amendment-for-stablecoins-on-venus/4531).

* BNB chain
    * Increase multiplier (annualized), from 0.0875 (7% APR at kink) to 0.1 (8% APR at kink): [USDT (Core pool)](https://bscscan.com/address/0xfD5840Cd36d94D7229439859C0112a4185BC0255), [USDC (Core pool)](https://bscscan.com/address/0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8) and [DAI (Core pool)](https://bscscan.com/address/0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1),
    * Decrease multiplier (annualized), from 0.0875 (7% APR at kink) to 0.075 (6% APR at kink): [FDUSD (Core pool)](https://bscscan.com/address/0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba)
    * Decrease multiplier (annualized), from 0.1 (8% APR at kink) to 0.0375 (3% APR at kink): [USDT (Stablecoins)](https://bscscan.com/address/0x5e3072305F9caE1c7A82F6Fe9E38811c74922c3B)
    * Decrease multiplier (annualized), from 0.15 (12% APR at kink) to 0.135 (10.8% APR at kink): [USDT (GameFi)](https://bscscan.com/address/0x4978591f17670A846137d9d613e333C38dc68A37), [USDT (DeFi)](https://bscscan.com/address/0x1D8bBDE12B6b34140604E18e9f9c6e14deC16854)
* Ethereum
    * Increase multiplier (annualized), from 0.0875 (7% APR at kink) to 0.15 (12% APR at kink): [crvUSD (Core pool)](https://etherscan.io/address/0x672208C10aaAA2F9A6719F449C4C8227bc0BC202)
    * Decrease multiplier (annualized), from 0.15 (12% APR at kink) to 0.0875 (7% APR at kink): [DAI (Core pool)](https://etherscan.io/address/0xd8AdD9B41D4E1cd64Edad8722AB0bA8D35536657) and [TUSD (Core pool)](https://etherscan.io/address/0x13eB80FDBe5C5f4a7039728E258A6f05fb3B912b)
* Arbitrum one
    * Decrease multiplier (annualized), from 0.0875 (7% APR at kink) to 0.08 (6.4% APR at kink): [USDC (Core pool)](https://arbiscan.io/address/0x7D8609f8da70fF9027E9bc5229Af4F6727662707), [USDT (Core pool)](https://arbiscan.io/address/0xB9F9117d4200dC296F9AcD1e8bE1937df834a2fD)

Complete analysis and details of these recommendations are available in the above publications.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/359](https://github.com/VenusProtocol/vips/pull/359)

**Disclaimer for Ethereum and Arbitrum one commands**

Privilege commands on Ethereum and opBNB will be executed by the Guardian wallets ([Ethereum](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), [Arbitrum one](https://arbiscan.io/address/0x14e0e151b33f9802b3e75b621c1457afc44dcaa0)), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x5672182a533c441cbc4537c21728e354dbd8764ef36f8d171f8704502040b070) and [this](https://app.safe.global/transactions/tx?safe=arb1:0x14e0E151b33f9802b3e75b621c1457afc44DcAA0&id=multisig_0x14e0E151b33f9802b3e75b621c1457afc44DcAA0_0x1ddcc5cd0f5f797cee550ed845be65545b9af4e701642a1eed1c0998f08dc0b7) multisig transactions will be executed. Otherwise, they will be rejected.
`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      ...[VUSDT_CORE, VUSDC_CORE, VDAI_CORE].map((vToken: string) => ({
        target: vToken,
        signature: "_setInterestRateModel(address)",
        params: [RATE_MODELS.JumpRateModel_base0bps_slope1000bps_jump25000bps_kink8000bps],
      })),
      {
        target: VFDUSD_CORE,
        signature: "_setInterestRateModel(address)",
        params: [RATE_MODELS.JumpRateModel_base0bps_slope750bps_jump50000bps_kink8000bps],
      },
      {
        target: VUSDT_STABLECOINS,
        signature: "setInterestRateModel(address)",
        params: [RATE_MODELS.JumpRateModelV2_base0bps_slope375bps_jump25000bps_kink8000bps],
      },
      ...[VUSDT_GAMEFI, VUSDT_DEFI].map((vToken: string) => ({
        target: vToken,
        signature: "setInterestRateModel(address)",
        params: [RATE_MODELS.JumpRateModelV2_base200bps_slope1350bps_jump25000bps_kink8000bps],
      })),
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip354;
