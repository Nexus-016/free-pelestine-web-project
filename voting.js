export function setupVoting(supportSideRadios, supportButton, HAS_VOTED_KEY) {
    // Enable the button only if "Palestine" is selected and the user hasn't voted
    supportSideRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
            const hasVoted = localStorage.getItem(HAS_VOTED_KEY);
            console.log(`Radio value: ${radio.value}, Checked: ${radio.checked}, Has Voted: ${hasVoted}`); // Debugging log
            if (radio.value === "Palestine" && radio.checked && !hasVoted) {
                supportButton.disabled = false;
                console.log("Support button enabled.");
            } else {
                supportButton.disabled = true;
                console.log("Support button disabled.");
            }
        });
    });
}

export function disableVotingUI(supportButton, thankYouMessage, supportSideRadios) {
    supportButton.disabled = true;
    supportButton.textContent = "You have already supported";
    thankYouMessage.classList.remove("hidden");
    supportSideRadios.forEach((radio) => {
        radio.disabled = true;
    });
    console.log("Voting UI disabled.");
}
