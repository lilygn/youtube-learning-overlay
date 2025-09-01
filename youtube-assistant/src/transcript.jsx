function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
export async function getTranscript() {
    await wait(3000);

  const transcriptButton = document.querySelector('button[aria-label="Show transcript"]');
  if (transcriptButton) {
    transcriptButton.click();
    console.log("Transcript button clicked.");

    await wait(5000);

    const transcriptSegments = document.querySelectorAll('ytd-transcript-segment-renderer');
    let fullTranscript = "";

    if (transcriptSegments.length === 0) {
      console.log("No transcript segments found.");
      return null;
    }

    transcriptSegments.forEach(segment => {
      const text = segment.textContent.trim();
      if (text) {
        fullTranscript += text + "\n";
      }
    });

    console.log("Transcript extracted successfully.");
    return fullTranscript;
  } else {
    console.log("Transcript button not found.");
    return null;
  }
}