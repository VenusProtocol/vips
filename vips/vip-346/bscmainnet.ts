import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";

export const CERTIK = "0x4cf605b238e9c3c72d0faed64d12426e4a54ee12";
export const FAIRYPROOF = "0x060a08fff78aedba4eef712533a324272bf68119";
export const CHAINALYSIS = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
export const CHAOSLABS = "0xfb1912af5b9d3fb678f801bf764e98f1c217ef35";
export const COMMUNITY = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
export const SKYNET = "0x4124E7aAAfd7F29ad6E6914B80179060B8bE871c";
export const CHAINPATROL = "0x3D9d22E1821Be3b1Ce2A8ACB6FE47fFEF04243c3";

export const VTREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
export const TOKEN_REDEEMER = "0xC53ffda840B51068C64b2E052a5715043f634bcd";

export const CERTIK_AMOUNT = parseUnits("17500", 18).mul(2);
export const FAIRYPROOF_AMOUNT = parseUnits("7500", 18);
export const CHAINALYSIS_AMOUNT = parseUnits("21600", 18);
export const CHAOS_LABS_AMOUNT = parseUnits("170000", 18);
export const COMMUNITY_BNB_AMOUNT = parseUnits("2", 18);
export const COMMUNITY_USDT_AMOUNT = parseUnits("936.61", 18);
export const COMMUNITY_USDC_AMOUNT = parseUnits("313", 18);
export const SKYNET_XVS_AMOUNT = parseUnits("68000", 18);
export const SKYNET_BNB_AMOUNT = parseUnits("833.33", 18);
export const CHAINPATROL_AMOUNT = parseUnits("3000", 18);

// Total USDC Balance of Treasury = 130,475
// USDC Needed = 21,600 + 170,000 + 313 = 191,913
// Extra USDC Needed = 191,913 - 130,475 = 61,438
// 1 vUSDC = 0.02420 USDC
// vUSDC Needed = 61,438 / 0.02420 = 2,538,843.47
export const VUSDC_AMOUNT = parseUnits("2538844", 8);
export const USDC_AMOUNT = parseUnits("61438", 18);

export const vip344 = () => {
  const meta = {
    version: "v2",
    title: "VIP-346 Payments issuance for audits and other expenses",
    description: `#### Summary

If passed this VIP will perform the following actions:

- Transfer 35,000 USDT to Certik for the retainer program (July and August 2024)
- Transfer 7,500 USDT to Fairyproof for the audit of Two Kinks Interest Rates
- Transfer 21,600 USDC to Chainalysis for the yearly subscription fee renewal
- Transfer 170,000 USDC to ChaosLabs for the Quarterly fee
- Transfer 3,000 USDT to ChainPatrol
- Transfer assets back to the community wallet for various deployments GAS refund
- Transfer 68,000 XVS and 833.33 BNB to Skynet for the liquidity management of XVS

#### Details

**Certik - retainer program**

- Auditor: Certik ([https://certik.com](https://certik.com/))
- Concept: Retainer program - monthly payment of July and August 2024. Scheduled audits by Certik in July and August: Two Kinks Interest Rates
- Cost: 35,000 USDT, to be sent to the BEP20 address 0x4cf605b238e9c3c72d0faed64d12426e4a54ee12

**Fairyproof - Two Kinks Interest Rates**

- Auditor: Fairyproof ([https://www.fairyproof.com](https://www.fairyproof.com/))
- Payload: Two Kinks Interest Rates ([here](https://github.com/VenusProtocol/venus-protocol/pull/494) and [here](https://github.com/VenusProtocol/isolated-pools/pull/417))
- Status: audit started on July 26th, 2024. It should take 3 days
- Cost: 7,500 USDT, to be sent to the BEP20 address 0x060a08fff78aedba4eef712533a324272bf68119

**Chainalysis**

- [http://chainalysis.com](http://chainalysis.com/)
- Entity Risking - Silver plan - All Assets 100,000 Screens / Annual
- Support Level - Gold - Commercial
- Payment to be sent to the community wallet to issue payment
- Cost: 21,600 USDC, to be sent to the BEP20 address: 0xc444949e0054A23c44Fc45789738bdF64aed2391

**Chaos Labs**

- [https://chaoslabs.xyz](https://chaoslabs.xyz/)
- Quarterly payment of Q3-2024 USDC 100,000.00
- Q3-2024 Additional deployment (Ethereum) USDC 30,000
- Q2-Q3 Additional Deployment (Arbitrum) Prorated 4 months USDC 40,000
- Cost: 170,000 USDC, to be sent to the BEP20 address 0xfb1912af5b9d3fb678f801bf764e98f1c217ef35

**ChainPatrol**

- [https://chainpatrol.io](https://chainpatrol.io/)
- [Proposal:](https://community.venus.io/t/proposal-to-venus-protocol-enhancing-security-and-trust-with-chainpatrol/4474) Enhancing Security and Trust with ChainPatrol.
- Pay $3,000 USD ($250 USD/mo) for 1 Year Contract
- [Snapshot vote](https://snapshot.org/#/venus-xvs.eth/proposal/0x66e9a98483a28125452b502feddcfcdc38a626ed25754bebb79c1a7fbd97f058)
- Cost: 3,000 USDT, to be sent to the BEP20 address 0x3D9d22E1821Be3b1Ce2A8ACB6FE47fFEF04243c3

**Community Refunds**

- [2 BNB](https://bscscan.com/tx/0xf74d485ecba35d2081070d6661854633713e18354d333069141077cdb7389e25) provided for VIP-330 Timelock GAS
- [30 USDT](https://etherscan.io/tx/0xc5f5029d26caa1ad9c1bbb361825ae352218f39d804c0831caaa698d10b4f888) converted to ETH to Release Funds on ETH Converters
- [270 USDT](https://etherscan.io/tx/0x6935ee847c3d87d6d0a35e9896c6342704ecd5ed8264412e41858e2582013fb9) converted to ETH to Release Funds on ETH Converters
- [636.61 USDT](https://etherscan.io/tx/0x8eac6be59707fe1553474ff649594cc3b68e1a735b3dd8598740f93e9b7260fe) Swapped to ETH for VIP-335 ETH Comptroller Upgrade GAS
- [313 USDC](https://bscscan.com/tx/0x67e836eacf4dc429deff03d69cc5ac05e4b815180b92b5b19595ae98b9e6745f) converted to ETH for VIP-335 Execution
- Total: 2 BNB / 936.61 USDT / 313 USDC, to be sent to the BEP20 address 0xc444949e0054A23c44Fc45789738bdF64aed2391

**Skynet Trading**

- [https://skynettrading.com](https://skynettrading.com/)
- Liquidity Management budget Increase (XVS/BNB) pair.
- Cost: 68,000 XVS ($500K, assuming 1 XVS = $7.35) and 833.33 BNB ($500K, assuming 1 BNB= $600)
- [Proposal](https://community.venus.io/t/proposal-liquidity-management-budget-increase-xvs-bnb/4482)
- [Snapshot Vote](https://snapshot.org/#/venus-xvs.eth/proposal/0x5e83f140833485f59fb7190b77088dfe5d76879500c233f7afe202315097aa41)
- Funds to be transferred to the DeFiTech/SkyNet Multisig
- BEP20: 0x4124E7aAAfd7F29ad6E6914B80179060B8bE871c

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/333)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, CERTIK_AMOUNT, CERTIK],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, FAIRYPROOF_AMOUNT, FAIRYPROOF],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, CHAINALYSIS_AMOUNT, CHAINALYSIS],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [vUSDC, VUSDC_AMOUNT, TOKEN_REDEEMER],
      },
      {
        target: TOKEN_REDEEMER,
        signature: "redeemUnderlyingAndTransfer(address,address,uint256,address)",
        params: [vUSDC, VTREASURY, USDC_AMOUNT, VTREASURY],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, CHAOS_LABS_AMOUNT, CHAOSLABS],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [WBNB, COMMUNITY_BNB_AMOUNT.add(SKYNET_BNB_AMOUNT), NORMAL_TIMELOCK],
      },
      {
        target: WBNB,
        signature: "withdraw(uint256)",
        params: [COMMUNITY_BNB_AMOUNT.add(SKYNET_BNB_AMOUNT)],
      },
      {
        target: COMMUNITY,
        signature: "",
        params: [],
        value: COMMUNITY_BNB_AMOUNT.toString(),
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, COMMUNITY_USDT_AMOUNT, COMMUNITY],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, COMMUNITY_USDC_AMOUNT, COMMUNITY],
      },
      {
        target: COMPTROLLER,
        signature: "_grantXVS(address,uint256)",
        params: [SKYNET, SKYNET_XVS_AMOUNT],
      },
      {
        target: SKYNET,
        signature: "",
        params: [],
        value: SKYNET_BNB_AMOUNT.toString(),
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, CHAINPATROL_AMOUNT, CHAINPATROL],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip344;
