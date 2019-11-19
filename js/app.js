window.app = {
	// 后台服务地址
	serverUrl: "http://188.188.188.104:8080",
	// serverUrl: "http://192.168.1.102:8080",
	// 图片服务器地址
	imgServerUrl: "http://45.76.70.131:8888/group1/",
	// websocket服务器地址
	wsServerUrl: "ws://188.188.188.104:8088/ws",
	// wsServerUrl: "ws://192.168.1.102:8088/ws",
	// 通过好友请求消息常量
	FRIEND_REQUEST_PASS_STRING: "我们已经是好友了,可以开始聊天了.",
	
	/**
	 * 判断是否为空，返回true不为空，false则为空
	 * @param {Object} str
	 */
	isNotNull: function(str) {
		if (str != null && str != "" && str != undefined) {
			return true;
		}
		return false;
	},
	
	/**
	 * 封装消息提示框
	 * @param {Object} msg
	 * @param {Object} type
	 */
	showToast: function(msg, type) {
		plus.nativeUI.toast(msg, {icon:"image/" + type + ".png", verticalAlign:"center"})
	},
	
	/**
	 * 保存用户全局信息到缓存中
	 * @param {Object} userInfo
	 */
	setGlobalUserInfo: function(userInfo) {
		plus.storage.setItem("userInfo", JSON.stringify(userInfo));
	},
	
	/**
	 * 从缓存中获取用户全局信息，返回字符串
	 */
	getGlobalUserInfo: function() {
		return plus.storage.getItem("userInfo");
	},
	
	/**
	 * 从缓存中获取用户全局信息，直接返回json对象
	 */
	getGlobalUserInfoJson: function() {
		var userInfoStr = plus.storage.getItem("userInfo");
		return JSON.parse(userInfoStr);
	},
	
	/**
	 * 从缓存中清除用户全局信息
	 */
	removeGlobalUserInfo: function() {
		return plus.storage.removeItem("userInfo");
	},
	
	/**
	 * 获取用户头像图片，如果没有则取默认图片
	 * @param {Object} faceImg
	 */
	getUserFaceImg: function(faceImg) {
		var that = this;
		var result = "image/face-default-cat.png";
		if (that.isNotNull(faceImg)) {
			var isHttp = new RegExp("^http.*$").test(faceImg);
			if (isHttp) {
				return faceImg;
			}
			
			var isDefault = new RegExp("^image.*$").test(faceImg);
			if (isDefault) {
				return result;
			}
			return that.imgServerUrl + faceImg;
		}
		return result;
	},
	
	/**
	 * 保存用户好友列表信息到缓存中
	 * @param {Object} userInfo
	 */
	setFriendsList: function(friendsListStr) {
		plus.storage.setItem("friendsList", JSON.stringify(friendsListStr));
	},
	
	/**
	 * 从缓存中获取用户好友列表信息，返回json对象
	 */
	getFriendsList: function() {
		var friendsListStr = plus.storage.getItem("friendsList");
		return JSON.parse(friendsListStr);
	},
	
	/**
	 * 保存聊天记录
	 * @param {Object} myId
	 * @param {Object} friendId
	 * @param {Object} msg
	 * @param {Object} flag	1:我发送的，2:朋友发送的
	 */
	saveChatMessage: function(myId, friendId, msg, flag) {
		var that = this;
		// 构建单条消息对象实体
		var singleMsgPojo = new that.singleMsgPojo(myId, friendId, msg, flag);
		// 存储的key
		var storageKey = myId + "-" + friendId;
		var chatMsgListStr = plus.storage.getItem(storageKey);
		var chatMsgList = null;
		if (that.isNotNull(chatMsgListStr)) {
			chatMsgList = JSON.parse(chatMsgListStr);
		} else {
			chatMsgList = [];
		}
		chatMsgList.push(singleMsgPojo);
		plus.storage.setItem(storageKey, JSON.stringify(chatMsgList));
	},
	
	/**
	 * 删除聊天记录
	 * @param {Object} myId
	 * @param {Object} friendId
	 */
	deleteChatHistory: function(myId, friendId) {
		// 存储的key
		var storageKey = myId + "-" + friendId;
		plus.storage.removeItem(storageKey);
	},
	
	/**
	 * 获取聊天记录
	 * @param {Object} myId
	 * @param {Object} friendId
	 */
	getChatMessage: function(myId, friendId) {
		var that = this;
		var storageKey = myId + "-" + friendId;
		var chatMsgListStr = plus.storage.getItem(storageKey);
		
		var chatMsgList = null;
		if (that.isNotNull(chatMsgListStr)) {
			chatMsgList = JSON.parse(chatMsgListStr);
		} else {
			chatMsgList = [];
		}
		return chatMsgList;
	},
	
	/**
	 * 保存聊天记录的快照，只保存与朋友聊天的最后一条消息
	 * @param {Object} myId
	 * @param {Object} friendId
	 * @param {Object} msg
	 * @param {Object} isRead	消息是否已读 true：已读，false：未读
	 */
	saveChatSnapshot: function(myId, friendId, msg, isRead) {
		var that = this;
		var storageKey = "xChat-" + myId;
		var snapshotListStr = plus.storage.getItem(storageKey);
		var singleSnapshot = new that.singleSnapshotPojo(myId, friendId, msg, isRead);
		var snapshotList = null;
		if (that.isNotNull(snapshotListStr)) {
			snapshotList = JSON.parse(snapshotListStr);
			for (var i = 0, size = snapshotList.length; i < size; i++) {
				var ss = snapshotList[i];
				if (ss.friendId == friendId) {
					// 清除原来的聊天快照
					snapshotList.splice(i, 1);
					break;
				}
			}
		} else {
			snapshotList = [];
		}
		snapshotList.unshift(singleSnapshot);
		plus.storage.setItem(storageKey, JSON.stringify(snapshotList));
	},
	
	/**
	 * 删除本地的聊天快照记录
	 * @param {Object} myId
	 * @param {Object} friendId
	 */
	deleteChatSnapshot: function (myId, friendId) {
		var that = this;
		var storageKey = "xChat-" + myId;
		var snapshotListStr = plus.storage.getItem(storageKey);
		if (that.isNotNull(snapshotListStr)) {
			snapshotList = JSON.parse(snapshotListStr);
			for (var i = 0, size = snapshotList.length; i < size; i++) {
				var ss = snapshotList[i];
				if (ss.friendId == friendId) {
					// 清除原来的聊天快照
					snapshotList.splice(i, 1);
					break;
				}
			}
		} else {
			return;
		}
		plus.storage.setItem(storageKey, JSON.stringify(snapshotList));
	},
	
	/**
	 * 获取聊天记录的快照
	 * @param {Object} myId
	 */
	getChatSnapshot: function(myId) {
		var that = this;
		var storageKey = "xChat-" + myId;
		var snapshotListStr = plus.storage.getItem(storageKey);
		var snapshotList = null;
		if (that.isNotNull(snapshotListStr)) {
			snapshotList = JSON.parse(snapshotListStr);
		} else {
			snapshotList = [];
		}
		return snapshotList;
	},
	
	/**
	 * 将未读消息状态变为已读
	 */
	changeMsgToRead: function(myId, friendId) {
		var that = this;
		var chatSnapshotList = that.getChatSnapshot(myId);
		var size = chatSnapshotList.length;
		if (size > 0) {
			for (var i = 0; i < size; i++) {
				var chatSnapshot = chatSnapshotList[i];
				var fId = chatSnapshot.friendId;
				if (fId == friendId) {
					chatSnapshot.isRead = true;
					// 将原来的聊天快照替换掉
					chatSnapshotList.splice(i, 1, chatSnapshot);
					break;
				}
			}
			// 保存聊天快照
			var storageKey = "xChat-" + myId;
			plus.storage.setItem(storageKey, JSON.stringify(chatSnapshotList));
		}
	},
	
	/**
	 * 从localstorage中获取缓存的朋友对象
	 * @param {Object} friendId
	 */
	getFriendFromStorage: function(friendId) {
		var that = this;
		var friendList = that.getFriendsList();
		for (var i = 0, size = friendList.length; i < size; i++) {
			var friend = friendList[i];
			if (friend.id == friendId) {
				return friend;
			}
		}
		return null;
	},
	
	/**
	 * 单条快照对象
	 * @param {Object} myId
	 * @param {Object} friendId
	 * @param {Object} msg
	 * @param {Object} isRead
	 */
	singleSnapshotPojo: function(myId, friendId, msg, isRead) {
		this.myId = myId;
		this.friendId = friendId;
		this.msg = msg;
		this.isRead = isRead;
	},
	
	/**
	 * 单条消息对象
	 * @param {Object} myId
	 * @param {Object} friendId
	 * @param {Object} msg
	 * @param {Object} flag
	 */
	singleMsgPojo: function(myId, friendId, msg, flag) {
		this.myId = myId;
		this.friendId = friendId;
		this.msg = msg;
		this.flag = flag;
	},
	
	/**
	 * 和后端枚举对应
	 */
	CONNECT: 1, 	// "第一次（或重连）初始化连接"
	CHAT: 2, 		// "聊天消息"
	SIGN: 3, 		// "签收消息"
	KEEPALIVE:4, 	// "客户端保持心跳"
	PULL_FRIENDS:5, // "重新拉取好友"
	
	MsgPojo: function(senderId, receiverId, msg, msgId) {
		this.senderId = senderId;
		this.receiverId = receiverId;
		this.msg = msg;
		this.msgId = msgId;
	},
	
	DataContent: function (action, msgPojo, extend) {
		this.action = action;
		this.msgPojo = msgPojo;
		this.extend = extend;
	},
};

