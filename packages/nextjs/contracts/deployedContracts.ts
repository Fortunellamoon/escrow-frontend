/**
 * Route B闁挎稒顑恠crow 濞戞挸绨奸崬顒傛暜娴ｇ儤鐣遍梺顔哄妿鐠佽尙鎷嬮弶璺ㄧЭ闁挎稑鐗忛弫閬嶆焾閵娧嗩唹闁煎瓨纰嶅﹢浼村礃濞嗗繐寮抽柛锔芥緲濞煎啴鏁嶆径鍫氬亾? * You should not edit this file manually.
 */
import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

const deployedContracts = {
  60600: {
    Escrow: {
      address: "0x5A4AB9e936533Ff9173cC39C7Ae342170650631c",
      abi: [
        {
          inputs: [{ internalType: "address", name: "_arbiter", type: "address" }],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          anonymous: false,
          inputs: [
            { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
            { indexed: true, internalType: "address", name: "buyer", type: "address" },
            { indexed: true, internalType: "address", name: "seller", type: "address" },
            { indexed: false, internalType: "address", name: "token", type: "address" },
            { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
            { indexed: false, internalType: "uint256", name: "deadline", type: "uint256" },
          ],
          name: "OrderCreated",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [{ indexed: true, internalType: "uint256", name: "id", type: "uint256" }],
          name: "OrderPaid",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [{ indexed: true, internalType: "uint256", name: "id", type: "uint256" }],
          name: "OrderCompleted",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [{ indexed: true, internalType: "uint256", name: "id", type: "uint256" }],
          name: "OrderRefunded",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
            { indexed: false, internalType: "address", name: "by", type: "address" },
          ],
          name: "OrderDisputed",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
            { indexed: false, internalType: "bool", name: "sellerWins", type: "bool" },
          ],
          name: "OrderResolved",
          type: "event",
        },
        {
          inputs: [],
          name: "arbiter",
          outputs: [{ internalType: "address", name: "", type: "address" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "orderCount",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
          name: "getOrder",
          outputs: [
            {
              components: [
                { internalType: "address", name: "buyer", type: "address" },
                { internalType: "address", name: "seller", type: "address" },
                { internalType: "address", name: "token", type: "address" },
                { internalType: "uint256", name: "amount", type: "uint256" },
                { internalType: "uint256", name: "deadline", type: "uint256" },
                { internalType: "uint8", name: "status", type: "uint8" },
                { internalType: "string", name: "description", type: "string" },
              ],
              internalType: "struct Escrow.Order",
              name: "",
              type: "tuple",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            { internalType: "address", name: "seller", type: "address" },
            { internalType: "address", name: "token", type: "address" },
            { internalType: "uint256", name: "amount", type: "uint256" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
            { internalType: "string", name: "description", type: "string" },
          ],
          name: "createOrder",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
          name: "deposit",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
          name: "confirm",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
          name: "refund",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
          name: "dispute",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            { internalType: "uint256", name: "id", type: "uint256" },
            { internalType: "bool", name: "sellerWins", type: "bool" },
          ],
          name: "resolve",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      inheritedFunctions: {},
      deployedOnBlock: 2687024,
    },
    ZSToken: {
      address: "0x5542EA0d580c43F6f43D7c2eBF9A6dc9E169Db4E",
      abi: [
        {
          anonymous: false,
          inputs: [
            { indexed: true, internalType: "address", name: "from", type: "address" },
            { indexed: true, internalType: "address", name: "to", type: "address" },
            { indexed: false, internalType: "uint256", name: "value", type: "uint256" },
          ],
          name: "Transfer",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            { indexed: true, internalType: "address", name: "owner", type: "address" },
            { indexed: true, internalType: "address", name: "spender", type: "address" },
            { indexed: false, internalType: "uint256", name: "value", type: "uint256" },
          ],
          name: "Approval",
          type: "event",
        },
        {
          inputs: [],
          name: "name",
          outputs: [{ internalType: "string", name: "", type: "string" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "symbol",
          outputs: [{ internalType: "string", name: "", type: "string" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "decimals",
          outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "totalSupply",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "owner",
          outputs: [{ internalType: "address", name: "", type: "address" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [{ internalType: "address", name: "", type: "address" }],
          name: "balanceOf",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            { internalType: "address", name: "", type: "address" },
            { internalType: "address", name: "", type: "address" },
          ],
          name: "allowance",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            { internalType: "address", name: "_to", type: "address" },
            { internalType: "uint256", name: "_amount", type: "uint256" },
          ],
          name: "mint",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [{ internalType: "uint256", name: "_amount", type: "uint256" }],
          name: "burn",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            { internalType: "address", name: "to", type: "address" },
            { internalType: "uint256", name: "value", type: "uint256" },
          ],
          name: "transfer",
          outputs: [{ internalType: "bool", name: "", type: "bool" }],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            { internalType: "address", name: "spender", type: "address" },
            { internalType: "uint256", name: "value", type: "uint256" },
          ],
          name: "approve",
          outputs: [{ internalType: "bool", name: "", type: "bool" }],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            { internalType: "address", name: "from", type: "address" },
            { internalType: "address", name: "to", type: "address" },
            { internalType: "uint256", name: "value", type: "uint256" },
          ],
          name: "transferFrom",
          outputs: [{ internalType: "bool", name: "", type: "bool" }],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      inheritedFunctions: {},
      deployedOnBlock: 2687021,
    },
  },
} as const;

export default deployedContracts satisfies GenericContractsDeclaration;
