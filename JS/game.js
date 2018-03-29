/**
 * Created by B00189991 on 29/03/2015.
 */

var running;

$(document).on("pageinit", "#gamePage", function(){

    //Hide the scrollbars of the page.
    document.body.style.overflow = "hidden";

    //Store the window size from JQM.
    //var width = $(window).width();
    //var height = $(window).height();
    //Use set values otherwise new graphics need to be made to cater for different resolutions i.e. button spacing.
    var width = 320;
    var height = 480;

    var homePage = 'index.html';
    var base = height - 96;
    var leftBTN, rightBTN, rotateBTN, quitBTN;
    var currentBlock, nextBlock;
    var blocks;
    var blocksGroup = [];
    var touched = false;
    var score = 0;
    var lineChecker;
    var i;
    var playerScore, gameSpeed;

    var g;
    var game = new Phaser.Game(width, height, Phaser.CANVAS, "gamePage", {preload: preload, create: create, update: update, render: render});

    //Score object for displaying the player score.
    function Score() {

        this.score = 0;

        this.text = game.add.text(width - 47, base - 135, this.score, {font: "16px Arial", fill: "#fafafa", align: "center"});
        this.text.anchor.setTo(0.5, 0.5);
    }

    Score.prototype.addScore = function(){

        this.score += 100;
    };

    Score.prototype.updateBoard = function(){

        this.text.setText(this.score);
    };

    //Speed object for controlling and displaying the game speed, using time.
    function Speed() {

        this.speed = 0;
        this.addedTime = 500;

        this.currentTime = game.time.now;
        this.newTime = this.currentTime + this.addedTime;

        this.speedText = game.add.text(width - 47, base - 25, this.speed, {font: "16px Arial", fill: "#fafafa", align: "center"});
        this.timeText = game.add.text(width - 47, base - 81, this.speed, {font: "16px Arial", fill: "#fafafa", align: "center"});

        this.speedText.anchor.setTo(0.5, 0.5);
        this.timeText.anchor.setTo(0.5, 0.5);
    }

    Speed.prototype.updateCurrentTime = function(){

        this.currentTime = game.time.now;
    };

    Speed.prototype.updateNewTime = function(){

        this.newTime = this.currentTime + this.addedTime;
    };

    Speed.prototype.speedUp = function(){

        this.addedTime -= 15;
        this.speed += 1;
    };

    Speed.prototype.speedDown = function(){

        //Power down will alter the speed of the game.
        this.addedTime += 50;
    };

    Speed.prototype.updateBoard = function(){

        var displayTime = Math.round(this.currentTime/1000);
        this.speedText.setText(this.speed);
        this.timeText.setText(displayTime);
    };

    //Block object with properties
    function Block(blockType, preview) {

        this.space = 16;

        if(!preview) {

            //Device resolution width minus the panel graphic, halved to find the center of the play area.
            this.x = (width - 96) / 2 - 8;
            this.y = -8;
        }else{

            this.x = width - 63;
            this.y = 137;
        }

        this.rotated = false;

        //Create a new group that will hold the complete shape of the block, and one for the collision squares.
        this.shapeGroup = game.add.group();

        //Set it's position.
        this.shapeGroup.x = this.x;
        this.shapeGroup.y = this.y;

        //Will keep note of it's angle for later use.
        this.storedAngle = 0;

        //Boolean to prevent the blocks being moved inside other blocks.
        this.preventInput = false;

        //Create each individual block depending on what block type has been passed in.
        switch(blockType){

            case 0:

                //Row position is relative to the group position.
                this.row1 = this.shapeGroup.create(0, 0, "redBlock");
                this.row2 = this.shapeGroup.create(0, 16, "redBlock");
                this.row3 = this.shapeGroup.create(0, 32, "redBlock");
                this.row4 = this.shapeGroup.create(0, 48, "redBlock");

                break;

            case 1:

                this.row1 = this.shapeGroup.create(0, 0, "blueBlock");
                this.row2 = this.shapeGroup.create(16, 0, "blueBlock");
                this.row3 = this.shapeGroup.create(16, 16, "blueBlock");
                this.row4 = this.shapeGroup.create(32, 16, "blueBlock");

                break;

            case 2:

                this.row1 = this.shapeGroup.create(0, 0, "yellowBlock");
                this.row2 = this.shapeGroup.create(0, 16, "yellowBlock");
                this.row3 = this.shapeGroup.create(16, 16, "yellowBlock");
                this.row4 = this.shapeGroup.create(32, 16, "yellowBlock");

                break;

            case 3:

                this.row1 = this.shapeGroup.create(16, 0, "pinkBlock");
                this.row2 = this.shapeGroup.create(0, 16, "pinkBlock");
                this.row3 = this.shapeGroup.create(16, 16, "pinkBlock");
                this.row4 = this.shapeGroup.create(32, 16, "pinkBlock");

                break;

            case 4:

                this.row1 = this.shapeGroup.create(0, 16, "greenBlock");
                this.row2 = this.shapeGroup.create(16, 16, "greenBlock");
                this.row3 = this.shapeGroup.create(16, 0, "greenBlock");
                this.row4 = this.shapeGroup.create(32, 0, "greenBlock");

                break;

            case 5:

                this.row1 = this.shapeGroup.create(0, 0, "lgreenBlock");
                this.row2 = this.shapeGroup.create(0, 16, "lgreenBlock");
                this.row3 = this.shapeGroup.create(16, 0, "lgreenBlock");
                this.row4 = this.shapeGroup.create(16, 16, "lgreenBlock");

                break;

            case 6:

                this.row1 = this.shapeGroup.create(32, 0, "cyanBlock");
                this.row2 = this.shapeGroup.create(32, 16, "cyanBlock");
                this.row3 = this.shapeGroup.create(16, 16, "cyanBlock");
                this.row4 = this.shapeGroup.create(0, 16, "cyanBlock");

                break;
        }

        //For each square in the shapeGroup...
        this.shapeGroup.forEach(function(square){

            //Center it's texture.
            square.anchor.setTo(0.5, 0.5);
        }, this);

        if(!preview) {

            //This will dictate if the block has stopped or not.
            this.moving = true;
        }

        //Enable Phaser's physics for each individual square in the block.
        game.physics.enable(this.row1, Phaser.Physics.ARCADE);
        game.physics.enable(this.row2, Phaser.Physics.ARCADE);
        game.physics.enable(this.row3, Phaser.Physics.ARCADE);
        game.physics.enable(this.row4, Phaser.Physics.ARCADE);
    };

    Block.prototype.ready = function(){

        //Set it's position.
        this.shapeGroup.x = ((width - 96) / 2)+56;
        this.shapeGroup.y = -24;

        this.moving = true;
    };

    Block.prototype.move = function(direction){

        //Move the group of shapes accordingly.

            switch(direction){

                case "down":

                    this.shapeGroup.y += this.space;
                    break;

                case "right":

                    this.shapeGroup.x += this.space;
                    break;

                case "left":

                    this.shapeGroup.x -= this.space;
                    break;
            };
    };

    Block.prototype.checkCollision = function(square2x, square2y){

        this.shapeGroup.forEach(function(square1){

            if(square1.world.x == square2x && square1.world.y + 16 >= square2y){

                this.moving = false;
            };

            /*Workaround for bug causing the world.x position of 2 squares to come back as
             floats instead of integers while at the far left of screen. No way to set the world position
             while the square is a child of shapeGroup.
             */
            if(square1.world.x <= 9 && square2x <= 9 && square1.world.y + 16 >= square2y){

                this.moving = false;
            };

            //Check for touching the bottom of the play area.
            if(square1.world.y + 16 >= base){

                this.moving = false;
            };

        }, this);
    };

    Block.prototype.rotate = function(){

        this.tempX = this.shapeGroup.x;
        this.tempY = this.shapeGroup.y;

        this.shapeGroup.angle = this.shapeGroup.angle + 90;

        //Keep the angle value between 0 and 360 so it's easier to manage.
        if(this.shapeGroup.angle == 360){

            this.shapeGroup.angle = 0;
        };

        this.storedAngle = this.shapeGroup.angle;
    };

    Block.prototype.checkPosition = function(){

        this.shapeGroup.forEach(function(square){

            //Edit the block's position if it's outside the screen bounds after being rotated.
            if(square.world.x < 0){

                this.shapeGroup.x += 16;
            }

            if(square.world.x > width - 96){

                this.shapeGroup.x -= 16;
            }
        }, this);
    };

    //Line checker object.
    function LineChecker(){

        this.x = 0;
        this.y = 376;

        this.checking = false;

        this.blockList = [];
        this.squareList = [];
    };

    LineChecker.prototype.moveCheck = function(){

        this.y -= 16;
    };

    LineChecker.prototype.resetCheck = function(){

        this.y = 376;
    };

    LineChecker.prototype.checkLine = function(i, j){

        //If the world position of any of the blocks is base - 16...
        if (blocksGroup[i].shapeGroup.children[j].world.y == this.y) {

            //Store a reference to that block and specific square.
            //They'll match up once iterated through one loop.
            this.blockList.push(blocksGroup[i]);
            this.squareList.push(blocksGroup[i].shapeGroup.children[j]);
        };
    };

    LineChecker.prototype.destroyLine = function(){

        //Destroy the squares that form a line.
        for(var i = 0; i < this.blockList.length; i++){

            this.blockList[i].shapeGroup.remove(this.squareList[i], true, false);
        };
    };

    LineChecker.prototype.clearArrays = function(){

        this.blockList = [];
        this.squareList = [];
    };

    LineChecker.prototype.report = function(){

        console.log("Linechecker.y: " + this.y);
        console.log("blockList holds " + this.blockList.length + " items.");
        console.log("squareList holds " + this.blockList.length + " items.");
    };

    function preload() {

        game.stage.backgroundColor = "00000f";
        game.load.image("panelInfo", "../Assignment/GFX/panelInfo.png");
        game.load.image("quitBTN", "../Assignment/GFX/quitBTN.png");
        game.load.image("leftBTN", "../Assignment/GFX/leftBTN.png");
        game.load.image("rightBTN", "../Assignment/GFX/rightBTN.png");
        game.load.image("rotateBTN", "../Assignment/GFX/rotateBTN.png");
        game.load.image("redBlock", "../Assignment/GFX/blocks/red.png");
        game.load.image("blueBlock", "../Assignment/GFX/blocks/blue.png");
        game.load.image("yellowBlock", "../Assignment/GFX/blocks/yellow.png");
        game.load.image("greenBlock", "../Assignment/GFX/blocks/green.png");
        game.load.image("pinkBlock", "../Assignment/GFX/blocks/pink.png");
        game.load.image("cyanBlock", "../Assignment/GFX/blocks/cyan.png");
        game.load.image("orangeBlock", "../Assignment/GFX/blocks/orange.png");
        game.load.image("lgreenBlock", "../Assignment/GFX/blocks/lgreen.png");

        //Scale the game graphics to fit the dimensions provided.
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        this.scale.setScreenSize( true );
    };

    function create() {

        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.stage.backgroundColor = "00000f";

        g = game.add.graphics();

        //Add the graphic for the side panel and quit button.
        game.add.sprite(width - 96, 0, "panelInfo");
        quitBTN = game.add.sprite(width - 78, 16, "quitBTN");

        //Add the rotate button
        g.beginFill(0x090909, 1);
        g.drawRect(width - (width/3 * 2), base, width/3, 96);

        //Create the first falling block and next block.
        currentBlock = new Block(getRandomInt(), false);
        nextBlock = new Block(getRandomInt(), true);

        leftBTN = game.add.sprite(0, base, "leftBTN");
        rightBTN = game.add.sprite(width - 96, base, "rightBTN");
        rotateBTN = game.add.sprite(96, base, "rotateBTN");

        lineChecker = new LineChecker();
        playerScore = new Score();
        gameSpeed = new Speed();
    };

    function update() {

        playerScore.updateBoard();
        gameSpeed.updateBoard();

        //If 14 columns in a single line were filled...
        if(lineChecker.squareList.length > 13) {

            //Destroy that line
            lineChecker.destroyLine();
            //Make any blocks above it fall.
            checkAbove();
            //score += 100;
            playerScore.addScore();
            gameSpeed.speedUp();
        };

        //Clear the stored squares and blocks that were listed.
        lineChecker.clearArrays();

        //If the linechecker has checked the first line...
        if(lineChecker.checking){

            //...Move it up a row.
            lineChecker.moveCheck();
            lineChecker.checking = false;
        };

        //If the Linechecker has reached y...
        if(lineChecker.y <= 10){

            //Move it back to the bottom.
            lineChecker.resetCheck();
        };

        //If the correct amount of time has passed, make things happen.
        if(gameSpeed.currentTime > gameSpeed.newTime && currentBlock.moving){

            //Make the block "fall".
            if(currentBlock.moving == true){

                currentBlock.move("down");
            };

            //Update the new time.
            gameSpeed.updateNewTime();
        };

        //If the block has landed then add to an array to check against later, then create a new block.
        if(gameSpeed.currentTime > gameSpeed.newTime && !currentBlock.moving){

            //Add the falling block to the list of existing blocks.
            blocksGroup.push(currentBlock);
            //Assign next block to currentBlock.
            currentBlock = nextBlock;
            currentBlock.ready();
            console.log(currentBlock.shapeGroup.y);
            nextBlock = new Block(getRandomInt(), true);
        };

        //For each existing block...
        for (i = 0; i < blocksGroup.length; i++) {

            //For each square in that block...
            for (var j = 0; j < blocksGroup[i].shapeGroup.length; j++) {

                lineChecker.checkLine(i, j);
            };
        };

        lineChecker.checking = true;

        //Check for user input.
        checkInput();
        //Check for collisions.
        checkCollisions();
        //Make sure the block hasn't been rotated off the screen.
        currentBlock.checkPosition();

        if(blocksGroup.length > 10) {

            //Check if block has touched top of screen.
            checkGameOver();
        };

        gameSpeed.updateCurrentTime();
    };

    function checkInput() {

        var x1, y1;
        var cantMoveLeft, cantMoveRight;

        cantMoveLeft = false;
        cantMoveRight = false;

        if(game.input.pointer1.isDown){

            touched = true;
        }

        if(currentBlock.moving) {
            //If the user stops touching...
            if (game.input.pointer1.isUp && touched) {

                //Take note of where the touch stopped.
                x1 = game.input.pointer1.x;
                y1 = game.input.pointer1.y;

                //Check if the user touched the "Left" button.
                if (x1 >= leftBTN.x && x1 <= leftBTN.x + leftBTN.width && y1 >= leftBTN.y && y1 <= leftBTN.y + leftBTN.height) {

                    currentBlock.shapeGroup.forEach(function (square) {

                        if (square.world.x <= 16) {

                            cantMoveLeft = true;
                        };
                    }, this);

                    if (!cantMoveLeft) {

                        currentBlock.move("left");
                    };
                };

                //Check if the user touched the "Right" button.
                if (x1 >= rightBTN.x && x1 <= rightBTN.x + rightBTN.width && y1 >= rightBTN.y && y1 <= rightBTN.y + rightBTN.height) {

                    //If any squares are equal to or over the play area, forbid the block from moving further.
                    currentBlock.shapeGroup.forEach(function (square) {

                        if (square.world.x + 16 >= width - 96) {

                            cantMoveRight = true;
                        };
                    }, this);

                    if (!cantMoveRight) {

                        currentBlock.move("right");
                    };
                };

                //Check if the user touched the "Rotate" button.
                if (x1 >= rotateBTN.x && x1 <= rotateBTN.x + rotateBTN.width && y1 >= rotateBTN.y && y1 <= rotateBTN.y + rotateBTN.height) {

                    //Make the falling block rotate.
                    currentBlock.rotate();
                };

                if (x1 >= quitBTN.x && x1 <= quitBTN.x + quitBTN.width && y1 >= quitBTN.y && y1 <= quitBTN.y + quitBTN.height) {

                    //Reload the page first, so next time the user comes to this page, everything is starting from scratch.
                    document.location.reload(true);
                    //Change to the homePage div.
                    document.location.hash = "#homePage";
                }

                touched = false;
            }
        }
    }

    function checkCollisions(){

        //See if the falling block hits the floor.
        currentBlock.checkCollision();


        //For each existing block...
        for(var i = 0; i < blocksGroup.length; i++){

            //...and each square in that existing block...
            blocksGroup[i].shapeGroup.forEach(function(square2){

                //...Check if the falling block lands on any of them.
                currentBlock.checkCollision(square2.world.x, square2.world.y);
            }, this);
        };
    }

    function checkGameOver(){

        var lastEntry = blocksGroup.length-1;

        blocksGroup[lastEntry].shapeGroup.forEach(function(square){

            if(square.world.y <= 0){

                console.log("Score is " + playerScore.score);
                //Store the player's score in local storage.
                localStorage.score = JSON.stringify(playerScore.score);
                localStorage.initialised = "true";

                //Reload the page first, so next time the user comes to this page, everything is starting from scratch.
                document.location.reload(true);
                //Change page to #scorePage.
                document.location.hash = "#scorePage";
            };
        }, this);
    }

    function getRandomInt(){

        return Math.floor(Math.random() * 7);
    }

    function checkAbove(){

        //If the squares in a block are above the destroyed line, move them down a row.

        //For all the existing blocks...
        for(var i = 0; i < blocksGroup.length; i++){

            //For all the squares in those blocks.
            blocksGroup[i].shapeGroup.forEach(function(square){

                //Compare it's position to the destroyed line.
                if(square.world.y < lineChecker.y){

                    //y position must be changed in relation to the parent "shapeGroup", so check the
                    //angle of the rested block before moving the square appropriately.
                    if(blocksGroup[i].storedAngle == 0){

                        square.y += 16;
                    }else if(blocksGroup[i].storedAngle == 90){

                        square.x += 16;
                    }else if(blocksGroup[i].storedAngle == 180){

                        square.y -= 16;
                    }else{

                        square.x -= 16;
                    };
                };
            }, this);
        };
    }

    function render() {

        //Uncomment to see the bounds of each square for debugging.

        /*
        currentBlock.shapeGroup.forEach(function(square){

            game.debug.body(square);
        }, this);

        for(var i = 0; i < blocksGroup.length; i++){

            blocksGroup[i].shapeGroup.forEach(function(square3){

                game.debug.body(square3);
            }, this);
        }
        */

    }
});