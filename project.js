document.addEventListener("DOMContentLoaded", () => {

    // Function 1: Core dynamic rendering engine for manuscript injection
    const initLibraryEngine = () => {
        const workspaceNode = document.getElementById("interactive-display");
        const actionTriggers = document.querySelectorAll(".btn-interactive");

        if (!workspaceNode || actionTriggers.length === 0) return;

        actionTriggers.forEach(trigger => {
            trigger.addEventListener("click", async (event) => {
                const selectedBook = event.target.getAttribute("data-book");
                const selectedType = event.target.getAttribute("data-type");

                workspaceNode.innerHTML = `<div style="padding: 20px; text-align: center;"><p style="color: #a78bfa; font-weight: bold;">Loading manuscript data...</p></div>`;

                try {
                    let response = await fetch("data/books.json");
                    if (!response.ok) response = await fetch("books.json");
                    if (!response.ok) throw new Error("Could not find the books.json file.");
                    
                    const data = await response.json();

                    const book = data.books.find(b => b.id === selectedBook);
                    if (!book) throw new Error("Manuscript not found in database.");

                    const chapter = book.chapters.find(c => c.id === selectedType);
                    if (!chapter) throw new Error("Specific chapter or excerpt not found.");

                    let contentHtml = `
                        <div>
                            <h2 style="color: #a78bfa; margin-bottom: 0.5rem;">${book.title} &mdash; ${chapter.title.toUpperCase()}</h2>
                    `;
                    
                    if (chapter.summary) {
                        contentHtml += `<p class="muted" style="margin-top: 0; font-size: 0.95em; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1);"><em>${chapter.summary}</em> (Est. read time: ${chapter.readTime} min)</p>`;
                    }

                    chapter.sample.forEach(paragraph => {
                        contentHtml += `<p style="margin-bottom: 1rem; line-height: 1.7;">${paragraph}</p>`;
                    });

                    contentHtml += `</div>`;
                    workspaceNode.innerHTML = contentHtml;

                } catch (error) {
                    workspaceNode.innerHTML = `
                        <div style="padding: 20px; text-align: center;">
                            <p style="color: #ef4444; font-weight: bold;">Error: ${error.message}</p>
                            <p style="font-size: 0.9em; color: #9ca3af;">Please ensure you uploaded the books.json file to your GitHub repository.</p>
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

        let globalLogCount = parseInt(localStorage.getItem("wddReviewCount") || "0", 10);
        if (submissionCounterField) {
            submissionCounterField.textContent = `Total Community Reviews Logged: ${globalLogCount}`;
        }

        readerForm.addEventListener("submit", (event) => {
            event.preventDefault(); 
            const inputReaderName = document.getElementById("form-reader-name").value;
            const inputBookContext = document.getElementById("form-book-select").value;

            if (inputReaderName.trim() !== "") {
                globalLogCount += 1;
                localStorage.setItem("wddReviewCount", globalLogCount);
                if (submissionCounterField) submissionCounterField.textContent = `Total Community Reviews Logged: ${globalLogCount}`;

                if (visualFeedbackAlert) {
                    visualFeedbackAlert.innerHTML = `
                        <div style="color: #10b981; margin-bottom: 1rem; font-weight: bold; background: rgba(16,185,129,0.1); padding: 10px; border-radius: 4px;">
                            Log entry saved. Thank you, <strong>${inputReaderName}</strong>, for committing notes toward <em>${inputBookContext}</em>.
                        </div>
                    `;
                }
                readerForm.reset();
            }
        });
    };

    // Function 3: BULLETPROOF Interactive Lead Generation Database Search
    const initLeadSearchEngine = async () => {
        const searchInput = document.getElementById("lead-search");
        const tableBody = document.getElementById("lead-table-body");
        
        if (!searchInput || !tableBody) return;

        let allLeads = [];

        try {
            let response = await fetch("data/leads.json");
            if (!response.ok) response = await fetch("leads.json"); 
            if (!response.ok) throw new Error("Could not find leads.json");
            
            const data = await response.json();
            
            // Handle different JSON structures automatically
            if (data.leads && Array.isArray(data.leads)) {
                allLeads = data.leads;
            } else if (Array.isArray(data)) {
                allLeads = data;
            } else if (data.data && Array.isArray(data.data)) {
                allLeads = data.data;
            } else {
                throw new Error("JSON format is unrecognizable.");
            }
            
            const renderTable = (leadsToDisplay) => {
                tableBody.innerHTML = ""; 
                
                if (!leadsToDisplay || leadsToDisplay.length === 0) {
                    tableBody.innerHTML = `<tr><td colspan="5" style="padding: 1rem; text-align: center; color: #ef4444;">No records found.</td></tr>`;
                    return;
                }

                // PERFORMANCE LIMIT: Draw only 100 rows
                const displayLimit = leadsToDisplay.slice(0, 100);

                displayLimit.forEach(lead => {
                    let name = 'Unknown', city = 'Unknown', state = 'Unknown', type = 'Unknown', cat = 'Unknown';

                    // If JSON tool output an Array of Arrays
                    if (Array.isArray(lead)) {
                        name = String(lead[0] || 'Unknown');
                        city = String(lead[1] || 'Unknown');
                        state = String(lead[2] || 'Unknown');
                        type = String(lead[3] || 'Unknown');
                        cat = String(lead[4] || 'Facility');
                    } 
                    // If JSON tool output an Array of Objects (standard)
                    else if (typeof lead === 'object' && lead !== null) {
                        const keys = Object.keys(lead);
                        
                        // Smart Search: Looks for keys containing these words
                        const findValue = (keywords) => {
                            const foundKey = keys.find(k => keywords.some(kw => String(k).toLowerCase().includes(kw)));
                            return foundKey ? String(lead[foundKey]) : 'Unknown';
                        };

                        name = findValue(['name', 'club', 'tournament', 'first']);
                        city = findValue(['city', 'town']);
                        state = findValue(['state', 'province']);
                        type = findValue(['type', 'format']);
                        cat = findValue(['category', 'cat']);

                        // ULTIMATE FALLBACK: If smart search fails, just grab the first 5 values blind
                        if (name === 'Unknown' && city === 'Unknown' && keys.length > 0) {
                            const vals = Object.values(lead);
                            name = String(vals[0] || 'Unknown');
                            city = String(vals[1] || 'Unknown');
                            state = String(vals[2] || 'Unknown');
                            type = String(vals[3] || 'Unknown');
                            cat = String(vals[4] || 'Facility');
                        }
                    }

                    // Clean up visuals (Forcing strings prevents the .toLowerCase error!)
                    cat = String(cat);
                    if (cat.toLowerCase().includes('unknown') || cat === '') cat = 'Facility';

                    const rowHtml = `
                        <tr style="border-bottom: 1px solid rgba(45,35,88,0.2);">
                            <td style="padding: 0.5rem;"><span style="background: ${cat.toLowerCase().includes('tournament') ? '#0284c7' : '#8b5cf6'}; padding: 2px 6px; border-radius: 4px; font-size: 0.8em; color: white;">${cat}</span></td>
                            <td style="padding: 0.5rem; font-weight: bold;">${name}</td>
                            <td style="padding: 0.5rem;">${city}</td>
                            <td style="padding: 0.5rem;">${state}</td>
                            <td style="padding: 0.5rem; color: #9ca3af;">${type}</td>
                        </tr>
                    `;
                    tableBody.insertAdjacentHTML('beforeend', rowHtml);
                });

                if (leadsToDisplay.length > 100) {
                    tableBody.insertAdjacentHTML('beforeend', `
                        <tr><td colspan="5" style="padding: 1rem; text-align: center; color: #9ca3af; font-style: italic;">
                            Showing top 100 results of ${leadsToDisplay.length}. Use the search bar to narrow down further.
                        </td></tr>
                    `);
                }
            };

            renderTable(allLeads);

            // Universal Search Box
            searchInput.addEventListener("input", (e) => {
                const searchTerm = String(e.target.value).toLowerCase();
                
                const filteredLeads = allLeads.filter(lead => {
                    let searchString = "";
                    if (Array.isArray(lead)) {
                        searchString = lead.join(" ").toLowerCase();
                    } else if (typeof lead === 'object' && lead !== null) {
                        searchString = Object.values(lead).join(" ").toLowerCase();
                    }
                    return searchString.includes(searchTerm);
                });
                
                renderTable(filteredLeads);
            });

        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="5" style="padding: 1rem; text-align: center; color: #ef4444;">Error loading data: ${error.message}</td></tr>`;
        }
    };

    // Trigger all modules
    initLeadSearchEngine();
    initLibraryEngine();
    initFormStorageEngine();

});
