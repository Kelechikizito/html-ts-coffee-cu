import { createWalletClient, custom } from "https://esm.sh/viem";

const connectButton = document.getElementById("connectButton");
let walletClient;

// Check if MetaMask is installed and ready
if (typeof window.ethereum !== "undefined") {
  setupApp();
} else {
  // Wait for MetaMask to inject itself
  window.addEventListener("ethereum#initialized", setupApp, {
    once: true,
  });

  // Timeout if MetaMask doesn't inject within a reasonable time
  setTimeout(() => {
    if (typeof window.ethereum === "undefined") {
      connectButton.innerHTML = "Please install MetaMask";
      connectButton.disabled = true;
    }
  }, 3000);
}

function setupApp() {
  walletClient = createWalletClient({
    transport: custom(window.ethereum),
  });

  // Check if already connected
  checkConnection();
}

async function checkConnection() {
  try {
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    if (accounts.length > 0) {
      connectButton.innerHTML = "Connected";
    }
  } catch (error) {
    console.error("Error checking connection:", error);
  }
}

const connect = async () => {
  try {
    const accounts = await walletClient.requestAddresses();
    connectButton.innerHTML = "Connected";
    console.log("Connected address:", accounts[0]);
  } catch (error) {
    console.error("Connection failed:", error);
    connectButton.innerHTML = "Connection failed";
  }
};

connectButton.onclick = connect;
