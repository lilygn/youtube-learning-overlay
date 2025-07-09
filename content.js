console.log("YouTube Learning Overlay injected successfully! loaded");

setTimeout(() => {


    const transcriptButton = document.querySelector('button[aria-label="Show transcript"]');
    if (transcriptButton) {
        transcriptButton.click();
        console.log("Transcript button clicked. updating transcript...");
        setTimeout(() => {

        const transcriptSegments = document.querySelectorAll('ytd-transcript-segment-renderer');
        if (transcriptSegments.length == 0) {
            console.log("No transcript segments found.");
    
        
    } else {
        transcriptSegments.forEach(segment => {
            const text = segment.textContent.trim();
            if (text) {
                console.log(text);
            }    }
        );
        console.log("Transcript segments processed.");
        }
    },5000);


    } else {
        console.log("Transcript button not found.");
    }
},3000);