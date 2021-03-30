import Phaser, { Scene } from 'phaser';
import 'regenerator-runtime/runtime'
import { readFunds } from './functions';

/**
 * Import libraries to connect UAL with different wallets.
 */
import { UALJs } from 'ual-plainjs-renderer';
import { Anchor } from 'ual-anchor'         // Anchor Wallet    
import { Wax } from '@eosdacio/ual-wax';    // WAX Cloud Wallet
import { User } from 'universal-authenticator-library'
// ********************************************************* //

import logoImg from './assets/logo.png';
import btLogin from './assets/login.png';
import btLogout from './assets/logout.png';
import btSendWax from './assets/btsend.png';

class MyGame extends Phaser.Scene {
    constructor() {
        super();
    }

    preload() {
        this.load.image('logo', logoImg);
        this.load.image('btlogin', btLogin);
        this.load.image('sendwax', btSendWax);
        this.load.image('logout', btLogout);
    }

    create() {
        /**
         * Callback when UAL authentication 
         */
        const myLoginCallback = users => {
            // Start game when user is login. Send user and ual data to scene.
            this.scene.start('SceneA', { users: users, ual: ual });
        }
        const myAppName = 'My Game'

        const wax = new Wax([myChain], { appName: myAppName });         // WAX Cloud Wallet connection
        const anchor = new Anchor([myChain], { appName: myAppName });   // Anchor Wallet connection

        const myAppRoot = {     // Attach DOM element for UAL embedding
            containerElement: document.getElementById('ual-div')
        }

        // Load UAL
        const ual = new UALJs(myLoginCallback, [myChain], myAppName, [wax, anchor], myAppRoot);
        (async () => {
            console.log('Loading...');
            const sesion = await ual.init();
        })()

        // Show game logo and create a button to login
        const logo = this.add.image(400, 250, 'logo');
        const btLogin = this.add.image(650, 550, 'btlogin')
            .setInteractive();

        /*
        * when login button clicked, send click signal to UAL button (hidden in index.html)
        *   This button load the UAL login window
        */
        btLogin.on(Phaser.Input.Events.POINTER_DOWN, async () => {
            const [buttonUAL] = document.body.getElementsByClassName('ual-button-gen');
            buttonUAL.click();
        });
    }
}
class SceneA extends Phaser.Scene {
    constructor() {
        super({ key: 'SceneA' });
    }

    init(data) {
        // Recover UAL data from user and session
        const { users, ual } = data;
        this.loggedInuser = new User;
        this.loggedInuser = users[0];
        this.ual = ual;
    }

    create() {
        let SceneA = this;
        // const userAccount = SceneA.users[0];

        /**
         * Button to send WAX
         * This operation requires user signature and will be performed through UAL (signTransaction).
         */
        const btSend = SceneA.add.image(650, 75, 'sendwax')
            .setInteractive();

        btSend.on(Phaser.Input.Events.POINTER_DOWN, () => {
            console.log('Sending WAX...');
            (async () => {
                try {
                    SceneA.nameUser = await SceneA.loggedInuser.getAccountName();
                    await SceneA.loggedInuser.signTransaction(
                        {
                            actions: [{
                                account: 'eosio.token',
                                name: 'transfer',
                                authorization: [{
                                    actor: SceneA.nameUser,
                                    permission: 'active'
                                }],
                                data: {
                                    from: SceneA.nameUser,
                                    to: '3dkrenderwax',
                                    quantity: '1.00000000 WAX',
                                    memo: 'This works!'
                                }
                            }]
                        },
                        {
                            blocksBehind: 3,
                            expireSeconds: 30
                        }
                    );
                    /**
                     * Operations on blockchain require a few seconds to synchronize. 
                     * Force a pause before reading updated data.
                     * Read new balance and update text
                     */
                    setTimeout(async () => {
                        balance = await readFunds(SceneA.nameUser);
                        SceneA.title.setText(`User: ${SceneA.nameUser} Balance: ${balance}`);
                        console.log('Done!', balance);
                    }, 10000);
                } catch (error) {
                    console.log(error);
                }
            })();
        });

        /**
         * Logout button to close session and logout user from wallet
         * Then restart game
         */
        const btLogout = SceneA.add.image(650, 550, 'logout')
            .setInteractive();

        btLogout.on(Phaser.Input.Events.POINTER_DOWN, () => {
            console.log('Closing session...');
            SceneA.ual.logoutUser();
            SceneA.loggedInuser = null;
            SceneA.sys.game.destroy(true);
            document.addEventListener('mousedown', function newGame() {
                game = new Phaser.Game(config);
                document.removeEventListener('mousedown', newGame);
            });
        });

        /**
         * Call to read only action on blockchain tables. No signature needed.
         */
        let balance = '0.00 WAX';
        (async function () {
            try {
                // Get account name from UAL user
                SceneA.nameUser = await SceneA.loggedInuser.getAccountName();
                // Get balance
                balance = await readFunds(SceneA.nameUser);
                // Show data
                SceneA.title = SceneA.add.text(20, 20, `User: ${SceneA.nameUser} Balance: ${balance}`);

            } catch (error) {
                console.log(error);
            }
        })();
    }
}
const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    dom: {
        createContainer: true
    },
    scene: [MyGame, SceneA]
};
const myChain = {
    chainId: 'f16b1833c747c43682f4386fca9cbb327929334a762755ebec17f6f23c9b8a12',
    rpcEndpoints: [{
        protocol: 'https',
        host: 'testnet.waxsweden.org',
        port: ''
    }]
};

let game = new Phaser.Game(config);
