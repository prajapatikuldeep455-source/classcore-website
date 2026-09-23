const downloadList = document.getElementById('downloadList');

async function loadDownloads() {
  try {
    const response = await fetch('/api/downloads');
    const result = await response.json();
    if (!response.ok || !result.ok) {
      throw new Error('Download list is unavailable.');
    }

    downloadList.innerHTML = result.files.map((file) => `
      <article class="download-item">
        <div>
          <span class="file-type">${file.type}</span>
          <h3>${file.name}</h3>
          <p>${file.size} · Ready to download</p>
        </div>
        <a class="btn btn-primary" href="${file.file}" download>Download</a>
      </article>
    `).join('');
  } catch (error) {
    downloadList.innerHTML = `<div class="download-item error-item">${error.message}</div>`;
  }
}

loadDownloads();
