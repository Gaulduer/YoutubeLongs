/**
 * Hide the youtube shorts container with the classname:
 * '.style-scope ytd-rich-shelf-renderer'
 */
const hideShorts = `.style-scope ytd-rich-shelf-renderer {
                    display: none;
                  }`;
const extensionStatus = document.getElementById('extension-status');

/**
 * Insert the page-hiding CSS into the active tab,
 * send a "longify" message to the content script in the active tab.
 */
function longify(tabs) {
  extensionStatus.textContent = 'Shorts are banned!';
  browser.tabs.sendMessage(tabs[0].id, {
    command: 'longify',
  });
}

/**
 * Remove the page-hiding CSS from the active tab,
 * send a "reset" message to the content script in the active tab.
 */
function reset(tabs) {
  extensionStatus.textContent = 'Shorts are allowed!';
  browser.tabs.sendMessage(tabs[0].id, {
    command: 'show-shorts',
  });
}

/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
function listenForEvents() {
  // Check to make sure 'ban-shorts' is defined in local storage.
  browser.storage.local.get('ban-shorts').then((ban) => {
    let banShorts = '1';
    if (ban === null || ban['ban-shorts'] === null)
      browser.storage.local.set({'ban-shorts': banShorts});
    else 
      banShorts = ban['ban-shorts'];

    return banShorts
  })

  // Hide or show shorts based on 'ban-shorts'.
  function updateMessage() {
    browser.storage.local.get('ban-shorts').then((ban) => {
      return ban['ban-shorts']
    }).then((banShorts) => {
      if (banShorts === '1') {
        browser.tabs
          .query({ active: true, currentWindow: true })
          .then(longify)
          .catch(reportError);
      }
      else if (banShorts === '0') {
        browser.tabs
          .query({ active: true, currentWindow: true })
          .then(reset)
          .catch(reportError);
      }
      else
        extensionStatus.textContent = 'Error';
    })
  }

  document.addEventListener("click", (e) => {
    /**
     * Just log the error to the console.
     */
    function reportError(error) {
      console.error(`Could not longify: ${error}`);
      extensionStatus.textContent('Error running command');
    }

    if (e.target.tagName !== "BUTTON" || !e.target.closest("#popup-content")) {
      // Ignore when click is not on a button within <div id="popup-content">.
      return;
    }
    if (e.target.type === "reset") {
      browser.storage.local.set({'ban-shorts': '0'});
      browser.tabs
        .query({ active: true, currentWindow: true })
        .then(reset)
        .catch(reportError);
    } else {
      browser.storage.local.set({'ban-shorts': '1'});
      browser.tabs
        .query({ active: true, currentWindow: true })
        .then(longify)
        .catch(reportError);
    }
    updateMessage();
  });
  updateMessage();
}

/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */
function reportExecuteScriptError(error) {
  document.querySelector("#popup-content").classList.add("hidden");
  document.querySelector("#error-content").classList.remove("hidden");
  console.error(`Failed to Youtube longs content script: ${error.message}`);
}

listenForEvents().catch(reportExecuteScriptError);