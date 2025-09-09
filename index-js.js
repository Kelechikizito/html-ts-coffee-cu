import {
  createWalletClient,
  createPublicClient,
  custom,
  parseEther,
  defineChain,
  formatEther,
} from "https://esm.sh/viem";
import { contractAddress, abi } from "./constants-js.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const ethAmountInput = document.getElementById("ethAmount");
const withdrawButton = document.getElementById("withdrawButton");
const fundingAddressButton = document.getElementById("fundingAddressButton");

let walletClient;
let publicClient;

const connect = async () => {
  if (typeof window.ethereum !== "undefined") {
    walletClient = createWalletClient({
      transport: custom(window.ethereum),
    });
    await walletClient.requestAddresses(); // THIS LINE IS RESPONSIBLE FOR CONNECTING(CONFIRMING CONNECTION TO THE WALLET) ALSO, IF USER REJECTS THE CONNECTION, THIS LINE WILL THROW AN ERROR
    connectButton.innerHTML = "Connected";
  } else {
    connectButton.innerHTML = "Please install Metamask";
  }
};

const fund = async () => {
  const ethAmount = ethAmountInput.value;
  console.log(`Funding with ${ethAmount} ETH...`);

  if (typeof window.ethereum !== "undefined") {
    walletClient = createWalletClient({
      transport: custom(window.ethereum),
    });
    const [connectedAccount] = await walletClient.requestAddresses();
    const currentChain = await getCurrentChain(walletClient);

    publicClient = createPublicClient({
      transport: custom(window.ethereum),
    });
    const { request } = await publicClient.simulateContract({
      address: contractAddress, // This simulateContract takes the address of the contract we want to simulate
      abi: abi, // Takes the ABI of the contract
      functionName: "fund", // the name of the function we want to call
      account: connectedAccount, // the msg.sender of the interaction
      chain: currentChain,
      value: parseEther(ethAmount), // the value we want to send in WEI
    });
    console.log(request);
    const hash = await walletClient.writeContract(request); // this line of code executes the transaction to the network
    console.log(hash);
  } else {
    connectButton.innerHTML = "Please install Metamask";
  }
};

const getCurrentChain = async (client) => {
  const chainId = await client.getChainId(); // This gets the chain ID from the connected wallet client

  // This defines the chain parameters using viem's defineChain
  const currentChain = defineChain({
    id: chainId,
    name: "Custom Chain",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ["http://localhost:8545"], // Native RPC URL of the Anvil node
      },
    },
  });
  return currentChain;
};

const getBalance = async () => {
  if (typeof window.ethereum !== "undefined") {
    publicClient = createPublicClient({
      transport: custom(window.ethereum),
    });
    const balance = await publicClient.getBalance({
      address: contractAddress, // the address of the contract we want to check the balance of
    });
    console.log(formatEther(balance)); // formatEther converts the balance from WEI to ETH, it does the opposite of parseEther
  }
};

const withdraw = async () => {
  console.log("Withdrawing...");

  if (typeof window.ethereum !== "undefined") {
    walletClient = createWalletClient({
      transport: custom(window.ethereum),
    });
    const [connectedAccount] = await walletClient.requestAddresses();
    const currentChain = await getCurrentChain(walletClient);

    publicClient = createPublicClient({
      transport: custom(window.ethereum),
    });
    const { request } = await publicClient.simulateContract({
      address: contractAddress, // This simulateContract takes the address of the contract we want to simulate
      abi: abi, // Takes the ABI of the contract
      functionName: "withdraw", // the name of the function we want to call
      account: connectedAccount, // the msg.sender of the interaction
      chain: currentChain,
    });
    console.log(request);
    const hash = await walletClient.writeContract(request); // this line of code executes the transaction to the network
    console.log(hash);
  } else {
    connectButton.innerHTML = "Please install Metamask";
  }
};

const checkFundingAddress = async () => {
  console.log("Checking funding address...");

  if (typeof window.ethereum !== "undefined") {
    walletClient = createWalletClient({
      transport: custom(window.ethereum),
    });
    const [connectedAccount] = await walletClient.requestAddresses();

    publicClient = createPublicClient({
      transport: custom(window.ethereum),
    });
    const data = await publicClient.readContract({
      address: contractAddress, // This simulateContract takes the address of the contract we want to simulate
      abi: abi, // Takes the ABI of the contract
      functionName: "getAddressToAmountFunded", // the name of the function we want to call
      args: [connectedAccount], // the argument to pass to the function we want to call
    });
    console.log(
      `${connectedAccount} has funded with ${formatEther(data)} ETH.`
    );
  } else {
    connectButton.innerHTML = "Please install Metamask";
  }
};

connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;
fundingAddressButton.onclick = checkFundingAddress;
