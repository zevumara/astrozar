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
  if (user[deck] !== null) return;
  user.target = deck;
  $("#btnChoose").disabled = false;
  $("#deck").classList.add("appear");
  deckSwiper.slideTo(5, 0);
  deckSwiper.update();
  deckSwiper.update();
  deckSwiper.enable();
}

function chosen() {
  if (!user.target) return;
  $("#btnChoose").disabled = true;
  user.decks.circle = generate_deck();
  user.decks.square = generate_deck();
  user.decks.triangle = generate_deck();
  user[user.target] = user.decks[user.target][deckSwiper.activeIndex];
  $("#deck").classList.remove("appear");
  $("#chosen").classList.remove("hide");
  // DON'T ASK MAN...
  animate("#card-back", "wobble").then(() => {
    animate("#card-back", "flipOutY").then(() => {
      $("#card-back").classList.add("hide");
      $("#card-front").classList.remove("hide");
      animate("#card-front", "flipInY").then(() => {
        animate("#card-front", "zoomOutUp").then(() => {
          $("#card-front").classList.add("hide");
          $(`.slot.${[user.target]}`).classList.remove("pulse");
          $(`.slot.${[user.target]}`).classList.add("done");
          $(`.slot.${[user.target]}`).classList.add("float");
          cardEffect(`.slot.${[user.target]}`);
          animate("#chosen", "fadeOut").then(() => {
            $("#chosen").classList.add("hide");
            $("#card-back").classList.remove("hide");
            $("#btnChoose").disabled = false;
            if (
              typeof user.triangle === "number" &&
              typeof user.square === "number" &&
              typeof user.circle === "number"
            ) {
              alea_iacta_est();
            }
          });
        });
      });
    });
  });
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
  //next();
  //setTimeout(answer, 6000);
}

function animate(element, animation, prefix = "animate__") {
  return new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    const node = $(element);
    node.classList.add(`${prefix}animated`, animationName);
    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      resolve("Animation ended");
    }
    node.addEventListener("animationend", handleAnimationEnd, { once: true });
  });
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
      $("#btnDraw").classList.add("pulse");
    }
  } else {
    user.query = null;
    if (!$("#btnDraw").classList.contains("disabled")) {
      $("#btnDraw").classList.add("disabled");
      $("#btnDraw").classList.remove("pulse");
    }
  }
};

$("#btnDraw").onclick = (e) => {
  e.preventDefault();
  if (!user.query) return;
  // Download files (sfx?)
  setTimeout(next, 3000); // Avoid after first time (localStorage)
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
  $("#deck").classList.remove("appear");
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

function rotateToMouse(e, el, bounds) {
  const mouseX = e.clientX;
  const mouseY = e.clientY;
  const leftX = mouseX - bounds.x;
  const topY = mouseY - bounds.y;
  const center = {
    x: leftX - bounds.width / 2,
    y: topY - bounds.height / 2,
  };

  // const distance = Math.sqrt(center.x ** 2 + center.y ** 2);

  //   el.style.transform = `
  //   scale3d(1.07, 1.07, 1.07)
  //   rotate3d(
  //     ${center.y / 100},
  //     ${-center.x / 100},
  //     0,
  //     ${Math.log(distance) * 2}deg
  //   )
  // `;

  el.querySelector(".glow").style.backgroundImage = `
    radial-gradient(
      circle at
      ${center.x * 2 + bounds.width / 2}px
      ${center.y * 2 + bounds.height / 2}px,
      #ffffff55,
      #0000000f
    )
  `;
}

function cardEffect(el) {
  const card = document.querySelector(el);
  const bounds = card.getBoundingClientRect();

  card.addEventListener("mouseenter", () => {
    document.addEventListener("mousemove", (e) => {
      rotateToMouse(e, card, bounds);
    });
  });

  card.addEventListener("mouseleave", () => {
    document.removeEventListener("mousemove", (e) => {
      rotateToMouse(e, card, bounds);
    });
    card.style.transform = "";
    card.style.background = "";
  });
}
