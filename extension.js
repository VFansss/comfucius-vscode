
const vscode = require('vscode');
const fetch = require("node-fetch");

var myStatusBarItem;
var hideStatusBar;

// Used to retain a cache instead of calling the web API often
var cachedData;

// Strings used for status bar

const BAR_COLLAPSED = `$(ruby) Click for Comfucius`;
const BAR_LOADING = `$(ruby) Loading... `;
const BAR_ERROR = `$(ruby) No quotes ಥ_ಥ `;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);

	const toggleVis = 'comfucius.toggleVisibility';
	context.subscriptions.push(vscode.commands.registerCommand(toggleVis, () => {
		hideStatusBar = !hideStatusBar;
		if (hideStatusBar)
			myStatusBarItem.text = BAR_COLLAPSED;
			else
			myStatusBarItem.text = BAR_LOADING;
	}));
	myStatusBarItem.command = toggleVis;

	context.subscriptions.push(myStatusBarItem);
	myStatusBarItem.show();
	refreshPhrase();
}

function deactivate() {}

function refreshPhrase(){

	if(cachedData){

		// Pass cloned object to avoid cache clearing while parsing the phrase
		showPharse({...cachedData});

	}
	else{

		// @ts-ignore
		fetch('https://comfucius.xyz/quotes/api/get-fake-quote')
		.then(response => response.json())
		.then(dataFromApi => {

			// Save inside cache data I've retrieved from API...
			cachedData = dataFromApi;

			// ...but also dischange it after a certain amount of time
			setTimeout(()=>{ cachedData = null }, vscode.workspace.getConfiguration().get('comfucius.cacheTtl') * 1000);
			
			showPharse(cachedData);	

		});
	
	}

}

async function showPharse(data){
	
	if (data != null){

		// Build the fake quote from the input data

		let fakeQuote = `${data.Phrase} ~ ${data.Thinker}`;

		if (hideStatusBar)
			myStatusBarItem.text = BAR_COLLAPSED;
		else
			myStatusBarItem.text = `$(megaphone) ${fakeQuote}`;

		var textLength = fakeQuote.length;
		await new Promise(r => setTimeout(r, vscode.workspace.getConfiguration().get('comfucius.startScrollDelay') * 1000));
		while (textLength > 0){
			textLength--;
			fakeQuote = fakeQuote.substring(1);
			if (hideStatusBar)
				myStatusBarItem.text = BAR_COLLAPSED;
			else
				myStatusBarItem.text = `$(megaphone) ${fakeQuote}`;
			await new Promise(r => setTimeout(r, vscode.workspace.getConfiguration().get('comfucius.scrollPerCharacter') * 1000));
		}

	}
	else{
		if (hideStatusBar)
			myStatusBarItem.text = BAR_COLLAPSED;
		else
			myStatusBarItem.text = BAR_ERROR;
		await new Promise(r => setTimeout(r, 10000));
	}	
	setTimeout(refreshPhrase, vscode.workspace.getConfiguration().get('comfucius.timeDelay') * 1000);
}

module.exports = {
	activate,
	deactivate
}
