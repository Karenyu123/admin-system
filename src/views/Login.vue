<template>
  <div class="login">
    <div class="logo">
      <img src="../assets/images/logo.png" alt="">
    </div>
    <el-card class="login-box">
      <h2>用户登录</h2>
      <el-form :model="user" :rules="loginRules" ref="loginForm">
        <el-form-item label="" prop="username">
          <el-input v-model="user.username" placeholder="用户名" prefix-icon="el-icon-bell"></el-input>
        </el-form-item>
         <el-form-item label="" prop="password">
          <el-input v-model="user.password" placeholder="密码" type="password" prefix-icon="el-icon-edit"></el-input>
        </el-form-item>
        <el-form-item label="" class="btn">
          <el-button type="primary" @click="login" size="small" >登录</el-button>
          <el-button type="info" @click="reset" size="small">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data () {
    return {
      user: {
        username: '',
        password: ''
      },
      loginRules: {
        username: [
          { required: true, message: '请输入合法的用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入正确的密码', trigger: 'blur' },
          { min: 6, max: 10, message: '长度在 6 到 10 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    reset () {
      this.$refs.loginForm.resetFields()
    },
    login () {
      this.$refs.loginForm.validate(async valid => {
        if (!valid) return
        const { data } = await this.$http.post('login', this.user)
        if (data.meta.status !== 200) {
          return this.$message.error('登陆失败,用户不存在')
        }
        this.$message.success('登陆成功')
        this.$router.push('/home')
        console.log(data)
        window.sessionStorage.token = data.data.token
      })
    }
  }
}
</script>

<style scoped>
.login {
  background: #778CA3;
  height: 100vh;
  overflow: hidden;
}
.login-box {
  width: 350px;
  height: 300px;
  margin: 100px auto;
  padding-bottom:20px;
  background: #f1f1f1
}
h2 {
  text-align: center;
  margin-bottom: 30px;
}
.btn {
  display: flex;
  justify-content: flex-end;
}
.logo{
  padding: 10px;
  height: 60px;
  position: relative;
  left: 0;
  top: 0;
}
.logo img{
   height: 60px;
}
</style>
