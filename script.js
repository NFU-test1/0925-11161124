const imageBasePath = 'images/'; // 圖片資料夾路徑
const imagesFull = [
    'animal1.png', 'animal2.png', 'animal3.png', 'animal4.png',
    'animal5.png', 'animal6.png', 'animal7.png', 'animal8.png',
    'animal9.png', 'animal10.png', 'animal11.png', 'animal12.png',
    'animal13.png', 'animal14.png', 'animal15.png', 'animal16.png',
    'animal17.png', 'animal18.png'
    // 確保有足夠的圖片來支援 6x6 網格
];

let gameBoard = document.getElementById('game-board');
let fullscreenTimer = document.getElementById('fullscreen-timer'); // 全屏倒數計時區域
let firstCard, secondCard;
let lockBoard = false;
let hasFlippedCard = false;
let startTime, endTime;
let matchedPairs = 0;
let totalPairs = 8; // 預設 4x4
let hideOption = document.querySelector('input[name="hide-option"]:checked').value;

// 取得下拉式選單和選項
const gridSizeSelect = document.getElementById('grid-size');
const hideOptions = document.querySelectorAll('input[name="hide-option"]');

// 當玩家更改選項時，更新 hideOption 的值
hideOptions.forEach(option => {
    option.addEventListener('change', () => {
        hideOption = document.querySelector('input[name="hide-option"]:checked').value;
    });
});

// 當玩家更改網格大小時，更新 totalPairs
gridSizeSelect.addEventListener('change', () => {
    const gridSize = parseInt(gridSizeSelect.value);
    totalPairs = (gridSize * gridSize) / 2;
});

function createBoard() {
    // 清空遊戲板
    gameBoard.innerHTML = '';

    // 根據選擇的網格大小設定遊戲板的 CSS grid
    const gridSize = parseInt(gridSizeSelect.value);
    gameBoard.style.gridTemplateColumns = `repeat(${gridSize}, 100px)`;
    gameBoard.style.gridTemplateRows = `repeat(${gridSize}, 100px)`;

    // 根據總配對數選擇圖片
    const selectedImages = imagesFull.slice(0, totalPairs);

    // 確保有足夠的圖片來配對
    if (selectedImages.length < totalPairs) {
        alert('圖片數量不足，請增加更多圖片！');
        return;
    }

    // 生成卡片配對
    let cards = [...selectedImages, ...selectedImages];

    // 打亂順序
    cards.sort(() => 0.5 - Math.random());

    // 創建卡片元素
    cards.forEach(image => {
        const card = document.createElement('div');
        card.classList.add('card');
        
        const cardInner = document.createElement('div');
        cardInner.classList.add('card-inner');
        
        const cardFront = document.createElement('div');
        cardFront.classList.add('card-front');
        // 可以在正面添加圖案或文字
        // cardFront.innerHTML = '🎣';
        
        const cardBack = document.createElement('div');
        cardBack.classList.add('card-back');
        cardBack.innerHTML = `<img src="${imageBasePath}${image}" alt="Animal">`;
        
        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        card.appendChild(cardInner);
        
        gameBoard.appendChild(card);
    });
}

function startGame() {
    document.getElementById('start').style.display = 'none'; // 隱藏開始按鈕
    document.getElementById('restart').style.display = 'none'; // 確保重新開始按鈕不顯示

    let countdown = 10;
    fullscreenTimer.textContent = countdown;
    fullscreenTimer.classList.add('show'); // 顯示全屏倒數計時
    
    const countdownInterval = setInterval(() => {
        countdown--;
        fullscreenTimer.textContent = countdown;
        
        if (countdown === 0) {
            clearInterval(countdownInterval);
            flipAllCardsToBack();
            enableCardClicks();
            fullscreenTimer.classList.add('fade-out'); // 倒數計時結束後淡出

            setTimeout(() => {
                fullscreenTimer.classList.remove('show'); // 完全隱藏倒數計時
                fullscreenTimer.classList.remove('fade-out'); // 清除 fade-out 類，以便下次使用
            }, 1000);  // 1秒後完全隱藏倒數計時
            
            startTime = new Date(); // 開始計時
        }
    }, 1000);

    flipAllCardsToFront(); // 顯示正面
}

function flipAllCardsToBack() {
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => card.classList.remove('flipped'));
}

function flipAllCardsToFront() {
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => card.classList.add('flipped'));
}

function enableCardClicks() {
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => card.addEventListener('click', flipCard));
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;
    if (this.classList.contains('hidden')) return; // 不允許翻轉已隱藏的卡片

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
    matchedPairs = 0;
    gameBoard.innerHTML = '';
    createBoard();
    startGame();
    document.getElementById('restart').style.display = 'none'; // 隱藏重新開始按鈕
});

// 初始化遊戲
document.getElementById('start').addEventListener('click', () => {
    matchedPairs = 0;
    gameBoard.innerHTML = '';
    createBoard();
    startGame();
});
