<template>
  <el-tabs v-model="activeName" @tab-click="handleClick">
    <!--用户新增界面-->
    <el-dialog title="新增用户" v-model="addUserFormVisible" :close-on-click-modal="false">
      <el-form :model="addUserForm" label-width="90px" ref="addTreeNodeForm">
        <el-form-item label="用户名称">
          <el-input v-model="addUserForm.userName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="用户账号">
          <el-input v-model="addUserForm.loginName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="用户密码">
          <el-input v-model="addUserForm.password" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="所属部门">
          <el-input v-model="addUserForm.departments" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="addUserFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="saveUser()" :loading="addLoading">确定</el-button>
      </div>
    </el-dialog>
    <!--用户编辑界面-->
    <el-dialog title="编辑用户" v-model="editUserFormVisible" :close-on-click-modal="false">
      <el-form :model="editUserForm" label-width="90px" ref="addTreeNodeForm">
        <el-form-item label="用户名称">
          <el-input v-model="editUserForm.userName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="用户账号">
          <el-input v-model="editUserForm.loginName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="用户密码">
          <el-input v-model="editUserForm.password" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="所属部门">
          <el-input v-model="editUserForm.departments" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="editUserFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="editUser()" :loading="addLoading">确定</el-button>
      </div>
    </el-dialog>

    <el-tab-pane label="用户列表管理" name="0">
      <!--工具条-->
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <el-form :inline="true">
          <el-form-item>
            <el-input placeholder="请输入用户名查询" v-model="userName"></el-input>
          </el-form-item>
          <el-form-item>
            <el-input placeholder="请输入用户账号查询" v-model="loginName"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" v-on:click="query">查询</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click.native="addUserFormVisible = true">新增用户</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <el-table :data="tableData" highlight-current-row style="width: 100%;">
        <el-table-column type="index" width="60"></el-table-column>
        <el-table-column prop="userName" label="用户名称" width="160" sortable></el-table-column>
        <el-table-column prop="loginName" label="用户账号" width="160" sortable></el-table-column>
        <el-table-column prop="creatTime" label="创建时间" width="180" sortable></el-table-column>
        <el-table-column prop="departments" label="所属部门" min-width="160" sortable></el-table-column>
        <el-table-column prop="roleName" label="角色名称" min-width="200" sortable></el-table-column>
        <el-table-column label="操作" width="250">
          <template scope="scope">
            <el-button size="small" @click="findById(scope.$index, scope.row)">角色分配</el-button>
            <el-button size="small" @click="edit_user(scope.$index, scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="delUser(scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-col :span="24" class="toolbar">
        <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="10" :total="total" style="text-align:right;">
        </el-pagination>
      </el-col>
    </el-tab-pane>

    <el-tab-pane label="用户角色管理" name="1">
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <el-form :inline="true">
          <el-form-item>
            <el-input placeholder="请输入角色" v-model="userName"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" v-on:click="query">查询</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="query">新增用户</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-tab-pane>

    <el-tab-pane label="用户权限管理" name="2">
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <el-form :inline="true">
          <el-form-item>
            <el-input placeholder="请输入权限" v-model="userName"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" v-on:click="query">查询</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="query">新增用户</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-tab-pane>
  </el-tabs>
</template>


<script>
  let id = 1000;
  var clickTreeNodedata;
  var clickTreeNode;

  //import NProgress from 'nprogress'
  export default {
    //监测输入框变化
    watch: {
      filterText(val) {
        //alert(this.index);
        this.$refs.tree2.filter(val);
        //console.log(val)
      }
    },
    data() {
      return {

        filterText: "",
        data:[],
        editTreeNodeVisible: false,
        addTreeNodeVisible: false,
        activeName:"0",
        addLoading: false,
        objs:[],
        options:[],
        name:null,
        total: 0,
        page: 1,
        data4:[],

        editUserFormVisible: false,// 编辑用户界面是否显示
        addUserFormVisible: false,// 新增用户界面是否显示
        addUserForm:{},
        editUserForm:{},

        tableData: [],//列表数据
        userName: null,
        loginName: null,
        pageNum: 1, // 初始化页码
        pageSize: 10 // 初始化页面数量
      };
    },
    mounted() {
      this.init();
    },
    methods: {
      handleClick(e){

      },
      // 输入限制
      save_panduan:function(){
        let panduan = true;
        if(this.addUserForm.userName == null || this.addUserForm.userName == ""){
          panduan = false;
          this.$message({message:'请输入姓名',type:'warning'})
        }else if (this.addUserForm.loginName == null || this.addUserForm.loginName == ""){
          panduan = false;
          this.$message({message:'请输入账号',type:'warning'})
        }else if (this.addUserForm.password == null || this.addUserForm.password == ""){
          panduan = false;
          this.$message({message:'请输入密码',type:'warning'})
        }else if (this.addUserForm.departments == null || this.addUserForm.departments == ""){
          panduan = false;
          this.$message({message:'请输入所在部门',type:'warning'})
        }
        return panduan;
      },
      // 输入限制
      edit_panduan:function(){
        let panduan = true;
        if(this.editUserForm.userName == null || this.editUserForm.userName == ""){
          panduan = false;
          this.$message({message:'请输入姓名',type:'warning'})
        }else if (this.editUserForm.loginName == null || this.editUserForm.loginName == ""){
          panduan = false;
          this.$message({message:'请输入账号',type:'warning'})
        }else if (this.editUserForm.password == null || this.editUserForm.password == ""){
          panduan = false;
          this.$message({message:'请输入密码',type:'warning'})
        }else if (this.editUserForm.departments == null || this.editUserForm.departments == ""){
          panduan = false;
          this.$message({message:'请输入所在部门',type:'warning'})
        }
        return panduan;
      },
      // 保存用户信息
      saveUser:function(){
            let panduan = this.save_panduan();// 输入限制
            if(panduan){
               this.$http.post("biaoyin/tbSysUser/insert.do",this.addUserForm).then(({data})=>{
                 if(data){
                   this.addUserFormVisible = false;
                   this.init();
                   this.$message({message:'成功创建用户',type:'success'});
                 }else {
                   this.$message.error("创建用户失败");
                 }
               })
            }
      },
      // 显示编辑页面
      edit_user: function(i, row){
        this.editUserFormVisible = true;
        this.editUserForm = row;
        this.editUserForm.password = null;
      },
      // 编辑保存
      editUser:function(){
        if(this.edit_panduan()) {
          console.log(this.editUserForm);
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            this.editLoading = true;
            this.$http.post("biaoyin/tbSysUser/updateByUserId.do", this.editUserForm).then(({data}) => {
              this.editLoading = false;
              this.editUserFormVisible = false;
              this.init();
              if (data) {
                this.$message({
                  showClose: true,
                  message: "编辑成功",
                  type: 'success'
                })
              } else {
                this.$message({
                  showClose: true,
                  message: "编辑失败",
                  type: 'error'
                })
              }
            })
          })
        }
      },
      // 删除用户信息
      delUser:function(i, row){
        this.$http.get("biaoyin/tbSysUser/delByUserId.do?userId="+row.userId).then(({data})=>{
          if(data){
            this.init();
            this.$message({message:'删除成功',type:'success'});
          }else {
            this.$message.error("删除失败");
          }
        })
      },
      //改变页码触发的函数
      handleCurrentChange(val) {
        this.page = val;
        if(this.loginName != null || this.userName != null){
          this.query(this.page);
        }else{
          this.init(this.page);
        }
      },
      // 查询
      query(){
        let num = this.pageNum;
        let size = this.pageSize;
        let tiaojian = "?pageNum="+num+"&pageSize="+size;
        if(this.loginName != null){
          tiaojian = tiaojian+"&loginName="+this.loginName;
        }
        if(this.userName != null){
          tiaojian = tiaojian+"&userName="+this.userName;
        }
        this.$http.get("biaoyin/tbSysUser/queryPage.do"+tiaojian).then(({data})=>{
            let list = data.rows;
            this.total = data.total;
            this.tableData = list;
        })
      },
      init(pageNum = 1, pageSize = 10){
          this.$http.get("biaoyin/tbSysUser/queryPage.do?pageNum="+pageNum+"&pageSize="+pageSize).then(({data})=>{
            let list = data.rows;
            this.total = data.total;
            this.tableData = list;
          })
      }
    }
  };
</script>

<style lang="scss" scoped>
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }
</style>
