 // import the library modules needed
const Web3 = require('web3');
const jsSHA = require("jssha");
const fs = require("fs");
// declare two variables to hold references to the connected web3 instance and the contract
let web3 = undefined;
let contract = undefined;
// initialise the Ethereum node connection and the contract binding in the init() function.
function init() {
	//set up network
	// First, connect to the (local ganache) node
	// let provider = new Web3.providers.HttpProvider("http://localhost:7545");
	// First, connect to the (test rinkeby) node
	let provider = new Web3.providers.HttpProvider("http://localhost:8545");

	web3 = new Web3(provider);
	// console.log(web3);

	//contract abi
	// Next, in order to create a web3 proxy object for our contract, which we can use to execute the contract functions from Javascript, 
	// we need to know the address of the contract and the ABI
	let abi = [
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
	// In the above code we have declared the ABI and address in the code. 
	// !!!We could just read them from the JSON file created by Truffle in the build directory.

	//assign contract address
	// replace the above address with the one assigned by your Ganache test blockchain
	// let address = "0xd121f94184Da71908123a1e08F72cAB8573b9363"; //Notary Contract address from author's test Rinkeby
	// let address = "0x1Bcc185F72e3452a1de64AD732E7B0684832F7A0"; //Notary Contract address from Ganache
	let address = "0x0a0f0F7587DdFFBf393e80a9ecC4A313b7Ad5784"; //Notary Contract address from my test Rinkeby

	//init contract
	// create the contract object
	contract = new web3.eth.Contract(abi, address);
 	// console.log(contract);
};

//get a SHA-256 hash from a file --> works synchronously
// The calculateHash function reads the content of a file and 
// then uses the calculateHashBytes helper function to actually calculate our hash value
function calculateHash (fileName) {
	let fileContent = fs.readFileSync(fileName);
	return calculateHashBytes(fileContent);
};

//get a SHA-256 hash from a data Buffer --> works synchronously
// The calculateHashBytes function uses the jsSHA library to calculate a SHA-256 hash value, which is provided in hexadecimal string representation. 
// Note, that we add a leading “0x”, in order to have a string which can be recognised by Web3 as a HEX string, which can be automatically converted to the bytes32 Solidity type.
function calculateHashBytes (data) {
	let shaObj = new jsSHA("SHA-256", "ARRAYBUFFER");
	shaObj.update(data);
	let hash = "0x" + shaObj.getHash("HEX");
	return hash;
};

//sends a hash to the blockchain
//sends a hash value to the contract
// The function is asynchronous and uses nested callbacks
function sendHash (hash, callback) {
	// The existing accounts are obtained by the web3.eth.getAccounts() call, which is the outer call in our callback structure.
	web3.eth.getAccounts(function (error, accounts) {
		// The addDocHash() function is accessed through the methods field of the contract object
		// Calling the Javascript version of addDocHash() returns a transaction object
		// We send the transaction calling send() function which requires an `options` object as an arguement
		// in which we specify the account to use as a sender address for our transaction.
		// We use the first address in the accounts[] array.
		// console.log(accounts); // --> undefined :(
		contract.methods.addDocHash(hash).send({
			from: accounts[0]
		}, function(error, tx) {
			if (error) callback(error, null);
			else callback(null, tx);
		});
	});
};

//looks up a hash on the blockchain
// The function for verifying a hash value is similar to the function for sending a hash value.
// The main difference though is that we do NOT need to CREATE and SHARE a transaction
// as the findDocHash() function of our contract does not modify state and can be executed in a call instead of a transaction
// i.e. the STATE can be read from our local Ethereum node's copy of the blockchain state.
function findHash (hash, callback) {
	contract.methods.findDocHash(hash).call( function (error, result) {
		if (error) callback(error, null);
		else {
			let resultObj = {
				mineTime: new Date(result[0] * 1000),
				blockNumber: result[1]
			}
			callback(null, resultObj);
		}
	});
};

// exposes the modules interface and does not require explanation
let NotaryExports = {
	findHash : findHash,
	sendHash : sendHash,
	calculateHash : calculateHash,
	init : init,
	calculateHashBytes : calculateHashBytes,
};

module.exports = NotaryExports;