function fix_icon_size(element) {
  const img = new Image();

  const apply = () => {
    const h = element.getBoundingClientRect().height;
    element.style.width = `${h}px`;
    element.style.height = `${h}px`;
  };

  img.onload = apply;
  img.src = element.getAttribute('data-src');

  if (img.complete) {
    apply();
  }
}

function process_card_generated_front(container = document) {
  container.querySelectorAll('[data-onload="fix-icon-size"]').forEach(fix_icon_size);
  container.querySelectorAll('.auto-fit-font-size').forEach(auto_fit_font_size);

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      container.querySelectorAll('.auto-fit-font-size').forEach(auto_fit_font_size);
    });
  }
}

function auto_fit_font_size(container) {
  const minimumFontSize = 7;
  const textElements = container.querySelectorAll(
    '.card-description-line, .card-property-line, .card-section, .card-stats, '
    + '.card-subtitle, .card-picture, .card-bullet-line, .card-p2e-trait, '
    + '.card-p2e-attribute-line'
  );
  const referenceElement = textElements[0] || container;
  const computedFontSize = parseFloat(getComputedStyle(referenceElement).fontSize);
  let fontSize = Number.isFinite(computedFontSize) ? Math.floor(computedFontSize) : 12;

  while (container.scrollHeight > container.clientHeight && fontSize > minimumFontSize) {
    fontSize--;
    container.style.fontSize = `${fontSize}px`;
    container.style.lineHeight = 'normal';
    textElements.forEach(element => {
      element.style.fontSize = `${fontSize}px`;
      element.style.lineHeight = 'normal';
    });
  }
}