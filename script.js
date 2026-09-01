const form = document.getElementById('inspectionForm');
const inspectionDate = document.getElementById('inspectionDate');

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

setToday();

form.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!form.reportValidity()) {
    return;
  }

  const employeeName = document.getElementById('employeeName').value.trim();
  const vehicleNumber = document.getElementById('vehicleNumber').value.trim();
  const inspectionDateValue = inspectionDate.value;
  const generalComment = document.getElementById('generalComment').value.trim();

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

  const subject = `Inspection de véhicule avant départ - Véhicule ${vehicleNumber} - ${inspectionDateValue}`;
  const mailtoLink = `mailto:michael.fontaine@colasquebec.ca?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.join('\n'))}`;
  window.location.href = mailtoLink;
});
