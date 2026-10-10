document.addEventListener("DOMContentLoaded", () => {

    // Function 1: Core dynamic rendering engine for manuscript injection (Fetching from JSON)
    const initLibraryEngine = () => {
        const workspaceNode = document.getElementById("interactive-display");
        const actionTriggers = document.querySelectorAll(".btn-interactive");

        if (!workspaceNode || actionTriggers.length === 0) return;

        actionTriggers.forEach(trigger => {
            trigger.addEventListener("click", async (event) => {
                const selectedBook = event.target.getAttribute("data-book");
                const selectedType = event.target.getAttribute("data-type");

                // Temporary loading state
                workspaceNode.innerHTML = `<div class="render-animate-box"><p class="placeholder-text">Loading manuscript data...</p></div>`;

                try {
                    // Fetch the JSON database
                    const response = await fetch("data/books.json");
                    if (!response.ok) {
                        throw new Error("Could not load book data.");
                    }
                    
                    const data = await response.json();

                    // Find the specific book and chapter
                    const book = data.books.find(b => b.id === selectedBook);
                    if (!book) throw new Error("Manuscript not found in database.");

                    const chapter = book.chapters.find(c => c.id === selectedType);
                    if (!chapter) throw new Error("Specific chapter or excerpt not found.");

                    // Build the HTML strictly utilizing Template Literals
                    let contentHtml = `
                        <div class="render-animate-box">
                            <span class="display-label">${book.title} &mdash; ${chapter.title.toUpperCase()}</span>
                    `;
                    
                    if (chapter.summary) {
                        contentHtml += `<p class="muted" style="margin-top: 0; font-size: 0.9em; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1);"><em>${chapter.summary}</em> (Est. read time: ${chapter.readTime} min)</p>`;
                    }

                    // Loop through the sample text array and create paragraphs
                    chapter.sample.forEach(paragraph => {
                        contentHtml += `<p class="display-body-text" style="margin-bottom: 1rem; line-height: 1.7;">${paragraph}</p>`;
                    });

                    contentHtml += `</div>`;

                    // Inject the generated HTML into the display area
                    workspaceNode.innerHTML = contentHtml;

                } catch (error) {
                    workspaceNode.innerHTML = `
                        <div class="render-animate-box">
                            <p class="placeholder-text" style="color: #ef4444;">Error: ${error.message}</p>
                        </div>
                    `;
                }
            });
        });
    };

    // Function 2: Core form management tracking data states via localStorage
    const initFormStorageEngine = () => {
        const readerForm = document.getElementById("reader-review-form");
        const submissionCounterField = document.getElementById("local-storage-counter");
        const visualFeedbackAlert = document.getElementById("form-status-feedback");

        if (!readerForm) return;

        // Populate baseline data elements out of active storage vectors
        let globalLogCount = parseInt(localStorage.getItem("wddReviewCount") || "0", 10);
        if (submissionCounterField) {
            submissionCounterField.textContent = `Total Community Reviews Logged: ${globalLogCount}`;
        }

        readerForm.addEventListener("submit", (event) => {
            event.preventDefault(); // Catch validation track loops

            const inputReaderName = document.getElementById("form-reader-name").value;
            const inputBookContext = document.getElementById("form-book-select").value;

            // Conditional validation gate checking string entries
            if (inputReaderName.trim() !== "") {
                globalLogCount += 1;
                localStorage.setItem("wddReviewCount", globalLogCount);

                if (submissionCounterField) {
                    submissionCounterField.textContent = `Total Community Reviews Logged: ${globalLogCount}`;
                }

                if (visualFeedbackAlert) {
                    // Strict template literal compliance on message building blocks
                    visualFeedbackAlert.innerHTML = `
                        <div class="success-alert" style="color: #10b981; margin-bottom: 1rem; font-weight: bold; background: rgba(16,185,129,0.1); padding: 10px; border-radius: 4px;">
                            Log entry saved. Thank you, <strong>${inputReaderName}</strong>, for committing notes toward <em>${inputBookContext}</em>.
                        </div>
                    `;
                }
                readerForm.reset();
            }
        });
    };

    // Trigger both modules
    initLibraryEngine();
    initFormStorageEngine();
});
