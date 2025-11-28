const styleID = 'gslse'; // God's special little style element.
const styleContent = 
                `
                  .style-scope ytd-rich-shelf-renderer {
                    display: none;
                  }
                  .style-scope ytd-reel-shelf-renderer {
                    display:none;
                  }  
                `;
              
// Add the style element to the document so we can use it later.
let styleElement = document.createElement('style');
styleElement.id = styleID;
document.head.appendChild(styleElement);
styleElement = document.getElementById(styleID);

function hideShorts(hide) {
  if(hide)
    styleElement.innerHTML = styleContent;
  else
    styleElement.innerHTML = '';
}
/**
 * If the current video is a short,
 * The url is changed to make it a normal video.
 */
function longify() {
  // Break up the url to find out if 'shorts is within it'.
  const urlPieces = window.location.href.split('/');

  /**
   * If https:// is included when getting the url,
   * this will scew the position of shorts in 'urlPieces'.
   */
  let position = 0;
  if (urlPieces[1] === 'shorts')
    position = 1;
  else if(urlPieces[3] === 'shorts')
    position = 3;
  else {
    hideShorts(true);
    return;
  }

  // Setting 'shorts' to 'v' will make the url to lead to a normal video.
  urlPieces[position] = 'v';

  window.location.href = urlPieces.join('/');
}

// Only run longify by default if 'ban-shorts' is not 'inactive.
chrome.storage.local.get('ban-shorts').then((ban) => {
  if (ban['ban-shorts'] !== 'inactive')
    longify();
})

// After the page is loaded, commands may be triggered to hide or show shorts.
chrome.runtime.onMessage.addListener((message) => {
  if (message.command === "longify") {
    longify();
  } else if (message.command === "show-shorts") {
    hideShorts(false);
  }
});