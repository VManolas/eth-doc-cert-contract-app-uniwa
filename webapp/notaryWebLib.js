// using @metamask/detect-provider to detect the current provider: https://github.com/MetaMask/detect-provider
// import detectEthereumProvider from "@metamask/detect-provider";
// const provider = detectEthereumProvider();
// instead of the two above commands, can use the following one: 
// const provider = require('https://unpkg.com/@metamask/detect-provider/dist/detect-provider.min.js')

var contract = undefined;
var customProvider = undefined;
// Remember to replace the contract address, if you want to use your own instance
// var address = "0xd121f94184Da71908123a1e08F72cAB8573b9363";
var address = "0x0a0f0F7587DdFFBf393e80a9ecC4A313b7Ad5784"; //Notary Contract address from my test Rinkeby
// var address = "0xEf01b1B33F56607fF932C7E057308acaB0E8C52B"; // Metamask account address on Rinkeby Test Network
var abi = undefined;

function notary_init () {
  // Check if Web3 has been injected by the browser (MetaMask/ Mist https://github.com/ethereum/mist)
    // Metamask injects a web3 object
    // Only a small object to get the provider is guaranteed to be supported
    // Thus, our own copy of the web3 code is included in our JS imports and in the html code
 
/* Warning for deprecated property: window.web3.currentProvider 
 * Instead use window.ethereum
 * More Info: https://docs.metamask.io/guide/provider-migration.html#replacing-window-web3
 */
  // If an injected web3 object is found,
  if (typeof web3 !== 'undefined') {
  // we create a new web3 object with our library pointing to the existing provider
    // Use existing gateway
    // window.web3 = new Web3(web3.currentProvider);
    // from https://github.com/ChainSafe/web3.js/blob/0.20.7/DOCUMENTATION.md#adding-web3
    web3 = new Web3(web3.currentProvider);
    
  // If not, we display an alert
  } else {
    alert("No Ethereum interface injected into browser. Read-only access");
    // from https://github.com/ChainSafe/web3.js/blob/0.20.7/DOCUMENTATION.md#adding-web3
    // set the provider you want from Web3.providers
     web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

/* We should replace this part of code above, 
 * with this part of code below: 
 */
  // if (provider) {
    // console.log('Ethereum successfully detected!')

  //   // From now on, this should always be true:
  //   // provider === window.ethereum
  //   // Access the decentralized web!
  //   // Legacy providers may only have ethereum.sendAsync
    // const chainId = /*await*/ provider.request({
      // method: 'eth_chainId'
    // })
  // } else {
    // if the provider is not detected, detectEthereumProvider resolves to null
    // console.error('Please install MetaMask!', error)
  // }

  // From: https://blog.valist.io/how-to-connect-web3-js-to-metamask-in-2020-fee2b2edf58a
  // const Web3 = require("web3");
  // const ethEnabled = () => {
  //   if (window.web3) {
  //     window.web3 = new Web3(window.web3.currentProvider);
  //     window.ethereum.enable();
  //     return true;
  //   }
  //   return false;
  // }

  // const ethEnabled = async () => {
  //   if (window.ethereum) {
  //     await window.ethereum.request({method: 'eth_requestAccounts'});
  //     window.web3 = new Web3(window.ethereum);
  //     return true;
  //   }
  //   return false;
  // }

  abi = [
    {
      "constant": false,
      "inputs": [
        {
          "name": "hash",
          "type": "bytes32"
        }
      ],
      "name": "addDocHash",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "hash",
          "type": "bytes32"
        }
      ],
      "name": "findDocHash",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        },
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "constructor"
    }
  ];

  contract = new web3.eth.Contract(abi, address);

};

//sends a hash to the blockchain
function notary_send(hash, callback) {
    web3.eth.getAccounts(function (error, accounts) {
      contract.methods.addDocHash(hash).send({
        from: accounts[0]
      },function(error, tx) {
        if (error) callback(error, null);
        else callback(null, tx);
      });
    });
};

//looks up a hash on the blockchain
function notary_find (hash, callback) {
  contract.methods.findDocHash(hash).call( function (error, result) {
    if (error) callback(error, null);
    else {
      let resultObj = {
        mineTime:  new Date(result[0] * 1000),
        blockNumber: result[1]
      }
      callback(null, resultObj);
    }
  });
};