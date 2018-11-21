function injectCustomJs(){
    jsPath = 'js/inject.js';
    var temp = document.createElement('script');
    temp.setAttribute('type', 'text/javascript');
    // 获得的地址类似：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
    temp.src = chrome.extension.getURL(jsPath);
    temp.onload = function()
    {
        // 放在页面不好看，执行完后移除掉
        this.parentNode.removeChild(this);
    };
    document.head.appendChild(temp);
}
// injectCustomJs();

let storage = chrome.storage.sync || chrome.storage.local;

function inject() {
    if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
    }
    chrome.tabs.executeScript(null, { file: 'js/inject.js', allFrames: true });
    console.log('Injector executed.');
}

function checkAutoInject() {
    console.log('Initing...');
    // storage.get({
    //     server: '',
    //     autoActivate: false
    // }, item => {
    //     if (item.autoActivate) {
    chrome.webNavigation.onCompleted.addListener(inject, { url: [
        { urlMatches: '(?:^|\.)(qq\.com)(?:\/|$)' }
    ]});
    //         console.log('Auto injector bound.');
    //     } else {
    //         if (chrome.webNavigation.onCompleted.hasListener(inject)) {
    //             chrome.webNavigation.onCompleted.removeListener(inject);
    //             console.log('Auto injector removed.');
    //         }
    //     }
    // });
}

chrome.runtime.onMessage.addListener((message, sender, respond) => {
    if (message.event === 'optionschange') {
        console.log('Options changed and re-init...');
        checkAutoInject();
        respond({ success: true });
    }
});

// chrome.browserAction.onClicked.addListener(inject);
// console.log('Action injector bound.');
checkAutoInject();

