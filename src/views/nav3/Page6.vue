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
    <div v-if="activeName!='0'">
      <div v-if="data4.length<1">
        <span>没有节点,<a href="#" style="text-decoration: none;color: #2baee9;" @click="addTrees()">点我添加节点</a></span>
      </div>
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
              <!-- empty-text="" 修改tree为空文本提示-->
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

      <el-table :data="tableData" highlight-current-row style="width: 100%;">
        <el-table-column type="index" width="60"></el-table-column>
        <el-table-column prop="name" label="中文主题词" width="130" sortable></el-table-column>
        <el-table-column prop="treename" label="词典体系" width="130" sortable></el-table-column>
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
        <el-form :model="Form" label-width="90px" ref="addForm">
          <el-form-item label="中文主题词" prop="name">
            <el-input v-model="Form.name" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="词典体系">
            <el-select  v-model="Form.treename" placeholder="请选择词典体系" @change="onChange()">
              <el-option
                      v-for="item in options"
                      :key="item.id"
                      :label="item.itemName"
                      :value="item.name"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="父级主题词">
            <el-input
                    placeholder="输入关键字进行过滤"
                    v-model="filterText">
            </el-input>
            <el-tree
                    :data="data2"
                    show-checkbox
                    :check-strictly=true
                    node-key="id"
                    default-expand-all
                    :filter-node-method="filterNode"
                    @check-change="setIds"
                    ref="tree2">
            </el-tree>
          </el-form-item>

          <el-form-item label="主题词编号">
            <el-input v-model="Form.meshcode" auto-complete="off"></el-input>
          </el-form-item>
          <!-- <el-form-item label="版本信息">
             <el-input v-model="addForm.name" auto-complete="off"></el-input>
           </el-form-item>-->
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button v-on:click="goclear()"  @click.native="addFormVisible = false">取消</el-button>
          <el-button type="primary" v-on:click="addTree" >新增主题词</el-button>
        </div>
      </el-dialog>

      <!--编辑界面-->
      <el-dialog title="编辑主题词" v-model="changeFormVisible" :close-on-click-modal="false">
        <el-form :model="Form" label-width="90px" ref="addForm">
          <el-form-item label="中文主题词" prop="name">
            <el-input v-model="Form.name" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="词典体系">
            <el-select  v-model="Form.treename" :disabled="true" placeholder="请选择词典体系" >
              <el-option
                      v-for="item in options"
                      :key="item.id"
                      :label="item.itemName"
                      :value="item.name"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="父级主题词">
            <el-input
                    placeholder="输入关键字进行过滤"
                    v-model="filterText">
            </el-input>
            <el-tree
                    :data="data2"
                    show-checkbox
                    :check-strictly=true
                    node-key="id"
                    default-expand-all
                    :default-checked-keys="idList"
                    :filter-node-method="filterNode"
                    @check-change="setIds"
                    ref="tree2">
            </el-tree>
          </el-form-item>
          <el-form-item label="主题词编号">
            <el-input v-model="Form.meshcode" auto-complete="off"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button v-on:click="goclear()" @click.native="changeFormVisible = false">取消</el-button>
          <el-button type="primary" v-on:click="changeTree" >编辑主题词</el-button>
        </div>
      </el-dialog>
      <!--工具条-->
      <el-col :span="24" class="toolbar">
        <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="5" :total="total" style="text-align:right;">
        </el-pagination>
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
      ,
      name(val){
        this.queryByName(val);

      },
      //addForm.treename.chenge()
        //addForm.change
        /*handler: function(newVal) {
        console.log(newVal.treename);
        },
        deep: true //深度监听*/

    },


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
        showPane: this.$route.query.index,
        treeName: this.$route.query.treeName,
        rootNodeName: this.$route.query.nodeName,
        editTreeNodeVisible: false,
        addTreeNodeVisible: false,
        //filterText2: "",
        // filterText3: "",
        /*
        data5: JSON.parse(JSON.stringify(this.data2)),
        data6: JSON.parse(JSON.stringify(this.data6)),*/
        //默认显示树形
        //this.$route.query.index!=""?this.$route.query.index:
        activeName:"0",
        addFormVisible: false, //新增界面是否显示
        changeFormVisible: false, //编辑界面是否显示
        addLoading: false,
        addFormRules: {
          name: [{ required: true, message: "请输入姓名", trigger: "blur" }]

        },
        objs:[],
        options:[],
        idList:[],
        //treeName:null,
        name:null,
        //index:0,
        total: 0,
        page: 1,
        //filterText:'',
        data2:[],
        //data6:[],
        data4:[],
        //data5:[],
        //新增界面数据
        addForm: {},
        Form: {},
        addTreeNodeForm:{},

        //修改界面数据
        editTreeNodeForm: {},

        tableData: []
      };
    },
    mounted() {
      this.init();
      this.queryTotal();
    },
    methods: {
      goclear(){
        this.Form={};
        this.idList=[];
        this.data2=[];
      },
      //新增编辑选择父级id
      setIds(){
        // if(checked){
        let list = this.$refs.tree2.getCheckedNodes(true,false);
        this.idList=[];
        for(let i=0;i<list.length;i++){
          this.idList.push(list[i].id)
        }
        //alert(this.idList)
        //console.log(this.idList)
        //this.$refs.treeForm.setCheckedNodes([data]);
        //交叉点击节点
        /*  }else{
            this.$refs.treeForm.setCheckedNodes([]);
            //点击已经选中的节点，置空
          }*/
      },
      //新增编辑根据下拉框选择父级
      onChange(){
        let name=this.Form.treename;
        //alert(name)
        if(name!=null && name!=""){
          this.$http.get("biaoyin/tbTree/selectAll.do?treeName=" +name)
                  .then(({data})=>{
                    //console.log("=======")
                    //console.log(data)
                    this.data2 = data
                  });
        }
      }
      ,
      handleCurrentChange(val) {//改变页码触发的函数
        this.page = val;
        //console.log(val)
        this.initTree();
      },
      //过滤树上的节点
      filterNode(value, data) {
        //alert(value)
        //console.log(data)
        if (!value) return true;
        return data.label.indexOf(value) !== -1;
      },
      queryByName(){
        this.$http.get("biaoyin/tbTree/queryPage?pageNum=" + this.page + "&&pageSize=5&&name="+this.name).then(({data}) =>{
          //console.log("===================")
          //console.log(data)
          this.tableData=data.rows;
          this.total=data.total;
        })
      },
      //切换选项卡获取到tab实例
      handleClick(e){
        if(e.label!="主题词列表管理"){
          //console.log(e.label);
          this.treeName=e.label;
          //this.index=parseInt(e.name);
          //alert(this.index)
          this.queryByTreeName();
        }else{
          //this.index=parseInt(e.name);
          //alert(this.index)
          this.initTree()
        }
        this.activeName=e.name;

      },
      queryTotal() {
        //查询所以树形
        this.$http.get("biaoyin/tbDictionary/selectAll.do").then(({ data }) => {
          this.options = data
        });
      },
      //根据树形查询数据
      initTree(){
        if(this.name=="" ||this.name==null) {
          this.$http.get("biaoyin/tbTree/queryPage?pageNum=" + this.page + "&&pageSize=5").then(({data}) => {
            this.tableData = data.rows;
            this.total = data.total;
            //console.log(data)
          })
        }else(
                //console.log("==================="),
                this.queryByName()
        )
      },
      //页面初始化

      init() {
        //alert(this.activeName+"+++++++++++++")
        this.selectAllTreeName();
        this.initTree();

        if(this.showPane!="" &&this.showPane!=null) {
          this.activeName = this.showPane;
        }
        this.queryByTreeName();
      },
      //通过词典表初始化所有树形
      selectAllTreeName(){
        this.$http.get("biaoyin/tbDictionary/queryByName.do").then(({data}) => {
          //alert(data)
          for(let i=0;i<data.length;i++){
            //console.log(data[i])
            let o={
              "name":data[i].name,
              "index":data[i].id,
            }
            this.objs.push(o);
          }
        })
      },
      //根据数名查询列
      queryByTreeName(){
        this.$http.get("biaoyin/tbTree/selectAll.do?treeName=" + this.treeName)
                .then(({data})=>{
                  //console.log("=======")
                  //console.log(data)
                  this.data = data;
                  this.data4 = data
                  //console.log(this.data4)
                  //console.log(this.data4)
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
        let bool=true;

        if(this.Form.treename==null || this.Form.treename==""){
          bool=false;
          this.$message({
            message: '请选择树形',
            type: 'warning'
          });
        }else if (this.Form.meshcode ==null || this.Form.meshcode==""){
          bool=false;
          this.$message({
            message: '主题词编号不能为空',
            type: 'warning'
          });
        }else if(this.Form.name==null || this.Form.name==""){
          bool=false;
          this.$message({
            message: '主题词不能为空',
            type: 'warning'
          });
        }else if(this.idList.length>1){
          bool=false;
          this.$message({
            message: '只能选择一个父节点',
            type: 'warning'
          });
        }
        if(this.idList.length==1){
          this.Form.parentId=this.idList[0];
        }else if(this.idList.length<=0){
          this.Form.parentId=0;
        }
        if(bool){
          this.$http.post("biaoyin/tbTree/insert.do",this.Form).then(({data}) => {
            if(data){
              this.$message({
                message: '新增成功',
                type: 'success'
              });
              this.Form={};
              this.idList=[];
              this.data2=[];
            }else{
              this.$message.error("新增失败")

            }
            this.addFormVisible = false
            this.initTree()
          })
        }


      },

      //显示编辑页面
      findById(index=0,obj=null){
        this.changeFormVisible=true;
        this.Form=obj[index];
        //console.log(this.Form)
        //this.$http.get("biaoyin/tbTree/queryById.do?id="+id)
        this.idList.push(this.Form.parentId)
        //console.log(this.idList)
        this.onChange();
      },
      //提交编辑信息
      changeTree(){
        let bool=true;

        if (this.Form.meshcode ==null || this.Form.meshcode==""){
          bool=false;
          this.$message({
            message: '主题词编号不能为空',
            type: 'warning'
          });
        }else if(this.Form.name==null || this.Form.name==""){
          bool=false;
          this.$message({
            message: '主题词不能为空',
            type: 'warning'
          });
        }else if(this.idList.length>1){
          bool=false;
          this.$message({
            message: '只能选择一个父节点',
            type: 'warning'
          });
        }
        if(this.idList.length==1){
          this.Form.parentId=this.idList[0];
        }else if(this.idList.length<=0){
          this.Form.parentId=0;
        }
        if(bool) {
          this.$http.post("biaoyin/tbTree/updateById.do", this.Form).then(({data}) => {
            if (data) {
              this.$message({
                message: '编辑成功',
                type: 'success'
              });
              this.Form = {};
              this.idList = [];
              this.data2 = [];
            } else {
              this.$message.error("编辑失败")
            }
            /*console.log(data)
            console.log(this.Form)*/
            this.initTree()
            this.changeFormVisible = false
          })
        }

      },
      //删除信息
      delTree(index=0,obj=null){
        let id=obj[index].id;
        let treename=obj[index].treename;
        //alert(id)
        this.$http.get("biaoyin/tbLable/findByTreeName?treeName="+treename).then(({data}) => {
          if(data != null && data.length>0){ // 如果该词典存在标引
            this.$message.error("该词典正在使用中,不能删除");
          }else{
            this.$confirm("确认删除该主题及其下面所有主题吗？", "提示", {})
                    .then(() => {
                      //console.log(this.settings);
                      this.$http.get("biaoyin/tbTree/delById.do?id="+id).then(({data}) => {
                        //console.log(data);
                        if(data){
                          this.$message({
                            message: '删除成功',
                            type: 'success'
                          });
                        }else{
                          this.$message.error('删除失败');
                        }
                        this.initTree()

                      });
                    })
                    .catch(() => {
                      //console.log("取消");
                    });

          }
        });

      },
      append(data) {
        clickTreeNodedata = data;
        this.addTreeNodeVisible = true;
      },
      addTrees(){
        clickTreeNodedata = null;
        this.addTreeNodeVisible = true;
      },
      //保存新增的节点数据
      insert(){
        //console.log(clickTreeNodedata)
        if(clickTreeNodedata==null){
          this.addTreeNodeForm.parentId=0;
        }else{
          let parentId=clickTreeNodedata.id;
          this.addTreeNodeForm.parentId=parentId;
        }
        //alert(this.addTreeNodeForm.treename+""+this.addTreeNodeForm.meshcode)
        if(this.addTreeNodeForm.name==null || this.addTreeNodeForm.name==""){
          this.$message({
            message: '主题词名称不能为空',
            type: 'warning'
          });
        }  else{
          this.addTreeNodeForm.treename=this.treeName;
          this.$http.post("biaoyin/tbTree/insert.do",this.addTreeNodeForm).then(({data}) => {
            if(data){
              this.addTreeNodeForm={}
            }
            this.queryByTreeName();
            this.addTreeNodeVisible = false;
          })
        }

      },
      saveTreeNode() {
        this.insert();
      },
      delTree2(node, data){
        //alert(data.id)
        this.$http.get("biaoyin/tbTree/delById.do?id="+data.id).then(({data}) => {
          //console.log(data);
          this.queryByTreeName();
          if(data){
            this.$message({
              message:'删除成功',
              type:'success'
            })
          }else{
            this.$message.error("新增失败")
          }
        });
      },
      //移除节点
      remove(node, data) {
        this.$confirm('确认删除该节点及子节点吗？', '提示', {}).then(() => {
           this.delTree2(node, data);
        })
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
        //console.log(dat)
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
