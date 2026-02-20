const output = document.getElementById('odiaOutput');

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
const yuktaksharas = ['କ୍ଷ', 'ତ୍ର', 'ଜ୍ଞ', 'ଶ୍ର', 'ଦ୍ୟ', 'ନ୍ଦ'];

/**
 * Insert text at the cursor/selection inside the textarea.
 * If some text is selected, the selection is replaced by the inserted character.
 */
function insertAtCursor(textToInsert) {
  const start = output.selectionStart;
  const end = output.selectionEnd;
  const currentValue = output.value;

  output.value = currentValue.slice(0, start) + textToInsert + currentValue.slice(end);

  // Move cursor to right after the inserted text and keep focus in textarea.
  const newPosition = start + textToInsert.length;
  output.focus();
  output.setSelectionRange(newPosition, newPosition);
}

/**
 * Create keyboard buttons from an array and append them to target container.
 * Each key click inserts the matching Odia Unicode symbol into the textarea.
 */
function createKeyButtons(characters, containerId) {
  const container = document.getElementById(containerId);

  characters.forEach((char) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'key-button';
    button.textContent = char;

    button.addEventListener('click', () => {
      insertAtCursor(char);
    });

    container.appendChild(button);
  });
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

    // If text is selected, delete the selected range; otherwise remove one character before cursor.
    if (start !== end) {
      output.value = output.value.slice(0, start) + output.value.slice(end);
      output.setSelectionRange(start, start);
    } else if (start > 0) {
      output.value = output.value.slice(0, start - 1) + output.value.slice(start);
      output.setSelectionRange(start - 1, start - 1);
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

  utilities.append(backspaceButton, clearButton);
}

createKeyButtons(vowels, 'vowels');
createKeyButtons(consonants, 'consonants');
createKeyButtons(matras, 'matras');
createKeyButtons(yuktaksharas, 'yuktaksharas');
createUtilityButtons();
