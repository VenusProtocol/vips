import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip014 from "../../multisig/proposals/arbitrumone/vip-014";
import vip373, { ARBITRUM_ONE_BOUND_VALIDATOR, ARBITRUM_XVS_BRIDGE_ADMIN } from "../../vips/vip-373/bscmainnet";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import RESILLIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import TREASURY_ABI from "./abi/treasury.json";
import XVS_BRIDGE_ABI from "./abi/xvsBridge.json";
import XVS_BRIDGE_ADMIN_ABI from "./abi/xvsBridgeAdmin.json";

const XVS_BRIDGE = "0x20cEa49B5F7a6DBD78cAE772CA5973eF360AA1e6";
const { arbitrumone } = NETWORK_ADDRESSES;

forking(230362555, async () => {
  const provider = ethers.provider;
  let chainLinkOracle: Contract;
  let redstoneOracle: Contract;
  let resilientOracle: Contract;
  let boundValidator: Contract;
  let treasury: Contract;
  let xvsBridgeAdmin: Contract;
  let xvsBridge: Contract;
  before(async () => {
    chainLinkOracle = new ethers.Contract(arbitrumone.CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, provider);
    redstoneOracle = new ethers.Contract(arbitrumone.REDSTONE_ORACLE, CHAINLINK_ORACLE_ABI, provider);
    resilientOracle = new ethers.Contract(arbitrumone.RESILIENT_ORACLE, RESILLIENT_ORACLE_ABI, provider);
    boundValidator = new ethers.Contract(ARBITRUM_ONE_BOUND_VALIDATOR, BOUND_VALIDATOR_ABI, provider);
    treasury = await ethers.getContractAt(TREASURY_ABI, arbitrumone.VTREASURY);
    xvsBridgeAdmin = await ethers.getContractAt(XVS_BRIDGE_ADMIN_ABI, ARBITRUM_XVS_BRIDGE_ADMIN);
    xvsBridge = await ethers.getContractAt(XVS_BRIDGE_ABI, XVS_BRIDGE);
    await pretendExecutingVip(await vip014());
  });

  testForkedNetworkVipCommands("vip333 XVS Bridge permissions", await vip373());

  describe("Post-VIP behaviour", async () => {
    it("XVSBridgeAdmin ownership transferred to Normal Timelock", async () => {
      expect(await xvsBridgeAdmin.owner()).to.be.equals(arbitrumone.NORMAL_TIMELOCK);
    });
    it("Normal Timelock should be whitelisted", async () => {
      expect(await xvsBridge.whitelist(arbitrumone.NORMAL_TIMELOCK)).to.be.true;
    });
    it("oracles should have correct owner", async () => {
      expect(await resilientOracle.owner()).equals(arbitrumone.NORMAL_TIMELOCK);
      expect(await chainLinkOracle.owner()).equals(arbitrumone.NORMAL_TIMELOCK);
      expect(await redstoneOracle.owner()).equals(arbitrumone.NORMAL_TIMELOCK);
      expect(await boundValidator.owner()).equals(arbitrumone.NORMAL_TIMELOCK);
    });
    it("Normal Timelock should be the owner of the Vtreasury", async () => {
      expect(await treasury.owner()).equals(arbitrumone.NORMAL_TIMELOCK);
    });
  });
});
