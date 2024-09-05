import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import { vip012 } from "../../../proposals/arbitrumone/vip-012";
import vip013 from "../../../proposals/arbitrumone/vip-013";
import vip014, {
  COMPTROLLER_CORE,
  COMPTROLLER_LIQUID_STAKED_ETH,
  NATIVE_TOKEN_GATEWAY_LIQUID_STAKED_ETH_POOL,
  PRIME,
} from "../../../proposals/arbitrumone/vip-014";
import GATEWAY_ABI from "./abi/NativeTokenGateway.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const VWETH = "0x39D6d13Ea59548637104E40e729E4aABE27FE106";
const WETH = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";

forking(250401898, async () => {
  let coreComptroller: Contract;
  let LSETHComptroller: Contract;
  let nativeTokenGateway: Contract;

  before(async () => {
    coreComptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_CORE);
    LSETHComptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_LIQUID_STAKED_ETH);
    nativeTokenGateway = await ethers.getContractAt(GATEWAY_ABI, NATIVE_TOKEN_GATEWAY_LIQUID_STAKED_ETH_POOL);

    // executing the vip012 to upgrade the beacon comptroller implementation
    await pretendExecutingVip(await vip012());

    // executing vip013 first to accept the ownership of the LSETH pool's comptroller by Guardian
    await pretendExecutingVip(await vip013());

    await pretendExecutingVip(await vip014());
  });

  describe("Post tx checks", () => {
    it("Should set owner to multisig", async () => {
      expect(await nativeTokenGateway.owner()).equals(NETWORK_ADDRESSES.arbitrumone.GUARDIAN);
    });

    it("Should have correct owner vWETH and wETH addresses", async () => {
      expect(await nativeTokenGateway.vWNativeToken()).to.be.equal(VWETH);
      expect(await nativeTokenGateway.wNativeToken()).to.be.equal(WETH);
    });

    it("Prime for the core comptroller", async () => {
      expect(await coreComptroller.prime()).to.be.equal(PRIME);
    });

    it("Prime for the liquid staked ETH comptroller", async () => {
      expect(await LSETHComptroller.prime()).to.be.equal(PRIME);
    });
  });
});
