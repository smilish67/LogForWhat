const {Connection, clusterApiUrl} = require('@solana/web3.js');

const connection = new Connection(clusterApiUrl('devnet'));


module.exports = connection;