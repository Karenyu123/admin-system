import Vue from 'vue'
import VueRouter from 'vue-router'
const Login = () => import('../views/Login.vue')
const Home = () => import('../views/Home.vue')
const Welcome = () => import('../views/Welcome.vue')
const Users = () => import('../views/Users.vue')
const Rights = () => import('../views/Rights.vue')
const Roles = () => import('../views/Roles.vue')
const GoodsCategories = () => import('../views/GoodsCategories.vue')
const CateParams = () => import('../views/CateParams.vue')
const GoodsList = () => import('../views/GoodsList.vue')
const AddGoods = () => import('../views/AddGoods.vue')
const Order = () => import('../views/Order.vue')
const Report = () => import('../views/Report.vue')

Vue.use(VueRouter)

const routes = [{
  path: '/',
  redirect: '/login'
},
{
  path: '/login',
  name: 'login',
  component: Login
},
{
  path: '/home',
  name: 'home',
  component: Home,
  redirect: '/welcome',
  children: [{
    path: '/welcome',
    name: 'welcome',
    component: Welcome
  },
  {
    path: '/users',
    name: 'users',
    component: Users
  },
  {
    path: '/rights',
    name: 'rights',
    component: Rights
  }, {
    path: '/roles',
    name: 'roles',
    component: Roles
  },
  {
    path: '/categories',
    name: 'goodsCategories',
    component: GoodsCategories
  },
  {
    path: '/params',
    name: 'cateparams',
    component: CateParams
  },
  {
    path: '/goods',
    name: 'goodslist',
    component: GoodsList
  },
  {
    path: '/goods/add',
    name: 'addgoods',
    component: AddGoods
  },
  {
    path: '/orders',
    name: 'order',
    component: Order
  },
  {
    path: '/reports',
    name: 'report',
    component: Report
  }
  ]
}
]

const router = new VueRouter({
  routes
})
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const token = window.sessionStorage.token
  if (!token) {
    next('/login')
  }
  next()
})
export default router