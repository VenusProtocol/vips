import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const BSCTESTNET_XVS_VAULT_PROXY = "0x9aB56bAD2D7631B2A857ccf36d998232A8b82280";
export const BSCTESTNET_COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const BSCTESTNET_XVS_MARKET = "0x6d6F697e34145Bb95c54E77482d97cc261Dc237E";
export const BSCTESTNET_XVS = "0xB9e0E753630434d7863528cc73CB7AC638a7c8ff";
export const BSCTESTNET_BTCB = "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4";
export const BSCTESTNET_ETH = "0x98f7A83361F7Ac8765CcEBAB1425da6b341958a7";
export const BSCTESTNET_USDC = "0x16227D60f7a0e586C66B005219dfc887D13C9531";
export const BSCTESTNET_USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";

export const BSCTESTNET_XVS_PER_BLOCK_REWARD = parseUnits("0.01", 18).div(2);
export const BSCTESTNET_BTCB_PER_BLOCK_REWARD = parseUnits("0.000001261574074074", 18).div(2);
export const BSCTESTNET_ETH_PER_BLOCK_REWARD = parseUnits("0.000024438657407407", 18).div(2);
export const BSCTESTNET_USDC_PER_BLOCK_REWARD = parseUnits("0.036881", 6).div(2);
export const BSCTESTNET_USDT_PER_BLOCK_REWARD = parseUnits("0.087191", 6).div(2);
export const BSCTESTNET_VAI_VAULT_RATE_PER_BLOCK = parseUnits("0.192", 18).div(2);

export const BSCTESTNET_DEFAULT_PROXY_ADMIN = "0x7877ffd62649b6a1557b55d4c20fcbab17344c91";
export const BSCTESTNET_PRIME_PROXY = "0xe840F8EC2Dc50E7D22e5e2991975b9F6e34b62Ad";
export const BSCTESTNET_PLP_PROXY = "0xAdeddc73eAFCbed174e6C400165b111b0cb80B7E";
export const BSCTESTNET_VAI_UNITROLLER = "0xf70C3C6b749BbAb89C081737334E74C9aFD4BE16";
export const BSCTESTNET_NEW_VAI_IMPLEMENTATION = "0x52558EED5d8f4c86cC2d5EC5DF155521db8d0D48";
export const BSCTESTNET_NEW_PLP_IMPLEMENTATION = "0xD2eBa310E843fC6dc242187501bDf7c0F6b46681";
export const BSCTESTNET_NEW_PRIME_IMPLEMENTATION = "0x73Ac7280b8f3EAF7F621c48ae2398733eD9fBC81";
export const BSCTESTNET_NEW_XVS_VAULT_IMPLEMENTATION = "0x471A33538D8A73fc7148F8B72A2A8BE6Ab9E3723";
export const BSCTESTNET_VTOKEN_BEACON = "0xBF85A90673E61956f8c79b9150BAB7893b791bDd";
export const BSCTESTNET_NEW_VTOKEN_IMPLEMENTATION = "0x78Da3E30a896Afd5E04cBC98fE37b8f027098638";
export const BSCTESTNET_ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
const BSCTESTNET_NEW_BLOCK_RATE = 21024000;
export const BSCTESTNET_VSLIS_BEACON = "0x1103Bec24Eb194d69ae116d62DD9559412E7C23A";
export const BSCTESTNET_VPLANET_BEACON = "0x6f48cf8e94562b5c37be1d0b6c50c845118cc498";
export const BSCTESTNET_GOVERNANCE_BRAVO = "0x5573422A1a59385C247ec3a66B93B7C08eC2f8f2";
export const BSCTESTNET_BRAVO_NEW_IMPL = "0xB30b0b051132930e8E4A77f990CFdf78895f9E1A";
export const BSCTESTNET_GUARDIAN = "0xFEA1c651A47FE29dB9b1bf3cC1f224d8D9CFF68C";

// Doubling the previous value, to be reviewed
export const MIN_VOTING_PERIOD = 50 * 2;
export const MAX_VOTING_PERIOD = 200 * 2;
export const MIN_VOTING_DELAY = 1 * 2;
export const MAX_VOTING_DELAY = 201600 * 2;

export const NT_VOTING_PERIOD = 150 * 2;
export const NT_VOTING_DELAY = 150 * 2;
export const NT_PROPOSAL_THRESHOLD = parseUnits("150000", 18);

export const FT_VOTING_PERIOD = 100 * 2;
export const FT_VOTING_DELAY = 100 * 2;
export const FT_PROPOSAL_THRESHOLD = parseUnits("200000", 18);

export const CT_VOTING_PERIOD = 50 * 2;
export const CT_VOTING_DELAY = 50 * 2;
export const CT_PROPOSAL_THRESHOLD = parseUnits("250000", 18);

export const PROPOSAL_TIMELOCKS = [
  "0xce10739590001705F7FF231611ba4A48B2820327", // NT
  "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6", // FT
  "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D", // CT
];

export const PROPOSAL_CONFIGS = [
  [NT_VOTING_PERIOD, NT_VOTING_DELAY, NT_PROPOSAL_THRESHOLD],
  [FT_VOTING_PERIOD, FT_VOTING_DELAY, FT_PROPOSAL_THRESHOLD],
  [CT_VOTING_PERIOD, CT_VOTING_DELAY, CT_PROPOSAL_THRESHOLD],
];

export interface SpeedRecord {
  market: string;
  symbol: string;
  supplySideSpeed: string;
  borrowSideSpeed: string;
}

export const PREVIOUS_XVS_EMISSIONS: SpeedRecord[] = [
  {
    market: "0x35566ED3AF9E537Be487C98b1811cDf95ad0C32b",
    symbol: "vWBETH",
    supplySideSpeed: "596440972222220",
    borrowSideSpeed: "596440972222220",
  },
  {
    market: "0x369Fea97f6fB7510755DCA389088d9E2e2819278",
    symbol: "vTRXOLD",
    supplySideSpeed: "868055555555556",
    borrowSideSpeed: "868055555555556",
  },
  {
    market: "0x6AF3Fdb3282c5bb6926269Db10837fa8Aec67C04",
    symbol: "vTRX",
    supplySideSpeed: "868055555555555",
    borrowSideSpeed: "868055555555555",
  },
  {
    market: "0xF06e662a00796c122AaAE935EC4F0Be3F74f5636",
    symbol: "vFDUSD",
    supplySideSpeed: "173611111111111",
    borrowSideSpeed: "173611111111111",
  },
  {
    market: "0xEFAACF73CE2D38ED40991f29E72B12C74bd4cf23",
    symbol: "vTUSD",
    supplySideSpeed: "217013888888889",
    borrowSideSpeed: "217013888888889",
  },
  {
    market: "0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c",
    symbol: "vBNB",
    supplySideSpeed: "52083333000000000",
    borrowSideSpeed: "52083333000000000",
  },
  {
    market: "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A",
    symbol: "vUSDT",
    supplySideSpeed: "17361111000000000",
    borrowSideSpeed: "17361111000000000",
  },
  {
    market: "0x171B468b52d7027F12cEF90cd065d6776a25E24e",
    symbol: "vUNI",
    supplySideSpeed: "81250000000000",
    borrowSideSpeed: "81250000000000",
  },
  {
    market: "0x162D005F0Fff510E54958Cfc5CF32A3180A84aab",
    symbol: "vETH",
    supplySideSpeed: "8680556000000000",
    borrowSideSpeed: "8680556000000000",
  },
  {
    market: "0xAfc13BC065ABeE838540823431055D2ea52eBA52",
    symbol: "vLTC",
    supplySideSpeed: "8680556000000000",
    borrowSideSpeed: "8680556000000000",
  },
  {
    market: "0xb6e9322C49FD75a367Fcb17B0Fcd62C5070EbCBe",
    symbol: "vBTCB",
    supplySideSpeed: "52083333000000000",
    borrowSideSpeed: "52083333000000000",
  },
  {
    market: "0x488aB2826a154da01CC4CC16A8C83d4720D3cA2C",
    symbol: "vXRP",
    supplySideSpeed: "8680556000000000",
    borrowSideSpeed: "8680556000000000",
  },
  {
    market: "0x74469281310195A04840Daf6EdF576F559a3dE80",
    symbol: "vSXP",
    supplySideSpeed: "868055555555555",
    borrowSideSpeed: "868055555555555",
  },
  {
    market: "0x37C28DE42bA3d22217995D146FC684B2326Ede64",
    symbol: "vADA",
    supplySideSpeed: "3038194444444440",
    borrowSideSpeed: "3038194444444440",
  },
  {
    market: "0xeDaC03D29ff74b5fDc0CC936F6288312e1459BC6",
    symbol: "vCAKE",
    supplySideSpeed: "3038194444444440",
    borrowSideSpeed: "3038194444444440",
  },
  {
    market: "0x714db6c38A17883964B68a07d56cE331501d9eb6",
    symbol: "vAAVE",
    supplySideSpeed: "434027777777778",
    borrowSideSpeed: "434027777777778",
  },
  {
    market: "0xF912d3001CAf6DC4ADD366A62Cc9115B4303c9A9",
    symbol: "vDOGE",
    supplySideSpeed: "1590451388888890",
    borrowSideSpeed: "1590451388888890",
  },
  {
    market: "0xD5C4C2e2facBEB59D0216D0595d63FcDc6F9A1a7",
    symbol: "vUSDC",
    supplySideSpeed: "17361111000000000",
    borrowSideSpeed: "17361111000000000",
  },
];

export const vip482 = () => {
  const meta = {
    version: "v2",
    title:
      "Reduce the distribution speeds and upgrade implementations considering the update of the blockrate on BNB Chain",
    description: `Reduce the distribution speeds and upgrade implementations considering the update of the blockrate on BNB Chain`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: BSCTESTNET_XVS_VAULT_PROXY,
        signature: "setAccessControl(address)",
        params: [BSCTESTNET_ACM],
      },
      {
        target: BSCTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [BSCTESTNET_XVS_VAULT_PROXY, "setBlocksPerYear(uint256)", NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK],
      },

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
        target: BSCTESTNET_XVS_VAULT_PROXY,
        signature: "_setPendingImplementation(address)",
        params: [BSCTESTNET_NEW_XVS_VAULT_IMPLEMENTATION],
      },
      {
        target: BSCTESTNET_NEW_XVS_VAULT_IMPLEMENTATION,
        signature: "_become(address)",
        params: [BSCTESTNET_XVS_VAULT_PROXY],
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

      // Accept admin of Bravo
      {
        target: BSCTESTNET_GOVERNANCE_BRAVO,
        signature: "_acceptAdmin()",
        params: [],
      },

      // Update Bravo impl
      {
        target: BSCTESTNET_GOVERNANCE_BRAVO,
        signature: "_setImplementation(address)",
        params: [BSCTESTNET_BRAVO_NEW_IMPL],
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
          PREVIOUS_XVS_EMISSIONS.map(s => BigNumber.from(s.supplySideSpeed).div(2).toString()),
          PREVIOUS_XVS_EMISSIONS.map(s => BigNumber.from(s.borrowSideSpeed).div(2).toString()),
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip482;
