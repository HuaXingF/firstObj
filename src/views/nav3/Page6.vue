<template>
  <el-tabs v-model="activeName" @tab-click="handleClick">
    <!--新增树上节点界面-->
    <el-dialog title="新增节点" v-model="addTreeNodeVisible" :close-on-click-modal="false">
      <el-form :model="addTreeNodeForm" label-width="90px" ref="addTreeNodeForm">
        <el-form-item label="主题词名称">
          <el-input v-model="addTreeNodeForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="主题词代码">
          <el-input v-model="addTreeNodeForm.meshcode" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="addTreeNodeVisible = false">取消</el-button>
        <el-button type="primary" @click.native="saveTreeNode" :loading="addLoading">确定</el-button>
      </div>
    </el-dialog>

    <!--编辑树上节点界面-->
    <el-dialog title="修改节点" v-model="editTreeNodeVisible" :close-on-click-modal="false">
      <el-form :model="editTreeNodeForm" label-width="90px" ref="editTreeNodeForm">
        <el-form-item label="主题词名称">
          <el-input v-model="editTreeNodeForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="主题词代码">
          <el-input v-model="editTreeNodeForm.meshcode" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="editTreeNodeVisible = false">取消</el-button>
        <el-button type="primary" @click.native="saveEditNode" :loading="addLoading">确定</el-button>
      </div>
    </el-dialog>
   <div v-for="obj in this.objs">
      <el-tab-pane v-bind:label="obj.name"  v-bind:name="obj.index" >
      </el-tab-pane>
    </div>
   <div v-if="index>0">
     <el-input
             placeholder="输入关键字进行过滤"
             v-model="filterText">
     </el-input>
     <section>
       <div class="custom-tree-container">
         <div class="block">
           <el-tree
                   class="filter-tree"
                   :data="data4"
                   show-checkbox
                   node-key="id"
                   default-expand-all
                   :expand-on-click-node="false"
                   :render-content="renderContent"
                   :filter-node-method="filterNode"
                   ref="tree2">
           </el-tree>
         </div>
       </div>
     </section>
   </div>

    <el-tab-pane label="主题词列表管理" name="0">
      <!--工具条-->
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <el-form :inline="true">
          <el-form-item>
            <el-input placeholder="请输入主题字查询" v-model="name"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" v-on:click="queryByName">查询</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleAdd">新增主题词</el-button>
          </el-form-item>
        </el-form>
      </el-col>



    <!-- <div>
     <el-tab-pane label="mesh树" name="0">
       <el-input placeholder="输入关键字进行过滤" v-model="filterText"></el-input>
       <section>
         <div class="custom-tree-container">
           <div class="block">
             <el-tree
               class="filter-tree"
               :data="data4"
               show-checkbox
               node-key="id"
               default-expand-all
               :expand-on-click-node="false"
               :render-content="renderContent"
               :filter-node-method="filterNode"
               ref="tree2"
             ></el-tree>
           </div>
         </div>
       </section>
     </el-tab-pane>
     </div>

         <el-tab-pane label="UMLS树形结构管理" name="second">
           <el-input placeholder="输入关键字进行过滤" v-model="filterText2"></el-input>
           <section>
             <div class="custom-tree-container">
               <div class="block">
                 <el-tree
                   class="filter-tree"
                   :data="data5"
                   show-checkbox
                   node-key="id"
                   default-expand-all
                   :expand-on-click-node="false"
                   :render-content="renderContent"
                   :filter-node-method="filterNode2"
                   ref="tree3"
                 ></el-tree>
               </div>
             </div>
           </section>
         </el-tab-pane>-->


      <el-table :data="tableData" highlight-current-row style="width: 100%;">
        <el-table-column type="index" width="60"></el-table-column>
        <el-table-column prop="name" label="中文主题词" width="130" sortable></el-table-column>
        <el-table-column prop="treename" label="词典体系" width="130" sortable></el-table-column>
        <!--<el-table-column prop="dllb" label="大类类别" width="120"  sortable>-->
        <!--</el-table-column>-->
        <!--<el-table-column prop="xllb" label="小类类别" width="120" sortable>-->
        <!--</el-table-column>-->
        <el-table-column prop="meshcode" label="主题词编号" width="130" sortable></el-table-column>
        <el-table-column prop="creatTime" label="创建时间" min-width="140" sortable></el-table-column>
        <el-table-column prop="creatUser" label="创建者" min-width="140" sortable></el-table-column>
        <el-table-column label="操作" width="150">
          <template scope="scope">
            <el-button size="small" @click="findById(scope.$index,tableData)">编辑</el-button>
            <el-button type="danger" size="small" @click="delTree(scope.$index,tableData)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!--新增界面-->
      <el-dialog title="新增主题词" v-model="addFormVisible" :close-on-click-modal="false">
        <el-form :model="addForm" label-width="90px" ref="addForm">
          <el-form-item label="中文主题词" prop="name">
            <el-input v-model="addForm.name" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="词典体系">
            <el-input v-model="addForm.treename" auto-complete="off"></el-input>
          </el-form-item>
          <!--<el-form-item label="大类类别">-->
          <!--<el-input v-model="addForm.name" auto-complete="off"></el-input>-->
          <!--</el-form-item>-->
          <!--<el-form-item label="小类类别">-->
          <!--<el-input v-model="addForm.name" auto-complete="off"></el-input>-->
          <!--</el-form-item>-->
          <el-form-item label="主题词编号">
            <el-input v-model="addForm.meshcode" auto-complete="off"></el-input>
          </el-form-item>
         <!-- <el-form-item label="版本信息">
            <el-input v-model="addForm.name" auto-complete="off"></el-input>
          </el-form-item>-->
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click.native="addFormVisible = false">取消</el-button>
          <el-button type="primary" v-on:click="addTree" @click.native="addFormVisible = false">新增主题词</el-button>
        </div>
      </el-dialog>

    <!--编辑界面-->
    <el-dialog title="编辑主题词" v-model="changeFormVisible" :close-on-click-modal="false">
      <el-form :model="changeForm" label-width="90px" ref="addForm">
        <el-form-item label="中文主题词" prop="name">
          <el-input v-model="changeForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="词典体系">
          <el-input v-model="changeForm.treename" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="主题词编号">
          <el-input v-model="changeForm.meshcode" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="changeFormVisible = false">取消</el-button>
        <el-button type="primary" v-on:click="changeTree" @click.native="changeFormVisible = false">编辑主题词</el-button>
      </div>
    </el-dialog>
    </el-tab-pane>

    <!--<el-tab-pane v-bind:label="treeName" name="forth" v-if="showPane">
      <el-input placeholder="输入关键字进行过滤" v-model="filterText3"></el-input>
      <section>
        <div class="custom-tree-container">
          <div class="block">
            <el-tree
              class="filter-tree"
              :data="data6"
              show-checkbox
              node-key="id"
              default-expand-all
              :expand-on-click-node="false"
              :render-content="renderContent"
              :filter-node-method="filterNode"
              ref="tree5"
            ></el-tree>
          </div>
        </div>
      </section>
    </el-tab-pane>-->
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
/*,
name(val){
  this.queryByName(val);
}*/
  data() {
    /*
    const data6 = [
      {
        id: 1002,
        label: this.$route.query.rootNodeName
      }
    ];*/
    return {
      filterText: "",
      data:[],
      //showPane: this.$route.query.showTabPane,
      //treeName: this.$route.query.treeName,
      //rootNodeName: this.$route.query.rootNodeName,
      editTreeNodeVisible: false,
      addTreeNodeVisible: false,
      //filterText2: "",
     // filterText3: "",
      /*
      data5: JSON.parse(JSON.stringify(this.data2)),
      data6: JSON.parse(JSON.stringify(this.data6)),*/
      //默认显示树形
      activeName:"0",
      addFormVisible: false, //新增界面是否显示
      changeFormVisible: false, //编辑界面是否显示
      addLoading: false,
      addFormRules: {
        name: [{ required: true, message: "请输入姓名", trigger: "blur" }]

      },
      objs:[],
      treeName:null,
      name:null,
      index:0,
      //filterText:'',
      //data2:[],
      //data6:[],
      data4:[],
      //data5:[],
      //新增界面数据
      addForm: {},
      changeForm: {},
      addTreeNodeForm:{},

      //修改界面数据
      editTreeNodeForm: {},

      tableData: []
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    //过滤树上的节点
    filterNode(value, data) {
      //alert(value)
      console.log(data)
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    queryByName(){
        this.$http.get("biaoyin/tbTree/queryAll.do?name="+this.name).then(({data}) =>{
          this.tableData=data;
        })
	},
    //切换选项卡获取到tab实例
	handleClick(e){
      if(e.label!="主题词列表管理"){
        console.log(e.label);
        this.treeName=e.label;
        this.index=parseInt(e.name);
        //alert(this.index)
        this.queryByTreeName();
      }else{
        this.index=parseInt(e.name);
        //alert(this.index)
        this.initTree()
      }
      this.activeName=e.name;

	},
    initTree(){
      this.$http.get("biaoyin/tbTree/queryAll.do").then(({data}) => {
        this.tableData=data;
        console.log(data)
      })
    },
    //页面初始化

    init() {
	  this.selectAllTreeName();
      this.queryByTreeName();
      /*this.$http.get("biaoyin/tbSysSettings/queryById.do?id=2").then(({data}) => {
        this.treeName=data.itemValue;
      })*/
      this.initTree()

    },
    //初始化所有树形
    selectAllTreeName(){
	  this.$http.get("biaoyin/tbDictionary/queryByName.do").then(({data}) => {
	    //alert(data)
	    for(let i=0;i<data.length;i++){
	      //console.log(data[i])
          let o={
	        "name":data[i].name,
            "index":(i+1).toString(),
          }
            this.objs.push(o);
          }
      })
    },
    //根据数名查询列
    queryByTreeName(){
      this.$http.get("biaoyin/tbTree/selectAll.do?treeName=" + this.treeName)
              .then(({data})=>{
                this.data = data;
                this.data4=JSON.parse(JSON.stringify(data)),
                        console.log(this.data4)
              });
    },

    /*filterNode2(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },*/
    //显示新增界面
    handleAdd: function() {
      this.addFormVisible = true;

    },
    //新增数据
    addTree(){
      this.$http.post("biaoyin/tbTree/insert.do",this.addForm).then(({data}) => {
        alert(data)
        //console.log(this.addForm)
        this.initTree()
      })
    },
    //显示编辑页面
    findById(index=0,obj=null){
      this.changeFormVisible=true;
      this.changeForm=obj[index];
      console.log(this.changeForm)
      //this.$http.get("biaoyin/tbTree/queryById.do?id="+id)
    },
    //提交编辑信息
    changeTree(){
      this.$http.post("biaoyin/tbTree/updateById.do",this.changeForm).then(({data}) => {
        console.log(data)
        console.log(this.changeForm)
        this.initTree()
      })
    },
    //删除信息
    delTree(index=0,obj=null){
      let id=obj[index].id;
      this.$confirm("确认删除该主题及其下面所有主题吗？", "提示", {})
              .then(() => {
                console.log(this.settings);
                this.$http.get("biaoyin/tbTree/delById.do?id="+id).then(({data}) => {
                  console.log(data);
                  this.initTree()
                });
              })
              .catch(() => {
                console.log("取消");
              });

    },
    append(data) {
      clickTreeNodedata = data;
      this.addTreeNodeVisible = true;
    },
    //保存新增的节点数据
    insert(){
      //console.log(clickTreeNodedata)
      let parentId=clickTreeNodedata.id;
      this.addTreeNodeForm.parentId=parentId;
      this.addTreeNodeForm.treename=this.treeName;
      this.$http.post("biaoyin/tbTree/insert.do",this.addTreeNodeForm).then(({data}) => {
        if(data){
          this.addTreeNodeForm={}
        }
        this.queryByTreeName();
        this.addTreeNodeVisible = false;
      })
    },
    saveTreeNode() {
        this.insert();
      },
    delTree2(node, data){
      //alert(data.id)
      this.$http.get("biaoyin/tbTree/delById.do?id="+data.id).then(({data}) => {
        console.log(data);
        this.queryByTreeName();
      });
    },
    //移除节点
    remove(node, data) {
      this.delTree2(node,data);
    },
    //弹出编辑对话框
    edit(node, data) {
      clickTreeNode = node;
      clickTreeNodedata = data;
      let codeStartIndex = data.label.toString().indexOf("(");
      //节点不包含主题词编号
      if (codeStartIndex != -1) {
        let codeEndIndex = data.label.toString().indexOf(")");
        let code = data.label
          .toString()
          .substring(codeStartIndex + 1, codeEndIndex);
        let title = data.label.toString().substring(0, codeStartIndex);
        this.editTreeNodeForm.name = title;
        this.editTreeNodeForm.meshcode = code;
        this.editTreeNodeVisible = true;
      } else {
        //节点包含主题词编号
        this.editTreeNodeForm.name = data.label;
        this.editTreeNodeVisible = true;
      }
    },
    updata1(){
     let dat= clickTreeNodedata;
      this.editTreeNodeForm.id=dat.id
     console.log(dat)
      this.$http.post("biaoyin/tbTree/updateById.do",this.editTreeNodeForm).then(({data}) => {
        if(data){
          this.editTreeNodeForm={}
        }
        this.queryByTreeName();
        this.editTreeNodeVisible = false;
      })
    },
    //保存编辑的节点数据
    saveEditNode() {
      this.updata1();
    },

    renderContent(h, { node, data, store }) {
      return (
        <span class="custom-tree-node">
          <span>{node.label}</span>
          <span>
            <el-button
              size="mini"
              type="text"
              on-click={() => this.append(data)}
            >
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;增加子节点
            </el-button>
            <el-button
              size="mini"
              type="text"
              on-click={() => this.remove(node, data)}
            >
              &nbsp;&nbsp;&nbsp;删除
            </el-button>
            <el-button
              size="mini"
              type="text"
              on-click={() => this.edit(node, data)}
            >
              &nbsp;&nbsp;&nbsp;修改
            </el-button>
          </span>
        </span>
      );
    },

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