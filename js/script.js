// script.js

document.addEventListener('DOMContentLoaded', () => {
  const sprite = document.querySelector('.sprite');
  if (!sprite) return;

  let dir = 1;         // Direction of movement
  let max = 8;         // Maximum pixels to move up
  let speed = 2;       // Pixels per tick
  let interval = 30;   // Interval in ms (smaller = faster)

  setInterval(() => {
    let top = parseInt(sprite.style.top) || 0;
    if (top >= max) dir = -1;
    if (top <= 0) dir = 1;
    sprite.style.top = (top + dir * speed) + 'px';
  }, interval);
});
