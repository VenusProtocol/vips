import { hours } from "@nomicfoundation/hardhat-network-helpers/dist/src/helpers/time/duration";
import { concat, hexlify, parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

// Make sure to update the deadline before submitting the transaction
const NOW = 1705566017;
const DEADLINE = NOW + hours(4);

const VTREASURY = "0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA";
const UNI_V3_ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
const BBTC = "0x9BE89D2a4cd102D8Fecc6BF9dA793be995C22541";
const WBTC = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
const NORMAL_TIMELOCK = NETWORK_ADDRESSES.ethereum.NORMAL_TIMELOCK;

const BBTC_AMOUNT = parseUnits("0.3", 8);
const MIN_WBTC_AMOUNT = parseUnits("0.295029", 8);

const FEE_HEX = "0x000bb8";
const PATH = hexlify(concat([BBTC, FEE_HEX, WBTC]));

const vip002 = () => {
  return makeProposal([
    {
      target: VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [BBTC, BBTC_AMOUNT, NORMAL_TIMELOCK],
    },
    {
      target: BBTC,
      signature: "approve(address,uint256)",
      params: [UNI_V3_ROUTER, BBTC_AMOUNT],
    },
    {
      target: UNI_V3_ROUTER,
      signature: "exactInput((bytes,address,uint256,uint256,uint256))",
      params: [[PATH, VTREASURY, DEADLINE, BBTC_AMOUNT, MIN_WBTC_AMOUNT]],
    },
    {
      target: BBTC,
      signature: "approve(address,uint256)",
      params: [UNI_V3_ROUTER, 0],
    },
  ]);
};

export default vip002;
