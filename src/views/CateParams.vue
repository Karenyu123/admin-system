<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert title="只允许为三级分类设置参数" type="warning" :closable="false" show-icon></el-alert>
      <div>
        <span>选择商品分类：</span>
        <el-cascader
          :options="cateList"
          v-model="selectedKey"
          :props="cateProps"
          @change="handleChange"
          clearable
        ></el-cascader>
      </div>
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" :disabled="isDisabled" @click="openAddDialog">添加参数</el-button>
          <el-table :data="manyParamsData">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="closeTag(index,scope.row)"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="editParams(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" :disabled="isDisabled" @click="openAddDialog">添加属性</el-button>
          <el-table :data="onlyParamsData">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="closeTag(index,scope.row)"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="editParams(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加属性的对话框 -->
    <el-dialog :title="'添加'+text" :visible.sync="addDialogVisible" width="50%" @close="closeDialog">
      <el-form :model="addObject" :rules="addRules" ref="addForm">
        <el-form-item :label="text" prop="attr_name" label-width="80px">
          <el-input v-model="addObject.attr_name" placeholder="请输入"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑属性的对话框 -->
    <el-dialog :title="'编辑'+text" :visible.sync="editDialogVisible" width="50%">
      <el-form :model="editObject" :rules="addRules" ref="editForm">
        <el-form-item :label="text" prop="attr_name" label-width="80px">
          <el-input v-model="editObject.attr_name" placeholder="请输入"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitEditParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'CateParams',
  data() {
    return {
      cateList: [],
      selectedKey: [],
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      activeName: 'many',
      onlyParamsData: [],
      manyParamsData: [],
      addObject: {
        attr_name: ''
      },
      addRules: {
        attr_name: [
          { required: true, message: '请输入活动名称', trigger: 'blur' }
        ]
      },
      addDialogVisible: false,
      editDialogVisible: false,
      editObject: {
        attr_name: ''
      }
    }
  },
  created() {
    this.fetchCateList()
  },
  computed: {
    isDisabled() {
      if (this.selectedKey.length === 3) {
        return false
      }
      return true
    },
    text() {
      return this.activeName === 'only' ? '静态属性' : '动态参数'
    }
  },
  methods: {
    async fetchCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据失败')
      }
      this.cateList = res.data
    },
    handleChange() {
      if (this.selectedKey.length !== 3) {
        this.selectedKey = []
        this.$message.warning('请选择三级分类')
      }
      this.fetchParams()
    },
    handleTabClick() {
      this.fetchParams()
    },
    async fetchParams() {
      if (this.selectedKey.length !== 3) {
        this.selectedKey = []
        this.manyParamsData = []
        this.onlyParamsData = []
        return
      }
      const id = this.selectedKey[2]
      const { data: res } = await this.$http.get(
        `categories/${id}/attributes`,
        {
          params: { sel: this.activeName }
        }
      )
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputVisible = false
        item.inputValue = ''
        return item
      })
      if (this.activeName === 'only') {
        this.onlyParamsData = res.data
      } else {
        this.manyParamsData = res.data
      }
    },
    openAddDialog() {
      this.addDialogVisible = true
    },
    submitParams() {
      this.$refs.addForm.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.selectedKey[2]}/attributes`,
          { attr_name: this.addObject.attr_name, attr_sel: this.activeName }
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加失败')
        }
        this.$message.success('添加成功')
        this.fetchParams()
      })
      this.addDialogVisible = false
    },
    closeDialog() {
      this.$refs.addForm.resetFields()
    },
    async editParams(aid) {
      const { data: res } = await this.$http.get(
        `categories/${this.selectedKey[2]}/attributes/${aid}`,
        {
          params: { attr_sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数失败')
      }
      this.editObject = res.data
      this.editDialogVisible = true
    },
    submitEditParams() {
      this.$refs.editForm.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.selectedKey[2]}/attributes/${
            this.editObject.attr_id
          }`,
          {
            attr_name: this.editObject.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改失败')
        }
        this.$message.success('修改成功')
        this.fetchParams()
      })
      this.editDialogVisible = false
    },
    // 删除参数
    removeParams(id) {
      this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(
            `categories/${this.selectedKey[2]}/attributes/${id}`
          )
          if (res.meta.status !== 200) {
            return this.$message.error('删除参数失败')
          }
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.fetchParams()
        })
        .catch(err => {
          this.$message({
            type: 'info',
            message: err + '已取消删除'
          })
        })
    },
    // input显示后的回调
    handleInputConfirm(row) {
      // 如果没有有效内容，在失去焦点的时候变回按钮，清空内容
      if (!row.inputValue.trim()) {
        row.inputVisible = false
        row.inputValue = ''
        return false
      }
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.getAttrVal(row)
    },
    // 删除标签
    closeTag(i, row) {
      row.attr_vals.splice(i, 1)
      this.getAttrVal(row)
    },
    // 存储添加和修改后的参数
    async getAttrVal(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.selectedKey[2]}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: this.activeName,
          attr_vals: row.attr_vals.join(',')
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('操作失败')
      }
      this.$message.success('操作成功')
      row.inputVisible = false
    },
    showInput(row) {
      row.inputVisible = true
      // 再次渲染dom时调用，获得焦点
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    }
  }
}
</script>

<style scoped>
.el-cascader {
  margin: 20px 0;
}
.el-tag {
  margin: 0 10px;
}
.input-new-tag {
  width: 120px;
}
</style>