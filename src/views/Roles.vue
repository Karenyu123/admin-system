<template>
  <div>
    <el-card>
      <el-row>
        <el-col :span="5">
          <el-button type="primary">添加角色</el-button>
        </el-col>
        <el-table :data="roleList" border stripe>
          <el-table-column type="expand">
            <template slot-scope="scope">
              <el-row v-for="(item1) in scope.row.children" :key="item1.id" class="bt center">
                <el-col :span="5">
                  <el-tag closable @close="removeRights(scope.row,item1.id)">{{item1.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <el-col :span="19">
                  <el-row
                    v-for="(item2,index2) in item1.children"
                    :key="item2.id"
                    :class="[index2===0?'':'bt','center']"
                  >
                    <el-col :span="8">
                      <el-tag
                        type="success"
                        closable
                        @close="removeRights(scope.row,item2.id)"
                      >{{item2.authName}}</el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <el-col :span="16">
                      <el-tag
                        type="warning"
                        v-for="(item3) in item2.children"
                        :key="item3.children"
                        closable
                        @close="removeRights(scope.row,item3.id)"
                      >{{item3.authName}}</el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
          <el-table-column type="index"></el-table-column>
          <el-table-column label="角色名称" prop="roleName"></el-table-column>
          <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
          <el-table-column label="操作" width="350px">
            <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="openRightsDialog(scope.row)"
              >分配权限</el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-dialog title="设置权限" :visible.sync="rightsDialog" width="30%" @close="closeDialog">
          <el-tree
            :data="rightsList"
            :props="defaultProps"
            default-expand-all
            show-checkbox
            node-key="id"
            :default-checked-keys="checkedRights"
            ref="rightsTree"
          ></el-tree>
          <span slot="footer" class="dialog-footer">
            <el-button @click="rightsDialog = false">取 消</el-button>
            <el-button type="primary" @click="submitRights">确 定</el-button>
          </span>
        </el-dialog>
      </el-row>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Roles',
  data() {
    return {
      roleList: [],
      rightsDialog: false,
      rightsList: [],
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      checkedRights: [],
      roleId: ''
    }
  },
  created() {
    this.fetchRoles()
  },
  methods: {
    async fetchRoles() {
      const { data: res } = await this.$http.get('roles')
      this.roleList = res.data
    },
    removeRights(role, rightid) {
      this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(
            `roles/${role.id}/rights/${rightid}`
          )
          if (res.meta.status !== 200) {
            return this.$message.error('删除权限失败')
          }
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          role.children = res.data
        })
        .catch(err => {
          this.$message({
            type: 'info',
            message: err + '已取消删除'
          })
        })
    },
    async openRightsDialog(role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      this.rightsList = res.data
      this.fetchCheckedRights(role, this.checkedRights)
      this.rightsDialog = true
    },
    // 获取选中的权限
    fetchCheckedRights(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.fetchCheckedRights(item, arr)
      })
    },
    closeDialog() {
      this.checkedRights = []
    },
    async submitRights() {
      const keys = [
        ...this.$refs.rightsTree.getCheckedKeys(),
        ...this.$refs.rightsTree.getHalfCheckedKeys()
      ]
      const rids = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: rids }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('更新数据失败')
      }
      this.$message.success('更新数据成功')
      this.fetchRoles()
      this.rightsDialog = false
    }
  }
}
</script>

<style scoped>
.el-tag {
  margin: 10px 5px;
}
.bt {
  border-top: 1px solid #ebeef5;
}
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>