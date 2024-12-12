import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip000 from "../../multisig/proposals/basemainnet/vip-000";
import vip001 from "../../multisig/proposals/basemainnet/vip-001";
import vip002 from "../../multisig/proposals/basemainnet/vip-002";
import vip003, { PSR } from "../../multisig/proposals/basemainnet/vip-003";
import vip004, { USDC, WETH, cbBTC } from "../../multisig/proposals/basemainnet/vip-004";
import vip005 from "../../multisig/proposals/basemainnet/vip-005";
import vip006 from "../../multisig/proposals/basemainnet/vip-006";
import vip007 from "../../multisig/proposals/basemainnet/vip-007";
import { PLP, PRIME } from "../../multisig/proposals/basemainnet/vip-007";
import vip502, {
  BOUND_VALIDATOR,
  COMPTROLLERS,
  VTOKENS,
  XVS_BRIDGE,
  XVS_BRIDGE_ADMIN,
  XVS_STORE,
} from "../../vips/vip-502/bscmainnet";
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
import TOKEN_ABI from "./abi/WETH.json";

const { basemainnet } = NETWORK_ADDRESSES;

forking(23604355, async () => {
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

  before(async () => {
    prime = new ethers.Contract(PRIME, PRIME_ABI, provider);
    plp = new ethers.Contract(PLP, PRIME_LIQUIDITY_PROVIDER_ABI, provider);
    chainLinkOracle = new ethers.Contract(basemainnet.CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, provider);
    redstoneOracle = new ethers.Contract(basemainnet.REDSTONE_ORACLE, CHAINLINK_ORACLE_ABI, provider);
    resilientOracle = new ethers.Contract(basemainnet.RESILIENT_ORACLE, RESILLIENT_ORACLE_ABI, provider);
    boundValidator = new ethers.Contract(BOUND_VALIDATOR, BOUND_VALIDATOR_ABI, provider);
    xvsBridgeAdmin = await ethers.getContractAt(XVS_BRIDGE_ADMIN_ABI, XVS_BRIDGE_ADMIN);
    xvsBridge = await ethers.getContractAt(XVS_BRIDGE_ABI, XVS_BRIDGE);
    treasury = await ethers.getContractAt(TREASURY_ABI, basemainnet.VTREASURY);

    await pretendExecutingVip(await vip000());
    await pretendExecutingVip(await vip001());
    await pretendExecutingVip(await vip002());
    await pretendExecutingVip(await vip003());

    const WETH_ACCOUNT = "0x6446021F4E396dA3df4235C62537431372195D38";
    const USDC_ACCOUNT = "0x0B0A5886664376F59C351ba3f598C8A8B4D0A6f3";
    const cbBTC_ACCOUNT = "0xF877ACaFA28c19b96727966690b2f44d35aD5976";

    await impersonateAccount(WETH_ACCOUNT);
    await impersonateAccount(USDC_ACCOUNT);
    await impersonateAccount(cbBTC_ACCOUNT);
    await setBalance(WETH_ACCOUNT, ethers.utils.parseEther("1"));
    await setBalance(USDC_ACCOUNT, ethers.utils.parseEther("1"));
    await setBalance(cbBTC_ACCOUNT, ethers.utils.parseEther("1"));

    const WETHSigner: Signer = await ethers.getSigner(WETH_ACCOUNT);
    const USDCSigner: Signer = await ethers.getSigner(USDC_ACCOUNT);
    const cbBTCSigner: Signer = await ethers.getSigner(cbBTC_ACCOUNT);
    const wethToken = await ethers.getContractAt(TOKEN_ABI, WETH, WETHSigner);
    const usdcToken = await ethers.getContractAt(TOKEN_ABI, USDC, USDCSigner);
    const cbBTCToken = await ethers.getContractAt(TOKEN_ABI, cbBTC, cbBTCSigner);

    await wethToken.connect(WETHSigner).transfer(basemainnet.VTREASURY, parseUnits("2", 18));
    await usdcToken.connect(USDCSigner).transfer(basemainnet.VTREASURY, parseUnits("5000", 6));
    await cbBTCToken.connect(cbBTCSigner).transfer(basemainnet.VTREASURY, parseUnits("0.05", 8));

    await pretendExecutingVip(await vip004());
    await pretendExecutingVip(await vip005());
    await pretendExecutingVip(await vip006());
    await pretendExecutingVip(await vip007());
  });

  testForkedNetworkVipCommands("vip502", await vip502());

  describe("Post-VIP behavior", async () => {
    it(`correct owner `, async () => {
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

    it("should have the correct pending owner", async () => {
      expect(await xvsVaultProxy.admin()).to.equal(basemainnet.NORMAL_TIMELOCK);
      expect(await xvsStore.admin()).to.equal(basemainnet.NORMAL_TIMELOCK);
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
  });
});
