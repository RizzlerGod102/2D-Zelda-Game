//Run this code only after the HTML page finishes loading
document.addEventListener('DOMContentLoaded', () => {

    //Get elements from the HTML
    const grid = document.getElementById('grid')
    const scoreDisplay = document.getElementById('score')
    const levelDisplay = document.getElementById('level')
    const enemyDisplay = document.getElementById('enemies')

    //Game settings
    const width = 10
    const tileSize = 48

    // Game variables
    const squares = []
    let score = 0
    let level = 0
    let playerPosition = 40
    let enemies = []
    let playerDirection = 'right'
    let gameRunning = true

    //Map Layouts
    const maps = [
        [
            'ycc)cc^ccw',
            'a        b',
            'a      * b',
            'a    (   b',
            '%        b',
            'a        b',
            'a     (  b',
            'a  *     b',
            'xdd)dd)ddz'
        ],
        [
            'yccccccccw',
            'a        b',
            'a      * )',
            'a    (   b',
            '%        b',
            'a   $    b',
            'a  *     )',
            'a   }    b',
            'xddddddddz',
        ]
    ]

    //Create the board
    function createBoard() {
        gameRunning = true
        grid.innerHTML = ''
        squares.length = 0
        enemies = []
        const currentMap = maps[level]

        for (let i = 0; i < 9; i++) {
            for(let j = 0; j < 10; j++) {
                const square = document.createElement('div')
                square.setAttribute('id', i * width + j)
                const char = currentMap[i][j]

                //Adds map
                addmapElement(square, char, j, i)
                grid.appendChild(square)
                squares.push(square)
            }
        }

        createPlayer()
    }

    // Sets up board for current level
    createBoard()


    function addmapElement(square, char, x, y) {
        switch(char) {
            case 'a': square.classList.add('left-wall'); break
            case 'b': square.classList.add('right-wall'); break
            case 'c': square.classList.add('top-wall'); break
            case 'd': square.classList.add('bottom-wall'); break
            case 'w': square.classList.add('top-right-wall'); break
            case 'x': square.classList.add('bottom-left-wall'); break
            case 'y': square.classList.add('top-left-wall'); break
            case 'z': square.classList.add('bottom-right-wall'); break
            case '%': square.classList.add('left-door'); break
            case '^': square.classList.add('top-door'); break
            case '$': square.classList.add('stairs'); break
            case ')': square.classList.add('lanterns'); break
            case '(': square.classList.add('fire-pot'); break
            case '*': createSlicer(x,y); break
            case '}': createSkeletor(x,y); break
        }
    }

    //character is added to the grid.
    function createPlayer() {
        const PlayerElement = document.createElement('div')
        PlayerElement.classList.add('link-going-right')
        PlayerElement.id = 'player'
        PlayerElement.style.left = `${(playerPosition % width) * tileSize}px`
        PlayerElement.style.top = `${Math.floor(playerPosition / width) * tileSize}px`
        grid.appendChild(PlayerElement)
    }
    //Creates a horizontal moving enemy (slicer).
    function createSlicer(x, y) {
        const slicerElement = document.createElement('div')
        slicerElement.classList.add('slicer')
        slicerElement.style.left = `${x * tileSize}px`
        slicerElement.style.top = `${y * tileSize}px`

        const slicer = {
            x, 
            y,
            direction: -1,
            type: 'slicer',
            element: slicerElement
        }

        enemies.push(slicer)
        grid.appendChild(slicerElement)
    }
    //Creates a vertical moving enemy (skeletor).
    function createSkeletor(x, y) {
        const skeletorElement = document.createElement('div')
        skeletorElement.classList.add('skeletor')
        skeletorElement.style.left = `${x * tileSize}px`
        skeletorElement.style.top = `${y * tileSize}px`

        const skeletor = {
            x, y,
            direction: -1,
            timer: Math.random() * 5,
            type: 'skeletor',
            element: skeletorElement
        }

        enemies.push(skeletor)
        grid.appendChild(skeletorElement)
    }

    //moves player in given direction
    function movePlayer(direction) {
        const PlayerElement = document.getElementById('player') 
        let newPosition = playerPosition

        switch(direction) {
            case 'left': 
                if(playerPosition % width !==0) newPosition = playerPosition -1
                PlayerElement.className = 'link-going-left'
                playerDirection = 'left'
                break
            case 'right': 
                if(playerPosition % width !== width-1) newPosition = playerPosition + 1
                PlayerElement.className = 'link-going-right'
                playerDirection = 'right'
                break
            case 'up':
                if(playerPosition - width >=0) newPosition = playerPosition - width
                PlayerElement.className ='link-going-up'
                playerDirection = 'up'
                break
            case 'down':
                if(playerPosition + width <width * 9) newPosition = playerPosition + width
                PlayerElement.className = 'link-going-down'
                playerDirection = 'down'
                break
        }

        //Determines whether character can move to certain square.
        if(canMoveTo(newPosition)){
            const square = squares[newPosition]
            if(square.classList.contains('left-door')) square.classList.remove('left-door')

            if(square.classList.contains('top-door') || square.classList.contains('stairs')) {
                if (enemies.length === 0) nextLevel()
                else showEnemiesRemainingMessage()
                return
            }
            playerPosition = newPosition
            PlayerElement.style.left = `${(playerPosition % width) * tileSize}px`
            PlayerElement.style.top = `${Math.floor(playerPosition / width) * tileSize}px` 
        }
    }

    function canMoveTo(position) {
        if(position < 0 || position >= squares.length) return false
        const square = squares[position]
        return !square.classList.contains('left-wall') &&
               !square.classList.contains('right-wall') &&
               !square.classList.contains('top-wall') &&
               !square.classList.contains('bottom-wall') &&
               !square.classList.contains('top-left-wall') &&
               !square.classList.contains('top-right-wall') &&
               !square.classList.contains('bottom-left-wall') &&
               !square.classList.contains('bottom-right-wall') &&
               !square.classList.contains('lanterns') &&
               !square.classList.contains('fire-pot') 
    }

    //Enemy movement functions (top-level)
    function moveEnemies(deltaTime) {
        for (const enemy of enemies) {
            if (enemy.type === 'slicer') moveSlicer(enemy, deltaTime)
            else if (enemy.type === 'skeletor') moveSkeletor(enemy, deltaTime)
        }
    }

    function moveSlicer(slicer, deltaTime) {
        const speed = 2 * deltaTime
        const newX = slicer.x + (slicer.direction * speed)
        const y = Math.round(slicer.y)

        if (newX < 0 || newX >= width || isWall(Math.round(newX), y)) slicer.direction *= -1
        else slicer.x = newX

        slicer.element.style.left = `${slicer.x * tileSize}px`
    }
    //skeletor goes vertically.
    function moveSkeletor(skeletor, deltaTime) {
        const speed = 1.5 * deltaTime
        skeletor.timer -= deltaTime
        if (skeletor.timer <= 0) {
            skeletor.direction *= -1
            skeletor.timer = Math.random() * 5
        }

        const newY = skeletor.y + (skeletor.direction * speed)
        const x = Math.round(skeletor.x)

        if (newY < 0 || newY >= 9 || isWall(x, Math.round(newY))) skeletor.direction *= -1
        else skeletor.y = newY

        skeletor.element.style.top = `${skeletor.y * tileSize}px`
    }

    function isWall(x, y) {
        const position = y * width + x
        if (position < 0 || position >= squares.length) return true
        const square = squares[position]
        return square.classList.contains('left-wall') ||
               square.classList.contains('right-wall') ||
               square.classList.contains('top-wall') ||
               square.classList.contains('bottom-wall') ||
               square.classList.contains('top-left-wall') ||
               square.classList.contains('top-right-wall') ||
               square.classList.contains('bottom-left-wall') ||
               square.classList.contains('bottom-right-wall') ||
               square.classList.contains('lanterns') ||
               square.classList.contains('fire-pot') 
    }

    //Kaboom
    function spawnKaboom() {
        let kaboomX = playerPosition % width
        let kaboomY = Math.floor(playerPosition / width)

        switch(playerDirection) {
            case 'left': kaboomX -= 1; break
            case 'right': kaboomX += 1; break
            case 'up': kaboomY -=1; break
            case 'down': kaboomY +=1; break
        }

        if (kaboomX >= 0 && kaboomX < width && kaboomY >= 0 && kaboomY < 9) {
            const kaboomElement = document.createElement('div')
            kaboomElement.className = 'kaboom'
            kaboomElement.style.left = `${kaboomX * tileSize}px`
            kaboomElement.style.top = `${kaboomY * tileSize}px`
            grid.appendChild(kaboomElement)

            // Check collision with enemies
            for (let i = enemies.length - 1; i >= 0; i--) {
                const enemy = enemies[i]
                const enemyX = Math.round(enemy.x)
                const enemyY = Math.round(enemy.y)
                if (enemyX === kaboomX && enemyY === kaboomY) {
                    if (enemy.element.parentNode) enemy.element.parentNode.removeChild(enemy.element)
                    enemies.splice(i, 1)
                    score++
                    //Updates the score, level and remaining enemies display in the User interface.
                    updateDisplays()
                }
            }

            setTimeout(() => {
                if (kaboomElement.parentNode) kaboomElement.parentNode.removeChild(kaboomElement)
            }, 1000)
        }
    }
//checks if player and enemy collide
    function checkPlayerEnemyCollision() {
        const playerX = playerPosition % width
        const playerY = Math.floor(playerPosition / width)

        for (const enemy of enemies) {
            const enemyX = Math.round(enemy.x)
            const enemyY = Math.round(enemy.y)
            //ends game when player dies
            if (enemyX === playerX && enemyY === playerY) {
                gameOver()
                return
            }
        }
    }

    function updateDisplays() {
        scoreDisplay.innerHTML = score 
        levelDisplay.innerHTML = level + 1
        enemyDisplay.innerHTML = enemies.length
    }

    //Moves  player to next level.
    function nextLevel() {
        level = (level + 1) % maps.length
        createBoard()
    }

    //Warns player if they try to leave without killing enemies
    function showEnemiesRemainingMessage(){
        grid.style.filter = 'hue-rotate(0deg) saturate(2) brightness(1.5)'
        grid.style.boxShadow = '0 0 20px red'
        setTimeout(() => { grid.style.filter = ''; grid.style.boxShadow = '' }, 300)
        showTemporaryMessage('Defeat all enemies first!', 'red', 2000)
    }

    function showTemporaryMessage(message, color, duration) {
        const existingMessage = document.getElementById('temp-message')
        if (existingMessage) existingMessage.remove()

        const messageElement = document.createElement('div')
        messageElement.id = 'temp-message'
        messageElement.textContent = message
        messageElement.style.color = color
        grid.appendChild(messageElement)

        setTimeout(() => { if (messageElement.parentNode) messageElement.parentNode.removeChild(messageElement) }, duration)
    }

    document.addEventListener('keydown', (e) => {
        if(!gameRunning) return
        switch(e.code) {
            case 'ArrowLeft':
                 e.preventDefault();  //prevents scrolling
                 movePlayer('left'); break

            case 'ArrowRight': 
            e.preventDefault(); 
            movePlayer('right'); break

            case 'ArrowUp': 
            e.preventDefault(); 
            movePlayer('up'); break

            case 'ArrowDown': 
            e.preventDefault();
             movePlayer('down'); break

            case 'Space': 
            e.preventDefault(); 
            spawnKaboom(); break
        }
    })

    let lastTime = 0
    let animationId

    function gameLoop(currentTime) {
        const deltaTime = (currentTime - lastTime) / 1000
        lastTime = currentTime
        if(gameRunning && deltaTime < 0.1) {
            //Updates the enemy position in each frame.
            moveEnemies(deltaTime)
            checkPlayerEnemyCollision()
        }
        animationId = requestAnimationFrame(gameLoop)
    }
//Ends game if player dies
    function gameOver() {
        gameRunning = false
        showTemporaryMessage(`Game Over Final Score: ${score}`, 'white', 3000)
    }

    animationId = requestAnimationFrame(gameLoop)

})