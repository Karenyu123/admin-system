<template>
  <div>
    <el-container>
      <el-header>
          <img src="../assets/images/logo.png" alt="" class="logo">
          <el-button type="info" size="small" @click="logout">退出</el-button>
      </el-header>
        <el-container>
        <el-aside width="200px" >
          <el-menu :default-active="currentPath" unique-opened background-color="#a5b1c2" router >
            <el-submenu :index="index+''" v-for="(item,index) in menu" :key="item.id">
              <template slot="title">
                <i class="el-icon-menu"></i>
                {{item.authName}}
                </template>
                <el-menu-item :index="'/'+submenu.path" v-for="(submenu) in item.children" :key="submenu.id" @click="getPath('/'+submenu.path)"><i class="el-icon-goods"></i>{{submenu.authName}}</el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <el-container>
        <el-main >
          <router-view></router-view>
        </el-main>
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data () {
    return {
      menu: [],
      currentPath: ''
    }
  },
  created () {
    this.fetchMenu()
    this.currentPath = window.sessionStorage.getItem('current_path')
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.replace('/login')
    },
    async fetchMenu () {
      const { data: res } = await this.$http.get('menus')
      this.menu = res.data
    },
    getPath (path) {
      window.sessionStorage.setItem('current_path', path)
    }
  }
}
</script>

<style scoped>
.el-container {
    height: 100vh;
    box-sizing: border-box;
    overflow: hidden;
}
.el-header {
  background: #778ca3;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 30px;
}
.el-aside {
  background: #a5b1c2;
}
.el-main {
  background: #f1f1f1;
}
.el-menu {
  border-right: none;
}
.logo{
  height: 50px;
}
</style>
