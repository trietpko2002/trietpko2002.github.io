function startGame() {
    const giverInput = document.getElementById('giverListInput').value.trim();
    const receiverInput = document.getElementById('receiverListInput').value.trim();
    const minAmountInput = document.getElementById('minAmount').value.trim();
    const maxAmountInput = document.getElementById('maxAmount').value.trim();
    const resultElement = document.getElementById('result');

    // Tách các tên thành mảng từ chuỗi nhập vào, loại bỏ khoảng trắng thừa
    const giverList = giverInput.split(',').map(name => name.trim()).filter(name => name !== "");
    const receiverList = receiverInput.split(',').map(name => name.trim()).filter(name => name !== "");

    // Kiểm tra xem có đủ danh sách người lì xì và người nhận không
    if (giverList.length === 0 || receiverList.length === 0 || minAmountInput === "" || maxAmountInput === "") {
        alert("Vui lòng nhập đầy đủ danh sách người lì xì, người nhận và số tiền!");
        return;
    }

    // Kiểm tra và chuyển đổi số tiền nhập vào thành số, và kiểm tra tính hợp lệ
    const minAmount = parseInt(minAmountInput);
    const maxAmount = parseInt(maxAmountInput);

    if (isNaN(minAmount) || isNaN(maxAmount)) {
        alert("Vui lòng nhập số tiền hợp lệ!");
        return;
    }

    if (minAmount >= maxAmount) {
        alert("Số tiền nhỏ nhất phải nhỏ hơn số tiền lớn nhất!");
        return;
    }

    // Chọn ngẫu nhiên người lì xì và người nhận
    const randomGiver = giverList[Math.floor(Math.random() * giverList.length)];
    const randomReceiver = receiverList[Math.floor(Math.random() * receiverList.length)];

    // Tạo số tiền random trong phạm vi từ minAmount đến maxAmount
    const randomAmount = Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount;

    // Hiển thị người lì xì, người nhận và số tiền
    resultElement.innerHTML = `${randomGiver} lì xì cho ${randomReceiver}: <strong>${randomAmount.toLocaleString()} VND</strong>`;

    // Thêm hiệu ứng random
    resultElement.style.transition = "all 1s ease-in-out";
    resultElement.style.opacity = 0;
    setTimeout(() => {
        resultElement.style.opacity = 1;
        resultElement.style.transform = "scale(1.2)";
    }, 100);
    setTimeout(() => {
        resultElement.style.transform = "scale(1)";
    }, 500);
}