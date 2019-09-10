const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)

const users=[]

server.listen(8011,()=>{
	console.log('服务器启动成功')
})
// express处理静态资源
app.use(require('express').static('public'))
app.get('/',(req,res)=>{
	res.sendFile(__dirname + '/index.html')
})


// 基于nodejs服务的
io.on('connection',socket => {
	console.log('有新用户连接了')
	// socket.emit方法表示黑浏览器发送数据
	// 监听登录
	socket.on('login',data=>{
		let user = users.find(item => item.userName === data.userName)
		// console.log(data)
		if(user){
			socket.emit('loginErr',{msg:'登录失败'})
		}else{
			users.push(data)
			socket.emit('loginSuc',data)

			// 告诉所有人有新用户加入
			io.emit('addUser',data)

			// 告诉所有用户，当前聊天室有多少人
			io.emit('userList',users)

			// 吧登录成功的用户名存起来
			socket.userName = data.userName
			socket.avatar = data.avatar
		}
	})
	// 用户断开连接的功能
	socket.on('disconnect',()=>{
		let idx = users.findIndex(item=>item.userName === socket.userName)
		// 1、删除离开的人
		users.splice(idx,1)

		io.emit('delUser',{
			userName:socket.userName,
			avatar:socket.avatar
		})
		// 2、告诉所有人userlist发生变数
		io.emit('userList',users)

	})
	// 监听聊天的信息
	socket.on('sendMsg',data=>{
    	console.log(data)
		io.emit('receiveMsg',data)
	})
	// 监听图片的信息
	socket.on('sendImg',data=>{
		io.emit('receiveImg',data)
	})
})