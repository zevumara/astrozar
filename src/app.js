const swiper = new Swiper(".mySwiper", {
  speed: 600,
  parallax: true,
  allowTouchMove: false,
  autoHeight: true,
  direction: "vertical",
});

$("#askButton").onclick = () => {
  swiper.slideNext(600);
};

$("#testButton").onclick = () => {
  swiper.changeDirection("horizontal");
  swiper.slideNext(600);
};

function $(selector) {
  return document.querySelector(selector);
}
