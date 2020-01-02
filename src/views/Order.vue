<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col :span="10">
          <el-input placeholder="请输入内容" v-model="queryInfo.query">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table :data="orderList">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column
          label="订单价格"
          prop="order_price"
          width="100px"
        ></el-table-column>
        <el-table-column label="是否付款" prop="order_pay" width="100px">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.order_pay === 1"
              >已付款</el-tag
            >
            <el-tag type="warning" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="是否发货"
          prop="is_send"
          width="100px"
        ></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">
            {{ scope.row.create_time | timeFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" prop="">
          <template>
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editAddress"
              >编辑</el-button
            >
            <el-button
              type="success"
              icon="el-icon-location"
              size="mini"
              @click="openSendBox"
              >物流</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <el-dialog
      title="提示"
      :visible.sync="orderDialogVisible"
      width="50%"
      @close="closeForm"
    >
      <el-form
        :model="addressForm"
        :rules="addressRules"
        ref="addressForm"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            :options="cityData"
            v-model="addressForm.address1"
            :props="addressProps"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2" placeholder=""></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="orderDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitAddress">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="物流信息"
      :visible.sync="addressDialogVisible"
      width="50%"
    >
      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in processInfo"
          :key="index"
          :timestamp="item.time"
        >
          {{ item.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from '../assets/citydata'
export default {
  name: 'Order',
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      orderList: [],
      total: 0,
      orderDialogVisible: false,
      cityData,
      addressForm: {
        address1: [],
        address2: ''
      },
      addressProps: {
        // label: 'cat_name',
        // value: 'cat_id',
        // children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      addressRules: {
        address1: [
          { required: true, message: '请输入地址名称', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入地址名称', trigger: 'blur' }
        ]
      },
      addressDialogVisible: false,
      processInfo: []
    }
  },
  created() {
    this.fetchOrders()
  },
  methods: {
    async fetchOrders() {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据失败')
      }
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange(size) {
      this.queryInfo.pagesize = size
      this.fetchOrders()
    },
    handleCurrentChange(num) {
      this.queryInfo.pagenum = num
      this.fetchOrders()
    },
    // 编辑地址
    editAddress() {
      this.orderDialogVisible = true
    },
    // 提交修改地址
    submitAddress() {
      this.orderDialogVisible = false
    },
    // 关闭对话框
    closeForm() {
      this.$refs.addressForm.resetFields()
    },
    // 查询物流信息
    async openSendBox() {
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流信息失败，请稍后再试')
      }
      this.processInfo = res.data
      this.addressDialogVisible = true
    }
  }
}
</script>

<style scoped>
.el-table {
  margin: 20px 0;
}
.el-card {
  padding-bottom: 30px;
}
</style>
