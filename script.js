const images = [
    'animal1.png', 'animal2.png', 'animal3.png', 'animal4.png',
    'animal5.png', 'animal6.png', 'animal7.png', 'animal8.png'
];

let gameBoard = document.getElementById('game-board');
let countdownElement = document.getElementById('countdown');
let timerElement = document.getElementById('timer');
let firstCard, secondCard;
let lockBoard = false;
let hasFlippedCard = false;
let startTime, endTime;
let matchedPairs = 0;
const totalPairs = 8;

// 取得玩家選擇是否隱藏卡片的選項
let hideOption = document.querySelector('input[name="hide-option"]:checked').value;

let cards = [...images, ...images]; // 配對卡片

// 當玩家更改選項時，更新 hideOption 的值
document.querySelectorAll('input[name="hide-option"]').forEach(option => {
    option.addEventListener('change', () => {
        hideOption = document.querySelector('input[name="hide-option"]:checked').value;
    });
});

// 打亂順序
cards.sort(() => 0.5 - Math.random());

function createBoard() {
    cards.forEach(image => {
        const card = document.createElement('div');
        card.classList.add('card');
        
        const cardInner = document.createElement('div');
        cardInner.classList.add('card-inner');
        
        const cardFront = document.createElement('div');
        cardFront.classList.add('card-front');
        
        const cardBack = document.createElement('div');
        cardBack.classList.add('card-back');
        cardBack.innerHTML = `<img src="images/${image}" alt="Animal">`;
        
        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        card.appendChild(cardInner);
        
        gameBoard.appendChild(card);
    });
}

function flipAllCardsToBack() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => card.classList.remove('flipped'));
}

function flipAllCardsToFront() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => card.classList.add('flipped'));
}

function startGame() {
    document.getElementById('start').style.display = 'none'; // 隱藏開始按鈕
    document.getElementById('restart').style.display = 'none'; // 確保重新開始按鈕不顯示

    let countdown = 10;
    countdownElement.textContent = countdown;
    
    timerElement.style.display = 'block'; // 顯示倒計時
    const countdownInterval = setInterval(() => {
        countdown--;
        countdownElement.textContent = countdown;
        if (countdown === 0) {
            clearInterval(countdownInterval);
            flipAllCardsToBack();
            enableCardClicks();
            timerElement.style.display = 'none';  // 隱藏倒計時
            startTime = new Date(); // 開始計時
        }
    }, 1000);

    flipAllCardsToFront(); // 顯示正面
}

function enableCardClicks() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => card.addEventListener('click', flipCard));
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add('flipped');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    checkForMatch();
}

function checkForMatch() {
    let isMatch = firstCard.innerHTML === secondCard.innerHTML;
    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    
    if (hideOption === 'hide') {
        // 如果選擇隱藏，淡出配對成功的卡片
        firstCard.classList.add('hidden');
        secondCard.classList.add('hidden');
    }
    
    resetBoard();
    matchedPairs++;
    if (matchedPairs === totalPairs) {
        setTimeout(gameOver, 1000); // 確保在最後一對翻轉後再提示
    }
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

function gameOver() {
    endTime = new Date();
    const timeTaken = Math.floor((endTime - startTime) / 1000); // 計算所花時間（秒）
    alert(`完成時間：${timeTaken} 秒`); // 使用 alert 顯示完成時間
    document.getElementById('restart').style.display = 'block'; // 顯示重新開始按鈕
}

// 重新開始遊戲
document.getElementById('restart').addEventListener('click', () => {
    gameBoard.innerHTML = '';
    cards.sort(() => 0.5 - Math.random());
    matchedPairs = 0;
    createBoard();
    startGame();
    document.getElementById('restart').style.display = 'none'; // 隱藏完成時間
});

// 初始化遊戲
document.getElementById('start').addEventListener('click', () => {
    gameBoard.innerHTML = '';
    cards.sort(() => 0.5 - Math.random());
    createBoard();
    startGame();
    timerElement.style.display = 'block'; // 顯示倒計時
});
