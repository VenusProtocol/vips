import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip007, {
  BOUND_VALIDATOR,
  COMPTROLLERS,
  NATIVE_TOKEN_GATEWAY,
  PLP,
  PRIME,
  PSR,
  VTOKENS,
  XVS_BRIDGE_ADMIN_PROXY,
  XVS_STORE,
} from "../../multisig/proposals/basemainnet/vip-007";
import vip408 from "../../vips/vip-408/bscmainnet";
import vip409 from "../../vips/vip-409/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import PRIME_ABI from "./abi/Prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abi/PrimeLiquidityProvider.json";
import PSR_ABI from "./abi/ProtocolShareReserve.json";
import VTOKEN_ABI from "./abi/VToken.json";
import XVS_STORE_ABI from "./abi/XVSStore.json";
import XVS_VAULT_PROXY_ABI from "./abi/XVSVaultProxy.json";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import RESILLIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import TREASURY_ABI from "./abi/treasury.json";
import XVS_BRIDGE_ABI from "./abi/xvsBridge.json";
import XVS_BRIDGE_ADMIN_ABI from "./abi/xvsBridgeAdmin.json";
import NATIVE_TOKEN_GATEWAY_ABI from "./abi/NativeTokenGateway.json";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";

const XVS_BRIDGE = "0x3dD92fB51a5d381Ae78E023dfB5DD1D45D2426Cd";

const { basemainnet } = NETWORK_ADDRESSES;

forking(23958718, async () => {
  const provider = ethers.provider;
  let prime: Contract;
  let plp: Contract;
  const xvsVaultProxy = new ethers.Contract(basemainnet.XVS_VAULT_PROXY, XVS_VAULT_PROXY_ABI, provider);
  const xvsStore = new ethers.Contract(XVS_STORE, XVS_STORE_ABI, provider);
  let chainLinkOracle: Contract;
  let redstoneOracle: Contract;
  let resilientOracle: Contract;
  let boundValidator: Contract;
  let xvsBridgeAdmin: Contract;
  let xvsBridge: Contract;
  let treasury: Contract;
  let poolRegistry: Contract;

  before(async () => {
    await impersonateAccount(basemainnet.NORMAL_TIMELOCK);
    await setBalance(basemainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
    await setBalance(basemainnet.VTREASURY, ethers.utils.parseEther("100"));

    prime = new ethers.Contract(PRIME, PRIME_ABI, provider);
    plp = new ethers.Contract(PLP, PRIME_LIQUIDITY_PROVIDER_ABI, provider);
    chainLinkOracle = new ethers.Contract(basemainnet.CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, provider);
    redstoneOracle = new ethers.Contract(basemainnet.REDSTONE_ORACLE, CHAINLINK_ORACLE_ABI, provider);
    resilientOracle = new ethers.Contract(basemainnet.RESILIENT_ORACLE, RESILLIENT_ORACLE_ABI, provider);
    boundValidator = new ethers.Contract(BOUND_VALIDATOR, BOUND_VALIDATOR_ABI, provider);
    xvsBridgeAdmin = await ethers.getContractAt(XVS_BRIDGE_ADMIN_ABI, XVS_BRIDGE_ADMIN_PROXY);
    xvsBridge = await ethers.getContractAt(XVS_BRIDGE_ABI, XVS_BRIDGE);
    treasury = await ethers.getContractAt(
      TREASURY_ABI,
      basemainnet.VTREASURY,
      await ethers.getSigner(basemainnet.NORMAL_TIMELOCK),
    );
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, basemainnet.POOL_REGISTRY);
    await pretendExecutingVip(await vip007());
  });

  describe("Pre-VIP behavior", async () => {
    it("cannot transfer tokens from the treasury", async () => {
      await expect(
        treasury.withdrawTreasuryNative(ethers.utils.parseEther("100"), basemainnet.NORMAL_TIMELOCK),
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  testForkedNetworkVipCommands("vip408", await vip408());
  testForkedNetworkVipCommands("vip409", await vip409());

  describe("Post-VIP behavior", async () => {
    it(`correct owner for Prime`, async () => {
      expect(await prime.owner()).to.equal(basemainnet.NORMAL_TIMELOCK);
      expect(await plp.owner()).to.equal(basemainnet.NORMAL_TIMELOCK);
    });

    it(`correct owner for psr`, async () => {
      const psr = new ethers.Contract(PSR, PSR_ABI, provider);
      expect(await psr.owner()).to.equal(basemainnet.NORMAL_TIMELOCK);
    });

    for (const comptrollerAddress of COMPTROLLERS) {
      it(`correct owner for ${comptrollerAddress}`, async () => {
        const c = new ethers.Contract(comptrollerAddress, COMPTROLLER_ABI, provider);
        expect(await c.owner()).to.equal(basemainnet.NORMAL_TIMELOCK);
      });
    }

    for (const vTokenAddress of VTOKENS) {
      it(`correct owner for ${vTokenAddress}`, async () => {
        const v = new ethers.Contract(vTokenAddress, VTOKEN_ABI, provider);
        expect(await v.owner()).to.equal(basemainnet.NORMAL_TIMELOCK);
      });
    }

    it("should have the correct owner", async () => {
      expect(await xvsVaultProxy.admin()).to.equal(basemainnet.NORMAL_TIMELOCK);
      expect(await xvsStore.admin()).to.equal(basemainnet.NORMAL_TIMELOCK);
    });

    it("should set the correct owner for NativeTokenGateway", async () => {
      const ntg = new ethers.Contract(NATIVE_TOKEN_GATEWAY, NATIVE_TOKEN_GATEWAY_ABI, ethers.provider);
      expect(await ntg.owner()).to.equal(basemainnet.NORMAL_TIMELOCK);
    });

    it("XVSBridgeAdmin ownership transferred to Normal Timelock", async () => {
      expect(await xvsBridgeAdmin.owner()).to.be.equals(basemainnet.NORMAL_TIMELOCK);
    });
    it("Normal Timelock should be whitelisted", async () => {
      expect(await xvsBridge.whitelist(basemainnet.NORMAL_TIMELOCK)).to.be.true;
    });
    it("oracles should have correct owner", async () => {
      expect(await resilientOracle.owner()).equals(basemainnet.NORMAL_TIMELOCK);
      expect(await chainLinkOracle.owner()).equals(basemainnet.NORMAL_TIMELOCK);
      expect(await redstoneOracle.owner()).equals(basemainnet.NORMAL_TIMELOCK);
      expect(await boundValidator.owner()).equals(basemainnet.NORMAL_TIMELOCK);
    });
    it("Normal Timelock should be the owner of the Vtreasury", async () => {
      expect(await treasury.owner()).equals(basemainnet.NORMAL_TIMELOCK);
    });
    it("Normal Timelock should be the owner of the PoolRegistry", async () => {
      expect(await poolRegistry.owner()).equals(basemainnet.NORMAL_TIMELOCK);
    });
    it("can transfer tokens from the treasury", async () => {
      const prevBalance = await provider.getBalance(basemainnet.NORMAL_TIMELOCK);
      await treasury.withdrawTreasuryNative(ethers.utils.parseEther("100"), basemainnet.NORMAL_TIMELOCK);
      const newBalance = await provider.getBalance(basemainnet.NORMAL_TIMELOCK);
      expect(newBalance.sub(prevBalance)).to.be.closeTo(ethers.utils.parseEther("100"), ethers.utils.parseEther("0.1"));
    });
  });
});
