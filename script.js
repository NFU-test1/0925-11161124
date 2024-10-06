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
let fullscreenTimer = document.getElementById('fullscreen-timer'); // 倒數計時顯示區域
let teamScores = document.getElementById('team-scores'); // 顯示隊伍和分數的區域
let gameOptions = document.getElementById('game-options'); // 包裹選項的容器
let startButton = document.getElementById('start');
let restartButton = document.getElementById('restart');
let firstCard, secondCard;
let lockBoard = false;
let hasFlippedCard = false;
let startTime;
let matchedPairs = 0;
let totalPairs = 8; // 預設 4x4
let hideOption = document.querySelector('input[name="hide-option"]:checked').value;
let currentTeam = 0; // 當前隊伍
let teams = []; // 儲存隊伍名稱及其成績
let scores = {}; // 每個隊伍的配對數

// 預設隊伍顏色
const teamColors = ["紅隊", "藍隊", "黃隊", "綠隊", "紫隊"];

// 取得下拉式選單和選項
const gridSizeSelect = document.getElementById('grid-size');
const hideOptions = document.querySelectorAll('input[name="hide-option"]');
const countdownTimeSelect = document.getElementById('countdown-time');
const teamCountSelect = document.getElementById('team-count'); // 取得隊伍數量選項

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
        cardFront.innerHTML = '🎣'; // 可以在正面添加圖案或文字
        
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
    startButton.style.display = 'none'; // 隱藏開始按鈕
    restartButton.style.display = 'none'; // 確保重新開始按鈕不顯示
    gameOptions.style.display = 'none'; // 隱藏遊戲選項

    let countdown = parseInt(countdownTimeSelect.value); // 根據使用者選擇的時間倒數
    fullscreenTimer.textContent = countdown;
    fullscreenTimer.classList.add('show'); // 顯示倒數計時

    let teamCount = parseInt(teamCountSelect.value); // 取得隊伍數量
    teams = teamColors.slice(0, teamCount); // 根據選擇的數量分配隊伍
    scores = teams.reduce((acc, team) => { acc[team] = 0; return acc; }, {}); // 初始化每個隊伍的分數
    currentTeam = 0; // 從紅隊開始

    updateTeamScores(); // 更新顯示的隊伍分數

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

// 更新隊伍和分數的顯示
function updateTeamScores() {
    teamScores.innerHTML = ''; // 清空之前的顯示
    teams.forEach((team, index) => {
        let teamDiv = document.createElement('div');
        teamDiv.classList.add('team');
        if (index === currentTeam) {
            teamDiv.classList.add('active'); // 當前隊伍加上 active 樣式
        }
        teamDiv.textContent = `${team} - 分數: ${scores[team]}`;
        teamScores.appendChild(teamDiv);
    });
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
    if (isMatch) {
        scores[teams[currentTeam]]++; // 成功配對，增加當前隊伍分數
        updateTeamScores(); // 即時更新分數顯示
        disableCards();
    } else {
        switchTeam(); // 失敗換隊
    }
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

function switchTeam() {
    // 當配對失敗時，切換至下一隊
    currentTeam = (currentTeam + 1) % teams.length;
    unflipCards(); // 配對失敗後翻回牌面
    
    setTimeout(() => {
        // 使用 SweetAlert 顯示隊伍切換提示，並自動在 1 秒後關閉
        Swal.fire({
            title: `換到 ${teams[currentTeam]}`,
            icon: 'info',
            timer: 1000,
            showConfirmButton: false
        });
        updateTeamScores(); // 更新顯示隊伍和分數
    }, 1000); // 等待翻轉動畫結束後顯示提示
}

function gameOver() {
    let highestScore = Math.max(...Object.values(scores)); // 找到最高分
    let winningTeams = teams.filter(team => scores[team] === highestScore); // 找到分數最高的隊伍
    if (winningTeams.length === 1) {
        Swal.fire(`${winningTeams[0]} 獲勝，分數為：${highestScore}`);
    } else {
        Swal.fire(`平手！${winningTeams.join(' 和 ')} 分數為：${highestScore}`);
    }
    restartButton.style.display = 'block'; // 顯示重新開始按鈕
    gameOptions.style.display = 'block'; // 顯示選項
}

// 重新開始遊戲
restartButton.addEventListener('click', () => {
    matchedPairs = 0;
    gameBoard.innerHTML = '';
    createBoard();
    startGame();
    restartButton.style.display = 'none'; // 隱藏重新開始按鈕
    gameOptions.style.display = 'none'; // 顯示選項

});

// 初始化遊戲
document.getElementById('start').addEventListener('click', () => {
    matchedPairs = 0;
    gameBoard.innerHTML = '';
    createBoard();
    startGame();
});
