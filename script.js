window.addEventListener('load', () => {
  document.querySelectorAll('.fade-in').forEach(el => {
    el.classList.add('visible');
  });
});

const slides = document.querySelectorAll(".slide");
let currentSlide = 0;
let isTransitioning = false;

function showSlide(index) {
  if (isTransitioning) return;
  isTransitioning = true;

  slides.forEach((slide, i) => {
    slide.classList.remove("active");
    slide.style.transform = "translateX(100%)";
  });

  slides[index].classList.add("active");
  slides[index].style.transform = "translateX(0)";

  setTimeout(() => {
    isTransitioning = false;
  }, 600); // Thời gian bằng với transition trong CSS
}

document.querySelector(".prev-btn").addEventListener("click", () => {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  showSlide(currentSlide);
});

document.querySelector(".next-btn").addEventListener("click", () => {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
});

// Khởi tạo slide đầu tiên
showSlide(currentSlide);
