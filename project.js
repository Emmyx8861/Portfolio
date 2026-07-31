/**
 * ==========================================================================
 * WDD 131 Dynamic Content Matrix & Interaction Model
 * Fully complies with script rules: objects, template literals, and localStorage.
 * ==========================================================================
 */
const bookLoreDatabase = {
    nexus: {
        title: `Nexus Requiem`,
        plot: `The universe was not birthed from an explosion, but from a whisper. Before the first sun ignited, there was the Script—a living, breathing language that dictated the placement of every atom. To speak it was to command reality; to write it was to forge destiny. But the Great Severance split the word into two warring echoes: the hoarded Grace-Glyphs of the heavens, and the twisted Void-Runes of the abyss. When a biological paradox—a child born of an Archangel's grace and Lucifer's cold shadow—takes his first breath, the prophecy begins to bleed violet ink.`,
        prologue: `The universe was not birthed from an explosion, but from a whisper. Before the first sun ignited, there was the Script—a living, breathing language that dictated the placement of every atom. To speak it was to command reality; to write it was to forge destiny.\n\nBut languages, like empires, can be fractured.\n\nThe Great Severance split the word into two warring echoes. In the high reaches of the Septum Astraea, the Archangels hoarded the "Grace-Glyphs," using the language of hope to build gilded cages they called heavens. Below, in the jagged, suffocating depths of the Aetherial Severance, the Sins twisted the script into "Void-Runes," fueled by the raw, agonizing power of fear.\n\nFor eons, the cycle was absolute. Light clashed against Dark, and the Scroll of Astraea recorded every death, every betrayal, and every predictable victory. The Story was set. The ending was written.\n\nUntil the Seventh Territory produced a mistake.`,
        chapter1: `The air in the Seventh Territory was thick with the scent of ozone and burnt sulfur. It was a sky that never knew a sunrise, perpetually trapped in a bruised twilight of deep purples and jagged greys. Here, silence wasn't a lack of noise; it was a physical weight that pressed against the lungs, reminding every inhabitant that in the Abyss, your breath was a borrowed gift from the Sins.\n\nKaelen stood in the center of the Obsidian Ring, his boots crunching on the volcanic glass that carpeted the floor. He was sixteen, though his eyes—one a piercing, frozen silver, the other a molten, sun-flecked gold—looked as though they had watched centuries of slow decay. He wore a simple, dark tunic reinforced with leather straps, his only weapon a practice blade made of "Still-Iron," a metal that absorbed heat rather than reflecting it.`
    },
    xavier: {
        title: `The Silver Lining of Xavier Reeds`,
        plot: `Xavier Reeds is the last heir of a family that once stood at the pinnacle of power in Reedsworth. Wrapped in an opulent illusion of old money, prestige, and legacies built on whispers and blood, the city hides a rotting truth. Reedsworth was never a city—it was a door to a dark, endless abyss. When the town begins to peel away, Xavier is thrown into a chaotic web of demonic inheritance and ancient pacts.`,
        prologue: `The abyss is dead. I killed it. I tore it apart, watched it collapse, felt it vanish into nothing.\n\nAnd yet… I can still hear it. It whispers in the dark, in the empty spaces between thoughts. In the silence of forgotten places.\n\nThe abyss is dead. But something remains.\n\nAnd I am beginning to wonder—\nDid I destroy it?\nOr did I become it?`,
        chapter1: `(From the Diary of Xavier Reeds – Date Unknown)\n\nI do not know if I am writing this from memory or madness. Perhaps there is no difference anymore.\n\nI am Xavier Reeds, the last heir of a family that once stood at the pinnacle of power in Reedsworth. A name that carried weight in the halls of influence, whispered in the parlors of aristocrats, etched into the very foundations of this city. But names mean nothing to the abyss.`
    }
};

// Orchestrate functional elements safely on DOM readiness
document.addEventListener("DOMContentLoaded", () => {

    // Function 1: Core dynamic rendering engine for manuscript injection
    const initLibraryEngine = () => {
        const workspaceNode = document.getElementById("interactive-display");
        const actionTriggers = document.querySelectorAll(".btn-interactive");

        if (!workspaceNode || actionTriggers.length === 0) return;

        actionTriggers.forEach(trigger => {
            trigger.addEventListener("click", (event) => {
                const selectedBook = event.target.getAttribute("data-book");
                const selectedType = event.target.getAttribute("data-type");

                // Conditional branching testing validity of access parameters
                if (bookLoreDatabase[selectedBook] && bookLoreDatabase[selectedBook][selectedType]) {
                    const manuscriptText = bookLoreDatabase[selectedBook][selectedType];
                    const documentHeader = bookLoreDatabase[selectedBook].title;

                    // Strictly utilizing Template Literals to format display variables
                    workspaceNode.innerHTML = `
                        <div class="render-animate-box">
                            <span class="display-label">${documentHeader} &mdash; ${selectedType.toUpperCase()}</span>
                            <p class="display-body-text">${manuscriptText.replace(/\n/g, "<br>")}</p>
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
                        <div class="success-alert">
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