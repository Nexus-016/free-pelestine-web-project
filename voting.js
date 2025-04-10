export function setupVoting(supportSideRadios, supportButton, HAS_VOTED_KEY) {
    // Enable the button only if "Palestine" is selected and the user hasn't voted
    supportSideRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
            const hasVoted = localStorage.getItem(HAS_VOTED_KEY);
            if (radio.value === "Palestine" && radio.checked && !hasVoted) {
                supportButton.disabled = false;
            } else {
                supportButton.disabled = true;
            }
        });
    });
}

export function disableVotingUI(supportButton, thankYouMessage, supportSideRadios) {
    supportButton.disabled = true;
    supportButton.textContent = "You have already voted";
    thankYouMessage.classList.remove("hidden");
    supportSideRadios.forEach((radio) => {
        radio.disabled = true;
    });
}
