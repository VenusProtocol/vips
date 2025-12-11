import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const BSCTESTNET_XVS_VAULT_PROXY = "0x9aB56bAD2D7631B2A857ccf36d998232A8b82280";
export const BSCTESTNET_COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const BSCTESTNET_XVS = "0xB9e0E753630434d7863528cc73CB7AC638a7c8ff";
export const BSCTESTNET_BTCB = "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4";
export const BSCTESTNET_ETH = "0x98f7A83361F7Ac8765CcEBAB1425da6b341958a7";
export const BSCTESTNET_USDC = "0x16227D60f7a0e586C66B005219dfc887D13C9531";
export const BSCTESTNET_USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";

// Block reward calculations adjusted for new block time (0.45s vs 0.75s)
// Formula: old_rate * 100 / 167 (equivalent to dividing by 1.67)
// Block time ratio: 0.75s / 0.45s = 1.67
export const BSCTESTNET_XVS_PER_BLOCK_REWARD = parseUnits("0.0025", 18).mul(100).div(167);
export const BSCTESTNET_BTCB_PER_BLOCK_REWARD = parseUnits("0.000000315393518518", 18).mul(100).div(167);
export const BSCTESTNET_ETH_PER_BLOCK_REWARD = parseUnits("0.000006109664351851", 18).mul(100).div(167);
export const BSCTESTNET_USDC_PER_BLOCK_REWARD = parseUnits("0.007", 6).mul(100).div(167);
export const BSCTESTNET_USDT_PER_BLOCK_REWARD = parseUnits("0.007", 6).mul(100).div(167);
export const BSCTESTNET_VAI_VAULT_RATE_PER_BLOCK = parseUnits("0.048", 18).mul(100).div(167);

// Updated block rate for 0.45 second blocks
// Previous: 42,048,000 blocks/year (0.75s per block)
// New: 70,080,000 blocks/year (0.45s per block)
// Calculation: 365.25 days * 24 hours * 3600 seconds / 0.45s = 70,080,000
const BSCTESTNET_NEW_BLOCK_RATE = 70080000;

export const BSCTESTNET_DEFAULT_PROXY_ADMIN = "0x7877ffd62649b6a1557b55d4c20fcbab17344c91";
export const BSCTESTNET_PRIME_PROXY = "0xe840F8EC2Dc50E7D22e5e2991975b9F6e34b62Ad";
export const BSCTESTNET_PLP_PROXY = "0xAdeddc73eAFCbed174e6C400165b111b0cb80B7E";
export const BSCTESTNET_VAI_UNITROLLER = "0xf70C3C6b749BbAb89C081737334E74C9aFD4BE16";
export const BSCTESTNET_NEW_VAI_IMPLEMENTATION = "0xC1CE7174D58f177fd2b418292A6E60CDE9bACF78";
export const BSCTESTNET_NEW_PLP_IMPLEMENTATION = "0xbc85D7c9F7BdB348bd31d726ADa716d7efAEaBfB";
export const BSCTESTNET_NEW_PRIME_IMPLEMENTATION = "0x3C439A567C0f66b3D2Ca682327fC303Ec3Fb82D9";
export const BSCTESTNET_VTOKEN_BEACON = "0xBF85A90673E61956f8c79b9150BAB7893b791bDd";
export const BSCTESTNET_NEW_VTOKEN_IMPLEMENTATION = "0x6109c4E3BaaF98da6A9822B1d16AB101088208B7";
export const BSCTESTNET_VSLIS_BEACON = "0x1103Bec24Eb194d69ae116d62DD9559412E7C23A";
export const BSCTESTNET_VPLANET_BEACON = "0x6f48cf8e94562b5c37be1d0b6c50c845118cc498";
export const BSCTESTNET_GOVERNANCE_BRAVO = "0x5573422A1a59385C247ec3a66B93B7C08eC2f8f2";
export const BSCTESTNET_SHORTFALL_PROXY = "0x503574a82fE2A9f968d355C8AAc1Ba0481859369";
export const BSCTESTNET_NEW_SHORTFALL_IMPLEMENTATION = "0x84B09BC76ABA4c0FC45616AdD44017b678FBCA87";

// Governance voting parameters adjusted for new block rate
// All periods/delays multiplied by 1.67 to maintain same time duration
// Formula: old_blocks * 167 / 100 (equivalent to multiplying by 1.67)
export const MIN_VOTING_PERIOD = 334;
export const MAX_VOTING_PERIOD = 1336;
export const MIN_VOTING_DELAY = 1;
export const MAX_VOTING_DELAY = 1346688;

export const NT_VOTING_PERIOD = 1002;
export const NT_VOTING_DELAY = 1002;
export const NT_PROPOSAL_THRESHOLD = parseUnits("150000", 18);

export const FT_VOTING_PERIOD = 668;
export const FT_VOTING_DELAY = 668;
export const FT_PROPOSAL_THRESHOLD = parseUnits("200000", 18);

export const CT_VOTING_PERIOD = 334;
export const CT_VOTING_DELAY = 334;
export const CT_PROPOSAL_THRESHOLD = parseUnits("250000", 18);

export const PROPOSAL_CONFIGS = [
  [NT_VOTING_DELAY, NT_VOTING_PERIOD, NT_PROPOSAL_THRESHOLD],
  [FT_VOTING_DELAY, FT_VOTING_PERIOD, FT_PROPOSAL_THRESHOLD],
  [CT_VOTING_DELAY, CT_VOTING_PERIOD, CT_PROPOSAL_THRESHOLD],
];

export interface SpeedRecord {
  market: string;
  symbol: string;
  supplySideSpeed: string;
  borrowSideSpeed: string;
}

// Previous XVS emissions data for BSCTESTNET markets
export const PREVIOUS_XVS_EMISSIONS: SpeedRecord[] = [
  {
    market: "0x35566ED3AF9E537Be487C98b1811cDf95ad0C32b",
    symbol: "vWBETH",
    supplySideSpeed: "149110243055555",
    borrowSideSpeed: "149110243055555",
  },
  {
    market: "0x369Fea97f6fB7510755DCA389088d9E2e2819278",
    symbol: "vTRXOLD",
    supplySideSpeed: "217013888888889",
    borrowSideSpeed: "217013888888889",
  },
  {
    market: "0x6AF3Fdb3282c5bb6926269Db10837fa8Aec67C04",
    symbol: "vTRX",
    supplySideSpeed: "217013888888888",
    borrowSideSpeed: "217013888888888",
  },
  {
    market: "0xF06e662a00796c122AaAE935EC4F0Be3F74f5636",
    symbol: "vFDUSD",
    supplySideSpeed: "43402777777777",
    borrowSideSpeed: "43402777777777",
  },
  {
    market: "0xEFAACF73CE2D38ED40991f29E72B12C74bd4cf23",
    symbol: "vTUSD",
    supplySideSpeed: "54253472222222",
    borrowSideSpeed: "54253472222222",
  },
  {
    market: "0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c",
    symbol: "vBNB",
    supplySideSpeed: "13020833250000000",
    borrowSideSpeed: "13020833250000000",
  },
  {
    market: "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A",
    symbol: "vUSDT",
    supplySideSpeed: "4340277750000000",
    borrowSideSpeed: "4340277750000000",
  },
  {
    market: "0x171B468b52d7027F12cEF90cd065d6776a25E24e",
    symbol: "vUNI",
    supplySideSpeed: "20312500000000",
    borrowSideSpeed: "20312500000000",
  },
  {
    market: "0x162D005F0Fff510E54958Cfc5CF32A3180A84aab",
    symbol: "vETH",
    supplySideSpeed: "2170139000000000",
    borrowSideSpeed: "2170139000000000",
  },
  {
    market: "0xAfc13BC065ABeE838540823431055D2ea52eBA52",
    symbol: "vLTC",
    supplySideSpeed: "2170139000000000",
    borrowSideSpeed: "2170139000000000",
  },
  {
    market: "0xb6e9322C49FD75a367Fcb17B0Fcd62C5070EbCBe",
    symbol: "vBTCB",
    supplySideSpeed: "13020833250000000",
    borrowSideSpeed: "13020833250000000",
  },
  {
    market: "0x488aB2826a154da01CC4CC16A8C83d4720D3cA2C",
    symbol: "vXRP",
    supplySideSpeed: "2170139000000000",
    borrowSideSpeed: "2170139000000000",
  },
  {
    market: "0x74469281310195A04840Daf6EdF576F559a3dE80",
    symbol: "vSXP",
    supplySideSpeed: "217013888888888",
    borrowSideSpeed: "217013888888888",
  },
  {
    market: "0x37C28DE42bA3d22217995D146FC684B2326Ede64",
    symbol: "vADA",
    supplySideSpeed: "759548611111110",
    borrowSideSpeed: "759548611111110",
  },
  {
    market: "0xeDaC03D29ff74b5fDc0CC936F6288312e1459BC6",
    symbol: "vCAKE",
    supplySideSpeed: "759548611111110",
    borrowSideSpeed: "759548611111110",
  },
  {
    market: "0x714db6c38A17883964B68a07d56cE331501d9eb6",
    symbol: "vAAVE",
    supplySideSpeed: "108506944444444",
    borrowSideSpeed: "108506944444444",
  },
  {
    market: "0xF912d3001CAf6DC4ADD366A62Cc9115B4303c9A9",
    symbol: "vDOGE",
    supplySideSpeed: "397612847222222",
    borrowSideSpeed: "397612847222222",
  },
  {
    market: "0xD5C4C2e2facBEB59D0216D0595d63FcDc6F9A1a7",
    symbol: "vUSDC",
    supplySideSpeed: "4340277750000000",
    borrowSideSpeed: "4340277750000000",
  },
];

export const vip572 = () => {
  const meta = {
    version: "v2",
    title:
      "Reduce the distribution speeds and upgrade implementations considering the update of the blockrate on BNB Chain Fermi Upgrade",
    description: `Reduce the distribution speeds and upgrade implementations considering the update of the blockrate on BNB Chain`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: BSCTESTNET_XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [BSCTESTNET_XVS, BSCTESTNET_XVS_PER_BLOCK_REWARD],
      },
      {
        target: BSCTESTNET_COMPTROLLER,
        signature: "_setVenusVAIVaultRate(uint256)",
        params: [BSCTESTNET_VAI_VAULT_RATE_PER_BLOCK],
      },
      {
        target: BSCTESTNET_PLP_PROXY,
        signature: "setTokensDistributionSpeed(address[],uint256[])",
        params: [
          [BSCTESTNET_BTCB, BSCTESTNET_ETH, BSCTESTNET_USDC, BSCTESTNET_USDT],
          [
            BSCTESTNET_BTCB_PER_BLOCK_REWARD,
            BSCTESTNET_ETH_PER_BLOCK_REWARD,
            BSCTESTNET_USDC_PER_BLOCK_REWARD,
            BSCTESTNET_USDT_PER_BLOCK_REWARD,
          ],
        ],
      },
      {
        target: BSCTESTNET_DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [BSCTESTNET_PRIME_PROXY, BSCTESTNET_NEW_PRIME_IMPLEMENTATION],
      },
      {
        target: BSCTESTNET_DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [BSCTESTNET_PLP_PROXY, BSCTESTNET_NEW_PLP_IMPLEMENTATION],
      },
      {
        target: BSCTESTNET_VTOKEN_BEACON,
        signature: "upgradeTo(address)",
        params: [BSCTESTNET_NEW_VTOKEN_IMPLEMENTATION],
      },
      // VSLIS & VPLANET is pointing to different Beacon
      {
        target: BSCTESTNET_VSLIS_BEACON,
        signature: "upgradeTo(address)",
        params: [BSCTESTNET_NEW_VTOKEN_IMPLEMENTATION],
      },
      {
        target: BSCTESTNET_VPLANET_BEACON,
        signature: "upgradeTo(address)",
        params: [BSCTESTNET_NEW_VTOKEN_IMPLEMENTATION],
      },

      {
        target: BSCTESTNET_VAI_UNITROLLER,
        signature: "_setPendingImplementation(address)",
        params: [BSCTESTNET_NEW_VAI_IMPLEMENTATION],
      },
      {
        target: BSCTESTNET_NEW_VAI_IMPLEMENTATION,
        signature: "_become(address)",
        params: [BSCTESTNET_VAI_UNITROLLER],
      },

      // set new block rate in xvs vault
      {
        target: BSCTESTNET_XVS_VAULT_PROXY,
        signature: "setBlocksPerYear(uint256)",
        params: [BSCTESTNET_NEW_BLOCK_RATE],
      },

      // Update validation params in Bravo
      {
        target: BSCTESTNET_GOVERNANCE_BRAVO,
        signature: "setValidationParams((uint256,uint256,uint256,uint256))",
        params: [[MIN_VOTING_PERIOD, MAX_VOTING_PERIOD, MIN_VOTING_DELAY, MAX_VOTING_DELAY]],
      },

      {
        target: BSCTESTNET_GOVERNANCE_BRAVO,
        signature: "setProposalConfigs((uint256,uint256,uint256)[])",
        params: [PROPOSAL_CONFIGS],
      },

      // Update XVS market emissions
      {
        target: BSCTESTNET_COMPTROLLER,
        signature: "_setVenusSpeeds(address[],uint256[],uint256[])",
        params: [
          PREVIOUS_XVS_EMISSIONS.map(s => s.market),
          PREVIOUS_XVS_EMISSIONS.map(s => BigNumber.from(s.supplySideSpeed).mul(100).div(167).toString()),
          PREVIOUS_XVS_EMISSIONS.map(s => BigNumber.from(s.borrowSideSpeed).mul(100).div(167).toString()),
        ],
      },
      {
        target: BSCTESTNET_DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [BSCTESTNET_SHORTFALL_PROXY, BSCTESTNET_NEW_SHORTFALL_IMPLEMENTATION],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip572;
