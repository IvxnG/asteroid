// const Phaser = require("phaser")
let config = { 
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 150 },
            debug: false
        }
    },
    scene: {
        preload: preload, 
        create: create, 
        update: update 
    }
};

let score = 0;
let scoretext;
let loseText;
let game = new Phaser.Game(config);
let gameOver = false;

function preload(){
    this.load.image('sky','assets/sky.png');
    this.load.image('ground','assets/platform.png');
    this.load.image('star','assets/star.png');
    this.load.image('bomb','assets/bomb.png');
    this.load.spritesheet('dude','assets/dude.png', {frameWidth: 32, frameHeight: 48});
}
function create(){
    this.add.image(400, 300, 'sky');

    platforms = this.physics.add.staticGroup();

    // Plataforma base
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    // Plataformas adicionales
    platforms.create(600, 400, 'ground').setScale(0.5).refreshBody();
    platforms.create(150, 250, 'ground');
    platforms.create(750, 220, 'ground');

    player = this.physics.add.sprite(100, 450, 'dude');
    player.setCollideWorldBounds(true);
    player.setBounce(0.2);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers( 'dude', { start: 0, end: 3}),
        frameRate: 20,
        repeat: -1,
    });
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers( 'dude', { start: 5, end: 8}),
        frameRate: 20,
        repeat: -1,
    });
    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame:4}],
        frameRate: 20,
    });

    player.body.setGravityY(100);

    this.physics.add.collider(player, platforms);

    cursors = this.input.keyboard.createCursorKeys();

    stars =  this.physics.add.group({
        key: 'star',
        repeat: 10,
        setXY: { x: 12, y: 0, stepX: 75 }
    });

    stars.children.iterate( function(child){
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
    });

    this.physics.add.collider(stars, platforms);
    this.physics.add.overlap(player, stars, collectStar, null, true);

    scoreText = this.add.text(16, 16 , 'Score: 0', { fontSize: 32, fill:'#000'})

    bombs =  this.physics.add.group();

    this.physics.add.collider(player, bombs, hitBomb, null, true);

}
function update(){
    if(gameOver) {
        return
    }
    if(cursors.left.isDown){
        player.setVelocityX(-150)
        player.anims.play('left', true)
    }else if(cursors.right.isDown){
        player.setVelocityX(150)
        player.anims.play('right', true)
    }else{
        player.setVelocityX(0)
        player.anims.play('turn')
    }

    if(cursors.up.isDown && player.body.touching.down){
        player.setVelocityY(-333)
    }
}

function collectStar(player, star){
    star.disableBody(true, true)

    score+= 10;
    scoreText.setText('Score: ' + score);

    if( stars.countActive(true) === 0){
        stars.children.iterate( function(child){
            child.enableBody(true, child.x, 0, true, true)
        });
        let x = (player.x < 400) ? Phaser.Math.Between(400,800) : Phaser.Math.Between(0,400);

        let bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200,200), 20)
    }
}

function hitBomb(){
    player.setTint(0xff0000);
    player.anims.play('turn');
    gameOver = true;
    loseText.setText('Fin del Juego | Score: ' + score);
    loseText = this.add.text(50, 50 , 'Score: 0', { fontSize: 64, fill:'#FF0000'})
    this.physics.pause();
}