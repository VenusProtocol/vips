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
export const BSCTESTNET_BRAVO_NEW_IMPL = "0x1789237eF2Db11D7fA8F91ff7FbdCAB40581C3F6";
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

export const vip482 = () => {
  const meta = {
    version: "v2",
    title:
      "Reduce the distribution speeds and upgrade implementations considering the update of the blockrate on BNB Chain",
    description: ``,
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
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip482;
