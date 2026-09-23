document.getElementById('year').textContent = new Date().getFullYear();

async function loadSiteMeta() {
  try {
    const res = await fetch('/api/site');
    const data = await res.json();
    if (data?.name) {
      document.title = `${data.name} | Smart Tuition Management`;
    }
  } catch (error) {
    console.error('Site metadata failed to load:', error);
  }
}

const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    formStatus.textContent = 'Sending message...';

    const formData = new FormData(contactForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Unable to send message.');
      }

      formStatus.textContent = result.message;
      contactForm.reset();
    } catch (error) {
      formStatus.textContent = error.message || 'Something went wrong.';
    }
  });
}

loadSiteMeta();
