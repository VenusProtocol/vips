import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip019, {
  BOUND_VALIDATOR,
  COMPTROLLERS,
  COMPTROLLER_BEACON,
  CONVERTERS,
  CONVERTER_NETWORK,
  DEFAULT_PROXY_ADMIN,
  PLP,
  PRIME,
  PSR,
  REWARD_DISTRIBUTORS,
  SINGLE_TOKEN_CONVERTER_BEACON,
  VTOKENS,
  VTOKEN_BEACON,
  XVS,
  XVS_BRIDGE_ADMIN_PROXY,
  XVS_STORE,
} from "../../../proposals/arbitrumone/vip-019";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import COMPTROLLER_BEACON_ABI from "./abi/ComptrollerBeacon.json";
import CONVERTER_NETWORK_ABI from "./abi/ConverterNetwork.json";
import DEFAULT_PROXY_ADMIN_ABI from "./abi/DefaultProxyAdmin.json";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import PRIME_ABI from "./abi/Prime.json";
import PLP_ABI from "./abi/PrimeLiquidityProvider.json";
import PSR_ABI from "./abi/ProtocolShareReserve.json";
import REWARD_DISTRIBUTOR_ABI from "./abi/RewardDistrbutor.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";
import SINGLE_TOKEN_CONVERTER_BEACON_ABI from "./abi/SingleTokenConverterBeacon.json";
import VTOKEN_ABI from "./abi/VToken.json";
import VTOKEN_BEACON_ABI from "./abi/VTokenBeacon.json";
import XVS_STORE_ABI from "./abi/XVSStore.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import TREASURY_ABI from "./abi/treasury.json";
import XVS_ABI from "./abi/xvs.json";
import XVS_BRIDGE_ADMIN_ABI from "./abi/xvsBridgeAdmin.json";

const { arbitrumone } = NETWORK_ADDRESSES;

const RESILIENT_ORACLE = arbitrumone.RESILIENT_ORACLE;
const CHAINLINK_ORACLE = arbitrumone.CHAINLINK_ORACLE;
const REDSTONE_ORACLE = arbitrumone.REDSTONE_ORACLE;
const NORMAL_TIMELOCK = arbitrumone.NORMAL_TIMELOCK;

forking(290585586, async () => {
  const provider = ethers.provider;
  let proxyAdmin: Contract;
  let prime: Contract;
  let plp: Contract;
  let psr: Contract;
  let comptrollerBeacon: Contract;
  let vTokenBeacon: Contract;
  let poolRegistry: Contract;
  let xvsVault: Contract;
  let xvsStore: Contract;
  let xvs: Contract;
  let xvsBridgeAdmin: Contract;
  let resilientOracle: Contract;
  let chainLinkOracle: Contract;
  let redstoneOracle: Contract;
  let boundValidator: Contract;
  let treasury: Contract;

  describe("Pre-VIP behavior", async () => {
    before(async () => {
      proxyAdmin = new ethers.Contract(DEFAULT_PROXY_ADMIN, DEFAULT_PROXY_ADMIN_ABI, provider);
      prime = new ethers.Contract(PRIME, PRIME_ABI, provider);
      plp = new ethers.Contract(PLP, PLP_ABI, provider);
      psr = new ethers.Contract(PSR, PSR_ABI, provider);
      comptrollerBeacon = new ethers.Contract(COMPTROLLER_BEACON, COMPTROLLER_BEACON_ABI, provider);
      vTokenBeacon = new ethers.Contract(VTOKEN_BEACON, VTOKEN_BEACON_ABI, provider);
      poolRegistry = new ethers.Contract(arbitrumone.POOL_REGISTRY, POOL_REGISTRY_ABI, provider);
      xvsVault = new ethers.Contract(arbitrumone.XVS_VAULT_PROXY, XVS_VAULT_ABI, provider);
      xvsStore = new ethers.Contract(XVS_STORE, XVS_STORE_ABI, provider);
      xvs = await ethers.getContractAt(XVS_ABI, XVS);
      xvsBridgeAdmin = await ethers.getContractAt(XVS_BRIDGE_ADMIN_ABI, XVS_BRIDGE_ADMIN_PROXY);
      resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
      chainLinkOracle = new ethers.Contract(CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, provider);
      redstoneOracle = new ethers.Contract(REDSTONE_ORACLE, CHAINLINK_ORACLE_ABI, provider);
      boundValidator = new ethers.Contract(BOUND_VALIDATOR, BOUND_VALIDATOR_ABI, provider);
      treasury = await ethers.getContractAt(TREASURY_ABI, NETWORK_ADDRESSES.arbitrumone.VTREASURY);
    });

    for (const converter of CONVERTERS) {
      it(`should have no pending owner for ${converter}`, async () => {
        const c = new ethers.Contract(converter, SINGLE_TOKEN_CONVERTER_ABI, provider);
        expect(await c.pendingOwner()).to.equal(ethers.constants.AddressZero);
      });
    }

    // it(`should have guardian as owner for converer beacon`, async () => {
    //   const c = new ethers.Contract(SINGLE_TOKEN_CONVERTER_BEACON, SINGLE_TOKEN_CONVERTER_BEACON_ABI, provider);
    //   expect(await c.owner()).to.equal(arbitrumone.GUARDIAN); // check and fix this.
    // });

    it(`should have no pending owner for converter network`, async () => {
      const c = new ethers.Contract(CONVERTER_NETWORK, CONVERTER_NETWORK_ABI, provider);
      expect(await c.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });

    it("owner of proxy admin is guardian", async () => {
      expect(await proxyAdmin.owner()).to.equal(arbitrumone.GUARDIAN);
    });
    it("pending owner", async () => {
      expect(await prime.pendingOwner()).to.equal(ethers.constants.AddressZero);
      expect(await plp.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });

    for (const rewardDistributor of REWARD_DISTRIBUTORS) {
      it(`should have no pending owner for ${rewardDistributor}`, async () => {
        const c = new ethers.Contract(rewardDistributor, REWARD_DISTRIBUTOR_ABI, provider);
        expect(await c.pendingOwner()).to.equal(ethers.constants.AddressZero);
      });
    }

    it("pending owner of psr", async () => {
      expect(await psr.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });

    for (const comptrollerAddress of COMPTROLLERS) {
      it(`should have no pending owner for ${comptrollerAddress}`, async () => {
        const c = new ethers.Contract(comptrollerAddress, COMPTROLLER_ABI, provider);
        expect(await c.pendingOwner()).to.equal(ethers.constants.AddressZero);
      });
    }

    for (const vTokenAddress of VTOKENS) {
      it(`should have no pending owner for ${vTokenAddress}`, async () => {
        const v = new ethers.Contract(vTokenAddress, VTOKEN_ABI, provider);
        expect(await v.pendingOwner()).to.equal(ethers.constants.AddressZero);
      });
    }

    it("owner of ComptrollerBeacon is guardian", async () => {
      expect(await comptrollerBeacon.owner()).to.equal(arbitrumone.GUARDIAN);
    });

    it("owner of VTokenBeacon is guardian", async () => {
      expect(await vTokenBeacon.owner()).to.equal(arbitrumone.GUARDIAN);
    });

    it("pending owner of PoolRegistry", async () => {
      expect(await poolRegistry.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });
    it("should have no pending owner", async () => {
      expect(await xvsVault.pendingAdmin()).to.equal(ethers.constants.AddressZero);
    });

    it("should have no pending owner", async () => {
      expect(await xvsStore.pendingAdmin()).to.equal(ethers.constants.AddressZero);
    });

    it("should have no pending owner", async () => {
      expect(await resilientOracle.pendingOwner()).to.equal(ethers.constants.AddressZero);
      expect(await chainLinkOracle.pendingOwner()).to.equal(ethers.constants.AddressZero);
      expect(await redstoneOracle.pendingOwner()).to.equal(ethers.constants.AddressZero);
      expect(await boundValidator.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip019());
    });

    for (const converter of CONVERTERS) {
      it(`should have no pending owner for ${converter}`, async () => {
        const c = new ethers.Contract(converter, SINGLE_TOKEN_CONVERTER_ABI, provider);
        expect(await c.pendingOwner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
      });
    }

    // it(`should have guardian as owner for converer beacon`, async () => {
    //   const c = new ethers.Contract(SINGLE_TOKEN_CONVERTER_BEACON, SINGLE_TOKEN_CONVERTER_BEACON_ABI, provider);
    //   expect(await c.owner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
    // });

    it(`should have no pending owner for converter network`, async () => {
      const c = new ethers.Contract(CONVERTER_NETWORK, CONVERTER_NETWORK_ABI, provider);
      expect(await c.pendingOwner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
    });

    it("owner of proxy admin is timelock", async () => {
      expect(await proxyAdmin.owner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
    });

    it("pending owner", async () => {
      expect(await prime.pendingOwner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
      expect(await plp.pendingOwner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
    });

    for (const rewardDistributor of REWARD_DISTRIBUTORS) {
      it(`should have Normal Timelock as pending owner for ${rewardDistributor}`, async () => {
        const c = new ethers.Contract(rewardDistributor, REWARD_DISTRIBUTOR_ABI, provider);
        expect(await c.pendingOwner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
      });
    }

    it("pending owner of psr", async () => {
      expect(await psr.pendingOwner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
    });

    for (const comptrollerAddress of COMPTROLLERS) {
      it(`correct pending owner for ${comptrollerAddress}`, async () => {
        const c = new ethers.Contract(comptrollerAddress, COMPTROLLER_ABI, provider);
        expect(await c.pendingOwner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
      });
    }

    for (const vTokenAddress of VTOKENS) {
      it(`correct pending owner for ${vTokenAddress}`, async () => {
        const v = new ethers.Contract(vTokenAddress, VTOKEN_ABI, provider);
        expect(await v.pendingOwner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
      });
    }

    it("owner of ComptrollerBeacon is NT", async () => {
      expect(await comptrollerBeacon.owner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
    });

    it("owner of VTokenBeacon is NT", async () => {
      expect(await vTokenBeacon.owner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
    });

    it("pending owner of PoolRegistry is NT", async () => {
      expect(await poolRegistry.pendingOwner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
    });

    it("correct pending owner", async () => {
      expect(await xvsVault.pendingAdmin()).to.equal(NORMAL_TIMELOCK);
    });

    it("correct pending owner", async () => {
      expect(await xvsStore.pendingAdmin()).to.equal(NORMAL_TIMELOCK);
    });

    it("Should set bridge pending owner to Normal Timelock", async () => {
      const pendingOwner = await xvsBridgeAdmin.pendingOwner();
      expect(pendingOwner).equals(arbitrumone.NORMAL_TIMELOCK);
    });
    it("Should set XVS owner to Normal Timelock", async () => {
      const owner = await xvs.owner();
      expect(owner).equals(arbitrumone.NORMAL_TIMELOCK);
    });
    it("correct pending owner", async () => {
      expect(await resilientOracle.pendingOwner()).to.equal(NORMAL_TIMELOCK);
      expect(await chainLinkOracle.pendingOwner()).to.equal(NORMAL_TIMELOCK);
      expect(await redstoneOracle.pendingOwner()).to.equal(NORMAL_TIMELOCK);
      expect(await boundValidator.pendingOwner()).to.equal(NORMAL_TIMELOCK);
    });
    it("Should set pendingOwner to Normal Timelock", async () => {
      const pendingOwner = await treasury.pendingOwner();
      expect(pendingOwner).equals(NETWORK_ADDRESSES.arbitrumone.NORMAL_TIMELOCK);
    });
  });
});
