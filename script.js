const output = document.getElementById('odiaOutput');
const toggleGuideButton = document.getElementById('toggleGuide');
const guideContent = document.getElementById('guideContent');

const vowels = ['ଅ', 'ଆ', 'ଇ', 'ଈ', 'ଉ', 'ଊ', 'ଋ', 'ୠ', 'ଌ', 'ୡ', 'ଏ', 'ଐ', 'ଓ', 'ଔ', 'ଂ', 'ଃ'];
const consonants = [
  'କ', 'ଖ', 'ଗ', 'ଘ', 'ଙ',
  'ଚ', 'ଛ', 'ଜ', 'ଝ', 'ଞ',
  'ଟ', 'ଠ', 'ଡ', 'ଢ', 'ଣ',
  'ତ', 'ଥ', 'ଦ', 'ଧ', 'ନ',
  'ପ', 'ଫ', 'ବ', 'ଭ', 'ମ',
  'ଯ', 'ର', 'ଲ', 'ଳ', 'ଵ',
  'ଶ', 'ଷ', 'ସ', 'ହ'
];
const matras = ['ା', 'ି', 'ୀ', 'ୁ', 'ୂ', 'ୃ', 'େ', 'ୈ', 'ୋ', 'ୌ', '୍'];
const digits = ['୦', '୧', '୨', '୩', '୪', '୫', '୬', '୭', '୮', '୯'];
const punctuation = ['।', '॥', ',', '.', '?', '!', ':'];

/**
 * Insert text at the current cursor/selection inside the textarea.
 * This uses standard Unicode insertion so Halant-based conjuncts form naturally,
 * for example: ଙ + ୍ + କ => ଙ୍କ and ତ + ୍ + ର => ତ୍ର.
 */
function insertAtCursor(textToInsert) {
  const start = output.selectionStart;
  const end = output.selectionEnd;
  const currentValue = output.value;

  output.value = currentValue.slice(0, start) + textToInsert + currentValue.slice(end);

  const newPosition = start + textToInsert.length;
  output.focus();
  output.setSelectionRange(newPosition, newPosition);
}

/**
 * Create keyboard buttons from an array and append them to a target container.
 * Every key click inserts the matching character at the cursor location.
 */
function createKeyButtons(characters, containerId) {
  const container = document.getElementById(containerId);

  characters.forEach((char) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'key-button';
    button.textContent = char;

    button.addEventListener('click', () => insertAtCursor(char));

    container.appendChild(button);
  });
}

/**
 * Remove the grapheme cluster right before cursor position.
 * This keeps complex Odia sequences (base + matra/halant marks) deletion-friendly.
 */
function removePreviousGrapheme(text, cursorIndex) {
  const before = text.slice(0, cursorIndex);
  const after = text.slice(cursorIndex);

  if (!before) {
    return { text, newCursor: cursorIndex };
  }

  // Prefer Intl.Segmenter for accurate grapheme boundaries.
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    const graphemes = [...segmenter.segment(before)];
    const previous = graphemes[graphemes.length - 1];
    const newBefore = before.slice(0, previous.index);

    return { text: newBefore + after, newCursor: previous.index };
  }

  // Fallback: remove one Unicode code point.
  const codePoints = Array.from(before);
  codePoints.pop();
  const newBefore = codePoints.join('');
  return { text: newBefore + after, newCursor: newBefore.length };
}

function createUtilityButtons() {
  const utilities = document.getElementById('utilities');

  const backspaceButton = document.createElement('button');
  backspaceButton.type = 'button';
  backspaceButton.className = 'key-button utility-btn backspace';
  backspaceButton.textContent = 'Backspace';

  backspaceButton.addEventListener('click', () => {
    const start = output.selectionStart;
    const end = output.selectionEnd;

    if (start !== end) {
      output.value = output.value.slice(0, start) + output.value.slice(end);
      output.setSelectionRange(start, start);
    } else if (start > 0) {
      const result = removePreviousGrapheme(output.value, start);
      output.value = result.text;
      output.setSelectionRange(result.newCursor, result.newCursor);
    }

    output.focus();
  });

  const clearButton = document.createElement('button');
  clearButton.type = 'button';
  clearButton.className = 'key-button utility-btn clear';
  clearButton.textContent = 'Clear';
  clearButton.addEventListener('click', () => {
    output.value = '';
    output.focus();
  });

  const spaceButton = document.createElement('button');
  spaceButton.type = 'button';
  spaceButton.className = 'key-button utility-btn space';
  spaceButton.textContent = 'Space';
  spaceButton.addEventListener('click', () => insertAtCursor(' '));

  utilities.append(backspaceButton, clearButton, spaceButton);
}

/**
 * Toggle help panel visibility.
 * Hidden by default and expanded only when user clicks the "How to Use" button.
 */
function setupGuideToggle() {
  toggleGuideButton.addEventListener('click', () => {
    const isHidden = guideContent.hasAttribute('hidden');

    if (isHidden) {
      guideContent.removeAttribute('hidden');
      toggleGuideButton.setAttribute('aria-expanded', 'true');
    } else {
      guideContent.setAttribute('hidden', '');
      toggleGuideButton.setAttribute('aria-expanded', 'false');
    }
  });
}

createKeyButtons(vowels, 'vowels');
createKeyButtons(consonants, 'consonants');
createKeyButtons(matras, 'matras');
createKeyButtons(digits, 'digits');
createKeyButtons(punctuation, 'punctuation');
createUtilityButtons();
setupGuideToggle();
