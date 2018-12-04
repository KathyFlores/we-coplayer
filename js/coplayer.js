(function() {
  'use strict';
  if (window !== top) {
    return;
  }
  let id = 'we-coplayer';
  if (get(id)) {
    return;
  }

  // Supported websites: Youku, SohuTV, Tudou, TencentVideo, iQiyi, YouTube
  let host = location.host.match(/(?:^|\.)(youku\.com|sohu\.com|tudou\.com|v\.qq\.com|iqiyi\.com|youtube\.com|acfun\.tv|bilibili\.com|le\.com|vimeo\.com)(?:\/|$)/i);
  if (!host) {
    return;
  }
  host = host[1].split('.')[0];

  /**
   * Common utilis
   */
  function getId(part) {
    return id + '-' + part;
  }

  function get(id) {
    return top.document.getElementById(id);
  }

  function query(selector, elem) {
    elem = elem || document;
    return elem.querySelector(selector);
  }

  function queryAll(selector, elem) {
    elem = elem || document;
    return elem.querySelectorAll(selector);
  }

  function attr(elem, name, value) {
    if (value !== undefined) {
      elem.setAttribute(name, value);
    } else {
      return elem.getAttribute(name);
    }
  }

  function create(tagName, parent, props) {
    let elem = document.createElement(tagName);
    for (let prop in props) {
      elem[prop] = props[prop];
    }
    if (parent) {
      parent.appendChild(elem);
    }
    return elem;
  }

  function getDefined(...args) {
    return args.find(val => val !== undefined);
  }

  function pick(obj, ...props) {
    return props.reduce((result, current) => {
      result[current] = obj[current];
      return result;
    }, {});
  }

  function on(elem, type, listener, noStop) {
    let prefixes = ['', 'webkit', 'moz'];
    let prefix = prefixes.find(prefix => elem['on' + prefix + type] !== undefined);
    elem.addEventListener(prefix + type, function (e) {
      listener.call(elem, e);
      if (!noStop) {
          e.preventDefault();
          e.stopPropagation();
      }
      return !!noStop;
    }, false);
  }

  function off(elem, type, listener) {
    let prefixes = ['', 'webkit', 'moz'];
    let prefix = prefixes.find(prefix => elem['on' + prefix + type] !== undefined);
    elem.removeEventListener(prefix + type, listener);
  }

  function getReqUrl() {
    const pathname = window.location.pathname;
    const search = window.location.search;
    if (search) {
      return pathname + search + '&randKey=' + Math.random();
    }
    return pathname + '?randKey=' + Math.random();
  }

  function getTimeSeconds(timeStr) {
    const arr = timeStr.split(':').reverse();
    return (+arr[0] || 0) + (+arr[1] || 0) * 60 + (+arr[2] || 0) * 3600;
  }

  function isPlayTime(now, inputTime) {
    const arr = inputTime.split(':');
    if(arr.length !== 3) {
      alert("开始播放的时间格式错误！请参考'1:20:01', '00:19:21', '00:00:38'输入！");
    }
    const nowTimeString = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
    return getTimeSeconds(nowTimeString) >= getTimeSeconds(inputTime);
  }

  var player = top.PLAYER;
  var interval = null;
  function ajax(playTime) {
    var xhr = null;
    if (window.XMLHttpRequest) {
      xhr = new window.XMLHttpRequest();
    } else { // ie
      xhr = new ActiveObject("Microsoft")
    }
    // 通过get的方式请求当前文件
    xhr.open("get", getReqUrl(), false);
    xhr.send(null);
    // 监听请求状态变化
    // xhr.onreadystatechange = function() {
      var time = null, now = null;
      if (xhr.readyState === 2) {
        // 获取响应头里的时间戳
        time = xhr.getResponseHeader("Date");
        now = new Date(time);
        if(isPlayTime(now, playTime)) {
          console.log("play");
          player.play();
          clearInterval(interval);
        }
      }
    // }
  }

  function handlePlay(seekTime, playTime) {
    player.seekTo(seekTime);
    player.pause();
    interval = setInterval(function() {
      // ajax(playTime);
      let d = new Date();
      console.log(d);
      if(!compareTime(d, playTime)) {
        console.log("play");
        player.play();
        clearInterval(interval);
      }
    }, 300);
  }

  function compareTime(now, inputTime) {
    // return true if inputTime has not come
    const arr = inputTime.split(':');
    if(arr.length !== 3) {
      alert("开始播放的时间格式错误！请参考'1:20:01', '00:19:21', '00:00:38'输入！");
      return false;
    }
    const nowTimeString = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
    return getTimeSeconds(inputTime) >= getTimeSeconds(nowTimeString);
  }
  
  function isPlayTimeValid(playTime) {
    // var xhr = null;
    // if (window.XMLHttpRequest) {
    //   xhr = new window.XMLHttpRequest();
    // } else { // ie
    //   xhr = new ActiveObject("Microsoft")
    // }
    // xhr.open("get", getReqUrl());
    // xhr.send(null);
    // xhr.onreadystatechange = function() {
    //   var time = null, now = null;
    //   if (xhr.readyState === 2) {
    //     // 获取响应头里的时间戳
    //     time = xhr.getResponseHeader("Date");
    //     now = new Date(time);
    //     console.log(compareTime(now, playTime));
    //     return compareTime(now, playTime);
    //   }
    // }
    return compareTime(new Date(), playTime);
  }

  function initUi() {
    let main = create('article', document.body, {
      id: id,
      className: 'article-main'
    });
    let local = create('input', main, {
      id: getId('local'),
      type: 'text',
      placeholder: "输入视频播放时间，例如'1:20:01', '19:21', '38'",
      // readOnly: true
    });
    // on(local, 'focus', function () {
    //     this.select();
    // });
    on(local, 'click', () => {});
    let remote = create('input', main, {
      id: getId('remote'),
      type: 'text',
      placeholder: "输入希望视频开始播放的时间（当天），例如'22:00:00', '00:11:00'",
      // readOnly: true
    });
    on(remote, 'click', () => {});
    let syncBtn = create('button', main, {
      id: getId('sync-btn'),
      innerHTML: 'sync'
    });
    on(syncBtn, 'click', () => {
      // getTime();
      if (interval) {
        clearInterval(interval);
      }
      const seekTime = getTimeSeconds(local.value);
      if (seekTime > player.getDuration()) {
        alert('视频播放时间超出视频时长，请重新输入！');
        return;
      }
      const playTime = remote.value;
      if (!isPlayTimeValid(playTime)) {
        alert('当前时间已超过期望开始播放时间，请重新输入！');
        return;
      }
      if (seekTime && playTime) {
        handlePlay(seekTime, playTime);
      } else {
        alert('请输入视频播放时间与开始播放时间！');
      }
    });
  }
  
  initUi();
})();