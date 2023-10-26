function generateDeck() {
  const deck = [];
  for (let i = 0; i < 10; i++) {
    let cardIndex;
    do {
      cardIndex = Math.floor(Math.random() * 10);
    } while (deck.includes(cardIndex));
    deck.push(cardIndex);
  }
  return deck;
}

let deckTriangle = generateDeck();
let deckSquare = generateDeck();
let deckCircle = generateDeck();

const swiper = new Swiper(".mySwiper", {
  speed: 600,
  parallax: true,
  allowTouchMove: false,
  autoHeight: true,
  direction: "vertical",
});

const deck = new Swiper(".mySwiperDeck", {
  effect: "cards",
  grabCursor: true,
  mousewheel: true,
  enabled: false,
  keyboard: true,
  initialSlide: 5,
});

$("#askButton").onclick = () => {
  swiper.slideNext(600);
};

$("#testButton").onclick = () => {
  swiper.changeDirection("horizontal");
  swiper.slideNext(600);
};

$(".slot.triangle").onclick = () => {
  $(".deck-wrapper").classList.remove("hide");
  deck.update();
  deck.update();
  deck.enable();
};

$(".slot.circle").onclick = () => {};

$(".slot.square").onclick = () => {};

// $(".deck-wrapper").onclick = () => {
//   console.log(deck.activeIndex);
// };

let holdTimer;

$("#btnChoose").onmousedown = (e) => {
  holdTimer = setTimeout(() => {
    console.log(`Carta ${deck.activeIndex} elegida.`);
    $("#btnChoose").disabled = true;
  }, 1000);
};

$("#btnChoose").onmouseup = (e) => {
  clearTimeout(holdTimer);
};

$("#btnChoose").ontouchstart = () => {
  console.log("ontouchstart");
  holdTimer = setTimeout(() => {
    console.log(`Choosed card is ${deck.activeIndex} (${deckTriangle[deck.activeIndex]}).`);
  }, 1000);
};

$("#btnChoose").ontouchend = () => {
  console.log("ontouchend");
  clearTimeout(holdTimer);
};

$("#btnBack").onclick = () => {
  $(".deck-wrapper").classList.add("hide");
  deck.disable();
};

function $(selector) {
  return document.querySelector(selector);
}
