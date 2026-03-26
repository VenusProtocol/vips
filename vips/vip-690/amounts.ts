import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";

// ──────────────────────────────────────────────────────────
// Token addresses (underlying)
// ──────────────────────────────────────────────────────────
export const CAKE = "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82";
export const DAI = "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3";
export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
export const XRP = "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE";
export const BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
export const BCH = "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf";
export const LTC = "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94";
export const LINK = "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD";
export const ADA = "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const AAVE = "0xfb6115445Bff7b52FeB98650C87f44907E58f802";
export const DOGE = "0xbA2aE424d960c26247Dd6c32edC70B295c744C43";
export const SXP = "0x47BEAd2563dCBf3bF2c9407fEa4dC236fAbA485A";
export const FIL = "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153";
export const TUSD = "0x40af3827F39D0EAcBF4A168f8D4ee67c121D11c9";

// ──────────────────────────────────────────────────────────
// vToken addresses (Core Pool)
// ──────────────────────────────────────────────────────────
export const vCAKE = "0x86aC3974e2BD0d60825230fa6F355fF11409df5c";
export const vDAI = "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1";
export const vBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
export const vETH = "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8";
export const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
export const vWBNB = "0x6bCa74586218dB34cdB402295796b79663d816e9";
export const vXRP = "0xB248a295732e0225acd3337607cc01068e3b9c10";
export const vBTC = "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B";
export const vBCH = "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176";
export const vLTC = "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B";
export const vLINK = "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f";
export const vADA = "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec";
export const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
export const vAAVE = "0x26DA28954763B92139ED49283625ceCAf52C6f94";
export const vDOGE = "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71";
export const vSXP = "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0";
export const vFIL = "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343";
export const vTUSD = "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E";

// ──────────────────────────────────────────────────────────
// Borrower addresses (27 accounts with bad debt > $10)
// ──────────────────────────────────────────────────────────
export const ACCOUNT_1 = "0x1a35bd28efd46cfc46c2136f878777d69ae16231";
export const ACCOUNT_2 = "0x737bc98f1d34e19539c074b8ad1169d5d45da619";
export const ACCOUNT_3 = "0x489a8756c18c0b8b24ec2a2b9ff3d4d447f79bec";
export const ACCOUNT_4 = "0x448ca4bc5e3407ce67bc9d7185cef5b34c3adef8";
export const ACCOUNT_5 = "0x85ca0dff027102ea3fbf1c077524eab21d1f7927";
export const ACCOUNT_6 = "0xddbf9868d960fd2433ba762faf46024881cd9916";
export const ACCOUNT_7 = "0xa72e1756426100c6207421471449e2ba9a917e86";
export const ACCOUNT_8 = "0x1dc0f176519ec89adc2fa16d0fb1163afd617c9c";
export const ACCOUNT_9 = "0x9958ed7f2441c208821ea14643224812a006d221";
export const ACCOUNT_10 = "0x6efee96287b5e1a2ef966e25bae15a54bde9b83e";
export const ACCOUNT_11 = "0x2c58d31559d65242cf7915a4fd89fcab9c96f7df";
export const ACCOUNT_12 = "0xdff9e1b12dfb7103231128940a19c2896f049de8";
export const ACCOUNT_13 = "0xa87f0d31846211ce417128a770c681fc342d3a74";
export const ACCOUNT_14 = "0xd4842ad6e4b96de9c250857f0822897c5b283d0d";
export const ACCOUNT_15 = "0x73b6a7a6e39a2e405087164d7f407a0bd2c86dcc";
export const ACCOUNT_16 = "0x2ee9d239df727454d2bdf76aea18f1c51aa196cc";
export const ACCOUNT_17 = "0xd7b67276fc0ef1079331494139f40fa3632d6125";
export const ACCOUNT_18 = "0x10e086957b9a5c0073f582aeeadaed7c37f8df9d";
export const ACCOUNT_19 = "0x9454f17a6bcc36cfbc8a07011b33dafcebe4050b";
export const ACCOUNT_20 = "0x0ceede04b0350e5251ba8919e131d60e3e063618";
export const ACCOUNT_21 = "0xbb81da9040b0ea33d56cf29a688856b40a7b400c";
export const ACCOUNT_22 = "0xf942e8436918163590ec858279233a6f7efccd94";
export const ACCOUNT_23 = "0xe73d283293efe2d9225825bc7a382f7008244c2b";
export const ACCOUNT_24 = "0xc234723994b035ce916e8a02878163046bc0940c";
export const ACCOUNT_25 = "0xb71d994b57594d9a61be011cfcf901e4aa36788f";
export const ACCOUNT_26 = "0x716bab7286be25cce2deb36e892056f4b4ad07c9";
export const ACCOUNT_27 = "0x770f97e8562eb40a181151587c2e473a604a18f6";

// ──────────────────────────────────────────────────────────
// Repayment data types
// ──────────────────────────────────────────────────────────
export interface BorrowerRepayment {
  address: string;
  amount: BigNumber;
}

export interface TokenRepayment {
  name: string;
  underlying: string;
  vToken: string;
  borrowers: BorrowerRepayment[];
}

export interface NativeBNBRepayment {
  address: string;
  amount: BigNumber;
}

// 3% overhead to cover interest accrual during ~48h timelock delay
const withOverhead = (amount: BigNumber): BigNumber => amount.mul(103).div(100);

// ──────────────────────────────────────────────────────────
// Part 1: Repayments sourced from Risk Fund
// Tokens available in Risk Fund: ETH, USDT, WBNB, BTCB
// ──────────────────────────────────────────────────────────
export const REPAYMENTS_FROM_RISK_FUND: TokenRepayment[] = [
  {
    name: "ETH",
    underlying: ETH,
    vToken: vETH,
    borrowers: [
      { address: ACCOUNT_3, amount: withOverhead(parseUnits("0.013", 18)) },
      { address: ACCOUNT_6, amount: withOverhead(parseUnits("1.579", 18)) },
      { address: ACCOUNT_15, amount: withOverhead(parseUnits("0.0022", 18)) },
      { address: ACCOUNT_23, amount: withOverhead(parseUnits("0.0015", 18)) },
    ],
  },
  {
    name: "USDT",
    underlying: USDT,
    vToken: vUSDT,
    borrowers: [
      { address: ACCOUNT_3, amount: withOverhead(parseUnits("0.111", 18)) },
      { address: ACCOUNT_5, amount: withOverhead(parseUnits("7.644", 18)) },
      { address: ACCOUNT_8, amount: withOverhead(parseUnits("1581.51", 18)) },
      { address: ACCOUNT_14, amount: withOverhead(parseUnits("0.352", 18)) },
      { address: ACCOUNT_18, amount: withOverhead(parseUnits("21.447", 18)) },
      { address: ACCOUNT_26, amount: withOverhead(parseUnits("0.007", 18)) },
    ],
  },
  {
    name: "WBNB",
    underlying: WBNB,
    vToken: vWBNB,
    borrowers: [{ address: ACCOUNT_1, amount: withOverhead(parseUnits("0.206", 18)) }],
  },
  {
    name: "BTCB",
    underlying: BTCB,
    vToken: vBTC,
    borrowers: [
      { address: ACCOUNT_1, amount: withOverhead(parseUnits("0.00096", 18)) },
      { address: ACCOUNT_3, amount: withOverhead(parseUnits("0.000048", 18)) },
      { address: ACCOUNT_14, amount: withOverhead(parseUnits("0.000008", 18)) },
      { address: ACCOUNT_15, amount: withOverhead(parseUnits("0.000098", 18)) },
    ],
  },
];

// ──────────────────────────────────────────────────────────
// Part 2: Repayments sourced from Treasury
// Treasury tokens withdrawn → Timelock repays → Risk Fund reimburses Treasury with USDT
// ──────────────────────────────────────────────────────────

// BEP20 tokens from Treasury — Part 1 (VIP-605): CAKE, DAI, XRP, BCH, LTC, LINK, ADA, USDC, AAVE, DOGE
// NOTE: THE repayment is handled separately in VIP-690 via sweepTokenAndSync
export const REPAYMENTS_FROM_TREASURY_PART1: TokenRepayment[] = [
  // Partially covered tokens (remaining sourced via OTC in Part 3)
  {
    name: "CAKE",
    underlying: CAKE,
    vToken: vCAKE,
    borrowers: [
      // Account 1 has 1,184,192.16 CAKE debt, Treasury has ~146,760.416 CAKE → partial repayment
      { address: ACCOUNT_1, amount: parseUnits("146760.416", 18) },
    ],
  },
  {
    name: "DAI",
    underlying: DAI,
    vToken: vDAI,
    borrowers: [
      // Account 25: 6.487 DAI fully repaid
      { address: ACCOUNT_25, amount: parseUnits("6.487", 18) },
      // Account 3: 57,827.94 total, partial repay with remaining (17,315.546 - 6.487 = 17,309.059)
      { address: ACCOUNT_3, amount: parseUnits("17309.059", 18) },
    ],
  },
  // Fully covered tokens
  {
    name: "XRP",
    underlying: XRP,
    vToken: vXRP,
    borrowers: [
      { address: ACCOUNT_15, amount: withOverhead(parseUnits("4.096", 18)) },
      { address: ACCOUNT_16, amount: withOverhead(parseUnits("16.505", 18)) },
      { address: ACCOUNT_17, amount: withOverhead(parseUnits("13.704", 18)) },
      { address: ACCOUNT_19, amount: withOverhead(parseUnits("6.425", 18)) },
      { address: ACCOUNT_20, amount: withOverhead(parseUnits("6.194", 18)) },
      { address: ACCOUNT_21, amount: withOverhead(parseUnits("4.003", 18)) },
      { address: ACCOUNT_22, amount: withOverhead(parseUnits("9.225", 18)) },
      { address: ACCOUNT_23, amount: withOverhead(parseUnits("3.781", 18)) },
      { address: ACCOUNT_24, amount: withOverhead(parseUnits("8.343", 18)) },
      { address: ACCOUNT_25, amount: withOverhead(parseUnits("2.833", 18)) },
      { address: ACCOUNT_26, amount: withOverhead(parseUnits("7.020", 18)) },
      { address: ACCOUNT_27, amount: withOverhead(parseUnits("7.547", 18)) },
    ],
  },
  {
    name: "BCH",
    underlying: BCH,
    vToken: vBCH,
    borrowers: [
      { address: ACCOUNT_14, amount: withOverhead(parseUnits("0.0155", 18)) },
      { address: ACCOUNT_15, amount: withOverhead(parseUnits("0.021", 18)) },
    ],
  },
  {
    name: "LTC",
    underlying: LTC,
    vToken: vLTC,
    borrowers: [
      { address: ACCOUNT_21, amount: withOverhead(parseUnits("0.137", 18)) },
      { address: ACCOUNT_23, amount: withOverhead(parseUnits("0.000001", 18)) },
    ],
  },
  {
    name: "LINK",
    underlying: LINK,
    vToken: vLINK,
    borrowers: [{ address: ACCOUNT_14, amount: withOverhead(parseUnits("0.729", 18)) }],
  },
  {
    name: "ADA",
    underlying: ADA,
    vToken: vADA,
    borrowers: [
      { address: ACCOUNT_19, amount: withOverhead(parseUnits("14.151", 18)) },
      { address: ACCOUNT_21, amount: withOverhead(parseUnits("10.546", 18)) },
    ],
  },
  {
    name: "USDC",
    underlying: USDC,
    vToken: vUSDC,
    borrowers: [
      { address: ACCOUNT_1, amount: withOverhead(parseUnits("2.33", 18)) },
      { address: ACCOUNT_3, amount: withOverhead(parseUnits("0.000024", 18)) },
      { address: ACCOUNT_20, amount: withOverhead(parseUnits("2.391", 18)) },
    ],
  },
  {
    name: "AAVE",
    underlying: AAVE,
    vToken: vAAVE,
    borrowers: [{ address: ACCOUNT_14, amount: withOverhead(parseUnits("0.038", 18)) }],
  },
  {
    name: "DOGE",
    underlying: DOGE,
    vToken: vDOGE,
    borrowers: [{ address: ACCOUNT_19, amount: withOverhead(parseUnits("38.931", 8)) }],
  },
];

// BEP20 tokens from Treasury — Part 2: SXP, FIL, TUSD
export const REPAYMENTS_FROM_TREASURY_PART2: TokenRepayment[] = [
  {
    name: "SXP",
    underlying: SXP,
    vToken: vSXP,
    borrowers: [
      { address: ACCOUNT_17, amount: withOverhead(parseUnits("0.678", 18)) },
      { address: ACCOUNT_20, amount: withOverhead(parseUnits("2.427", 18)) },
      { address: ACCOUNT_21, amount: withOverhead(parseUnits("0.561", 18)) },
      { address: ACCOUNT_22, amount: withOverhead(parseUnits("13.101", 18)) },
    ],
  },
  {
    name: "FIL",
    underlying: FIL,
    vToken: vFIL,
    borrowers: [{ address: ACCOUNT_15, amount: withOverhead(parseUnits("0.168", 18)) }],
  },
  {
    name: "TUSD",
    underlying: TUSD,
    vToken: vTUSD,
    borrowers: [{ address: ACCOUNT_20, amount: withOverhead(parseUnits("0.014", 18)) }],
  },
];

// Native BNB repayments from Treasury (uses withdrawTreasuryBNB + repayBorrowBehalf with value)
// 3% overhead ensures sufficient BNB is withdrawn; the helper contract returns any unused BNB to Timelock.
export const BNB_REPAYMENTS: NativeBNBRepayment[] = [
  { address: ACCOUNT_1, amount: withOverhead(parseUnits("0.00926", 18)) },
  { address: ACCOUNT_4, amount: withOverhead(parseUnits("15.1157", 18)) },
  { address: ACCOUNT_14, amount: withOverhead(parseUnits("0.01397", 18)) },
  { address: ACCOUNT_20, amount: withOverhead(parseUnits("0.00672", 18)) },
  { address: ACCOUNT_23, amount: withOverhead(parseUnits("0.00558", 18)) },
];

// ──────────────────────────────────────────────────────────
// Part 3: OTC — tokens that cannot be fully sourced
// Sweep USDT from Risk Fund to Dev Wallet for OTC conversion
// ──────────────────────────────────────────────────────────
// Shortfall based on current prices; THE portion self-covered via vTHE sweep
export const USDT_TO_OTC = parseUnits("1520000", 18);

// ──────────────────────────────────────────────────────────
// Treasury reimbursement — USDT equivalent of all tokens withdrawn from Treasury
// ──────────────────────────────────────────────────────────
// ~$237,000: CAKE ~$210k + DAI ~$17.3k + BNB ~$10.1k + others ~$177
export const USDT_TREASURY_REIMBURSEMENT = parseUnits("237000", 18);

// ──────────────────────────────────────────────────────────
// Helper to compute total amount per token
// ──────────────────────────────────────────────────────────
export const totalForToken = (repayment: TokenRepayment): BigNumber =>
  repayment.borrowers.reduce((sum, b) => sum.add(b.amount), BigNumber.from(0));

export const totalBNB = (): BigNumber => BNB_REPAYMENTS.reduce((sum, b) => sum.add(b.amount), BigNumber.from(0));
