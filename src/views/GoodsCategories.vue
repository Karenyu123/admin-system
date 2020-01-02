<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col :span="5">
          <el-button type="primary" @click="addCate">添加商品</el-button>
        </el-col>
      </el-row>
      <table-tree
        class="table"
        :data="categoryList"
        :columns="columns"
        border
        stripe
        :expand-type="false"
        :selection-type="false"
        :show-index="true"
        index-text="#"
      >
        <template slot-scope="scope" slot="isok">
          <i
            class="el-icon-success"
            style="color:yellowgreen"
            v-if="!scope.row.cat_deleted"
          ></i>
          <i class="el-icon-error" style="color:red" v-else></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            type="success"
            size="mini"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <template slot="option">
          <el-button type="primary" icon="el-icon-edit" size="mini"
            >编辑</el-button
          >
          <el-button type="danger" icon="el-icon-delete" size="mini"
            >删除</el-button
          >
        </template>
      </table-tree>
      <!-- 分页功能 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="cateDialogVisible"
      width="50%"
      @close="cateClose"
    >
      <el-form :model="cateList" :rules="cateRules" ref="cateForm">
        <el-form-item label="分类名称" prop="cat_name" label-width="80px">
          <el-input
            v-model="cateList.cat_name"
            placeholder="请输入商品分类名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="父级分类" label-width="80px">
          <el-cascader
            :options="cateOptions"
            v-model="selectedCate"
            @change="handleCateChange"
            :props="cateProps"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'GoodsCategories',
  data() {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      categoryList: [],
      total: 0,
      columns: [
        {
          label: '商品名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'option'
        }
      ],
      cateDialogVisible: false,
      cateRules: {
        cat_name: [
          { required: true, message: '请输入活动名称', trigger: 'blur' }
        ]
      },
      cateList: {
        cat_name: '',
        cat_level: 0, // 默认要添加分类的等级为一级
        cat_pid: 0 // 默认要添加的父分类的id为0
      },
      cateOptions: [],
      selectedCate: [], // 被选中的分类
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      }
    }
  },
  created() {
    this.fetchCategories()
  },
  methods: {
    async fetchCategories() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('请求数据失败')
      }
      this.categoryList = res.data.result
      this.total = res.data.total
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.fetchCategories()
    },
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum
      this.fetchCategories()
    },
    // 添加分类
    async addCate() {
      // 获取分类列表
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据失败')
      }
      this.cateOptions = res.data
      this.cateDialogVisible = true
    },
    // 选择分类,选中之后重新设置等级、id值
    handleCateChange() {
      // 如果selectedKey的数组长度大于0，说明选中了
      let length = this.selectedCate.length
      if (length) {
        this.cateList.cat_pid = this.selectedCate[length - 1]
        this.cateList.cat_level = length
      } else {
        this.cateList.cat_level = 0
        this.cateList.cat_pid = 0
      }
    },
    submitCate() {
      this.$refs.cateForm.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.cateList)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败' + res.meta.msg)
        }
        this.$message.success('添加分类成功')
        this.fetchCategories()
        this.cateDialogVisible = false
      })
    },
    cateClose() {
      this.selectedCate = []
      this.$refs.cateForm.resetFields()
    }
  }
}
</script>

<style scoped>
.table {
  margin: 20px 0;
}
</style>
