window.app = {
	// 后台服务器地址
	serverUrl:"http://10.200.83.26:8080",
	
	// 图片服务器地址
	imgServerUrl:"http://10.200.83.26:88/yuxin/",
	
	// netty服务器url
	nettyServerUrl: "ws://10.200.83.26:8088/websocket",
	
	/**
	 * 判断字符串是否为空
	 * @param {Object} str
	 * true: 不为空
	 * false：为空
	 */
	isNotNull: function(str) {
		if (str != null && str != "" && str != undefined) {
			return false
		}
		return true
	},
	/**
	 * 封装消息提示框，默认mui的不支持居中和自定义，所以使用h5+
	 * @param {Object} msg
	 * @param {Object} type
	 */
	showToast: function(msg, type) {
		plus.nativeUI.toast(msg, 
		{icon: "/images/" + type + ".png", verticalAlign: "center"})
	},
	
	/**
	 * 保存用户的全局对象
	 * @param {Object} user
	 */
	setUserGlobalInfo: function(user) {
		var userInfoStr = JSON.stringify(user)
		// 通过h5+方法将用户信息保存
		plus.storage.setItem("userInfo", userInfoStr)
	},
	/**
	 * 设置全局对象信息
	 */
	getUserGlobalInfo: function() {
		// 获取信息
		
		 var userInfoStr = plus.storage.getItem("userInfo")
		 return JSON.parse(userInfoStr)
	},
	/**
	 * 用户退出，清除用户全局对象
	 */
	userLogout: function() {
		plus.storage.removeItem("userInfo")
	},
	/**
	 * 缓存用户好友列表
	 * @param {Object} contactList
	 */
	setContactList: function(contactList) {
		var userFirends = JSON.stringify(contactList)
		// 通过h5+方法将用户信息保存
		plus.storage.setItem("userFirends", userFirends)
		
	},
	/**
	 * 返回用户好友列表
	 */
	getContacgList: function() {
		var userFirends = plus.storage.getItem("userFirends")
		if (this.isNotNull(userFirends)) {
			return []
		}
		// console.log(userFirends)
		return JSON.parse(userFirends)
	},
	/**
	 * 根据传入的朋友id 获取朋友的信息
	 * @param {Object} friendId
	 */
	getFriendFromContactList: function(friendId) {
		var userFirends = plus.storage.getItem("userFirends")
		
		if (this.isNotNull(userFirends)) {
			// console.log("用户聊天快照为空")
			return null;
		} else {
			// console.log("准备获取好友信息渲染：" + userFirends)
			var contactList = JSON.parse(userFirends)
			for (var i = 0; i < contactList.length ; i++) {
				var friendUserId = contactList[i].friendUserId;
				if (friendUserId == friendId) {
					// console.log("找到好友信息：" + JSON.stringify(contactList[i]))
					return contactList[i]
					break
				}
			}
		}
	},
	/**
	 * 将已读消息标记为已读
	 * @param {Object} myId
	 * @param {Object} friendId
	 */
	readUserChatSnapshot: function(myId, friendId) {
		var me = this
		var chatKey = "chat-snapshot-" + myId
		// 从本地缓存获取聊天记录快照
		var chatSnapshotListStr = plus.storage.getItem(chatKey)
		var chatSnapshotList;
		if (!me.isNotNull(chatSnapshotListStr)) {
			// 如果不为空
			chatSnapshotList = JSON.parse(chatSnapshotListStr)
			// 循环快照list，并且判断每个元素是否匹配friend，如果匹配，则删除
			for (var i = 0 ; i < chatSnapshotList.length ; i++ ) {
				var item = chatSnapshotList[i]
				if (item.friendId == friendId) {
					// 将对应的消息快照设置为已读
					item.isRead = true
					// 替换原有的快照
					chatSnapshotList.splice(i, 1, item)
					break
				}
			}
			// 替换原有的快照列表
			plus.storage.setItem(chatKey, JSON.stringify(chatSnapshotList))
		} else {
			return
		}
	},
	/**
	 * 保存用户的聊天记录
	 * @param {Object} myId
	 * @param {Object} friendId
	 * @param {Object} msg
	 * @param {Object} flag	// 判断本条消息是我发送的 还是我发送的 1：我发送的  2：朋友发送的
	 */
	saveUserChatHistory: function(myId, friendId, msg, flag) {
		var me = this
		var chatKey = "chat-" + myId + "-" + friendId
		// 从本地缓存获取聊天记录是否存在
		var chatHistoryListStr = plus.storage.getItem(chatKey)
		var chatHistoryList;
		if (!me.isNotNull(chatHistoryListStr)) {
			// 如果不为空
			chatHistoryList = JSON.parse(chatHistoryListStr)
		} else {
			chatHistoryList = []
		}
		// 构建聊天记录对象
		var signleMsg = new me.ChatHistory(myId, friendId, msg, flag)
		
		// 向list中追加msg对象
		chatHistoryList.push(signleMsg)
		plus.storage.setItem(chatKey, JSON.stringify(chatHistoryList))
		// console.log("所有的聊天记录+saveUserChatHistory:" + plus.storage.getItem(chatKey))
	},

	/**
	 * 获取用户聊天记录
	 * @param {Object} myId
	 * @param {Object} friendId
	 */
	getUserChatHistory: function(myId, friendId) {
		var me = this
		var chatKey = "chat-" + myId + "-" + friendId
		// 从本地缓存获取聊天记录是否存在
		var chatHistoryListStr = plus.storage.getItem(chatKey)
		var chatHistoryList;
		if (!me.isNotNull(chatHistoryListStr)) {
			// 如果不为空
			// console.log("聊天记录不为空:" + chatHistoryListStr)
			chatHistoryList = JSON.parse(chatHistoryListStr)
		} else {
			chatHistoryList = []
		}
		return chatHistoryList
	},
	/**
	 * 删除和朋友的聊天记录
	 * @param {Object} myId
	 * @param {Object} friendId
	 */
	deleteUserChatHistory: function(myId, friendId) {
		var chatKey = "chat-" + myId + "-" + friendId
		plus.storage.removeItem(chatKey)
	},
	/**
	 *  保存聊天记录快照 ，仅仅保存和朋友聊天的最后一条消息
	 * @param {Object} myId
	 * @param {Object} friendId
	 * @param {Object} msg
	 * @param {Object} isRead
	 */
	saveUserChatSnapshot: function(myId, friendId, msg, isRead) {
		var me = this
		var chatKey = "chat-snapshot-" + myId
		// 从本地缓存获取聊天记录快照
		var chatSnapshotListStr = plus.storage.getItem(chatKey)
		var chatSnapshotList;
		if (!me.isNotNull(chatSnapshotListStr)) {
			// 如果不为空
			chatSnapshotList = JSON.parse(chatSnapshotListStr)
			// 循环快照list，并且判断每个元素是否匹配friend，如果匹配，则删除
			for (var i = 0 ; i < chatSnapshotList.length ; i++ ) {
				if (chatSnapshotList[i].friendId == friendId) {
					// 删除已存在的friendId所对应的快照对象
					chatSnapshotList.splice(i, 1)
					break
				}
			}
			
		} else {
			chatSnapshotList = []
		}
		// 构建聊天记录快照对象
		var signleMsg = new me.ChatSnapshot(myId, friendId, msg, isRead)
		// 向list数组最前面追加快照对象
		chatSnapshotList.unshift(signleMsg)
		plus.storage.setItem(chatKey, JSON.stringify(chatSnapshotList))

		// console.log("所有的聊天快照+saveUserChatSnapshot:" + plus.storage.getItem(chatKey))
	},
	/**
	 * 获取用户聊天快照记录
	 * @param {Object} myId
	 * @param {Object} friendId
	 */
	getUserChatSnapshot: function(myId) {
		var me = this
		var chatKey = "chat-snapshot-" + myId
		// 从本地缓存获取聊天记录快照
		var chatSnapshotListStr = plus.storage.getItem(chatKey)
		
		var chatSnapshotList;
		if (!me.isNotNull(chatSnapshotListStr)) {
			// 如果不为空
			chatSnapshotList = JSON.parse(chatSnapshotListStr)
		} else {
			chatSnapshotList = []
		}
		// console.log("获取聊天快照+getUserChatSnapshot:" + chatSnapshotListStr)
		// console.log("获取返回快照:" + chatSnapshotList)
		return chatSnapshotList
	},
	/**
	 * 删除本地聊天快照记录
	 * @param {Object} myId
	 * @param {Object} friendId
	 */
	deleteUserChatSnapshot: function(myId, friendId) {
		var me = this
		var chatKey = "chat-snapshot-" + myId
		// 从本地缓存获取聊天记录快照
		var chatSnapshotListStr = plus.storage.getItem(chatKey)
		var chatSnapshotList;
		if (!me.isNotNull(chatSnapshotListStr)) {
			// 如果不为空
			chatSnapshotList = JSON.parse(chatSnapshotListStr)
			// 循环快照list，并且判断每个元素是否匹配friend，如果匹配，则删除
			for (var i = 0 ; i < chatSnapshotList.length ; i++ ) {
				if (chatSnapshotList[i].friendId == friendId) {
					// 删除已存在的friendId所对应的快照对象
					chatSnapshotList.splice(i, 1)
					break
				}
			}
		}
		
		plus.storage.setItem(chatKey, JSON.stringify(chatSnapshotList))
	},
	
	/**
	 * 和后端枚对应
	 */
	CONNECT: 1, 	//"第一次（或重连）初始化连接"),
	CHAT: 2, 		//"聊天消息"),
	SIGNED: 3, 		//"消息签收"),
	KEEPALIVE: 4,	//"客户端保持心跳");
	PULL_FREIND: 5, //"客户端拉取好友"),
	/**
	 * 和后端的聊天模型对应
	 * @param {Object} senderId
	 * @param {Object} receiverId
	 * @param {Object} msg
	 * @param {Object} msgId
	 */
	ChatMsg: function(senderId, receiverId, msg, msgId) {
		this.senduserId = senderId
		this.receiverId = receiverId
		this.msg = msg
		this.msgId = msgId
	},
	/**
	 * 构建消息模型对象
	 * @param {Object} action
	 * @param {Object} chatMsg
	 * @param {Object} extand
	 */
	DataConent: function(action, chatMsg, extand) {
		this.action = action
		this.chatMsg = chatMsg
		this.extand = extand
	},
	/**
	 * 单个聊天记录的对象
	 * @param {Object} myId
	 * @param {Object} friendId
	 * @param {Object} msg
	 * @param {Object} flag
	 */
	ChatHistory: function(myId, friendId, msg, flag) {
		this.myId = myId
		this.friendId = friendId
		this.msg = msg
		this.flag = flag
	},
	/**
	 * 快照对象
	 * @param {Object} myId
	 * @param {Object} friendId
	 * @param {Object} msg
	 * @param {Object} isRead
	 */
	ChatSnapshot: function(myId, friendId, msg, isRead) {
		this.myId = myId
		this.friendId = friendId
		this.msg = msg
		this.isRead = isRead
	}

}