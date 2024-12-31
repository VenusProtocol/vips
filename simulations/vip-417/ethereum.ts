import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip061 from "../../multisig/proposals/ethereum/vip-061";
import vip417, {
  ETHEREUM_BOUND_VALIDATOR,
  ETHEREUM_XVS_BRIDGE_ADMIN,
  ETHEREUM_sFrxETH_ORACLE,
} from "../../vips/vip-417/bscmainnet";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import RESILLIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import SFRAXETH_ORACLE_ABI from "./abi/sFrxETHOracle.json";
import TREASURY_ABI from "./abi/treasury.json";
import XVS_BRIDGE_ABI from "./abi/xvsBridge.json";
import XVS_BRIDGE_ADMIN_ABI from "./abi/xvsBridgeAdmin.json";

const XVS_BRIDGE = "0x888E317606b4c590BBAD88653863e8B345702633";
const { ethereum } = NETWORK_ADDRESSES;

forking(20274111, async () => {
  const provider = ethers.provider;
  let xvsBridgeAdmin: Contract;
  let xvsBridge: Contract;
  let chainLinkOracle: Contract;
  let redstoneOracle: Contract;
  let resilientOracle: Contract;
  let boundValidator: Contract;
  let sfraxETH: Contract;
  let treasury: Contract;
  before(async () => {
    xvsBridgeAdmin = await ethers.getContractAt(XVS_BRIDGE_ADMIN_ABI, ETHEREUM_XVS_BRIDGE_ADMIN);
    xvsBridge = await ethers.getContractAt(XVS_BRIDGE_ABI, XVS_BRIDGE);
    chainLinkOracle = new ethers.Contract(ethereum.CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, provider);
    redstoneOracle = new ethers.Contract(ethereum.REDSTONE_ORACLE, CHAINLINK_ORACLE_ABI, provider);
    resilientOracle = new ethers.Contract(ethereum.RESILIENT_ORACLE, RESILLIENT_ORACLE_ABI, provider);
    boundValidator = new ethers.Contract(ETHEREUM_BOUND_VALIDATOR, BOUND_VALIDATOR_ABI, provider);
    sfraxETH = new ethers.Contract(ETHEREUM_sFrxETH_ORACLE, SFRAXETH_ORACLE_ABI, provider);
    treasury = await ethers.getContractAt(TREASURY_ABI, ethereum.VTREASURY);
    await pretendExecutingVip(await vip061());
  });

  testForkedNetworkVipCommands("vip417", await vip417());

  describe("Post-VIP behaviour", async () => {
    it("XVSBridgeAdmin ownership transferred to Normal Timelock", async () => {
      expect(await xvsBridgeAdmin.owner()).to.be.equals(ethereum.NORMAL_TIMELOCK);
    });
    it("Normal Timelock should be whitelisted", async () => {
      expect(await xvsBridge.whitelist(ethereum.NORMAL_TIMELOCK)).to.be.true;
    });
    it("oracles should have correct owner", async () => {
      expect(await resilientOracle.owner()).equals(ethereum.NORMAL_TIMELOCK);
      expect(await chainLinkOracle.owner()).equals(ethereum.NORMAL_TIMELOCK);
      expect(await redstoneOracle.owner()).equals(ethereum.NORMAL_TIMELOCK);
      expect(await boundValidator.owner()).equals(ethereum.NORMAL_TIMELOCK);
      expect(await sfraxETH.owner()).equals(ethereum.NORMAL_TIMELOCK);
    });
    it("Normal Timelock should be the owner of the Vtreasury", async () => {
      expect(await treasury.owner()).equals(ethereum.NORMAL_TIMELOCK);
    });
  });
});
