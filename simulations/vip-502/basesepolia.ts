import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import { PSR } from "../../multisig/proposals/basesepolia/vip-003";
import vip007 from "../../multisig/proposals/basesepolia/vip-007";
import { PLP, PRIME } from "../../multisig/proposals/basesepolia/vip-007";
import vip502, {
  BOUND_VALIDATOR,
  COMPTROLLERS,
  VTOKENS,
  XVS_BRIDGE,
  XVS_BRIDGE_ADMIN,
  XVS_STORE,
} from "../../vips/vip-502/bsctestnet";
import COMPTROLLER_ABI from "../vip-502/abi/Comptroller.json";
import PRIME_ABI from "../vip-502/abi/Prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "../vip-502/abi/PrimeLiquidityProvider.json";
import PSR_ABI from "../vip-502/abi/ProtocolShareReserve.json";
import VTOKEN_ABI from "../vip-502/abi/VToken.json";
import XVS_STORE_ABI from "../vip-502/abi/XVSStore.json";
import XVS_VAULT_PROXY_ABI from "../vip-502/abi/XVSVaultProxy.json";
import BOUND_VALIDATOR_ABI from "../vip-502/abi/boundValidator.json";
import CHAINLINK_ORACLE_ABI from "../vip-502/abi/chainlinkOracle.json";
import RESILLIENT_ORACLE_ABI from "../vip-502/abi/resilientOracle.json";
import TREASURY_ABI from "../vip-502/abi/treasury.json";
import XVS_BRIDGE_ABI from "../vip-502/abi/xvsBridge.json";
import XVS_BRIDGE_ADMIN_ABI from "../vip-502/abi/xvsBridgeAdmin.json";

const { basesepolia } = NETWORK_ADDRESSES;

forking(19374669, async () => {
  const provider = ethers.provider;
  let prime: Contract;
  let plp: Contract;
  const xvsVaultProxy = new ethers.Contract(basesepolia.XVS_VAULT_PROXY, XVS_VAULT_PROXY_ABI, provider);
  const xvsStore = new ethers.Contract(XVS_STORE, XVS_STORE_ABI, provider);
  let chainLinkOracle: Contract;
  let redstoneOracle: Contract;
  let resilientOracle: Contract;
  let boundValidator: Contract;
  let xvsBridgeAdmin: Contract;
  let xvsBridge: Contract;
  let treasury: Contract;

  before(async () => {
    prime = new ethers.Contract(PRIME, PRIME_ABI, provider);
    plp = new ethers.Contract(PLP, PRIME_LIQUIDITY_PROVIDER_ABI, provider);
    chainLinkOracle = new ethers.Contract(basesepolia.CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, provider);
    redstoneOracle = new ethers.Contract(basesepolia.REDSTONE_ORACLE, CHAINLINK_ORACLE_ABI, provider);
    resilientOracle = new ethers.Contract(basesepolia.RESILIENT_ORACLE, RESILLIENT_ORACLE_ABI, provider);
    boundValidator = new ethers.Contract(BOUND_VALIDATOR, BOUND_VALIDATOR_ABI, provider);
    xvsBridgeAdmin = await ethers.getContractAt(XVS_BRIDGE_ADMIN_ABI, XVS_BRIDGE_ADMIN);
    xvsBridge = await ethers.getContractAt(XVS_BRIDGE_ABI, XVS_BRIDGE);
    treasury = await ethers.getContractAt(TREASURY_ABI, basesepolia.VTREASURY);

    await pretendExecutingVip(await vip007());
  });

  testForkedNetworkVipCommands("vip502", await vip502());

  describe("Post-VIP behavior", async () => {
    it(`correct owner `, async () => {
      expect(await prime.owner()).to.equal(basesepolia.NORMAL_TIMELOCK);
      expect(await plp.owner()).to.equal(basesepolia.NORMAL_TIMELOCK);
    });

    it(`correct owner for psr`, async () => {
      const psr = new ethers.Contract(PSR, PSR_ABI, provider);
      expect(await psr.owner()).to.equal(basesepolia.NORMAL_TIMELOCK);
    });

    for (const comptrollerAddress of COMPTROLLERS) {
      it(`correct owner for ${comptrollerAddress}`, async () => {
        const c = new ethers.Contract(comptrollerAddress, COMPTROLLER_ABI, provider);
        expect(await c.owner()).to.equal(basesepolia.NORMAL_TIMELOCK);
      });
    }

    for (const vTokenAddress of VTOKENS) {
      it(`correct owner for ${vTokenAddress}`, async () => {
        const v = new ethers.Contract(vTokenAddress, VTOKEN_ABI, provider);
        expect(await v.owner()).to.equal(basesepolia.NORMAL_TIMELOCK);
      });
    }

    it("should have the correct pending owner", async () => {
      expect(await xvsVaultProxy.admin()).to.equal(basesepolia.NORMAL_TIMELOCK);
      expect(await xvsStore.admin()).to.equal(basesepolia.NORMAL_TIMELOCK);
    });

    it("XVSBridgeAdmin ownership transferred to Normal Timelock", async () => {
      expect(await xvsBridgeAdmin.owner()).to.be.equals(basesepolia.NORMAL_TIMELOCK);
    });
    it("Normal Timelock should be whitelisted", async () => {
      expect(await xvsBridge.whitelist(basesepolia.NORMAL_TIMELOCK)).to.be.true;
    });
    it("oracles should have correct owner", async () => {
      expect(await resilientOracle.owner()).equals(basesepolia.NORMAL_TIMELOCK);
      expect(await chainLinkOracle.owner()).equals(basesepolia.NORMAL_TIMELOCK);
      expect(await redstoneOracle.owner()).equals(basesepolia.NORMAL_TIMELOCK);
      expect(await boundValidator.owner()).equals(basesepolia.NORMAL_TIMELOCK);
    });
    it("Normal Timelock should be the owner of the Vtreasury", async () => {
      expect(await treasury.owner()).equals(basesepolia.NORMAL_TIMELOCK);
    });
  });
});
