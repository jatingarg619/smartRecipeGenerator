
// Function to fetch substitutions from GPT-4
async function fetchSubstitution(ingredient, diet) {
    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer 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`
      },
      body: JSON.stringify({
        model: "gpt-4",
        prompt: `Suggest a ${diet} alternative for ${ingredient}.`,
        max_tokens: 50,
        temperature: 0.5
      })
    });
  
    const data = await response.json();
    // return data.choices[0].text.trim();
    return "test";
}

document.getElementById('convert-btn').addEventListener('click', async function () {
    
    const servingSize = document.getElementById('serving-size').value;
    const diet = document.getElementById('diet').value;
    const ingredientsInput = document.getElementById('ingredients').value;


    if (servingSize && ingredientsInput) {
        const button = document.getElementById('convert-btn');
        const originalButtonText = button.textContent;

        // Change button text to "Generating..."
        button.textContent = 'Generating...';
        button.disabled = true; // Disable button to prevent multiple clicks

        // Get the current tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length === 0) {
                document.getElementById('result').innerText = 'No active tab found.';
                button.textContent = originalButtonText; // Revert button text
                button.disabled = false; // Re-enable button
                return;
            }

            const activeTab = tabs[0];
           

            // Check if the URL is valid and not a restricted page
            if (activeTab.url.startsWith('http://') || activeTab.url.startsWith('https://')) {
                // Inject the content script
                chrome.scripting.executeScript({
                    target: { tabId: activeTab.id },
                    files: ['content.js']
                }, () => {
                    // Send a message to the content script
                    chrome.tabs.sendMessage(activeTab.id, { action: "convertRecipe", servingSize, diet, ingredientsInput }, (response) => {
                        
                        if (response && response.success) {
                            // Display the results in the popup
                            document.getElementById('result').innerText = response.results;
                            document.getElementById('result').style.display = 'block'; // Show result
                        } else {
                        
                            document.getElementById('result').innerText = 'Recipe conversion failed.';
                            document.getElementById('result').style.display = 'block'; // Show result
                        }
                        // Revert button text and re-enable button
                        button.textContent = originalButtonText;
                        button.disabled = false;
                    });
                });
            } else {
                document.getElementById('result').innerText = 'Cannot convert recipe on this page.';
                document.getElementById('result').style.display = 'block'; // Show result
                button.textContent = originalButtonText; // Revert button text
                button.disabled = false; // Re-enable button
            }
        });
    } else {
        document.getElementById('result').innerText = 'Please enter a serving size and ingredients.';
        document.getElementById('result').style.display = 'block'; // Show result
    }
});
