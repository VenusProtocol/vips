import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const PRIME_PROXY = "0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC";
const VAI_CONTROLLER_PROXY = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE";
const PLP_PROXY = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";
const NEW_PRIME_IMPLEMENTATION = "0x7A2e3481F345367045539896e5Bf385910fB5C2C";
const NEW_VAI_CONTROLLER_IMPLEMENTATION = "0x9817823d5C4023EFb6173099928F17bb77CD1d69";
const NEW_PLP_IMPLEMENTATION = "0x208068AE8A619FCc851659791659B1aA40d796dA";
const DEFAULT_PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";
const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
const VAI = "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7";
const IL_COMPTROLLER_BEACON = "0x38B4Efab9ea1bAcD19dC81f19c4D1C2F9DeAe1B2";
const IL_VTOKEN_BEACON = "0x2b8A1C539ABaC89CbF7E2Bc6987A0A38A5e660D4";
const NEW_IL_COMPTROLLER_IMPL = "0x3f66e044dfd1ccc834e55624b5f6e9e75ab36000";
const NEW_IL_VTOKEN_IMPL = "0x9A8ADe92b2D71497b6F19607797F2697cF30f03A";
const POOL_REGISTRY = "0x9F7b01A536aFA00EF10310A162877fd792cD0666";

export const vip225 = () => {
  const meta = {
    version: "v2",
    title: "VIP-225 Enable VAI minting for Prime holders",
    description: `#### Summary

If passed, this VIP will:

- Upgrade the VAIController implementation
- Upgrade the implementations of the Comptroller contracts in the Isolated pools
- Upgrade the implementations of the VToken contracts in the Isolated pools
- Update the Prime and PrimeLiquidityProvider implementations
- Enable VAI minting, only for Prime holders
- Set mintCap to 10M VAI (from zero) and increase the VAI baseRate to 7% (from 3%).

These actions implement the changes proposed in the Community post [[VIP] Re-enable VAI Minting and Adjust VAI Base Rate](https://community.venus.io/t/vip-re-enable-vai-minting-and-adjust-vai-base-rate/3935).

#### Description

This VIP upgrades the [VAIController](https://bscscan.com/address/0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE) implementation, adding the integration with the [Prime contract](https://bscscan.com/address/0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC), to allow only Prime holders to mint VAI. This behavior can be disabled in the future with a VIP, not requiring to hold a Prime token to mint VAI.

The parameters related to minting VAI updated in this VIP are:

- mintCap, the maximum number of VAI that can be minted: 10M
- baseRatio, the fixed interest rate applied to the minted VAI: 7%

The Comptroller and VToken contracts of the Isolated pools are upgraded to support Prime. New Isolated pools markets could be added to the Prime program with a new VIP. This codebase will be used in the new chains where Venus will be deployed.

Prime contract is upgraded to add more information in the view functions used to estimate the APR of the users. This will facilitate the development of rich estimators in the Venus UI ([https://app.venus.io](https://app.venus.io/)), for example. Moreover, the new codebase is ready to be used in new chains, where the blocks are not minted in regular periods, like Arbitrum.

#### Security and additional considerations

We applied the following security procedures for this VIP:

- **Check post upgrade**: in a simulation environment, validating the behaviors of the Comptroller and VAIController contracts were the expected one after the VIP
- **Deployment on testnet**: the same changes were performed on BNB testnet, and the upgrade contracts are used in the Venus Protocol testnet deployment
- **Audit**: Certik has audited the deployed code

#### Audit reports

- [Certik audit audit report](https://github.com/VenusProtocol/venus-protocol/blob/9afe804f18cd02318626aea46686522542aa5e4d/audits/087_prime_certik_20231219.pdf)

#### Deployed contracts on main net

- [New VAIController implementation](https://bscscan.com/address/0x9817823d5C4023EFb6173099928F17bb77CD1d69)
- [New Prime implementation](https://bscscan.com/address/0x7A2e3481F345367045539896e5Bf385910fB5C2C)
- [New PrimeLiquidityProviderImplementation](https://bscscan.com/address/0x208068AE8A619FCc851659791659B1aA40d796dA)

#### References

- [Pull request with the deployed changes](https://github.com/VenusProtocol/venus-protocol/pull/407)
- [VIP simulations](https://github.com/VenusProtocol/vips/pull/137)
- [VIP executed on testnet](https://testnet.bscscan.com/tx/0xb513a9daa63954e7f552c073914d36a3833c2e78be6287134bf94d9cf7a461d7)
- [Documentation](https://docs-v4.venus.io/whats-new/prime-yield)
- [Technical article about Venus Prime](https://docs-v4.venus.io/technical-reference/reference-technical-articles/prime)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [PRIME_PROXY, NEW_PRIME_IMPLEMENTATION],
      },
      {
        target: PRIME_PROXY,
        signature: "initializeV2(address)",
        params: [POOL_REGISTRY],
      },
      {
        target: VAI_CONTROLLER_PROXY,
        signature: "_setPendingImplementation(address)",
        params: [NEW_VAI_CONTROLLER_IMPLEMENTATION],
      },
      {
        target: NEW_VAI_CONTROLLER_IMPLEMENTATION,
        signature: "_become(address)",
        params: [VAI_CONTROLLER_PROXY],
      },
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [PLP_PROXY, NEW_PLP_IMPLEMENTATION],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_CONTROLLER_PROXY, "toggleOnlyPrimeHolderMint()", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_CONTROLLER_PROXY, "toggleOnlyPrimeHolderMint()", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_CONTROLLER_PROXY, "toggleOnlyPrimeHolderMint()", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_CONTROLLER_PROXY, "setMintCap(uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_CONTROLLER_PROXY, "setBaseRate(uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_CONTROLLER_PROXY, "setFloatRate(uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_CONTROLLER_PROXY, "setMintCap(uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME_PROXY, "addMarket(address,address,uint256,uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME_PROXY, "addMarket(address,address,uint256,uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [PRIME_PROXY, "addMarket(address,address,uint256,uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: VAI_CONTROLLER_PROXY,
        signature: "setPrimeToken(address)",
        params: [PRIME_PROXY],
      },
      {
        target: VAI_CONTROLLER_PROXY,
        signature: "setVAIToken(address)",
        params: [VAI],
      },
      {
        target: VAI_CONTROLLER_PROXY,
        signature: "toggleOnlyPrimeHolderMint()",
        params: [],
      },
      {
        target: VAI_CONTROLLER_PROXY,
        signature: "setBaseRate(uint256)",
        params: [parseUnits("0.07", 18).toString()],
      },
      {
        target: VAI_CONTROLLER_PROXY,
        signature: "setMintCap(uint256)",
        params: [parseUnits("10000000", 18).toString()],
      },
      {
        target: COMPTROLLER,
        signature: "_setVAIMintRate(uint256)",
        params: [parseUnits("1", 18).toString()],
      },
      {
        target: IL_COMPTROLLER_BEACON,
        signature: "upgradeTo(address)",
        params: [NEW_IL_COMPTROLLER_IMPL],
      },
      {
        target: IL_VTOKEN_BEACON,
        signature: "upgradeTo(address)",
        params: [NEW_IL_VTOKEN_IMPL],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
