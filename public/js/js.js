// 1、链接socket
let socket = io('http://localhost:8011')
let userName,avatar;
function scrollIntoView(){
	// 当前元素的底部滚动到可视区
	$('.box-bd').children(':last').get(0).scrollIntoView(false)
}
function systemMsg(data,state){
	let str = state ? '加入':'离开'
	$('.box-bd').append(`
		<div class="system">
			<p class="message_system">
				<span class="content">${data.userName}${str}了群聊</span>
			</p>
		</div>
	`)
}
// 2、登录功能
$('#login_avatar li').on('click',function(){
	$(this)
	.addClass('now')
	.siblings()
	.removeClass('now')
})
// 点击登录
$('#loginBtn').on('click',function(){
	let userName = $('#userName').val().trim()
	if(!userName){
		alert('请输入昵称！')
		return
	}
	// 获取图像
	let avatar = $('#login_avatar li.now img').attr('src')

	// 需要告诉socket io服务 登录
	socket.emit('login',{
		userName:userName,
		avatar:avatar
	})
})
// 监听登录失败的请求
socket.on('loginErr',data=>{
	alert('用户名已存在')
})
// 监听登录成功的请求
socket.on('loginSuc',data=>{
	// 显示聊天窗口，隐藏登录窗口
	$('.login_box').fadeOut()
	$('.container').fadeIn()
	// 设置个人信息
	$('.user-list .myImg').attr('src',data.avatar)
	$('.user-list .myName').text(data.userName)

	userName = data.userName
	avatar = data.avatar
})
// 监听添加用户的信息
socket.on('addUser',data=>{
	// 添加一条系统消息-加入群聊
	systemMsg(data,1)
	scrollIntoView()
})
// 监听添加用户列表的信息
socket.on('userList',data=>{
	// 那userList的数据动态熏染到左侧菜单
	$('.user-list ul').html('')
	data.forEach(item =>{
		$('.user-list ul').append(`
			<li class="user">
				<div class="avatar">
					<img class="avatar_url" src="${item.avatar}">
					<div class="userName">${item.userName}</div>
				</div>
			</li>
		`)
	})
	$('#userCount').text(data.length)
})
// 监听添加用户离开的的信息
socket.on('delUser',data=>{
	// 添加一条系统消息-离开群聊
	systemMsg(data,0)
	scrollIntoView()
})
// 聊天功能
$('#btn-send').on('click',function(){
	// let content = $('#content').val().trim()
	let content = $('#content').html()
	$('#content').html('')
	if(!content) return alert('请输入内容')

	// 发生给服务器
	socket.emit('sendMsg',{
		msg:content,
		userName:userName,
		avatar:avatar
		
	})
})
// jianting聊天信息
socket.on('receiveMsg',data=>{
	// 把接受的消息显示到聊天窗口中
	if(data.userName === userName){
		$('.box-bd').append(`
			<div class="message-box">
				<div class="my message">
					<img class='avatar' src="${data.avatar}">
					<div class="content">
						<div class="bubble">
							<div class="bubble_cont">${data.msg}</div>
						</div>
					</div>
				</div>
			</div>
		`)
	}else{
		$('.box-bd').append(`
			<div class="message-box">
				<div class="other message">
					<img class='avatar' src="${data.avatar}">
					<div class="content">
						<div class="nickname">${data.userName}</div>
						<div class="bubble">
							<div class="bubble_cont">${data.msg}</div>
						</div>
					</div>
				</div>
			</div>
		`)
	}
	scrollIntoView()
})
// 监听图片信息
socket.on('receiveImg',data=>{
	// 把接受的消息显示到聊天窗口中
	if(data.userName === userName){
		$('.box-bd').append(`
			<div class="message-box">
				<div class="my message">
					<img class='avatar' src="${data.avatar}">
					<div class="content">
						<div class="bubble">
							<img src="${data.img}">
						</div>
					</div>
				</div>
			</div>
		`)
	}else{
		$('.box-bd').append(`
			<div class="message-box">
				<div class="other message">
					<img class='avatar' src="${data.avatar}">
					<div class="content">
						<div class="nickname">${data.userName}</div>
						<div class="bubble">
							<img src="${data.img}">
						</div>
					</div>
				</div>
			</div>
		`)
	}
	// 等待图片加载完成在滚动到底部
	$('.box-bd img:last').on('load',function(){
		scrollIntoView()
	})
})
// 发送图片功能
$('#file').on('change',function(){
	let file = this.files[0]
	// 需要把这个文件发送到服务器，借助H5新增的fileReader
	let fr = new FileReader()
	fr.readAsDataURL(file)
	fr.onload = function(){
		socket.emit('sendImg',{
			userName:userName,
			avatar:avatar,
			img:fr.result
		})
	}
})
// 初始化jquery-emoji插件
$('.face').on('click',function(){
	$('#content').emoji({
		// 设置触发表情的按钮
		button: ".face",
		showTab: false,
		animation: 'slide',
		position: 'topRight',
	    icons: [{
	        name: "QQ表情",
	        path: "src/img/qq/",
	        maxNum: 91,
	        excludeNums: [41, 45, 54],
	        file: ".gif"
	    }]
	})
})


