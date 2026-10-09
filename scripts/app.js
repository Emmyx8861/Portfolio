const dataUrl = "data/books.json";

async function loadBooks() {
  const response = await fetch(dataUrl);
  if (!response.ok) {
    throw new Error(`Book data could not be loaded (${response.status}).`);
  }
  return response.json();
}

function chapterLink(bookId, chapterId) {
  return `chapter.html?book=${encodeURIComponent(bookId)}&chapter=${encodeURIComponent(chapterId)}`;
}

function renderBooks(books) {
  const list = document.querySelector("#book-list");
  if (!list) return;
  list.replaceChildren(...books.map((book) => {
    const article = document.createElement("article");
    article.className = "book card";
    article.innerHTML = `
      <h3>${book.title}</h3>
      <p class="meta"><strong>Genre:</strong> ${book.genre} | <strong>Chapters:</strong> ${book.chapters.length}</p>
      <p>${book.description}</p>
      <details>
        <summary>View chapters</summary>
        <ol>${book.chapters.map((chapter) => `
          <li><a href="${chapterLink(book.id, chapter.id)}">${chapter.title}</a> — ${chapter.readTime} minutes</li>
        `).join("")}</ol>
      </details>
    `;
    return article;
  }));
}

function renderChapter(books) {
  const title = document.querySelector("#chapter-title");
  const meta = document.querySelector("#chapter-meta");
  const content = document.querySelector("#chapter-content");
  if (!title || !meta || !content) return;

  const params = new URLSearchParams(window.location.search);
  const book = books.find((item) => item.id === params.get("book")) || books[0];
  const chapter = book.chapters.find((item) => item.id === params.get("chapter")) || book.chapters[0];

  title.textContent = `${book.title}: ${chapter.title}`;
  meta.textContent = `${book.genre} | Estimated read time: ${chapter.readTime} minutes`;
  content.replaceChildren(
    ...chapter.sample.map((paragraph) => {
      const element = document.createElement("p");
      element.textContent = paragraph;
      return element;
    }),
    Object.assign(document.createElement("p"), { textContent: "— excerpt —" })
  );
}

function setupForm(formId, message) {
  const form = document.querySelector(`#${formId}`);
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let status = form.querySelector(".form-status");
    if (!status) {
      status = document.createElement("p");
      status.className = "form-status";
      status.setAttribute("role", "status");
      form.append(status);
    }
    status.textContent = message;
    form.reset();
  });
}

loadBooks()
  .then(({ books }) => {
    renderBooks(books);
    renderChapter(books);
  })
  .catch((error) => {
    const target = document.querySelector("#book-list") || document.querySelector("#chapter-content");
    if (target) target.textContent = error.message;
  });

setupForm("signup", "Thanks for subscribing. New chapter updates are on their way.");
setupForm("contact", "Thanks for your message. The author will reply soon.");
