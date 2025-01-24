import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip061, {
  CONVERTERS,
  CONVERTER_NETWORK,
  NTGs,
  PLP,
  POOL_REGISTRY,
  PRIME,
  PSR,
  XVS_STORE,
} from "../../multisig/proposals/ethereum/vip-073";
import vip418, {
  ETHEREUM_BOUND_VALIDATOR,
  ETHEREUM_XVS_BRIDGE_ADMIN,
  ETHEREUM_sFrxETH_ORACLE,
} from "../../vips/vip-418/bscmainnet";
import OWNERSHIP_ABI from "../vip-416/abi/Ownership.json";

const XVS_BRIDGE = "0x888E317606b4c590BBAD88653863e8B345702633";
const { ethereum } = NETWORK_ADDRESSES;

forking(21686396, async () => {
  const provider = ethers.provider;
  let xvsBridgeAdmin: Contract;
  let xvsBridge: Contract;
  let chainLinkOracle: Contract;
  let redstoneOracle: Contract;
  let resilientOracle: Contract;
  let boundValidator: Contract;
  let sfraxETH: Contract;
  let prime: Contract;
  let plp: Contract;
  let poolRegistry: Contract;

  const xvsVaultProxy = new ethers.Contract(ethereum.XVS_VAULT_PROXY, OWNERSHIP_ABI, provider);
  const xvsStore = new ethers.Contract(XVS_STORE, OWNERSHIP_ABI, provider);

  before(async () => {
    xvsBridgeAdmin = await ethers.getContractAt(OWNERSHIP_ABI, ETHEREUM_XVS_BRIDGE_ADMIN);
    xvsBridge = await ethers.getContractAt(OWNERSHIP_ABI, XVS_BRIDGE);
    chainLinkOracle = new ethers.Contract(ethereum.CHAINLINK_ORACLE, OWNERSHIP_ABI, provider);
    redstoneOracle = new ethers.Contract(ethereum.REDSTONE_ORACLE, OWNERSHIP_ABI, provider);
    resilientOracle = new ethers.Contract(ethereum.RESILIENT_ORACLE, OWNERSHIP_ABI, provider);
    boundValidator = new ethers.Contract(ETHEREUM_BOUND_VALIDATOR, OWNERSHIP_ABI, provider);
    sfraxETH = new ethers.Contract(ETHEREUM_sFrxETH_ORACLE, OWNERSHIP_ABI, provider);
    prime = new ethers.Contract(PRIME, OWNERSHIP_ABI, provider);
    plp = new ethers.Contract(PLP, OWNERSHIP_ABI, provider);
    poolRegistry = new ethers.Contract(POOL_REGISTRY, OWNERSHIP_ABI, provider);

    await pretendExecutingVip(await vip061());
  });

  testForkedNetworkVipCommands("Accept ownerships/admins", await vip418());

  describe("Post-VIP behaviour", async () => {
    it("correct owner for pool registry", async () => {
      expect(await poolRegistry.owner()).to.equal(ethereum.NORMAL_TIMELOCK);
    });

    it(`correct owner for psr`, async () => {
      const psr = new ethers.Contract(PSR, OWNERSHIP_ABI, provider);
      expect(await psr.owner()).to.equal(ethereum.NORMAL_TIMELOCK);
    });

    for (const converter of CONVERTERS) {
      it(`owner for ${converter}`, async () => {
        const c = new ethers.Contract(converter, OWNERSHIP_ABI, provider);
        expect(await c.owner()).to.equal(ethereum.NORMAL_TIMELOCK);
      });
    }

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
    it("should have the correct pending owner", async () => {
      expect(await xvsVaultProxy.admin()).to.equal(ethereum.NORMAL_TIMELOCK);
      expect(await xvsStore.admin()).to.equal(ethereum.NORMAL_TIMELOCK);
    });
    it(`owner for converter network`, async () => {
      const c = new ethers.Contract(CONVERTER_NETWORK, OWNERSHIP_ABI, provider);
      expect(await c.owner()).to.equal(ethereum.NORMAL_TIMELOCK);
    });

    it(`correct owner `, async () => {
      expect(await prime.owner()).to.equal(ethereum.NORMAL_TIMELOCK);
      expect(await plp.owner()).to.equal(ethereum.NORMAL_TIMELOCK);
    });

    for (const ntgAddress of NTGs) {
      it(`correct owner for ${ntgAddress}`, async () => {
        const ntg = new ethers.Contract(ntgAddress, OWNERSHIP_ABI, provider);
        expect(await ntg.owner()).to.equal(ethereum.NORMAL_TIMELOCK);
      });
    }
  });
});
