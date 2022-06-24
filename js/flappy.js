function newElement(tagName, className) {
  const element = document.createElement(tagName);
  element.className = className;
  return element;
}

function Barrier(reverse = false) {
  this.element = newElement("div", "barrier");

  const border = newElement("div", "border");
  const body = newElement("div", "body");

  this.element.appendChild(reverse ? body : border);
  this.element.appendChild(reverse ? border : body);

  this.setHeight = (height) => (body.style.height = `${height}px`);
}

function BarrierPair(height, gap, x) {
  this.element = newElement("div", "barrier-pair");

  this.higher = new Barrier(true);
  this.lower = new Barrier(false);

  this.element.appendChild(this.higher.element);
  this.element.appendChild(this.lower.element);

  this.sortGap = () => {
    const topHeight = Math.random() * (height - gap);
    const lowerHeight = height - gap - topHeight;
    this.higher.setHeight(topHeight);
    this.lower.setHeight(lowerHeight);
  };

  this.getX = () => parseInt(this.element.style.left.split("px")[0]);
  this.setX = (x) => (this.element.style.left = `${x}px`);
  this.getWidth = () => this.element.clientWidth;

  this.sortGap();
  this.setX(x);
}

function Barriers(height, width, opening, space, notifyScores) {
  this.pairs = [
    new BarrierPair(height, opening, width),
    new BarrierPair(height, opening, width + space),
    new BarrierPair(height, opening, width + space * 2),
    new BarrierPair(height, opening, width + space * 3),
  ];

  const displacement = 3;

  this.animate = () => {
    this.pairs.forEach((pair) => {
      pair.setX(pair.getX() - displacement);

      //when the element leave the game area
      if (pair.getX() < -pair.getWidth()) {
        pair.setX(pair.getX() + space * this.pairs.length);
        pair.sortGap();
      }

      const middle = width / 2;
      const crossedMiddle =
        pair.getX() + displacement >= middle && pair.getX() < middle;
      console.log("crossedmiggle" + crossedMiddle);
      if (crossedMiddle) notifyScores();
    });
  };
}

function Bird(gameHeight) {
  let flying = false;

  this.element = newElement("img", "bird");
  this.element.src = "./imgs/passaro.png";

  this.getY = () => parseInt(this.element.style.bottom.split("px")[0]);
  this.setY = (y) => (this.element.style.bottom = `${y}px`);

  window.onkeydown = (e) => (flying = true);
  window.onkeyup = (e) => (flying = false);

  this.animate = () => {
    const newY = this.getY() + (flying ? 8 : -5);
    const maxHeight = gameHeight - this.element.clientHeight;
    console.log(flying);
    console.log(this.getY());
    if (newY <= 0) {
      this.setY(0);
    } else if (newY >= maxHeight) {
      this.setY(maxHeight);
    } else {
      this.setY(newY);
    }
  };

  this.setY(gameHeight / 2);
}

function Progress() {
  this.element = newElement("span", "progress");
  this.updateScores = (score) => {
    this.element.innerHTML = score;
  };
  this.updateScores(0);
}

function isOverlapping(elementA, elementB) {
  const a = elementA.getBoundingClientRect();
  const b = elementB.getBoundingClientRect();

  const horizon = a.left + a.width >= b.left && b.left + b.width >= a.left;
  const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top;

  return horizon && vertical;
}

function colided(bird, barriers) {
  let colided = false;
  barriers.pairs.forEach((barrierPair) => {
    if (!colided) {
      const higher = barrierPair.higher.element;
      const lower = barrierPair.lower.element;
      colided =
        isOverlapping(bird.element, higher) ||
        isOverlapping(bird.element, lower);
    }
  });
  return colided;
}

function FlappyBird() {
  let score = 0;

  const gameArea = document.querySelector("[wm-flappy]");
  const height = gameArea.clientHeight;
  const width = gameArea.clientWidth;
  console.log(height, width);
  const progress = new Progress();
  const barriers = new Barriers(height, width, 200, 400, () =>
    progress.updateScores(++score)
  );
  const bird = new Bird(height);

  gameArea.appendChild(progress.element);
  gameArea.appendChild(bird.element);
  barriers.pairs.forEach((pair) => gameArea.appendChild(pair.element));

  this.start = () => {
    //game loop
    const timer = setInterval(() => {
      barriers.animate();
      bird.animate();

      if (colided(bird, barriers)) clearInterval(timer);
    }, 20);
  };
}
new FlappyBird().start();
