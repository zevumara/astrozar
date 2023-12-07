function $(selector) {
  return document.querySelector(selector);
}

function restore() {
  console.log("Restoring last throw...");
  $("#query").value = user.query;
  if (typeof user.circle === "number") {
    $(".slot.circle").classList.remove("pulse");
    $(".slot.circle").classList.add("done");
    $(".slot.circle").classList.add("float");
    cardEffect(".slot.circle");
  }
  if (typeof user.square === "number") {
    $(".slot.square").classList.remove("pulse");
    $(".slot.square").classList.add("done");
    $(".slot.square").classList.add("float");
    cardEffect(".slot.square");
  }
  if (typeof user.triangle === "number") {
    $(".slot.triangle").classList.remove("pulse");
    $(".slot.triangle").classList.add("done");
    $(".slot.triangle").classList.add("float");
    cardEffect(".slot.triangle");
  }
  swiper.allowSlideNext = true;
  swiper.slideTo(user.slide, 1000);
  swiper.allowSlideNext = false;
  if (
    typeof user.triangle === "number" &&
    typeof user.square === "number" &&
    typeof user.circle === "number"
  ) {
    sound.play("alea-iacta-est");
    alea_iacta_est();
  }
}

function save(slide) {
  user.slide = slide;
  localStorage.setItem("user", JSON.stringify(user));
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
  sound.play("open");
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
  sound.play("chosen", true);
  $("#btnChoose").disabled = true;
  user.decks.circle = generate_deck();
  user.decks.square = generate_deck();
  user.decks.triangle = generate_deck();
  user[user.target] = user.decks[user.target][deckSwiper.activeIndex];
  save(3);
  $("#deck").classList.remove("appear");
  $("#chosen").classList.remove("hide");
  // DON'T ASK MAN...
  animate("#card-back", "wobble").then(() => {
    animate("#card-back", "flipOutY").then(() => {
      sound.play("reveal");
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
              sound.play("alea-iacta-est");
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
  localStorage.clear();
  user.query = "¿Esto es una pregunta?";
  if (!user.query) return;
  $(".query").innerText = user.query;
  $(".answer").innerText =
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nam omnis autem, eligendi, minus asperiores repudiandae et consequatur ab accusantium vero quod similique velit modi magni dolorum obcaecati incidunt sunt ipsa!";
  swiper.allowSlideNext = true;
  swiper.slideNext(1400);
  swiper.allowSlideNext = false;
}

function alea_iacta_est() {
  console.log(`Alea iacta est: ${user.triangle} ${user.circle} ${user.square}`);
  $("#background").classList.add("universe");
  setTimeout(() => {
    swiper.allowSlideNext = true;
    swiper.slideNext(1400);
    swiper.allowSlideNext = false;
    setTimeout(() => {
      sound.play("the-answer");
    }, 6500);
    setTimeout(answer, 7000);
  }, 5200);
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

const sound = {
  context: null,
  files: null,
  playing: null,
  load: async function (files) {
    const loaded = {};
    for (const file of files) {
      console.log(`Loading "sfx/${file}.ogg" ...`);
      const audioElement = new Audio();
      await new Promise((resolve) => {
        audioElement.addEventListener("canplaythrough", function () {
          loaded[file] = audioElement;
          resolve();
        });
        audioElement.src = `sfx/${file}.ogg`;
      });
    }
    console.log("All sound files are loaded:", loaded);
    this.files = loaded;
  },
  stop: function () {
    if (this.playing) {
      this.playing.pause();
      this.playing.currentTime = 0;
    }
  },
  play: function (file, overlay = false) {
    if (!this.context) {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
    }
    const sfx = this.files[file];
    this.playing = sfx;
    if (sfx) {
      if (!sfx.sourceNode) {
        sfx.sourceNode = this.context.createMediaElementSource(sfx);
        sfx.sourceNode.connect(this.context.destination);
      }
      if (overlay) {
        const audioInstance = new Audio(sfx.src);
        audioInstance.addEventListener("ended", function () {
          this.remove();
        });
        audioInstance.play();
      } else {
        sfx.play();
      }
    } else {
      console.error(`El sonido "${file}" no se ha pre-cargado.`);
    }
  },
};

const defaultUser = {
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
  slide: 0,
};

const user = JSON.parse(localStorage.getItem("user")) || defaultUser;

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

deckSwiper.on("slideChange", function () {
  sound.play("shuffling");
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
  save(3);
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

$(".slot.triangle").onmouseenter = (e) => {
  if (!e.target.classList.contains("done")) {
    sound.play("slot-hover");
  }
};

$(".slot.circle").onmouseenter = (e) => {
  if (!e.target.classList.contains("done")) {
    sound.play("slot-hover");
  }
};

$(".slot.square").onmouseenter = (e) => {
  if (!e.target.classList.contains("done")) {
    sound.play("slot-hover");
  }
};

$("#btnBack").onclick = () => {
  sound.play("close");
  $("#deck").classList.remove("appear");
  deckSwiper.disable();
};

$("#btnChoose").onmousedown = () => {
  sound.play("holding");
  user.timer = setTimeout(() => {
    chosen();
  }, 1200);
};

$("#btnChoose").onmouseup = () => {
  sound.stop();
  clearTimeout(user.timer);
};

$("#btnChoose").ontouchstart = () => {
  user.timer = setTimeout(() => {
    chosen();
  }, 1200);
};

$("#btnChoose").ontouchend = () => {
  clearTimeout(user.timer);
};

window.addEventListener("load", function () {
  sound
    .load([
      "the-answer",
      "alea-iacta-est",
      "reveal",
      "open",
      "close",
      "chosen",
      "holding",
      "shuffling",
      "slot-hover",
    ])
    .then(() => {
      console.log("User:", user);
      // Hide loading
      // Load last throw
      if (user.slide) {
        restore();
      }
    });
});
