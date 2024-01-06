const url = new URL(window.location.href);

const defaultUser = {
  decks: {
    triangle: null,
    square: null,
    circle: null,
  },
  query: null,
  target: null,
  timer: null,
  hodling: false,
  triangle: null,
  square: null,
  circle: null,
  slide: 0,
  id: null,
  debug: 1,
};

const names = [
  "Mirror",
  "Rainbow",
  "Eye",
  "Staff",
  "Void",
  "Dodecahedron",
  "Dagger",
  "Plant",
  "Heart",
  "Gem",
];

let user = JSON.parse(localStorage.getItem("user")) || { ...defaultUser };

const swiper = new Swiper("main", {
  speed: 600,
  allowSlideNext: false,
  allowSlidePrev: false,
  autoHeight: true,
  direction: "vertical",
  animating: false,
  initialSlide: 0,
});

const deckSwiper = new Swiper("#swiper-deck", {
  effect: "cards",
  grabCursor: false,
  mousewheel: true,
  enabled: false,
  keyboard: true,
  initialSlide: 5,
});

function $(selector) {
  return document.querySelector(selector);
}

function getRandomNumber() {
  const number = self.crypto.getRandomValues(new Uint32Array(1)).toString();
  const index = Math.floor(Math.random() * number.length);
  return parseInt(number.charAt(index), 10);
}

async function share(id) {
  await image.load(["background-stars.webp"]);
  $("#btnAstrozar a").href = window.appConfig.apiUrl;
  allFilesLoaded = true;
  const response = await fetch(`${window.appConfig.apiUrl}cosmos/share/${id}`);
  if (response.ok) {
    const spread = await response.json();
    $("#share .query").innerText = spread.query;
    $("#share .answer span").innerText = spread.answer;
    $("#share .number h2").innerText = spread.number;
    swiper.allowSlideNext = true;
    swiper.slideTo(6, 0);
    swiper.allowSlideNext = false;
    animate("#loader .icon", "backOutDown");
    animate(".curtain.left", "fadeOutLeft");
    await animate(".curtain.right", "fadeOutRight");
    $("#loader").classList.add("hide");
  }
}

function restore() {
  $("#query").value = user.query;
  if (typeof user.circle === "number") {
    setupCard("circle");
  }
  if (typeof user.square === "number") {
    setupCard("square");
  }
  if (typeof user.triangle === "number") {
    setupCard("triangle");
  }
  swiper.allowSlideNext = true;
  swiper.slideTo(user.slide, 1000);
  swiper.allowSlideNext = false;
  tooltip.show("slots", "zoomInDown");
  $("#background").classList.add("universe");
  if (user.answer) {
    sound.play("the-answer.ogg");
    showAnswer();
  } else if (
    typeof user.triangle === "number" &&
    typeof user.square === "number" &&
    typeof user.circle === "number"
  ) {
    aleaIactaEst();
  }
}

function save(slide) {
  user.slide = slide;
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("lastSlide", slide);
}

function drawYourCards() {
  if (!user.query) return;
  setupSlot("triangle");
  setupSlot("circle");
  setupSlot("square");
  const delay = localStorage.getItem("shuffling-cards") ? 1500 : 3000;
  setTimeout(() => {
    nextSlide();
    tooltip.show("slots", "zoomInDown");
    localStorage.setItem("shuffling-cards", 1);
  }, delay);
  nextSlide();
  user.decks.circle = generateDeck();
  user.decks.square = generateDeck();
  user.decks.triangle = generateDeck();
  save(3);
}

function generateDeck() {
  const deck = [];
  for (let i = 0; i < 10; i++) {
    let cardIndex;
    do {
      // cardIndex = Math.floor(Math.random() * 10);
      cardIndex = getRandomNumber();
    } while (deck.includes(cardIndex));
    deck.push(cardIndex);
  }
  return deck;
}

function showDeck(deck) {
  if (user[deck] !== null) return;
  sound.play("open.ogg");
  user.target = deck;
  $("#deck").classList.remove("triangle");
  $("#deck").classList.remove("square");
  $("#deck").classList.remove("circle");
  $("#deck").classList.add(deck);
  $("#deck").classList.add("appear");
  tooltip.hide("slots");
  tooltip.show("drag");
  deckSwiper.slideTo(5, 0);
  deckSwiper.update(); // Bug fix?
  deckSwiper.update();
  deckSwiper.enable();
}

async function chooseCard() {
  if (!user.target) return;
  user.holding = false;
  $("#hold").classList.add("hide");
  tooltip.hide("hold");
  sound.play("chosen.ogg", true);
  user.decks.circle = generateDeck();
  user.decks.square = generateDeck();
  user.decks.triangle = generateDeck();
  user[user.target] = user.decks[user.target][deckSwiper.activeIndex];
  save(3);
  $("#deck").classList.remove("appear");
  $("#card-back").classList.remove("triangle");
  $("#card-back").classList.remove("circle");
  $("#card-back").classList.remove("square");
  $("#card-back").classList.add(user.target);
  // Setup card
  $("#card-front").classList.remove("triangle");
  $("#card-front").classList.remove("circle");
  $("#card-front").classList.remove("square");
  $("#card-front").classList.add(user.target);
  $("#card-front .number").innerText = user[user.target];
  if (user.target === "circle") {
    $("#card-front .text").innerText = names[user[user.target]];
  }
  $("#chosen").classList.remove("animate__animated", "animate__fadeOut", "hide");
  // Animation when choosing the card
  await animate("#card-back", "wobble");
  await animate("#card-back", "flipOutY");
  sound.play("reveal.ogg");
  $("#card-back").classList.add("hide");
  $("#card-front").classList.remove("hide");
  await animate("#card-front", "flipInY");
  await animate("#card-front", "zoomOutUp");
  $("#card-front").classList.add("hide");
  // Setup card
  setupCard(user.target);
  // Tooltip
  tooltip.show("complete", "zoomInUp");
  localStorage.setItem("tooltip-complete", 1);
  $("#chosen").classList.add("hide");
  // The three cards were choosen
  if (
    typeof user.triangle === "number" &&
    typeof user.square === "number" &&
    typeof user.circle === "number"
  ) {
    aleaIactaEst();
  }
}

function setupCard(type) {
  // Fill slot
  $(`#slot-${type}`).classList.remove("slot");
  $(`#slot-${type}`).classList.add("card", "front");
  $("#card-back").classList.remove("hide");
  $(`#slot-${type} .number`).innerText = user[type];
  if (type === "circle") {
    $(`#slot-${type} .text`).innerText = names[user[type]];
  }
  $(`#slot-${type}`).classList.add("done");
  // Card effect
  $(`#slot-${type}`).addEventListener("mousemove", handleMove);
  $(`#slot-${type}`).addEventListener("touchmove", handleMove);
  $(`#slot-${type}`).addEventListener("mouseout", handleEnd);
  $(`#slot-${type}`).addEventListener("touchend", handleEnd);
  $(`#slot-${type}`).addEventListener("touchcancel", handleEnd);
}

function setupSlot(type) {
  // Fill slot
  $(`#slot-${type}`).classList.remove("done");
  $(`#slot-${type}`).classList.remove("card");
  $(`#slot-${type}`).classList.remove("front");
  $(`#slot-${type}`).classList.add("slot");
  $(`#slot-${type} .number`).innerText = "";
  if (type === "circle") {
    $(`#slot-${type} .text`).innerText = "";
  }
  // Card effect
  $(`#slot-${type}`).removeEventListener("mousemove", handleMove);
  $(`#slot-${type}`).removeEventListener("touchmove", handleMove);
  $(`#slot-${type}`).removeEventListener("mouseout", handleEnd);
  $(`#slot-${type}`).removeEventListener("touchend", handleEnd);
  $(`#slot-${type}`).removeEventListener("touchcancel", handleEnd);
}

function nextSlide() {
  swiper.allowSlideNext = true;
  swiper.slideNext(600);
  swiper.allowSlideNext = false;
}

function showAnswer() {
  if (!user.query || !user.answer) return;
  $("#answer .query").innerText = user.query;
  $("#answer .answer span").innerText = user.answer;
  $("#answer .number h2").innerText = `${user.triangle} ${user.circle} ${user.square}`;
  $("#btnShare").href = `${window.appConfig.apiUrl}?share=${user.id}`;
  localStorage.removeItem("user");
  user = { ...defaultUser };
  swiper.allowSlideNext = true;
  swiper.slideNext(1400);
  swiper.allowSlideNext = false;
}

function aleaIactaEst() {
  setTimeout(() => {
    sound.play("button.ogg", true);
    $("#flash").classList.remove("hide");
    setTimeout(() => {
      tooltip.hide("complete");
      $("#slot-triangle").classList.add("complete");
      $("#slot-circle").classList.add("complete");
      $("#slot-square").classList.add("complete");
      $("#flash").classList.add("hide");
    }, 250);
  }, 600);
  setTimeout(() => {
    sound.play("alea-iacta-est.ogg");
    setTimeout(() => {
      save(5);
      swiper.allowSlideNext = true;
      swiper.slideNext(1400);
      swiper.allowSlideNext = false;
    }, 4500);
  }, 3500);
  const start = performance.now();
  let end;
  let delay = 13500;
  fetch(`${window.appConfig.apiUrl}cosmos/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: user.query,
      c: user.circle,
      t: user.triangle,
      s: user.square,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return response.json();
    })
    .then((spread) => {
      user.id = spread.id;
      user.answer = spread.answer;
      end = performance.now();
      delay = Math.max(delay - (end - start), 0);
      if (user.debug) console.log("Delay:", delay);
      setTimeout(() => {
        sound.play("the-answer.ogg");
      }, delay);
      setTimeout(showAnswer, delay + 700);
    })
    .catch((error) => {
      throw new Error(`Error: ${error}`);
    });
}

function animate(element, animation, prefix = "animate__") {
  return new Promise((resolve) => {
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

function initHold() {
  if (!user.hodling) {
    sound.play("holding.ogg");
    $("#hold").classList.remove("hide");
    setTimeout(() => {
      $("#hold .progress").classList.add("animate");
    }, 100);
    user.timer = setTimeout(chooseCard, 1200);
    user.holding = true;
  }
}

const sound = {
  context: null,
  files: null,
  playing: null,
  load: async function (files) {
    const loaded = {};
    const loadFiles = files.map(async (file) => {
      if (user.debug) console.log(`Loading "sfx/${file}" ...`);
      const audioElement = new Audio();
      await new Promise((resolve) => {
        audioElement.addEventListener("canplaythrough", function () {
          loaded[file] = audioElement;
          resolve();
        });
        audioElement.src = `sfx/${file}`;
      });
    });
    await Promise.all(loadFiles);
    if (user.debug) console.log("All sound files are loaded:", loaded);
    this.files = loaded;
  },
  stop: function () {
    if (this.playing) {
      this.playing.pause();
      this.playing.currentTime = 0;
    }
  },
  play: function (file, overlay = true, volume = 1, loop = false) {
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
        audioInstance.volume = volume;
        audioInstance.loop = loop;
        audioInstance.play();
      } else {
        sfx.volume = volume;
        sfx.loop = loop;
        sfx.play();
      }
    } else {
      console.error(`The sound "${file}" has not been preloaded.`);
    }
  },
};

const image = {
  files: null,
  load: async function (files) {
    const loaded = {};
    const loadFiles = files.map(async (file) => {
      if (user.debug) console.log(`Loading "img/${file}" ...`);
      const imageElement = new Image();
      await new Promise((resolve) => {
        imageElement.addEventListener("load", function () {
          loaded[file] = imageElement;
          resolve();
        });
        imageElement.src = `img/${file}`;
      });
    });
    await Promise.all(loadFiles);
    if (user.debug) console.log("All image files are loaded:", loaded);
    this.files = loaded;
  },
  use: function (file) {
    return this.files[file];
  },
};

const language = {
  load: async function (lang) {
    const response = await fetch(`lang/${lang}.json`);
    const lang_file = await response.json();
    const texts = lang_file.text;
    for (const text in texts) {
      const el = $(`.${text}`);
      if (el) {
        el.innerText = texts[text];
      }
    }
    const htmls = lang_file.html;
    for (const html in htmls) {
      const el = $(`.${html}`);
      if (el) {
        el.innerHTML = htmls[html];
      }
    }
    const placeholders = lang_file.placeholder;
    for (const placeholder in placeholders) {
      const el = $(`.${placeholder}`);
      if (el) {
        el.setAttribute("placeholder", placeholders[placeholder]);
      }
    }
  },
};

const tooltip = {
  show: function (name, animation = "zoomInDown", delay = 1000) {
    if (localStorage.getItem(`tooltip-${name}`)) return;
    setTimeout(async () => {
      $(`#tooltip-${name}`).classList.remove("hide");
      await animate(`#tooltip-${name}`, animation);
      $(`#tooltip-${name}`).classList.add("animated");
    }, delay);
  },
  hide: function (name, animation = "zoomOut", delay = 0) {
    setTimeout(async () => {
      $(`#tooltip-${name}`).classList.remove("animated");
      await animate(`#tooltip-${name}`, animation);
      $(`#tooltip-${name}`).classList.add("hide");
      localStorage.setItem(`tooltip-${name}`, 1);
    }, delay);
  },
};

/*** Events ***/

$("#btnAsk").onclick = (e) => {
  e.preventDefault();
  if (!e.target.classList.contains("disabled")) {
    if (!playingMusic) {
      playingMusic = true;
      sound.play("ambience.mp3", true, 0.1, true);
    }
    sound.play("button.ogg", true);
    setTimeout(() => {
      e.target.classList.remove("pulse");
      e.target.classList.add("disabled");
      $("#flash").classList.remove("hide");
      setTimeout(() => {
        $("#flash").classList.add("hide");
      }, 250);
      setTimeout(() => {
        $("#query").focus();
        nextSlide();
      }, 400);
    }, 200);
  }
};

$("textarea").onkeydown = (e) => {
  if (e.keyCode === 13) {
    e.preventDefault();
    const characters = e.target.value.length;
    if (characters > 15 && characters < 76) {
      sound.play("button.ogg", true);
      setTimeout(() => {
        $("#btnDraw").classList.remove("pulse");
        $("#btnDraw").classList.add("disabled");
        $("#flash").classList.remove("hide");
        setTimeout(() => {
          $("#flash").classList.add("hide");
        }, 250);
        setTimeout(() => {
          drawYourCards();
        }, 400);
      }, 200);
    }
  }
};

$("textarea").oninput = (e) => {
  const characters = e.target.value.length;
  sound.play("key.ogg", true);
  if (characters > 15 && characters < 76) {
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
  if (!e.target.classList.contains("disabled")) {
    sound.play("button.ogg", true);
    setTimeout(() => {
      e.target.classList.remove("pulse");
      e.target.classList.add("disabled");
      $("#flash").classList.remove("hide");
      setTimeout(() => {
        $("#flash").classList.add("hide");
      }, 250);
      setTimeout(() => {
        drawYourCards();
      }, 400);
    }, 200);
  }
};

$("#btnBack").onclick = () => {
  sound.play("close.ogg");
  $("#deck").classList.remove("appear");
  deckSwiper.disable();
};

$("#swiper-deck").onpointerdown = () => {
  $("#swiper-deck").style.cursor = "grabbing";
  $("#hold .progress").classList.remove("animate");
  user.timer = setTimeout(initHold, 600);
};

document.body.onpointerup = () => {
  $("#swiper-deck").style.cursor = "grab";
  clearTimeout(user.timer);
  if (user.holding) {
    sound.stop();
    $("#hold").classList.add("hide");
    user.holding = false;
  }
};

$("#btnShare").onclick = (e) => {
  e.preventDefault();
  navigator.clipboard.writeText(e.target.href);
};

$("#btnAskMeAgain").onclick = (e) => {
  e.preventDefault();
  $("#query").value = "";
  $("#query").focus();
  $("#btnDraw").classList.add("disabled");
  $("#btnDraw").classList.remove("pulse");
  swiper.allowSlidePrev = true;
  swiper.slideTo(1, 1000);
  swiper.allowSlidePrev = false;
};

$("#slot-triangle").onclick = (event) => {
  if (!event.target.classList.contains("done")) {
    showDeck("triangle");
  }
};

$("#slot-circle").onclick = (event) => {
  if (!event.target.classList.contains("done")) {
    showDeck("circle");
  }
};

$("#slot-square").onclick = (event) => {
  if (!event.target.classList.contains("done")) {
    showDeck("square");
  }
};

$(".slot.triangle").onmouseenter = (e) => {
  if (!e.target.classList.contains("done")) {
    sound.play("slot-hover.ogg");
  }
};

$(".slot.circle").onmouseenter = (e) => {
  if (!e.target.classList.contains("done")) {
    sound.play("slot-hover.ogg");
  }
};
$(".slot.square").onmouseenter = (e) => {
  if (!e.target.classList.contains("done")) {
    sound.play("slot-hover.ogg");
  }
};

deckSwiper.on("slideChange", () => {
  sound.play("shuffling.ogg");
  tooltip.hide("drag");
  tooltip.show("hold", "zoomInUp", 2000);
});

// Sound effecs on hover
const sfxHoverButtons = document.querySelectorAll(".sfx-hover");
sfxHoverButtons.forEach((button) => {
  button.onmouseenter = () => {
    if (!button.classList.contains("disabled")) {
      sound.play("input.ogg");
    }
  };
});

// Card hover effect (credits to Simon Goellner)
const cards = document.querySelectorAll("#slots .card.front");
const style = document.querySelector(".hover-card-effect");

function handleMove(e) {
  let pos = [e.offsetX, e.offsetY];
  e.preventDefault();
  if (e.type === "touchmove") {
    pos = [e.touches[0].clientX, e.touches[0].clientY];
  }
  const card = this;
  const l = pos[0];
  const t = pos[1];
  const h = card.offsetHeight;
  const w = card.offsetWidth;
  const px = Math.abs(Math.floor((100 / w) * l) - 100);
  const py = Math.abs(Math.floor((100 / h) * t) - 100);
  const pa = 50 - px + (50 - py);
  const lp = 50 + (px - 50) / 1.5;
  const tp = 50 + (py - 50) / 1.5;
  const px_spark = 50 + (px - 50) / 7;
  const py_spark = 50 + (py - 50) / 7;
  const p_opc = 20 + Math.abs(pa) * 1.5;
  const ty = ((tp - 50) / 2) * -1;
  const tx = ((lp - 50) / 1.5) * 0.5;
  const grad_pos = `background-position: ${lp}% ${tp}%;`;
  const sprk_pos = `background-position: ${px_spark}% ${py_spark}%;`;
  const opc = `opacity: ${p_opc / 100};`;
  const tf = `transform: rotateX(${ty}deg) rotateY(${tx}deg)`;
  const styleText = `.card.front:hover:before { ${grad_pos} }
          .card.front:hover:after { ${sprk_pos} ${opc} }`;
  cards.forEach(function (c) {
    c.classList.remove("active");
    c.classList.remove("animated");
    c.removeAttribute("style");
  });
  card.classList.remove("animated");
  card.setAttribute("style", tf);
  style.innerHTML = styleText;
  if (e.type === "touchmove") {
    return false;
  }
  clearTimeout(user.timer);
}

function handleEnd() {
  const card = this;
  style.innerHTML = "";
  card.removeAttribute("style");
  user.timer = setTimeout(function () {
    card.classList.add("animated");
  }, 2500);
}

/*** Pre-load files ***/
let allFilesLoaded = false;
let playingMusic = false;

window.addEventListener("load", async () => {
  const lang = navigator.language.slice(0, 2) === "es" ? "es" : "en";
  await language.load(lang);
  const sharing_id = url.searchParams.get("share");
  if (sharing_id) {
    share(sharing_id);
    return;
  }
  await sound.load([
    "the-answer.ogg",
    "alea-iacta-est.ogg",
    "reveal.ogg",
    "open.ogg",
    "close.ogg",
    "chosen.ogg",
    "holding.ogg",
    "shuffling.ogg",
    "slot-hover.ogg",
    "button.ogg",
    "input.ogg",
    "key.ogg",
    "ambience.mp3",
  ]);
  await image.load([
    "background-stars.webp",
    "astrozar.webp",
    "bg-card.webp",
    "icon-grabbing.webp",
    "icon-move.webp",
    "icon-pointer.webp",
    "holo.webp",
    "sparkles.webp",
  ]);
  allFilesLoaded = true;
  animate("#loader .icon", "backOutDown");
  animate(".curtain.left", "fadeOutLeft");
  await animate(".curtain.right", "fadeOutRight");
  $("#loader").classList.add("hide");
  if (user.slide) {
    restore();
  }
  console.log(window.appConfig.apiUrl);
});
