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
const phalas = [
  { label: 'ର୍ ଫଳା', consonant: 'ର' },
  { label: 'ଯ୍ ଫଳା', consonant: 'ଯ' },
  { label: 'ମ୍ ଫଳା', consonant: 'ମ' },
  { label: 'ବ୍ ଫଳା', consonant: 'ବ' },
  { label: 'ଲ୍ ଫଳା', consonant: 'ଲ' },
  { label: 'ନ୍ ଫଳା', consonant: 'ନ' }
];

const halant = '୍';
const anusvara = 'ଂ';
const consonantSet = new Set(consonants);

// Strict nasal assimilation map: apply only for these exact anusvara + consonant combinations.
const nasalAssimilationMap = {
  କ: 'ଙ୍କ', ଖ: 'ଙ୍ଖ', ଗ: 'ଙ୍ଗ', ଘ: 'ଙ୍ଘ',
  ଚ: 'ଞ୍ଚ', ଛ: 'ଞ୍ଛ', ଜ: 'ଞ୍ଜ', ଝ: 'ଞ୍ଝ',
  ଟ: 'ଣ୍ଟ', ଠ: 'ଣ୍ଠ', ଡ: 'ଣ୍ଡ', ଢ: 'ଣ୍ଢ',
  ତ: 'ନ୍ତ', ଥ: 'ନ୍ଥ', ଦ: 'ନ୍ଦ', ଧ: 'ନ୍ଧ',
  ପ: 'ମ୍ପ', ଫ: 'ମ୍ଫ', ବ: 'ମ୍ବ', ଭ: 'ମ୍ଭ'
};

/**
 * Insert text at the current cursor/selection inside the textarea.
 * Halant stays fully manual and functional, so conjuncts can always be typed directly.
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
 * Handle consonant click with strict nasal-assimilation rule.
 * If anusvara (ଂ) is immediately before cursor and consonant is mapped,
 * replace that anusvara with the mapped conjunct (e.g., ଂ + କ => ଙ୍କ).
 */
function insertConsonantWithRules(consonant) {
  const start = output.selectionStart;
  const end = output.selectionEnd;

  if (start !== end) {
    insertAtCursor(consonant);
    return;
  }

  const before = output.value.slice(0, start);
  const after = output.value.slice(start);
  const previousChar = before.slice(-1);

  if (previousChar === anusvara && nasalAssimilationMap[consonant]) {
    const replacement = nasalAssimilationMap[consonant];
    const newBefore = before.slice(0, -1) + replacement;
    output.value = newBefore + after;
    output.focus();
    output.setSelectionRange(newBefore.length, newBefore.length);
    return;
  }

  insertAtCursor(consonant);
}

/**
 * Phala logic (quick combine):
 * - Looks at text just before cursor.
 * - If previous is consonant, inserts halant + phala consonant.
 * - If previous already ends with halant after consonant, inserts only phala consonant.
 * - If no valid base consonant is found, does nothing.
 */
function applyPhala(phalaConsonant) {
  const start = output.selectionStart;
  const end = output.selectionEnd;

  if (start !== end || start === 0) {
    return;
  }

  const before = output.value.slice(0, start);
  const after = output.value.slice(start);

  const previousChar = before.slice(-1);
  const beforePreviousChar = before.slice(-2, -1);

  let insertText = '';

  if (consonantSet.has(previousChar)) {
    insertText = `${halant}${phalaConsonant}`;
  } else if (previousChar === halant && consonantSet.has(beforePreviousChar)) {
    // Do not duplicate halant if base consonant already has one.
    insertText = phalaConsonant;
  } else {
    return;
  }

  output.value = before + insertText + after;
  const newCursor = start + insertText.length;
  output.focus();
  output.setSelectionRange(newCursor, newCursor);
}

/**
 * Create simple key buttons from plain character arrays.
 */
function createKeyButtons(characters, containerId, onClick = null) {
  const container = document.getElementById(containerId);

  characters.forEach((char) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'key-button';
    button.textContent = char;

    button.addEventListener('click', () => {
      if (onClick) {
        onClick(char);
      } else {
        insertAtCursor(char);
      }
    });

    container.appendChild(button);
  });
}

function createPhalaButtons() {
  const container = document.getElementById('phalas');

  phalas.forEach((phala) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'key-button phala-btn';
    button.textContent = phala.label;
    button.addEventListener('click', () => applyPhala(phala.consonant));
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

  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    const graphemes = [...segmenter.segment(before)];
    const previous = graphemes[graphemes.length - 1];
    const newBefore = before.slice(0, previous.index);

    return { text: newBefore + after, newCursor: previous.index };
  }

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
createKeyButtons(consonants, 'consonants', insertConsonantWithRules);
createPhalaButtons();
createKeyButtons(matras, 'matras');
createKeyButtons(digits, 'digits');
createKeyButtons(punctuation, 'punctuation');
createUtilityButtons();
setupGuideToggle();
