/*** Functions */

function $(selector) {
  return document.querySelector(selector);
}

function generate_deck() {
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

function show_deck(deck) {
  if (user[deck]) return;
  user.target = deck;
  $("#btnChoose").disabled = false;
  $(".deck-wrapper").classList.remove("hide");
  deckSwiper.update();
  deckSwiper.update();
  deckSwiper.enable();
  deckSwiper.slideTo(5, 0);
}

function chosen() {
  if (!user.target) return;
  user[user.target] = user.decks[user.target][deckSwiper.activeIndex];
  $("#btnChoose").disabled = true;
  $(".deck-wrapper").classList.add("hide");
  $(`.slot.${[user.target]}`).classList.add("done");
  $(`.slot.${[user.target]}`).innerText = user[user.target];
  if (
    typeof user.triangle === "number" &&
    typeof user.square === "number" &&
    typeof user.circle === "number"
  ) {
    alea_iacta_est();
  }
}

function alea_iacta_est() {
  console.log(`Alea iacta est: ${user.triangle} ${user.square} ${user.circle}`);
}

/*** Vars */

const user = {
  decks: {
    triangle: generate_deck(),
    square: generate_deck(),
    circle: generate_deck(),
  },
  target: null,
  timer: null,
  triangle: null,
  square: null,
  circle: null,
};

const swiper = new Swiper(".mySwiper", {
  speed: 600,
  parallax: true,
  allowTouchMove: false,
  autoHeight: true,
  direction: "vertical",
});

const deckSwiper = new Swiper(".mySwiperDeck", {
  effect: "cards",
  grabCursor: true,
  mousewheel: true,
  enabled: false,
  keyboard: true,
  initialSlide: 5,
});

/*** Buttons */

$("#askButton").onclick = () => {
  swiper.slideNext(600);
};

$("#testButton").onclick = () => {
  swiper.changeDirection("horizontal");
  swiper.slideNext(600);
};

$(".slot.triangle").onclick = () => {
  show_deck("triangle");
};

$(".slot.circle").onclick = () => {
  show_deck("circle");
};

$(".slot.square").onclick = () => {
  show_deck("square");
};

$("#btnBack").onclick = () => {
  $(".deck-wrapper").classList.add("hide");
  deckSwiper.disable();
};

$("#btnChoose").onmousedown = (e) => {
  user.timer = setTimeout(() => {
    chosen();
  }, 1000);
};

$("#btnChoose").onmouseup = (e) => {
  clearTimeout(user.timer);
};

$("#btnChoose").ontouchstart = () => {
  user.timer = setTimeout(() => {
    chosen();
  }, 1000);
};

$("#btnChoose").ontouchend = () => {
  clearTimeout(user.timer);
};
