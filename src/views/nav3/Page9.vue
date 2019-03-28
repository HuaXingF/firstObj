<template>
  <el-tabs v-model="activeName" @tab-click="handleClick">
    <!--标引弹框-->
    <el-dialog title="请选择查询的主题词" :visible.sync="dialogTableVisible">
      <div>
        当前所选关键词：
        <span style="color: red">{{this.getSelText()}}</span>
      </div>
      <el-input placeholder="输入关键字进行过滤" v-model="filterText"></el-input>
      <el-tree
        :data="data4"
        show-checkbox
        node-key="id"
        default-expand-all
        :expand-on-click-node="false"
        :props="defaultProps"
        :filter-node-method="filterNode"
        @check-change="setIds"
        ref="tree2"
      ></el-tree>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="dialogTableVisible = false">取消</el-button>
        <el-button type="primary" v-on:click="queryOptions()">确定</el-button>
      </div>
    </el-dialog>

    <!--住院小结标引tab页-->
    <el-tab-pane label="出院小结表(133)" name="0">
      <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
          <el-form :inline="true" :model="filters">
            <el-form-item>
              <el-input placeholder="请输入查询姓名" v-model="name"></el-input>
            </el-form-item>
            <el-form-item>
              <span class="demonstration">请选择标引状态</span>
              <el-select v-model="value" placeholder="请选择标引状态">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <div class="block">
                <span class="demonstration">请选择起止时间</span>
                <el-date-picker
                  v-model="value5"
                  type="datetimerange"
                  :picker-options="pickerOptions2"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  align="right"
                ></el-date-picker>
              </div>
            </el-form-item>

            <el-form-item>
              <el-button type="info" @click="dialogTableVisible = true" round>通过树形选择</el-button>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" v-on:click="queryOptions">查询</el-button>
            </el-form-item>
          </el-form>
        </el-col>

        <!--列表-->
        <el-table
          :data="tableData"
          highlight-current-row
          @selection-change="selsChange"
          style="width: 100%;"
        >
          <el-table-column type="index" width="60" fixed="left"></el-table-column>
          <el-table-column prop="jzlsh" label="住院就诊流水号" width="120" sortable></el-table-column>
          <el-table-column prop="yljgdm" label="医疗机构代码" width="100" sortable></el-table-column>
          <el-table-column prop="xm" label="姓名" width="90" sortable></el-table-column>
          <el-table-column prop="nl" label="年龄" width="120" sortable></el-table-column>
          <el-table-column prop="ksmc" label="科室名称" min-width="170" sortable></el-table-column>
          <el-table-column prop="rysj" label="入院时间" min-width="170" sortable></el-table-column>
          <el-table-column prop="cysj" label="出院时间" min-width="170" sortable></el-table-column>
          <el-table-column prop="zzysxm" label="主治医师" min-width="170" sortable></el-table-column>
          <el-table-column prop="byzt" label="标引状态" min-width="180" sortable></el-table-column>
          <!--<el-table-column prop="czz" label="操作者" min-width="170" sortable></el-table-column>-->
          <el-table-column label="操作" width="200" fixed="right">
            <template scope="scope">
              <el-button v-if="scope.row.byzt!='已标引'" type="danger" size="small" @click="markText(scope.$index, scope.row)">开始标引</el-button>
              <el-button v-if="scope.row.byzt=='已标引'" type="danger" size="small" @click="markText(scope.$index, scope.row)">编辑标引</el-button>
              <el-button v-if="scope.row.byzt=='已标引'" type="danger" size="small" @click="viewText(scope.$index, scope.row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>

       <!-- &lt;!&ndash;翻页工具条&ndash;&gt;
        <el-col :span="24" class="toolbar">
          <el-pagination
            layout="prev, pager, next"
            @current-change="handleCurrentChange"
            :page-size="10"
            :total="total"
            style="float:right;"
          ></el-pagination>
        </el-col>-->

        <!--已标引的关键字列表-->
        <el-dialog title="已关联列表" v-model="markedFormVisible" :close-on-click-modal="false">
          <!--工具条-->
          <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
              <el-form-item>
                <el-input placeholder="请输入关键字查询"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" v-on:click="getUsers">查询</el-button>
              </el-form-item>
            </el-form>
          </el-col>

          <el-table :data="markData" highlight-current-row style="width: 100%;">
            <el-table-column type="index" width="60"></el-table-column>
            <el-table-column prop="keyword" label="关键字" width="120" sortable></el-table-column>
            <el-table-column prop="meshword" label="主题词" width="90" sortable></el-table-column>
            <el-table-column prop="marktime" label="标引时间" width="90" sortable></el-table-column>
            <el-table-column prop="marker" label="标引者" width="120" sortable></el-table-column>
            <el-table-column label="操作" width="200">
              <template scope="scope">
                <el-button type="danger" size="small">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click.native="markedFormVisible = false" :loading="false">关闭</el-button>
          </div>
        </el-dialog>

        <!--标引界面-->
        <el-dialog title="数据标引" v-model="addFormVisible" :close-on-click-modal="false">
          <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="addForm.name" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="性别">
              <el-input v-model="addForm.sex" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="年龄">
              <el-input v-model="addForm.age" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="标引内容" prop="des">
              <div
                v-html="markContent"
                v-on:click="getSelectionText"
                style="background-color:#F2F2F2;"
              ></div>
            </el-form-item>
            <el-form-item label="关联关系">
              <div>
                <el-tag>呕吐现象->胃炎</el-tag>
                <el-tag>轻度器质性病变->胃溃疡</el-tag>
                <el-tag>持续性上腹隐痛->胃炎</el-tag>
                <el-tag>轻度器质性病变->胃溃疡</el-tag>
                <el-tag>轻度器质性病变->胃溃疡</el-tag>
                <el-tag>呕吐现象->胃炎</el-tag>
              </div>
            </el-form-item>
          </el-form>

          <div slot="footer" class="dialog-footer">
            <el-button @click.native="addFormVisible = false">取消</el-button>
            <el-button type="primary" @click.native="addFormVisible = false">提交标引</el-button>
          </div>
        </el-dialog>
      </section>
    </el-tab-pane>

    <!--手术明细tab页-->
    <el-tab-pane label="手术明细表(0)" name="1">
      <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
          <el-form :inline="true" :model="filters">
            <el-form-item>
              <el-input placeholder="请输入关键字查询"></el-input>
            </el-form-item>
            <el-form-item>
              <span class="demonstration">请选择标引状态</span>
              <el-select v-model="value" placeholder="请选择标引状态">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <div class="block">
                <span class="demonstration">请选择起止时间</span>
                <el-date-picker
                  v-model="value5"
                  type="datetimerange"
                  :picker-options="pickerOptions2"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  align="right"
                ></el-date-picker>
              </div>
            </el-form-item>

            <el-form-item>
              <el-button type="info" @click="dialogTableVisible = true" round>通过树形选择</el-button>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" v-on:click="getUsers">查询</el-button>
            </el-form-item>
          </el-form>
        </el-col>

        <!--列表-->
        <el-table
          :data="tableData2"
          highlight-current-row
          @selection-change="selsChange"
          style="width: 100%;"
        >
          <el-table-column type="index" width="60"></el-table-column>
          <el-table-column prop="name" label="患者姓名" width="120" sortable></el-table-column>
          <el-table-column prop="sex" label="性别" width="100" sortable></el-table-column>
          <el-table-column prop="age" label="年龄" width="90" sortable></el-table-column>
          <el-table-column prop="birth" label="出生年月" width="120" sortable></el-table-column>
          <el-table-column prop="addr" label="家庭地址" min-width="170" sortable></el-table-column>
          <el-table-column prop="bingli" label="病历描述" min-width="180" sortable></el-table-column>
          <el-table-column prop="byzt" label="标引状态" min-width="180" sortable></el-table-column>
          <el-table-column prop="czz" label="操作者" min-width="170" sortable></el-table-column>
          <el-table-column label="操作" width="200">
            <template scope="scope">
              <el-button size="small" @click="showMarkedList()">查看已标引</el-button>
              <el-button type="danger" size="small" @click="markText(scope.$index, scope.row)">开始标引</el-button>
            </template>
          </el-table-column>
        </el-table>

      <!--  &lt;!&ndash;翻页工具条&ndash;&gt;
        <el-col :span="24" class="toolbar">
          <el-pagination
            layout="prev, pager, next"
            @current-change="handleCurrentChange"
            :page-size="20"
            :total="total"
            style="float:right;"
          ></el-pagination>
        </el-col>-->

        <!--标引    界面-->
        <el-dialog title="数据标引" v-model="addFormVisible" :close-on-click-modal="false">
          <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="addForm.name" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="性别">
              <el-input v-model="addForm.sex" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="年龄">
              <el-input v-model="addForm.age" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="标引内容" prop="des">
              <div
                v-html="markContent"
                v-on:click="getSelectionText"
                style="background-color:#F2F2F2;"
              ></div>
            </el-form-item>
            <el-form-item label="关联关系">
              <div>
                <el-tag>呕吐现象->胃炎</el-tag>
                <el-tag>轻度器质性病变->胃溃疡</el-tag>
                <el-tag>持续性上腹隐痛->胃炎</el-tag>
                <el-tag>轻度器质性病变->胃溃疡</el-tag>
                <el-tag>轻度器质性病变->胃溃疡</el-tag>
                <el-tag>呕吐现象->胃炎</el-tag>
              </div>
            </el-form-item>
          </el-form>

          <div slot="footer" class="dialog-footer">
            <el-button @click.native="addFormVisible = false">取消</el-button>
            <el-button type="primary" @click.native="addFormVisible = false">提交标引</el-button>
          </div>
        </el-dialog>
      </section>
    </el-tab-pane>

    <!--诊断明细表tab-->
    <el-tab-pane label="诊断明细表(0)" name="2">
      <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
          <el-form :inline="true" :model="filters">
            <el-form-item>
              <el-input placeholder="请输入关键字查询"></el-input>
            </el-form-item>
            <el-form-item>
              <span class="demonstration">请选择标引状态</span>
              <el-select v-model="value" placeholder="请选择标引状态">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <div class="block">
                <span class="demonstration">请选择起止时间</span>
                <el-date-picker
                  v-model="value5"
                  type="datetimerange"
                  :picker-options="pickerOptions2"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  align="right"
                ></el-date-picker>
              </div>
            </el-form-item>

            <el-form-item>
              <el-button type="info" @click="dialogTableVisible = true" round>通过树形选择</el-button>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" v-on:click="getUsers">查询</el-button>
            </el-form-item>
          </el-form>
        </el-col>

        <!--列表-->
        <el-table
          :data="tableData3"
          highlight-current-row
          @selection-change="selsChange"
          style="width: 100%;"
        >
          <el-table-column type="index" width="60"></el-table-column>
          <el-table-column prop="name" label="患者姓名" width="120" sortable></el-table-column>
          <el-table-column prop="sex" label="性别" width="100" sortable></el-table-column>
          <el-table-column prop="age" label="年龄" width="90" sortable></el-table-column>
          <el-table-column prop="birth" label="出生年月" width="120" sortable></el-table-column>
          <el-table-column prop="addr" label="家庭地址" min-width="170" sortable></el-table-column>
          <el-table-column prop="bingli" label="病历描述" min-width="180" sortable></el-table-column>
          <el-table-column prop="byzt" label="标引状态" min-width="180" sortable></el-table-column>
          <el-table-column prop="czz" label="操作者" min-width="170" sortable></el-table-column>
          <el-table-column label="操作" width="200">
            <template scope="scope">
              <el-button type="danger" size="small" @click="markText(scope.$index, scope.row)">开始标引</el-button>
            </template>
          </el-table-column>
        </el-table>


      </section>
    </el-tab-pane>
      <!--翻页工具条-->
      <!--工具条-->
      <el-col :span="24" class="toolbar">
          <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="5" :total="total" style="text-align:right;">
          </el-pagination>
      </el-col>
  </el-tabs>
</template>

<script>
import axios from "axios";
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

var selectText;
export default {
  watch: {
    filterText(val) {
      this.$refs.tree2.filter(val);
    }

  },
  data() {
    return {
      activeName: "0",
      filterText: "",
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      index:0,
      keyWordTable:["tb_cls_lh_summary","tb_cls_lh_summary"],
      idList:[],
      data4: [],
      dialogTableVisible: false,
      filters: {
        name: ""
      },
      markContent: null,
      tableData: [],
      tableData2: [],
      tableData3: [],
      name:null,
        obj:{},
      options: [
        {
          value: "",
          label: "全部"
        },
        {
          value: "3",
          label: "未标引"
        },
        {
          value: "2",
          label: "标引中"
        },
        {
          value: "1",
          label: "已标引"
        },
      ],

      markData: [
        /*{
          keyword: "呕吐",
          meshword: "胃炎",
          marktime: "2018-02-22",
          marker: "张国华"
        },
        {
          keyword: "呕吐",
          meshword: "胃炎",
          marktime: "2018-02-22",
          marker: "张国华"
        },
        {
          keyword: "呕吐",
          meshword: "胃炎",
          marktime: "2018-02-22",
          marker: "张国华"
        },
        {
          keyword: "呕吐",
          meshword: "胃炎",
          marktime: "2018-02-22",
          marker: "张国华"
        },
        {
          keyword: "呕吐",
          meshword: "胃炎",
          marktime: "2018-02-22",
          marker: "张国华"
        }*/
      ],
      pickerOptions2: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            }
          }
        ]
      },
      value4: [new Date(2000, 10, 10, 10, 10), new Date(2000, 10, 11, 10, 10)],
      value5: "",
      strus:["已标引","标引中","未标引"],
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
       handleCurrentChange(val) {
          this.page = val;
          if(this.obj==null || this.obj=={}){
              this.queryOptions()
          }else{
              this.init(this.page);
          }

      },
    setIds(){

       // if(checked){
         let list = this.$refs.tree2.getCheckedNodes(true,false);
          console.log(list)
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
    //按条件查询数据
    //查询传参实例:{"tableName":"tb_brands","idList":[1,2,3],"map":{"name":"dfg";"list":[{"","",""}]}}}
    queryOptions(){
      this.dialogTableVisible = false;
      this.obj={};
      let maps={};
      if(this.name!=null && this.name!=""){
       maps.xm=this.name;
       //this.obj.map=maps;
      }
      if(this.value=="1" || this.value=="2"|| this.value=="3"){
        maps.byzt=this.value;
      }

      if(this.idList.length>0){
        this.obj.idList=this.idList;
      }
      //console.log(this.value5)
      if(this.value5.length>=1){
       // alert("1")
        //let value1=.format("yyyy-MM-dd");
        let d = new Date(this.value5[0])//.format("yyyy-MM-dd")
        let  time1=d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
        let b = new Date(this.value5[1])//.format("yyyy-MM-dd")
        let time2=b.getFullYear() + '-' + (b.getMonth() + 1) + '-' + b.getDate() + ' ' + b.getHours() + ':' + b.getMinutes() + ':' + b.getSeconds();

          //alert(time1)
        let list=[{"ziDuan":"cysj","value1":time1,"value2":time2}];
        maps.list=list;

      }
      if(maps!=null && maps!={}){
        this.obj.map=maps;
      }
      this.obj.tableName=this.keyWordTable[this.index]
        let url="biaoyin/findPage/"+ this.obj.tableName+"/findPageByInfo.do?pageNum="+this.page+"&&pageSize=5";
        this.$http.post(url,this.obj).then(({data}) =>{
            let list = data.rows;
            this.total = data.total;
            this.tableData = list;
           this.xiugai();
        })
      console.log(this.obj)
    },
    editLoading() {},
    handleClick(e) {
      this.index=e.name
      this.activeName=e.name;
    },
    renderContent() {},

    init(pageNum = 1, pageSize =5) {
      //请求出院小结数据数据列表
      this.$http
        .get(
          "biaoyin/tbClsLhSummary/findPage.do?pageNum=" +
            pageNum +
            "&&pageSize=" +
            pageSize
        )
        .then(({ data }) => {
          let list = data.rows;
          this.total = data.total;
          this.tableData = list;
          this.xiugai();
        });
      // 通过树形选择
      this.$http.get("biaoyin/tbSysSettings/queryTotal.do").then(({data})=>{
        for (let i=0;i<data.length;i++) {
           if (data[i].itemName == "生效树形") {
             let treeName = data[i].itemValue;// 根据树形名称来取决于是什么树
             this.$http.get("biaoyin/tbTree/selectAll.do?treeName=" + treeName).then(({data})=>{
                this.data4 = data;
             })
           }
        }
      })
    },
    // 改变状态码
    xiugai(){
      for (let i=0; i<this.tableData.length; i++) {
        this.tableData[i].byzt=this.strus[parseInt(this.tableData[i].byzt)-1]
        //alert(this.tableData[i].byzt);
      }
    },
    //过滤树上的节点
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    //显示编辑界面
    markText: function(i, { jzlsh, yljgdm }) {
      let list = JSON.stringify(this.tableData);
      this.$router.push({//跳转到编辑页的时候把参数传过去
        path: "/page10",
        query: {
          i,
          jzlsh,
          yljgdm,
          list
        }
      });
    },
    // 查看已标引
    viewText: function(i, { jzlsh, yljgdm }) {
      let list = JSON.stringify(this.tableData);
      this.$router.push({//跳转到查看页的时候把参数传过去
        path: "/page12",
        query: {
          i,
          jzlsh,
          yljgdm,
          list
        }
      });
    },
    selsChange: function(sels) {
      this.sels = sels;
    },
    getSelectionText: function() {
      this.selectText = window.getSelection().toString();
      if (this.selectText.toString() != "") this.dialogTableVisible = true;
    },
    getSelText: function() {
      this.selectText = window.getSelection().toString();
      return this.selectText;
    },
    //获取用户列表
    getUsers() {
    },

    showMarkedList() {
      this.markedFormVisible = true;
    }
  },
  mounted() {
    // this.getUsers();
    this.init();
    //this.initTree();
  }
};
</script>
<style>
.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both;
}

.box-card {
  width: 480px;
}
</style>
