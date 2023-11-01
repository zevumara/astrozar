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
  deckSwiper.slideTo(5, 0);
  deckSwiper.update();
  deckSwiper.update();
  deckSwiper.enable();
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

function next() {
  swiper.allowSlideNext = true;
  swiper.slideNext(600);
  swiper.allowSlideNext = false;
}

function answer() {
  if (!user.query) return;
  $(".query").innerText = user.query;
  $(".answer").innerText =
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nam omnis autem, eligendi, minus asperiores repudiandae et consequatur ab accusantium vero quod similique velit modi magni dolorum obcaecati incidunt sunt ipsa!";
  swiper.allowSlideNext = true;
  swiper.slideNext(600);
  swiper.allowSlideNext = false;
}

function alea_iacta_est() {
  console.log(`Alea iacta est: ${user.triangle} ${user.circle} ${user.square}`);
  next();
  setTimeout(answer, 6000);
}

/*** Vars */

const user = {
  decks: {
    triangle: null,
    square: null,
    circle: null,
  },
  query: null,
  target: null,
  timer: null,
  triangle: null,
  square: null,
  circle: null,
};

const swiper = new Swiper(".mySwiper", {
  speed: 600,
  parallax: true,
  allowSlideNext: false,
  allowSlidePrev: false,
  autoHeight: true,
  direction: "vertical",
  animating: false,
});

const deckSwiper = new Swiper(".mySwiperDeck", {
  effect: "cards",
  grabCursor: true,
  mousewheel: true,
  enabled: false,
  keyboard: true,
  initialSlide: 5,
});

/*** Events */

$("#btnAsk").onclick = (e) => {
  e.preventDefault();
  next();
};

$("textarea").oninput = (e) => {
  const characters = e.target.value.length;
  if (characters > 20 && characters < 255) {
    user.query = e.target.value;
    if ($("#btnDraw").classList.contains("disabled")) {
      $("#btnDraw").classList.remove("disabled");
    }
  } else {
    user.query = null;
    if (!$("#btnDraw").classList.contains("disabled")) {
      $("#btnDraw").classList.add("disabled");
    }
  }
};

$("#btnDraw").onclick = (e) => {
  e.preventDefault();
  setTimeout(next, 4000); // Avoid after first time (localStorage)
  next();
  user.decks.circle = generate_deck();
  user.decks.square = generate_deck();
  user.decks.triangle = generate_deck();
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

$("#btnChoose").onmousedown = () => {
  user.timer = setTimeout(() => {
    chosen();
  }, 1000);
};

$("#btnChoose").onmouseup = () => {
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
