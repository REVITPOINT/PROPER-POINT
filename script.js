
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => mainNav.classList.toggle('open'));
  document.querySelectorAll('.main-nav a').forEach(link => {
    link.addEventListener('click', () => mainNav.classList.remove('open'));
  });
}

const switchButtons = document.querySelectorAll('.switch-btn');
const inquiryType = document.getElementById('inquiryType');
const wasteFields = document.querySelector('.waste-fields');
const message = document.getElementById('message');

switchButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    switchButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const type = btn.dataset.type;
    inquiryType.value = type;

    if (type === 'kruszywa') {
      wasteFields.style.display = 'none';
      message.placeholder = 'Opisz rodzaj i ilość potrzebnego kruszywa oraz preferowany termin odbioru...';
    } else {
      wasteFields.style.display = 'grid';
      message.placeholder = 'Miejsce pochodzenia, termin i dodatkowe informacje...';
    }
  });
});

const quickForm = document.getElementById('quickForm');

if (quickForm) {
  quickForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const type = inquiryType.value;
    const company = document.getElementById('company').value.trim();
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const waste = document.getElementById('waste').value.trim();
    const amount = document.getElementById('amount').value.trim();
    const msg = document.getElementById('message').value.trim();

    const subject = encodeURIComponent(
      type === 'kruszywa' ? 'Zapytanie o kruszywo – REVIT POINT' : 'Zapytanie o przyjęcie odpadu – REVIT POINT'
    );

    let body = `Dzień dobry,

przesyłam zapytanie dotyczące ${type === 'kruszywa' ? 'kruszywa naturalnego' : 'możliwości przyjęcia odpadu'}.

Firma: ${company}
Imię i nazwisko: ${name}
Telefon: ${phone}
E-mail: ${email}
`;

    if (type === 'odpady') {
      body += `Kod odpadu: ${waste}
Ilość: ${amount}
`;
    }

    body += `
Wiadomość:
${msg}

Pozdrawiam,
${name}`;

    window.location.href = `mailto:biuro@revitpoint.pl?subject=${subject}&body=${encodeURIComponent(body)}`;
  });
}
