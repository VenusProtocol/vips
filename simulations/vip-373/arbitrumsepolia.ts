import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip014, { ACM } from "../../multisig/proposals/arbitrumsepolia/vip-014";
import vip373, {
  ARBITRUM_SEPOLIA_BOUND_VALIDATOR,
  ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN,
} from "../../vips/vip-373/bsctestnet";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import RESILLIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import TREASURY_ABI from "./abi/treasury.json";
import XVS_BRIDGE_ABI from "./abi/xvsBridge.json";
import XVS_BRIDGE_ADMIN_ABI from "./abi/xvsBridgeAdmin.json";

const XVS_BRIDGE = "0xFdC5cEC63FD167DA46cF006585b30D03B104eFD4";
const { arbitrumsepolia } = NETWORK_ADDRESSES;

forking(86016842, async () => {
  const provider = ethers.provider;
  let chainLinkOracle: Contract;
  let redstoneOracle: Contract;
  let resilientOracle: Contract;
  let boundValidator: Contract;
  let xvsBridgeAdmin: Contract;
  let xvsBridge: Contract;
  let treasury: Contract;
  before(async () => {
    chainLinkOracle = new ethers.Contract(arbitrumsepolia.CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, provider);
    redstoneOracle = new ethers.Contract(arbitrumsepolia.REDSTONE_ORACLE, CHAINLINK_ORACLE_ABI, provider);
    resilientOracle = new ethers.Contract(arbitrumsepolia.RESILIENT_ORACLE, RESILLIENT_ORACLE_ABI, provider);
    boundValidator = new ethers.Contract(ARBITRUM_SEPOLIA_BOUND_VALIDATOR, BOUND_VALIDATOR_ABI, provider);
    xvsBridgeAdmin = await ethers.getContractAt(XVS_BRIDGE_ADMIN_ABI, ARBITRUM_SEPOLIA_XVS_BRIDGE_ADMIN);
    xvsBridge = await ethers.getContractAt(XVS_BRIDGE_ABI, XVS_BRIDGE);
    treasury = await ethers.getContractAt(TREASURY_ABI, arbitrumsepolia.VTREASURY);

    await pretendExecutingVip(await vip014());
  });

  testForkedNetworkVipCommands("vip333 XVS Bridge permissions", await vip373());

  describe("Post-VIP behaviour", async () => {
    it("XVSBridgeAdmin ownership transferred to Normal Timelock", async () => {
      expect(await xvsBridgeAdmin.owner()).to.be.equals(arbitrumsepolia.NORMAL_TIMELOCK);
    });
    it("Normal Timelock should be whitelisted", async () => {
      expect(await xvsBridge.whitelist(arbitrumsepolia.NORMAL_TIMELOCK)).to.be.true;
    });
    it("oracles should have correct owner", async () => {
      expect(await resilientOracle.owner()).equals(arbitrumsepolia.NORMAL_TIMELOCK);
      expect(await chainLinkOracle.owner()).equals(arbitrumsepolia.NORMAL_TIMELOCK);
      expect(await redstoneOracle.owner()).equals(arbitrumsepolia.NORMAL_TIMELOCK);
      expect(await boundValidator.owner()).equals(arbitrumsepolia.NORMAL_TIMELOCK);
    });
    it("Normal Timelock should be the owner of the Vtreasury", async () => {
      expect(await treasury.owner()).equals(arbitrumsepolia.NORMAL_TIMELOCK);
    });
  });
});
