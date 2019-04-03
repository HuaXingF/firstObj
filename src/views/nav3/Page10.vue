<template>
  <section>
    <!--标引弹框-->
    <el-dialog title="请选择关联的主题词" :visible.sync="dialogTableVisible" :before-close="delDialogTable">
      <div v-if="panduan">
        当前所选关键词：
        <span  style="color: red" >{{this.selectText1}}</span>
      </div>
      <div  v-else>
        当前所选关键词：
        <span  style="color: red" >{{this.selectText}}</span>
      </div>
      <el-input
        placeholder="输入关键字进行过滤"
        v-model="filterText"
        ref="meshwordInput"
        v-bind:autofocus="autofocus"
      ></el-input>
      <el-tree
        :data="data4"
        show-checkbox
        node-key="id"
        default-expand-all
        :check-strictly=true
        :expand-on-click-node="false"
        :props="defaultProps"
        :default-checked-keys="checked_keys"
        :filter-node-method="filterNode"
        ref="tree2"
      ></el-tree>
      <!-- :render-content="renderContent"-->
      <div slot="footer" class="dialog-footer">
        <el-button v-on:click="delDialogTable()">取消</el-button>
        <el-button type="primary" v-on:click="saveDialogTable(panduan)" >确定</el-button>
      </div>
    </el-dialog>

    <!--标引界面-->
    <div>
      <el-form :model="addForm" label-width="100px" :rules="addFormRules" ref="addForm">
        <el-form-item label="基本信息：" prop="name">
          <el-input v-model="addForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <!--<el-form-item label="性别">-->
        <!--<el-input v-model="addForm.sex" auto-complete="off"></el-input>-->
        <!--</el-form-item>-->
        <!--<el-form-item label="年龄">-->
        <!--<el-input v-model="addForm.age" auto-complete="off"></el-input>-->
        <!--</el-form-item>-->
        <el-form-item label="门诊诊断" prop="des">
          <div
            v-html="markContent1"
            v-on:click="getSelectionText1"
            style="background-color:#F2F2F2;"
          ></div>
        </el-form-item>
        <el-form-item label="入院诊断" prop="des">
          <div
            v-html="markContent2"
            v-on:click="getSelectionText2"
            style="background-color:#F2F2F2;"
          ></div>
        </el-form-item>
        <el-form-item label="出院诊断" prop="des">
          <div
            v-html="markContent3"
            v-on:click="getSelectionText3"
            style="background-color:#F2F2F2;"
          ></div>
        </el-form-item>
        <el-form-item label="诊疗过程" prop="des">
          <div
            v-html="markContent4"
            v-on:click="getSelectionText4"
            style="background-color:#F2F2F2;"
          ></div>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer" align="right">
        <el-button @click.native="gotobiaoyin">返回列表</el-button>
        <!--<el-button type="primary" @click.native="addFormVisible = false">提交标引</el-button>-->
        <el-button type="primary" @click.native="markNext()">完成标引，标引下一条</el-button>
      </div>
    </div>
  </section>
</template>

<script>
import util from "../../common/js/util";
import { media } from "../../toolVue.js";

//import NProgress from 'nprogress'
import {
  getUserListPage,
  removeUser,
  batchRemoveUser,
  editUser,
  addUser
} from "../../api/api";
import directive from "element-ui/packages/popover/src/directive";
export default {
  watch: {
    filterText(val) {
      this.$refs.tree2.filter(val);
    }
  },
  created() {
    // this.changfouce();
  },
  data() {
    return {
      selectText:"",
      selectText1:"",
      filterText: "",
      autofocus: "autofocus",
      panduan: false,// 用于添加与编辑的区分（主要用与区分更改与保存）
      list : {},// 编辑所需的对象
      biaoyin_list: null, //是否存在已标引的数据（主要用于用户未标引却点击完成标引）
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      data4: [],
      checked_keys:[], // tree默认选中的值
      dialogTableVisible: false,
      filters: {
        name: ""
      },
      object:[],
      num : 0,
      jzlsh: "",// 住院就诊流水号
      yljgdm: "",// 医疗机构代码
      treeName: "",// 树形名称
      obj: "",// {jzlsh: this.jzlsh,yljgdm: this.yljgdm}
      keywordfieldname:"",
      markContent1: "",
      markContent2: "",
      markContent3: "",
      markContent4: "",
      value: "",
      users: [],
      total: 0,
      page: 1,
      listLoading: false,
      sels: [], //列表选中列

      markedFormVisible: false,

      addFormVisible: false, //新增界面是否显示
      addLoading: false,
      addFormRules: {
        name: [{ required: true, message: "请输入姓名", trigger: "blur" }]
      },
      //新增界面数据
      addForm: {}
    };
  },
  methods: {
    //过滤树上的节点
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    //显示编辑界面
    markText: function() {
      //this.addFormVisible = true;
      this.$router.push({ path: "/page6" });
    },
    selsChange: function(sels) {
      this.sels = sels;
    },
    getSelectionText: function() {//划词后出现弹框
      this.selectText = window.getSelection().toString();
      if (this.selectText.toString() != "") this.dialogTableVisible = true;
    },
    getSelectionText1: function() {//门诊诊断 划词后出现弹框
      this.keywordfieldname = "mzzd";
      this.selectText = window.getSelection().toString();
      if (this.selectText.toString() != "") this.dialogTableVisible = true;
    },
    getSelectionText2: function() {// 入院诊断 划词后出现弹框
      this.keywordfieldname = "ryzd";
      this.selectText = window.getSelection().toString();
      if (this.selectText.toString() != "") this.dialogTableVisible = true;
    },
    getSelectionText3: function() {// 出院诊断 划词后出现弹框
      this.keywordfieldname = "cyzd";
      this.selectText = window.getSelection().toString();
      if (this.selectText.toString() != "") this.dialogTableVisible = true;
    },
    getSelectionText4: function() {// 诊疗过程 划词后出现弹框
      this.keywordfieldname = "zlgc";
      this.selectText = window.getSelection().toString();
      if (this.selectText.toString() != "") this.dialogTableVisible = true;
    },
    getSelText: function() {//获取划取得文字内容
	  this.selectText = window.getSelection().toString();
      return this.selectText;
	},
	renderContent(){
	},
    delDialogTable(){
      //this.checked_keys = [];//去掉选中的树
      this.dialogTableVisible = false;
      this.panduan = false;
    },
    //保存与编辑的方法
    saveDialogTable(panduan){
      //this.checked_keys = [];//去掉选中的树
      //获取选中项的主题词
      //alert(this.$refs.tree2.getCheckedKeys()+"---"+this.$refs.tree2.getCheckedNodes());// 获取所有选中项的id
      let ridsb = this.$refs.tree2.getCheckedNodes();// 获取选中项的对象
      let name = "";
      let name_id = null;
      ridsb.forEach(ids =>{// 遍历集合
        //alert(ids.id+"---"+ids.label);// 获取id与文本
        name +=','+ids.label;// 拼接name
        name_id = ids.id;// 关键字id
      });
      name = name.substr(1);// 删除字符串前面的','
      if(name == ""){
        this.$message({
          message: '请选择一个主题词',
          type: 'warning'
        });
      }else if (name.indexOf(',')>-1) { // 判断是否选中多个关键词，如果选中多个则不让提交
         //alert("主题词只能选择一个");
        this.$message({
          message: '主题词只能选择一个',
          type: 'warning'
        });
      }else {
        let codeStartIndex = name.indexOf("(");
        let code = "";
        if (codeStartIndex != -1) {
          let codeEndIndex = name.indexOf(")");
          code = name.substring(codeStartIndex + 1, codeEndIndex);// 主题词编码
          name = name.substring(0, codeStartIndex); // 主题词
        }
        if (panduan) { //如果为真则进行修改操作
          let para = {
            id: this.list.id,
            keywordid: this.list.keywordid,
            keyword: this.list.keyword,
            meshword: name,
            meshwordid: name_id,
            treename: this.list.treename,
            keywordtable: this.list.keywordtable,
            meshcode: code,
            keywordfieldname: this.list.keywordfieldname
          };
          this.$http.post("biaoyin/tbLable/updateTbLable.do", para).then(({data}) => {
             if(data){
               this.$message({
                 message: '更改成功',
                 type: 'success'
               });
               this.dialogTableVisible = false;
               this.panduan = false;
               this.init();
             }else {
               this.$message.error('更改失败');
               this.dialogTableVisible = false;
               this.panduan = false;
               this.init();
             }
          })
        }else{ //否则进行保存操作
          let keyWordId = "(" + this.jzlsh + "," + this.yljgdm + ")";// 对应表id
          let para = {
            keywordid: keyWordId,
            keyword: this.selectText,
            meshword: name,
            meshwordid: name_id,
            treename: this.treeName,
            keywordtable: "tb_cls_lh_summary",
            meshcode: code,
            keywordfieldname: this.keywordfieldname
          };
          this.$http.post("biaoyin/tbLableRelationship/insertTblable.do", para).then(({data}) => {
             if(data){// 判断是否为true
               this.$message({
                 message: '标引成功',
                 type: 'success'
               });
               /*******************  如果标引了则更新标引状态 ***************************/
               let bianliang = {jzlsh: this.jzlsh,yljgdm: this.yljgdm,byzt:"2",bcbz:1};// 标引状态byzt（1.已标引2.标引中3.未标引）,补传标志(1：正常)
               this.$http.post("biaoyin/tbClsLhSummary/update.do",bianliang).then(()=>{

               });
               this.dialogTableVisible = false;
               this.init();
             }else{
               this.$message.error('标引失败');
               this.dialogTableVisible = false;
               this.init();
             }
          })
        }
      }
    },
    handleCurrentChange(val) {
      this.page = val;
      //this.getUsers();
    },
    showMarkedList() {
      this.markedFormVisible = true;
      this.autofocus = "autofocus";
    },

    gotobiaoyin() {
      this.$router.push({ path: "/page9" });
    },
    markNext() {
      let queren = "是否确认完成该次标引并进入下一条";
      if(this.biaoyin_list==null || this.biaoyin_list.length==0){
        queren = "该界面未标引，是否确认完成标引并进入下一条";
      }
      this.$confirm(queren, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let bianliang = {jzlsh: this.jzlsh,yljgdm: this.yljgdm,byzt:"1",bcbz:1};// 标引状态（1.已标引2.标引中3.未标引）,补传标志(1：正常)
          this.$http.post("biaoyin/tbClsLhSummary/update.do",bianliang).then(()=>{
            let i = this.num+1;
            if (i<this.object.length) {
              let jzlsh = this.object[i].jzlsh;
              let yljgdm = this.object[i].yljgdm;
              let list = JSON.stringify(this.object);
              this.$router.push({
                path: "/page10",
                query: {
                  i,
                  jzlsh,
                  yljgdm,
                  list
                }
              });
              this.init();
            }else{
              this.$message({
                message: '当前页面已经没有数据',
                type: 'warning'
              });
            }

          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消"
          });
        });
    },
    // 更新标引
    updata(i,list){
      this.$nextTick(() => {
        let updata = document.getElementById("updata"+i);
        let that = this; // 定义this
        updata.onclick = function () {
          that.list = list;
          that.panduan = true;
          that.dialogTableVisible = true;
          that.selectText1 = list.keyword;
          //that.checked_keys = [list.meshwordid];
          //alert(that.checked_keys);
        }
      })
    },
    // 删除标引
    del(i,id){
      this.$nextTick(() => {
        let del = document.getElementById("del"+i);
        let that = this; // 定义this
        del.onclick = function () {
          that.$confirm('确认删除吗？', '提示', {}).then(()=>{
            that.$http.get("biaoyin/tbLable/delTbLableById.do?id="+id).then(({data})=>{
              if(data){
                that.$message({
                  message: '删除成功',
                  type: 'success'
                });
                that.init();
              }else{
                that.$message.error('删除失败');
                that.init();
              }
            })
          })
        }
      })
    },
    select1:function(keyword, meshword, i, treename){
        let pingjie = `<span style=\"color: red;text-decoration:underline\">`
                + keyword
                + `</span>(已关联<span style="color: green;text-decoration:underline " >`
                + treename+`</span>主题词：<span style="color: green;text-decoration:underline " >`
                + meshword
                + `)</span><span id="del`+i+`" style="color: blue;text-decoration:underline;cursor: pointer">`
                +`(删除标引</span><span id="updata`+i+`" style="color: blue;text-decoration:underline;cursor: pointer">&nbsp;&nbsp;编辑标引)</span>`;
        return pingjie;
    },
    select(){
      // 判断 门诊诊断、入院诊断、出院诊断、诊疗过程中的标引
      let keyWordId = "("+this.jzlsh+","+this.yljgdm+")";// 对应表id
      this.$http.get("biaoyin/tbLable/queryByKeyWord.do?keyWordTable=tb_cls_lh_summary&keyWordId="+keyWordId).then(({data}) => {
        this.biaoyin_list = data;// 赋值给是否存在标引的数据（主要用于用户未标引却点击完成标引）
        let list = data;
        for (let i=0; i<list.length; i++) {
          if (list[i].keywordfieldname == 'mzzd') { //判断是否为门诊诊断
            if (this.markContent1.indexOf(list[i].keyword) > -1) {
              let b=this.select1(list[i].keyword, list[i].meshword, i, list[i].treename);
              this.markContent1 = this.markContent1.replace(list[i].keyword, b);
              this.del(i,list[i].id);
              this.updata(i,list[i]);
            }
          }else if(list[i].keywordfieldname == 'ryzd'){ //判断是否为入院诊断
            if (this.markContent2.indexOf(list[i].keyword) > -1) {
              let b = this.select1(list[i].keyword, list[i].meshword, i, list[i].treename);
              this.markContent2 = this.markContent2.replace(list[i].keyword, b);
              this.del(i,list[i].id);
              this.updata(i,list[i]);
            }
          }else if(list[i].keywordfieldname == 'cyzd'){//判断是否为入院诊断
            if (this.markContent3.indexOf(list[i].keyword) > -1) {
              let b = this.select1(list[i].keyword, list[i].meshword, i, list[i].treename);
              this.markContent3 = this.markContent3.replace(list[i].keyword, b);
              this.del(i,list[i].id);
              this.updata(i,list[i]);
            }
          }else if(list[i].keywordfieldname == 'zlgc'){//判断是否为入院诊断
            if (this.markContent4.indexOf(list[i].keyword) > -1) {
              let b = this.select1(list[i].keyword, list[i].meshword, i, list[i].treename);
              this.markContent4 = this.markContent4.replace(list[i].keyword, b);
              this.del(i,list[i].id);
              this.updata(i,list[i]);
            }
          }

        }
      });
    },
    init() {
      this.num = this.$route.query.i;// 接收的是第几行数据
      this.jzlsh = this.$route.query.jzlsh; // 接收page9传递的参数
      this.yljgdm = this.$route.query.yljgdm; // 接收page9传递的参数
      this.object = eval(this.$route.query.list); // 接收该页面所有数据的集合
      this.obj = {jzlsh: this.jzlsh,yljgdm: this.yljgdm};
      this.$http.post("biaoyin/tbClsLhSummary/queryByKey.do",this.obj)
              .then(({data})=>{
                let {xm,xb,nl,mzzd,ryzd,cyzd,zlgc} = data;
                this.addForm.name = `${xm}/${xb}/${nl}`;
                this.markContent1 = mzzd;
                this.markContent2 = ryzd;
                this.markContent3 = cyzd;
                this.markContent4 = zlgc;
                this.select();
              });
      // 通过树形选择
      this.$http.get("biaoyin/tbSysSettings/queryTotal.do").then(({data})=>{
        for (let i=0;i<data.length;i++) {
          if (data[i].itemName == "生效树形") {
            this.treeName = data[i].itemValue;// 根据树形名称来取决于是什么树
            this.$http.get("biaoyin/tbTree/selectAll.do?treeName=" + this.treeName).then(({data})=>{
              this.data4 = data;
            })
          }
        }
      });
    },
  },
  mounted() {
    this.init();

    // this.getUsers();
    /*media.$on("objInfo", obj => {
      //接受page9传过来的参数
	  this.objInfo = obj;
	  console.log(this.objInfo)
	});*/
  },

};
</script>
