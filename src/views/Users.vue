<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 搜索框 -->
      <el-row :gutter="10">
        <el-col :span="8">
          <el-input placeholder="请输入用户名" v-model="queryInfo.query" clearable @clear="fetchUsers">
            <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="5">
          <el-button type="primary" @click="dialogFormVisible=true">
            <i class="plus"></i>添加用户
          </el-button>
        </el-col>
      </el-row>
      <!-- 添加用户对话框 -->
      <el-dialog title="添加用户" :visible.sync="dialogFormVisible" @close="resetForm">
        <el-form :model="userForm" :rules="addUserRules" ref="addForm">
          <el-form-item label="用户名" label-width="80px" prop="username">
            <el-input v-model="userForm.username" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="密码" label-width="80px" prop="password">
            <el-input v-model="userForm.password" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" label-width="80px" prop="email">
            <el-input v-model="userForm.email" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="手机号" label-width="80px" prop="mobile">
            <el-input v-model="userForm.mobile" auto-complete="off"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </el-dialog>
      <!-- 用户列表 -->
      <el-table :data="users" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="用户名" prop="username"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="changeState(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editUser(scope.row.id)"
            ></el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="changeRoleInfo(scope.row)"
            ></el-button>
            <el-tooltip effect="dark" content="删除按钮" placement="top" :enterable="false">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="deleteUser(scope.row.id)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 修改权限的对话框 -->
      <el-dialog title="提示" :visible.sync="changeRole" width="30%" @close="closeDialog">
        <div>
          <p>用户名：{{userInfo.username}}</p>
          <p>用户角色：{{userInfo.role_name}}</p>
          <p>
            设置角色：
            <el-select v-model="roleid" placeholder="请分配角色">
              <el-option
                v-for="item in roleList"
                :key="item.id"
                :label="item.roleName"
                :value="item.id"
              ></el-option>
            </el-select>
          </p>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="changeRole = false">取 消</el-button>
          <el-button type="primary" @click="submitChangeRole">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 编辑用户对话框 -->
      <el-dialog
        title="编辑用户"
        :visible.sync="editableDialog"
        @close="()=>$refs.editForm.resetFields()"
      >
        <el-form :model="editUserInfo" :rules="editUserRules" ref="editForm">
          <el-form-item label="用户名" label-width="80px">
            <el-input v-model="editUserInfo.username" auto-complete="off" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" label-width="80px" prop="email">
            <el-input v-model="editUserInfo.email" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="手机号" label-width="80px" prop="mobile">
            <el-input v-model="editUserInfo.mobile" auto-complete="off"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="editableDialog = false">取 消</el-button>
          <el-button type="primary" @click="submitEdit">确 定</el-button>
        </div>
      </el-dialog>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Users',
  data() {
    const checkEmail = (rule, value, callback) => {
      const emailRules = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/
      const flag = emailRules.test(value)
      if (!flag) {
        return callback(new Error('邮箱格式不正确'))
      }
    }
    const checkMobile = (rule, value, callback) => {
      const mobileRules = /^(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}$/
      const flag = mobileRules.test(value)
      if (!flag) {
        return callback(new Error('手机号码格式不正确'))
      }
    }
    return {
      users: [],
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      total: 0,
      dialogFormVisible: false,
      userForm: {
        username: '',
        password: '',
        mobile: '',
        email: ''
      },
      addUserRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      editableDialog: false,
      editUserInfo: {},
      editUserRules: {
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      changeRole: false,
      userInfo: {},
      roleList: [],
      roleid: '',
      userId: ''
    }
  },
  created() {
    this.fetchUsers()
  },
  methods: {
    async fetchUsers() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      this.users = res.data.users
      this.total = res.data.total
    },
    handleSizeChange(size) {
      this.$set(this.queryInfo, 'pagesize', size)
      this.fetchUsers()
    },
    handleCurrentChange(num) {
      this.$set(this.queryInfo, 'pagenum', num)
      this.fetchUsers()
    },
    async changeState(data) {
      const { data: res } = await this.$http.put(
        `users/${data.id}/state/${data.mg_state}`
      )
      if (res.meta.status !== 200) {
        data.mg_state = !data.mg_state
        return this.$message.error('更新用户状态失败！')
      }
      this.$message.success('更新用户状态成功')
    },
    search() {
      this.fetchUsers()
    },
    resetForm() {
      this.$refs.addForm.resetFields()
    },
    // 提交用户数据
    async submitForm() {
      const { data: res } = await this.$http.post('users', this.userForm)
      console.log(res)
      if (res.meta.status !== 201) {
        return this.$message.error('添加失败,' + res.meta.msg)
      }
      this.$message.success('添加用户成功')
      this.dialogFormVisible = false
      this.fetchUsers()
    },
    // 编辑用户信息
    async editUser(id) {
      const { data: res } = await this.$http.get(`users/${id}`)
      this.editUserInfo = res.data
      this.editableDialog = true
    },
    // 提交用户修改
    async submitEdit(id) {
      const { data: res } = await this.$http.put(
        `users/${this.editUserInfo.id}`,
        { email: this.editUserInfo.email, mobile: this.editUserInfo.mobile }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('添加失败,' + res.meta.msg)
      }
      this.$message.success('更新用户成功')
      this.editableDialog = false
      this.fetchUsers()
    },
    // 删除用户
    deleteUser(id) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(`users/${id}`)
          if (res.meta.status !== 200) {
            this.$message.error('删除用户失败')
          }
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.fetchUsers()
        })
        .catch(err => {
          this.$message({
            type: 'info',
            message: err + '已取消删除'
          })
        })
    },
    // 设置用户角色
    async changeRoleInfo(role) {
      this.userInfo.username = role.username
      this.userInfo.role_name = role.role_name
      this.userId = role.id
      const { data: res } = await this.$http.get('/roles')
      this.roleList = res.data
      this.changeRole = true
    },
    async submitChangeRole() {
      if (!this.roleid) {
        return this.$message.error('分配角色不能为空')
      }
      const { data: res } = await this.$http.put(`users/${this.userId}/role`, {
        rid: this.roleid
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.$message.success('设置角色成功')
      this.fetchUsers()
      this.changeRole = false
    },
    closeDialog() {
      this.roleid = ''
      this.userInfo = {}
    }
  }
}
</script>

<style scoped>
.el-card {
  margin-top: 20px;
}
.el-table {
  margin: 20px 0;
}
</style>