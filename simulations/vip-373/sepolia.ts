import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip060, { ACM } from "../../multisig/proposals/sepolia/vip-060";
import vip373, {
  SEPOLIA_BOUND_VALIDATOR,
  SEPOLIA_XVS_BRIDGE_ADMIN,
  SEPOLIA_sFrxETH_ORACLE,
} from "../../vips/vip-373/bsctestnet";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import RESILLIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import SFRAXETH_ORACLE_ABI from "./abi/sFrxETHOracle.json";
import XVS_BRIDGE_ABI from "./abi/xvsBridge.json";
import XVS_BRIDGE_ADMIN_ABI from "./abi/xvsBridgeAdmin.json";

const XVS_BRIDGE = "0xc340b7d3406502F43dC11a988E4EC5bbE536E642";
const { sepolia } = NETWORK_ADDRESSES;

forking(6831661, async () => {
  const provider = ethers.provider;
  let chainLinkOracle: Contract;
  let redstoneOracle: Contract;
  let resilientOracle: Contract;
  let boundValidator: Contract;
  let sfraxETH: Contract;

  before(async () => {
    chainLinkOracle = new ethers.Contract(sepolia.CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, provider);
    redstoneOracle = new ethers.Contract(sepolia.REDSTONE_ORACLE, CHAINLINK_ORACLE_ABI, provider);
    resilientOracle = new ethers.Contract(sepolia.RESILIENT_ORACLE, RESILLIENT_ORACLE_ABI, provider);
    boundValidator = new ethers.Contract(SEPOLIA_BOUND_VALIDATOR, BOUND_VALIDATOR_ABI, provider);
    sfraxETH = new ethers.Contract(SEPOLIA_sFrxETH_ORACLE, SFRAXETH_ORACLE_ABI, provider);

    await pretendExecutingVip(await vip060());
  });

  testForkedNetworkVipCommands("vip333 XVS Bridge permissions", await vip373());

  describe("Post-VIP behaviour", async () => {
    let xvsBridgeAdmin: Contract;
    let xvsBridge: Contract;
    before(async () => {
      xvsBridgeAdmin = await ethers.getContractAt(XVS_BRIDGE_ADMIN_ABI, SEPOLIA_XVS_BRIDGE_ADMIN);
      xvsBridge = await ethers.getContractAt(XVS_BRIDGE_ABI, XVS_BRIDGE);
    });


    it("XVSBridgeAdmin ownership transferred to Normal Timelock", async () => {
      expect(await xvsBridgeAdmin.owner()).to.be.equals(sepolia.NORMAL_TIMELOCK);
    });
    it("Normal Timelock should be whitelisted", async () => {
      expect(await xvsBridge.whitelist(sepolia.NORMAL_TIMELOCK)).to.be.true;
    });
    it("oracles should have correct owner", async () => {
      expect(await resilientOracle.owner()).equals(sepolia.NORMAL_TIMELOCK);
      expect(await chainLinkOracle.owner()).equals(sepolia.NORMAL_TIMELOCK);
      expect(await redstoneOracle.owner()).equals(sepolia.NORMAL_TIMELOCK);
      expect(await boundValidator.owner()).equals(sepolia.NORMAL_TIMELOCK);
      expect(await sfraxETH.owner()).equals(sepolia.NORMAL_TIMELOCK);
    });
  });
});
