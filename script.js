const form = document.getElementById('inspectionForm');
const inspectionDate = document.getElementById('inspectionDate');
const photoInput = document.getElementById('photoInput');
const photoButton = document.getElementById('photoButton');
const photoName = document.getElementById('photoName');
const sendStatus = document.getElementById('sendStatus');

const setToday = () => {
  const today = new Date();
  const formattedDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0];
  inspectionDate.value = formattedDate;
};

const toggleCommentField = (question) => {
  const selectedAnswer = question.querySelector('input[type="radio"]:checked');
  const commentBox = question.querySelector('.comment-box');
  if (!commentBox) return;

  if (selectedAnswer && selectedAnswer.value === 'Non') {
    commentBox.classList.remove('hidden');
    commentBox.querySelector('textarea').setAttribute('required', 'required');
  } else {
    commentBox.classList.add('hidden');
    const textarea = commentBox.querySelector('textarea');
    textarea.removeAttribute('required');
    textarea.value = '';
  }
};

const questions = document.querySelectorAll('.question');
questions.forEach((question) => {
  question.querySelectorAll('input[type="radio"]').forEach((radio) => {
    radio.addEventListener('change', () => toggleCommentField(question));
  });
  toggleCommentField(question);
});

photoButton.addEventListener('click', () => {
  photoInput.click();
});

photoInput.addEventListener('change', () => {
  const selectedFile = photoInput.files && photoInput.files[0];
  if (!selectedFile) {
    photoName.textContent = 'Aucune photo sélectionnée.';
    return;
  }

  photoName.textContent = `Photo sélectionnée: ${selectedFile.name}`;
});

setToday();

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!form.reportValidity()) {
    return;
  }

  const employeeName = document.getElementById('employeeName').value.trim();
  const vehicleNumber = document.getElementById('vehicleNumber').value.trim();
  const inspectionDateValue = inspectionDate.value;
  const generalComment = document.getElementById('generalComment').value.trim();
  const selectedFile = photoInput.files && photoInput.files[0];

  let body = [
    'Bonjour,',
    '',
    'Voici le récapitulatif de l\'inspection de véhicule avant départ :',
    '',
    `Nom employé : ${employeeName}`,
    `Numéro véhicule : ${vehicleNumber}`,
    `Date : ${inspectionDateValue}`,
    ''
  ];

  questions.forEach((question, index) => {
    const label = question.querySelector('.question-text').textContent.trim();
    const answer = question.querySelector('input[type="radio"]:checked').value;
    const comment = question.querySelector('textarea')?.value.trim() || '';
    body.push(`${index + 1}. ${label}`);
    body.push(`Réponse : ${answer}`);
    if (answer === 'Non' && comment) {
      body.push(`Commentaire : ${comment}`);
    }
    body.push('');
  });

  body.push('Commentaire général :');
  body.push(generalComment || 'Aucun commentaire général.');

  if (selectedFile) {
    body.push('');
    body.push(`Photo sélectionnée : ${selectedFile.name}`);
  }

  const subject = `Inspection de véhicule avant départ - Véhicule ${vehicleNumber} - ${inspectionDateValue}`;
  const message = body.join('\n');

  if (
    selectedFile &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [selectedFile] })
  ) {
    try {
      await navigator.share({
        title: subject,
        text: `À : michael.fontaine@colasquebec.ca\nObjet : ${subject}\n\n${message}`,
        files: [selectedFile]
      });
      sendStatus.textContent = 'Le menu de partage est ouvert avec la photo jointe.';
    } catch (error) {
      if (error.name !== 'AbortError') {
        sendStatus.textContent = 'Le partage a échoué. Veuillez réessayer ou joindre la photo manuellement.';
      }
    }
    return;
  }

  if (selectedFile) {
    body.push('');
    body.push('La photo doit être jointe manuellement : ce navigateur ne permet pas le partage automatique de fichiers.');
  }

  const mailtoLink = `mailto:michael.fontaine@colasquebec.ca?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.join('\n'))}`;
  window.location.href = mailtoLink;
});
