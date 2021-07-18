
const vscode = require('vscode');
const fetch = require("node-fetch");

var myStatusBarItem;
var hideStatusBar;
var stopRefresh;
var phrase;
var thinker;

// Strings used for status bar

const BAR_COLLAPSED = `$(ruby) Click for Comfucius`;
const BAR_LOADING = `$(ruby) Loading... `;
const BAR_ERROR = `$(ruby) No quotes ಥ_ಥ `;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);

	const toggleVis = 'phrase.toggleVisibility';
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
	RefreshPhrase();
}

function deactivate() {}

function RefreshPhrase(){
	// @ts-ignore
	fetch('https://comfucius.xyz/quotes/api/get-fake-quote')
	.then(response => response.json())
	.then(data => 
		{
			ShowPharse(data);	
		});
}

async function ShowPharse(data){
	if (data != null){
		phrase = data.Phrase;
		thinker = data.Thinker;
		if (hideStatusBar)
			myStatusBarItem.text = BAR_COLLAPSED;
		else
			myStatusBarItem.text = `$(megaphone) ${phrase}`;
		var textLength = phrase.length;
		await new Promise(r => setTimeout(r, vscode.workspace.getConfiguration().get('phrase.startScrollDelay') * 1000));
		while (textLength > 0){
			textLength--;
			phrase = phrase.substring(1);
			if (hideStatusBar)
				myStatusBarItem.text = BAR_COLLAPSED;
			else
				myStatusBarItem.text = `$(megaphone) ${phrase}`;
			await new Promise(r => setTimeout(r, vscode.workspace.getConfiguration().get('phrase.scrollPerCharacter') * 1000));
		}
		
		await new Promise(r => setTimeout(r, 1500));
		if (hideStatusBar)
			myStatusBarItem.text = BAR_COLLAPSED;
		else
			myStatusBarItem.text = `$(megaphone) ~ by ${thinker}`;
	}
	else{
		if (hideStatusBar)
			myStatusBarItem.text = BAR_COLLAPSED;
		else
			myStatusBarItem.text = BAR_ERROR;
		await new Promise(r => setTimeout(r, 10000));
	}	
	setTimeout(RefreshPhrase, vscode.workspace.getConfiguration().get('phrase.timeDelay') * 1000);
}

module.exports = {
	activate,
	deactivate
}
