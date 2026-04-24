const form = document.getElementById('feedback-form');
const formScreen = document.getElementById('form-screen');
const confirmationScreen = document.getElementById('confirmation-screen');
const q6OtherWrapper = document.getElementById('q6-other-wrapper');
const q6OtherInput = document.getElementById('q6_other_text');
const q7Input = document.getElementById('q7_motivation');
const q7Value = document.getElementById('q7_value');
const formError = document.getElementById('form-error');

const q6Radios = Array.from(document.querySelectorAll('input[name="q6_main_limit"]'));

const updateQ6OtherVisibility = () => {
  const selected = document.querySelector('input[name="q6_main_limit"]:checked');
  const isOther = selected?.value === 'Autre';

  q6OtherWrapper.classList.toggle('hidden', !isOther);
  q6OtherInput.required = isOther;

  if (!isOther) {
    q6OtherInput.value = '';
  }
};

q6Radios.forEach((radio) => {
  radio.addEventListener('change', updateQ6OtherVisibility);
});

q7Input.addEventListener('input', () => {
  q7Value.textContent = q7Input.value;
});


const buildExcelCompatibleCsv = (payload) => {
  const rows = [
    ['field', 'value'],
    ['program', payload.metadata.program],
    ['period', payload.metadata.period],
    ['submittedAt', payload.metadata.submittedAt],
    ['source', payload.metadata.source],
    ['q1_sessions_followed', payload.answers.q1_sessions_followed],
    ['q2_difficulty_global', payload.answers.q2_difficulty_global],
    ['q3_exercise_clarity', payload.answers.q3_exercise_clarity],
    ['q4_exercise_feedback', payload.answers.q4_exercise_feedback],
    ['q5_changes_felt', payload.answers.q5_changes_felt],
    ['q6_main_limit', payload.answers.q6_main_limit],
    ['q6_other_text', payload.answers.q6_other_text ?? ''],
    ['q7_motivation', payload.answers.q7_motivation],
    ['q8_one_improvement', payload.answers.q8_one_improvement]
  ];

  const escapeCell = (value) => {
    const asString = String(value ?? '');
    if (/[",\n]/.test(asString)) {
      return `"${asString.replaceAll('"', '""')}"`;
    }
    return asString;
  };

  return rows.map((row) => row.map(escapeCell).join(';')).join('\n');
};

const downloadCsvFile = (csvContent) => {
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  link.href = URL.createObjectURL(blob);
  link.download = `feedback-fondations-${date}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
};

const openPreparedEmail = () => {
  const subject = encodeURIComponent('Feedback Fondations - Semaines 1 et 2');
  const body = encodeURIComponent(
    'Bonjour,\n\nLe fichier CSV (compatible Excel) vient d\'être téléchargé automatiquement. Merci de l\'ajouter en pièce jointe puis d\'envoyer cet email.\n'
  );
  window.location.href = `mailto:baptistemycoach@gmail.com?subject=${subject}&body=${body}`;
};

const getFormDataAsObject = () => {
  const data = new FormData(form);
  return {
    metadata: {
      program: 'Fondations',
      period: 'Semaines 1 et 2',
      submittedAt: new Date().toISOString(),
      source: 'web-form-vanilla'
    },
    answers: {
      q1_sessions_followed: data.get('q1_sessions_followed'),
      q2_difficulty_global: data.get('q2_difficulty_global'),
      q3_exercise_clarity: data.get('q3_exercise_clarity'),
      q4_exercise_feedback: data.get('q4_exercise_feedback')?.trim(),
      q5_changes_felt: data.get('q5_changes_felt'),
      q6_main_limit: data.get('q6_main_limit'),
      q6_other_text: data.get('q6_other_text')?.trim() || null,
      q7_motivation: Number(data.get('q7_motivation')),
      q8_one_improvement: data.get('q8_one_improvement')?.trim()
    }
  };
};

form.addEventListener('submit', (event) => {
  event.preventDefault();
  formError.classList.add('hidden');
  formError.textContent = '';

  updateQ6OtherVisibility();

  if (!form.checkValidity()) {
    formError.textContent = 'Merci de répondre à toutes les questions obligatoires.';
    formError.classList.remove('hidden');
    form.reportValidity();
    return;
  }

  const payload = getFormDataAsObject();

  console.log('Soumission feedback Fondations:', payload);
  console.log('JSON prêt pour Airtable/Google Sheets/Supabase:', JSON.stringify(payload));

  const csvContent = buildExcelCompatibleCsv(payload);
  downloadCsvFile(csvContent);
  openPreparedEmail();

  formScreen.classList.add('hidden');
  confirmationScreen.classList.remove('hidden');
});

updateQ6OtherVisibility();
