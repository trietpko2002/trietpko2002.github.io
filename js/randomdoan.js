const guessButton = document.getElementById('guessButton');
const resetButton = document.getElementById('resetButton');
const resultBox = document.getElementById('result');

// Danh sách các số tiền lì xì đẹp
const luckyAmounts = [5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2000000];

// Xử lý khi bấm nút "Đoán"
guessButton.addEventListener('click', () => {
    const randomIndex = Math.floor(Math.random() * luckyAmounts.length);
    const luckyAmount = luckyAmounts[randomIndex];
    resultBox.textContent = `${luckyAmount} VNĐ`;
});

// Xử lý khi bấm nút "Trở về Index"
resetButton.addEventListener('click', () => {
    resultBox.textContent = '...';
});