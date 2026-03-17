import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

// TODO: Replace with the deployed VBep20Delegate implementation address
const NEW_VBEP20_DELEGATE_IMPL = "0xb25b57599BA969c4829699F7E4Fc4076D14745E1";

// VBep20Delegator proxy addresses (43 markets, excludes vBNB)
const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const vBUSD = "0x95c78222B3D6e262426483D42CfA53685A67Ab9D";
const vSXP = "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0";
const vXVS = "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D";
const vBTC = "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B";
const vETH = "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8";
const vLTC = "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B";
const vXRP = "0xB248a295732e0225acd3337607cc01068e3b9c10";
const vBCH = "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176";
const vDOT = "0x1610bc33319e9398de5f57B33a5b184c806aD217";
const vLINK = "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f";
const vDAI = "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1";
const vFIL = "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343";
const vBETH = "0x972207A639CC1B374B893cc33Fa251b55CEB7c07";
const vADA = "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec";
const vDOGE = "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71";
const vMATIC = "0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8";
const vCAKE = "0x86aC3974e2BD0d60825230fa6F355fF11409df5c";
const vAAVE = "0x26DA28954763B92139ED49283625ceCAf52C6f94";
const vTUSDOLD = "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3";
const vTRXOLD = "0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93";
const vTRX = "0xC5D3466aA484B040eE977073fcF337f2c00071c1";
const vWBETH = "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0";
const vTUSD = "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E";
const vUNI = "0x27FF564707786720C71A2e5c1490A63266683612";
const vFDUSD = "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba";
const vTWT = "0x4d41a36D04D97785bcEA57b057C412b278e6Edcc";
const vSolvBTC = "0xf841cb62c19fCd4fF5CD0AaB5939f3140BaaC3Ea";
const vTHE = "0x86e06EAfa6A1eA631Eab51DE500E3D474933739f";
const vSOL = "0xBf515bA4D1b52FFdCeaBF20d31D705Ce789F2cEC";
const vlisUSD = "0x689E0daB47Ab16bcae87Ec18491692BF621Dc6Ab";
const vPT_sUSDE_26JUN2025 = "0x9e4E5fed5Ac5B9F732d0D850A615206330Bf1866";
const vsUSDe = "0x699658323d58eE25c69F1a29d476946ab011bD18";
const vUSDe = "0x74ca6930108F775CC667894EEa33843e691680d7";
const vUSD1 = "0x0C1DA220D301155b87318B90692Da8dc43B67340";
const vxSolvBTC = "0xd804dE60aFD05EE6B89aab5D152258fD461B07D5";
const vasBNB = "0xCC1dB43a06d97f736C7B045AedD03C6707c09BDF";
const vWBNB = "0x6bCa74586218dB34cdB402295796b79663d816e9";
const vslisBNB = "0x89c910Eb8c90df818b4649b508Ba22130Dc73Adc";
const vU = "0x3d5E269787d562b74aCC55F18Bd26C5D09Fa245E";
const vPT_clisBNB_25JUN2026 = "0x6d3BD68E90B42615cb5abF4B8DE92b154ADc435e";
const vXAUM = "0x92e6Ea74a1A3047DabF4186405a21c7D63a0612A";

// Markets and their excess token amounts to sweep before syncing
// TODO: Verify excess amounts on-chain before proposal. Use 0 for markets with no excess.
interface MarketConfig {
  vToken: string;
  name: string;
  excessAmount: string;
}

const MARKETS: MarketConfig[] = [
  { vToken: vUSDC, name: "vUSDC", excessAmount: "0" },
  { vToken: vUSDT, name: "vUSDT", excessAmount: "0" },
  { vToken: vBUSD, name: "vBUSD", excessAmount: "0" },
  { vToken: vSXP, name: "vSXP", excessAmount: "0" },
  { vToken: vXVS, name: "vXVS", excessAmount: "0" },
  { vToken: vBTC, name: "vBTC", excessAmount: "0" },
  { vToken: vETH, name: "vETH", excessAmount: "0" },
  { vToken: vLTC, name: "vLTC", excessAmount: "0" },
  { vToken: vXRP, name: "vXRP", excessAmount: "0" },
  { vToken: vBCH, name: "vBCH", excessAmount: "0" },
  { vToken: vDOT, name: "vDOT", excessAmount: "0" },
  { vToken: vLINK, name: "vLINK", excessAmount: "0" },
  { vToken: vDAI, name: "vDAI", excessAmount: "0" },
  { vToken: vFIL, name: "vFIL", excessAmount: "0" },
  { vToken: vBETH, name: "vBETH", excessAmount: "0" },
  { vToken: vADA, name: "vADA", excessAmount: "0" },
  { vToken: vDOGE, name: "vDOGE", excessAmount: "0" },
  { vToken: vMATIC, name: "vMATIC", excessAmount: "0" },
  { vToken: vCAKE, name: "vCAKE", excessAmount: "0" },
  { vToken: vAAVE, name: "vAAVE", excessAmount: "0" },
  { vToken: vTUSDOLD, name: "vTUSDOLD", excessAmount: "0" },
  { vToken: vTRXOLD, name: "vTRXOLD", excessAmount: "0" },
  { vToken: vTRX, name: "vTRX", excessAmount: "0" },
  { vToken: vWBETH, name: "vWBETH", excessAmount: "0" },
  { vToken: vTUSD, name: "vTUSD", excessAmount: "0" },
  { vToken: vUNI, name: "vUNI", excessAmount: "0" },
  { vToken: vFDUSD, name: "vFDUSD", excessAmount: "0" },
  { vToken: vTWT, name: "vTWT", excessAmount: "0" },
  { vToken: vSolvBTC, name: "vSolvBTC", excessAmount: "0" },
  { vToken: vTHE, name: "vTHE", excessAmount: "0" },
  { vToken: vSOL, name: "vSOL", excessAmount: "0" },
  { vToken: vlisUSD, name: "vlisUSD", excessAmount: "0" },
  { vToken: vPT_sUSDE_26JUN2025, name: "vPT-sUSDE-26JUN2025", excessAmount: "0" },
  { vToken: vsUSDe, name: "vsUSDe", excessAmount: "0" },
  { vToken: vUSDe, name: "vUSDe", excessAmount: "0" },
  { vToken: vUSD1, name: "vUSD1", excessAmount: "0" },
  { vToken: vxSolvBTC, name: "vxSolvBTC", excessAmount: "0" },
  { vToken: vasBNB, name: "vasBNB", excessAmount: "0" },
  { vToken: vWBNB, name: "vWBNB", excessAmount: "0" },
  { vToken: vslisBNB, name: "vslisBNB", excessAmount: "0" },
  { vToken: vU, name: "vU", excessAmount: "0" },
  { vToken: vPT_clisBNB_25JUN2026, name: "vPT-clisBNB-25JUN2026", excessAmount: "0" },
  { vToken: vXAUM, name: "vXAUM", excessAmount: "0" },
];

export const vip608 = () => {
  const meta = {
    version: "v2",
    title: "VIP-608 Upgrade VBep20Delegate implementation for Core Pool markets",
    description:
      "Upgrade all 43 VBep20Delegator core pool markets on BSC mainnet to the new VBep20Delegate implementation. " +
      "For each market: (1) set the new implementation, (2) call sweepTokenAndSync to initialize internalCash. " +
      "Markets with excess tokens have their excess swept to the Timelock before syncing.",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    MARKETS.flatMap(({ vToken, excessAmount }) => [
      {
        target: vToken,
        signature: "_setImplementation(address,bool,bytes)",
        params: [NEW_VBEP20_DELEGATE_IMPL, false, "0x"],
      },
      {
        target: vToken,
        signature: "sweepTokenAndSync(uint256)",
        params: [excessAmount],
      },
    ]),
    meta,
    ProposalType.REGULAR,
  );
};

export default vip608;
