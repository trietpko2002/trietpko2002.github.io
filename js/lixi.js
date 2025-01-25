const prizes = [
    '10,000đ', '20,000đ', '50,000đ', 'cái nịt', '200,000đ',
    '20,000đ', '50,000đ', 'cái nịt', '100,000đ', '500,000đ'
];

// Xáo trộn ngẫu nhiên danh sách phần thưởng
prizes.sort(() => Math.random() - 0.1);

const container = document.getElementById('lixi-container');

// Tạo 10 ô lì xì
prizes.forEach((_, index) => {
    const button = document.createElement('button');
    button.className = 'lixi';
    button.textContent = 'Lì Xì ' + (index + 1);
    button.onclick = () => showPrize(prizes[index]);
    container.appendChild(button);
});

function showPrize(prize) {
    const popup = document.getElementById('popup');
    const overlay = document.getElementById('overlay');
    const message = document.getElementById('popup-message');

    message.textContent = `Chúc mừng bạn nhận được ${prize}!`;
    popup.style.display = 'block';
    overlay.style.display = 'block';
}

function returnToIndex() {
    window.location.href = 'index.html';
}