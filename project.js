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

    // Function 3: Paginated Lead Generation Database Search
    const initLeadSearchEngine = async () => {
        const searchInput = document.getElementById("lead-search");
        const tableBody = document.getElementById("lead-table-body");
        const prevBtn = document.getElementById("prev-page");
        const nextBtn = document.getElementById("next-page");
        const pageIndicator = document.getElementById("page-indicator");
        
        if (!searchInput || !tableBody) return;

        let allLeads = [];
        let filteredLeads = [];
        let currentPage = 1;
        const rowsPerPage = 50; // Show 50 rows per page

        try {
            let response = await fetch("data/leads.json");
            if (!response.ok) response = await fetch("leads.json"); 
            if (!response.ok) throw new Error("Could not find leads.json");
            
            const data = await response.json();
            
            // Unwrapper
            const unwrapData = (obj) => {
                if (Array.isArray(obj)) {
                    if (obj.length === 1 && Array.isArray(obj[0])) return unwrapData(obj[0]);
                    return obj;
                } else if (typeof obj === 'object' && obj !== null) {
                    const keys = Object.keys(obj);
                    if (keys.length === 1 && Array.isArray(obj[keys[0]])) return unwrapData(obj[keys[0]]);
                    if (keys.length > 0 && typeof obj[keys[0]] === 'object') return Object.values(obj);
                }
                return [obj];
            };

            allLeads = unwrapData(data);
            filteredLeads = allLeads;

            const safeString = (val) => {
                if (val === null || val === undefined) return 'N/A';
                if (typeof val === 'string') return val.trim() || 'N/A';
                if (typeof val === 'number' || typeof val === 'boolean') return String(val);
                if (typeof val === 'object') {
                    if (Array.isArray(val) && val.length > 0) return safeString(val[0]);
                    const vals = Object.values(val);
                    if (vals.length === 1) return safeString(vals[0]);
                    return 'N/A';
                }
                return 'N/A';
            };
            
            const renderTable = () => {
                tableBody.innerHTML = ""; 
                
                const totalPages = Math.ceil(filteredLeads.length / rowsPerPage) || 1;
                
                // Safety checks for pagination
                if (currentPage > totalPages) currentPage = totalPages;
                if (currentPage < 1) currentPage = 1;

                // Update the Page Text
                if (pageIndicator) {
                    pageIndicator.textContent = `Page ${currentPage} of ${totalPages} (${filteredLeads.length} total records)`;
                }

                // Enable/Disable buttons based on current page
                if (prevBtn) {
                    prevBtn.disabled = currentPage === 1;
                    prevBtn.style.opacity = currentPage === 1 ? "0.5" : "1";
                    prevBtn.style.cursor = currentPage === 1 ? "not-allowed" : "pointer";
                }
                if (nextBtn) {
                    nextBtn.disabled = currentPage === totalPages;
                    nextBtn.style.opacity = currentPage === totalPages ? "0.5" : "1";
                    nextBtn.style.cursor = currentPage === totalPages ? "not-allowed" : "pointer";
                }

                if (filteredLeads.length === 0) {
                    tableBody.innerHTML = `<tr><td colspan="6" style="padding: 1rem; text-align: center; color: #ef4444;">No records found.</td></tr>`;
                    return;
                }

                // Slice the data for the current page
                const startIndex = (currentPage - 1) * rowsPerPage;
                const displayLimit = filteredLeads.slice(startIndex, startIndex + rowsPerPage);

                displayLimit.forEach(lead => {
                    let name = 'N/A', email = 'N/A', city = 'N/A', state = 'N/A', type = 'N/A', cat = 'Facility';

                    if (typeof lead !== 'object' || lead === null) {
                        name = safeString(lead);
                    }
                    else if (Array.isArray(lead)) {
                        name = safeString(lead[0]);
                        city = safeString(lead[1]);
                        state = safeString(lead[2]);
                        type = safeString(lead[3]);
                        cat = safeString(lead[4] !== 'N/A' ? lead[4] : 'Facility');
                    } 
                    else {
                        const lowerLead = {};
                        for (const [k, v] of Object.entries(lead)) {
                            lowerLead[k.toLowerCase()] = v;
                        }

                        const getVal = (keywords, defaultVal) => {
                            const foundKey = Object.keys(lowerLead).find(k => keywords.some(kw => k.includes(kw)));
                            return foundKey ? safeString(lowerLead[foundKey]) : defaultVal;
                        };

                        // Extracts Name, Event, Email, etc.
                        name = getVal(['name', 'club', 'tournament', 'event', 'organization'], 'N/A');
                        email = getVal(['email', 'mail', 'contact'], 'N/A');
                        city = getVal(['city', 'town'], 'N/A');
                        state = getVal(['state', 'province'], 'N/A');
                        type = getVal(['type', 'format'], 'N/A');
                        cat = getVal(['category', 'cat'], 'Facility');
                    }

                    if (cat.toLowerCase().includes('n/a') || cat === '') cat = 'Facility';

                    const rowHtml = `
                        <tr style="border-bottom: 1px solid rgba(45,35,88,0.2);">
                            <td style="padding: 0.5rem;"><span style="background: ${cat.toLowerCase().includes('tournament') ? '#0284c7' : '#8b5cf6'}; padding: 2px 6px; border-radius: 4px; font-size: 0.8em; color: white;">${cat}</span></td>
                            <td style="padding: 0.5rem; font-weight: bold;">${name}</td>
                            <td style="padding: 0.5rem; color: #a78bfa;">${email}</td>
                            <td style="padding: 0.5rem;">${city}</td>
                            <td style="padding: 0.5rem;">${state}</td>
                            <td style="padding: 0.5rem; color: #9ca3af;">${type}</td>
                        </tr>
                    `;
                    tableBody.insertAdjacentHTML('beforeend', rowHtml);
                });
            };

            // Setup Next/Prev Button Clicks
            if (prevBtn) {
                prevBtn.addEventListener("click", () => {
                    if (currentPage > 1) {
                        currentPage--;
                        renderTable();
                    }
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener("click", () => {
                    const totalPages = Math.ceil(filteredLeads.length / rowsPerPage);
                    if (currentPage < totalPages) {
                        currentPage++;
                        renderTable();
                    }
                });
            }

            // Initial Render
            renderTable();

            // Search Bar Functionality
            searchInput.addEventListener("input", (e) => {
                const searchTerm = String(e.target.value).toLowerCase();
                
                filteredLeads = allLeads.filter(lead => {
                    let searchString = "";
                    if (Array.isArray(lead)) {
                        searchString = lead.map(val => safeString(val)).join(" ").toLowerCase();
                    } else if (typeof lead === 'object' && lead !== null) {
                        searchString = Object.values(lead).map(val => safeString(val)).join(" ").toLowerCase();
                    }
                    return searchString.includes(searchTerm);
                });
                
                // When a user searches, jump back to page 1
                currentPage = 1;
                renderTable();
            });

        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="6" style="padding: 1rem; text-align: center; color: #ef4444;">Error loading data: ${error.message}</td></tr>`;
        }
    };

    // Trigger all modules
    initLeadSearchEngine();
    initLibraryEngine();
    initFormStorageEngine();

});
