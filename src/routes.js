import Login from './views/Login.vue'
import NotFound from './views/404.vue'
import Home from './views/Home.vue'
import Main from './views/Main.vue'
import Table from './views/nav1/Table.vue'
import Form from './views/nav1/Form.vue'
import user from './views/nav1/user.vue'
import Page4 from './views/nav2/Page4.vue'
import Page5 from './views/nav2/Page5.vue'
import Page6 from './views/nav3/Page6.vue'
import echarts from './views/charts/echarts.vue'
import Page7 from "./views/nav3/Page7.vue";
import Page8 from "./views/nav3/Page8.vue";
import Page9 from "./views/nav3/Page9.vue";
import Page10 from "./views/nav3/Page10.vue";
import Page11 from "./views/nav3/Page11.vue";
import Page12 from "./views/nav3/Page12.vue";
import Page13 from "./views/nav3/Page13.vue";
import Page14 from "./views/nav3/Page14.vue";
import Page15 from "./views/nav3/Page15.vue";

let routes = [
    {
        path: '/login',
        component: Login,
        name: '',
        hidden: true
    },
    {
        path: '/404',
        component: NotFound,
        name: '',
        hidden: true
    },
    {
        path: '/',
        component: Home,
        name: '',
        hidden: true,
        leaf: true,//只有一个节点
        children: [
            { path: '/page10', component: Page10, name: '信息标引' }
        ]
    },

    {
        path: '/',
        component: Home,
        name: '',
        hidden: true,
        leaf: true,//只有一个节点
        children: [
            { path: '/page12', component: Page12, name: '信息标引' }
        ]
    },
    //{ path: '/main', component: Main },
/*
    {
        path: '/',
        component: Home,
        name: '导航一',
        iconCls: 'el-icon-message',//图标样式class
        children: [
            { path: '/main', component: Main, name: '主页', hidden: true },
            { path: '/table', component: Table, name: 'Table' },
            { path: '/form', component: Form, name: 'Form' },
            { path: '/user', component: user, name: '列表' },
        ]
    },
    {
        path: '/',
        component: Home,
        name: '导航二',
        iconCls: 'fa fa-id-card-o',
        children: [
            { path: '/page4', component: Page4, name: '页面4' },
            { path: '/page5', component: Page5, name: '页面5' }
        ]
    },*/
    {
        path: '/',
        component: Home,
        name: '',
        iconCls: 'fa fa-address-card',
        leaf: true,//只有一个节点
        children: [
            { path: '/page11', component: Page11, name: '系统设置' }
        ]
    },

    {
        path: '/',
        component: Home,
        name: '医疗主题词',
        iconCls: 'fa fa-address-card',
        children: [
            { path: '/page13', component: Page13, name: '主题词典列表' },
            { path: '/page6', component: Page6, name: '主题词典管理' },
        ]
    },
    {
        path: '/',
        component: Home,
        name: '',
        iconCls: 'fa fa-address-card',
        leaf: true,//只有一个节点
        children: [
            { path: '/page7', component: Page7, name: '信息检索' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '',
        iconCls: 'fa fa-address-card',
        leaf: true,//只有一个节点
        children: [
            { path: '/page8', component: Page8, name: '专家关联' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '手工标引',
        iconCls: 'fa fa-address-card',
        children: [
            { path: '/page9', component: Page9, name: '住院信息标引' },
            { path: '/page14', component: Page14, name: '门诊信息标引' },
        ]
    }/*,
    {
        path: '/',
        component: Home,
        name: '',
        iconCls: 'fa fa-address-card',
        leaf: true,//只有一个节点
        children: [
            { path: '/page15', component: Page15, name: '标引审核' }
        ]
    }*/,
    /*
    {
        path: '/',
        component: Home,
        name: 'Charts',
        iconCls: 'fa fa-bar-chart',
        children: [
            { path: '/echarts', component: echarts, name: 'echarts' }
        ]
    },*/
    {
        path: '*',
        hidden: true,
        redirect: { path: '/404' }
    }
];

export default routes;