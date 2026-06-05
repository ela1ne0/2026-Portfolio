document.addEventListener('DOMContentLoaded', () => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const action = document.getElementById('hero-action');
  if (action) {
    const phrases = [
      'tweaking her portfolio for the Nth time',
      'redesigning a landing page',
      'exploring the capabilities of LLMs',
      'listening to music',
      'scrolling on Pinterest for inspo',
      'studying :/'
    ];
    let i = 0;
    setInterval(() => {
      i = (i + 1) % phrases.length;
      action.style.opacity = '0';
      setTimeout(() => {
        action.textContent = phrases[i];
        action.style.opacity = '1';
      }, 180);
    }, 3000);
  }
});
