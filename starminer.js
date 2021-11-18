//Variables go here


function preload() {
  // This method is called once at the beginning
  // It will load all the assets, like sprites and sounds
  this.load.image('sky', 'assets/sky.png');
  this.load.image('ground', 'assets/platform.png');
  this.load.image('star', 'assets/star.png');
  this.load.image('bomb', 'assets/bomb.png');
  this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });

}

function create () {
    // This method is called once, just after preload()
    // It will initialize our scene, like the positions of the sprites

    this.add.image(400, 300, 'sky');

    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50,  250, 'ground');
    platforms.create(750, 220, 'ground');
}

function update() {
  // This method is called 60 times per second after create()
  // It will handle all the game's logic, like movements

}


new Phaser.Game(
    {
      width: 700,
      height: 300,
      backgroundColor: '#3498db',
      physics: { default: 'arcade', arcade: { gravity: { y: 300 }, debug: false }  },
      parent: 'game',
      scene:
      {
        preload: preload,
        create: create,
        update: update
      },
      audio: { disableWebAudio: true }
    });