/**
 * Hide the youtube shorts container with the classname:
 * '.style-scope ytd-rich-shelf-renderer'
 */
const hideShorts = `.style-scope ytd-rich-shelf-renderer {
                    display: none;
                  }`;
const extensionStatus = document.getElementById('extension-status');
const statuses = {
  'active': 'Shorts are banned!',
  'inactive': 'Shorts are allowed!'
}

/**
 * Insert the page-hiding CSS into the active tab,
 * send a "longify" message to the content script in the active tab.
 */
function longify(tabs) {
  extensionStatus.textContent = statuses['active'];
  browser.storage.local.set({'ban-shorts': 'active'});
  browser.tabs.sendMessage(tabs[0].id, {
    command: 'longify',
  });
}

/**
 * Remove the page-hiding CSS from the active tab,
 * send a "reset" message to the content script in the active tab.
 */
function reset(tabs) {
  extensionStatus.textContent = statuses['inactive'];
  browser.storage.local.set({'ban-shorts': 'inactive'});
  browser.tabs.sendMessage(tabs[0].id, {
    command: 'show-shorts',
  });
}

/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
function listenForEvents() {
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
      browser.tabs
        .query({ active: true, currentWindow: true })
        .then(reset)
        .catch(reportError);
    } else {
      browser.tabs
        .query({ active: true, currentWindow: true })
        .then(longify)
        .catch(reportError);
    }
  });

  // Ensure that 'ban-shorts' is correctly defined, then update the extension message.
  browser.storage.local.get('ban-shorts').then((ban) => {
    if (ban['ban-shorts'] !== 'inactive') {
      if(ban['ban-shorts'] !== 'active')
        browser.storage.local.set({'ban-shorts': 'active'}) // Hiding shorts is the default.
      extensionStatus.textContent = statuses['active'];
      longify();
    }
    else {
      extensionStatus.textContent = statuses['inactive'];
    }
  });
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