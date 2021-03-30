import {fetch} from 'node-fetch';
import {JsonRpc} from 'eosjs';

/*
*   Connect to a WAX API only for read operations.
*   Write operations require a key and will be performed from UAL.
*/
const rpc = new JsonRpc('https://testnet-wax.3dkrender.com', {fetch});

/**
 * Sample read function. Read account liquid balance in WAX
 * 
 * @param {string} user Name account
 * @returns liquid balance
 */
async function readFunds(user) {
    const account = await rpc.get_account(user);

    if (account.account_name === undefined) 
        throw Error('Reading error!');
    
    return account.core_liquid_balance;
}

export {readFunds};