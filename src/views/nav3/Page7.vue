<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-select v-model="filters.value" placeholder="请选择数据类别" @change="runFlash()">
						<el-option
								v-for="item in options"
								:key="item.value"
								:label="item.label"
								:value="item.value">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-input v-model="filters.name" placeholder="请输入患者名称"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="info" @click="dialogTableVisible = true" round>通过树形选择</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="queryOptions()">查询</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->

		<el-table :data="tableData"  highlight-current-row  style="width: 100%;" v-bind:title="fullContext">


			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column v-for="item in list1" v-bind:prop="item.shuXing" v-bind:label="item.ziDuan" width="120" sortable>
			</el-table-column>
			<!--<el-table-column prop="xb" label="性别" width="120" sortable>
			</el-table-column>
			<el-table-column prop="nl" label="年龄" width="120" sortable>
			</el-table-column>
			&lt;!&ndash; <el-table-column prop="birth" label="出生年月" width="120" sortable>
            </el-table-column> &ndash;&gt;
			&lt;!&ndash; <el-table-column prop="addr" label="家庭地址" min-width="180" sortable>
            </el-table-column> &ndash;&gt;
			<el-table-column prop="blms" label="病历描述"  min-width="140" sortable>
			</el-table-column>
			<el-table-column prop="byzt" label="标引状态" min-width="120" sortable>
			</el-table-column>-->
			<el-table-column label="操作" width="130">
				<template scope="scope">
					<el-button type="danger" size="small" @click="showDetail(scope.$index,scope.row)">查看详情</el-button>
				</template>
			</el-table-column>
		</el-table>


		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="5" :total="total" style="float:right;">
			</el-pagination>
		</el-col>

		<!--详情界面-->
		<el-dialog title="查看详情" v-model="addFormVisible" :close-on-click-modal="false">
			<el-form  label-width="100px" :rules="addFormRules" ref="addForm">
				<el-form-item v-for="item in list1" v-bind:label="item.ziDuan"   prop="name">
					<el-input v-model="addForm[item.shuXing]"  auto-complete="off" disabled="disabled" ></el-input>
				</el-form-item>
				<!--<el-form-item label="性别">
					<el-input v-model="addForm.xb" auto-complete="off" disabled="disabled"></el-input>
				</el-form-item>
				<el-form-item label="年龄">
					<el-input v-model="addForm.nl" auto-complete="off" disabled="disabled"></el-input>
				</el-form-item>
				<el-form-item label="病区名称">
				    <el-input v-model="addForm.bqmc" auto-complete="off" disabled="disabled"></el-input>
			    </el-form-item>
				<el-form-item label="病区号">
					<el-input v-model="addForm.bfh" auto-complete="off" disabled="disabled"></el-input>
				</el-form-item>
				<el-form-item label="床号">
					<el-input v-model="addForm.ch" auto-complete="off" disabled="disabled"></el-input>
				</el-form-item>
				<el-form-item label="入院时间">
					<el-input v-model="addForm.rysj" auto-complete="off" disabled="disabled"></el-input>
				</el-form-item>
				<el-form-item label="出院时间">
					<el-input v-model="addForm.cysj" auto-complete="off" disabled="disabled"></el-input>
				</el-form-item>
				<el-form-item label="住院天数">
					<el-input v-model="addForm.zyts" auto-complete="off" disabled="disabled"></el-input>
				</el-form-item>
				<el-form-item label="入院诊断">
					<el-input type="textarea" v-model="addForm.ryzd" auto-complete="off" disabled="disabled"></el-input>
				</el-form-item>
				<el-form-item label="入院症状特征">
					<el-input v-model="addForm.ryzztz" auto-complete="off" disabled="disabled"></el-input>
				</el-form-item>
				<el-form-item label="病历描述">
					<el-input type="textarea" v-model="addForm.blms" disabled="disabled"></el-input>
				</el-form-item>-->
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addFormVisible = false">关闭</el-button>
			</div>
		</el-dialog>

		<el-dialog title="请选择查询的主题词" :visible.sync="dialogTableVisible">
			<el-input
					placeholder="输入关键字进行过滤"
					v-model="filterText">
			</el-input>
			<el-tree
					:data="data4"
					show-checkbox
					node-key="id"
					default-expand-all
					:expand-on-click-node="false"
					:filter-node-method="filterNode"
					@check-change="setIds"
					ref="tree2">
			</el-tree>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="dialogTableVisible = false">取消</el-button>
				<el-button type="primary"  @click.native="queryOptions()">确定</el-button>
			</div>
		</el-dialog>

	</section>
</template>

<script>
	import util from '../../common/js/util'
	//import NProgress from 'nprogress'
	import { getUserListPage, removeUser, batchRemoveUser, editUser, addUser } from '../../api/api';

	export default {
		watch: {
			filterText(val) {
				this.$refs.tree2.filter(val);
			}
		},
		data() {

			//const data = []
			return {
				//用于渲染页面字段
				shuxingString: '',
				list1:[],
				//list2:[],

				show:"",
				filterText: '',
				treeName:[],
				idList:[],
				obj:{},
				data4:[],
				data5:[],
				filters: {
					name: "",
					value:"",
				},
				tableData: [],
				//标引状态信息转换
				//lable:["已标引","标引中","未标引"],
				options: [ {
					value: 'tb_yl_mz_medical_record',
					label: '就诊数据'
				}, {
					value: 'tb_cls_lh_summary',
					label: '住院数据'
				}],
				dialogTableVisible: false,
				value: '',
				users: [],
				total: 0,
				page: 1,
				listLoading: false,
				sels: [],//列表选中列
				fullContext:'',
				startus:["已标引","标引中","未标引"],

				editFormVisible: false,//编辑界面是否显示
				editLoading: false,
				editFormRules: {
					name: [
						{ required: true, message: '请输入姓名', trigger: 'blur' }
					]
				},
				//编辑界面数据
				editForm: {},
				addFormVisible: false,//新增界面是否显示
				addLoading: false,
				addFormRules: {
					name: [
						{ required: true, message: '请输入姓名', trigger: 'blur' }
					]
				},
				//新增界面数据
				addForm: []
			}
		},
		methods: {
			//过滤树上的节点
			filterNode(value, data) {
				if (!value) return true;
				return data.label.indexOf(value) !== -1;
			},
			//性别显示转换
			// formatSex: function (row, column) {
			// 	return row.sex == 1 ? '男' : row.sex == 0 ? '女' : '未知';
			// },
			handleCurrentChange(val) {
				this.page = val;
				if(this.filters.value=="" || this.filters.value==null){
					this.findByPage();
				}else{
					this.queryOptions()
				}

			},
			//获取用户列表
			findByPage() {
				this.listLoading = true;
				this.$http.get("biaoyin/tbYlMzMedicalRecord/findPage.do?pageNum="+this.page+"&&pageSize=5").then(({data}) => {
					this.total = data.total;
					//this.users = data.users;
					this.listLoading = false;
					this.tableData = data.rows;
					this.changestarus();
					console.log(this.tableData)
				});
				this.initTree();

			},
			changestarus(){
				for(let i=0;i<this.tableData.length;i++){
					//alert(parseInt(this.tableData[i].byzt)-1+"===============")
					this.tableData[i].byzt=this.startus[parseInt(this.tableData[i].byzt)-1];
				}
			}
			,
			setIds(){

				// if(checked){
				let list = this.$refs.tree2.getCheckedNodes(true,false);
				this.idList=[];
				for(let i=0;i<list.length;i++){
					this.idList.push(list[i].id)
				}
				//alert(this.idList)
				console.log(this.idList)
				//this.$refs.treeForm.setCheckedNodes([data]);
				//交叉点击节点
				/*  }else{
                    this.$refs.treeForm.setCheckedNodes([]);
                    //点击已经选中的节点，置空
                  }*/
			},
			//初始化树形
			initTree(){
				let treeName ;
				this.$http.get("biaoyin/tbSysSettings/queryById.do?id=2").then(({data}) => {
					treeName=data.itemValue;
					this.treeName=treeName;
					//alert(this.treeName)
					this.init2()
				})

			},
			init2(){
				// 通过树形选
				this.$http.get("biaoyin/tbTree/selectAll.do?treeName="+this.treeName).then(({data})=>{
					//alert(this.treeName)
					this.data4 = data;
					//console.log(data)
				})
			},
			queryOptions(){
				//filters
				this.obj={};
				this.dialogTableVisible = false;
				if(this.filters.value!="" &&this.filters.value!=null){
					this.obj.tableName=this.filters.value;
					if(this.filters.name!=null && this.filters.name!=""){
						let maps={
							xm:this.filters.name
						}
						this.obj.map=maps;
					}
					console.log(this.obj)
					if(this.idList.length>0) {
						this.obj.idList = this.idList;
					}
					let url="biaoyin/findPage/"+ this.obj.tableName+"/findPageByInfo.do?pageNum="+this.page+"&&pageSize=5";
					this.$http.post(url,this.obj).then(({data}) =>{
						this.total = data.total;
						this.users = data.users;
						this.listLoading = false;
						this.tableData =data.rows
						this.changestarus();
					})
				}else{
					this.$message({
						message:'请选择数据类别',
						type:'warning'
					})
				}
			},
			//显示详情界面
			showDetail: function (index, row) {
				    this.addFormVisible = true;
				    this.addForm = row;
				/*for (let prop in this.addForm) {
					console.log("obj." + prop + " = " + this.addForm[prop]);
				}*/
			},
			//初始化显示表单字段信息
			showColums(){
				let tableName="tb_yl_mz_medical_record"
				if(this.filters.value!="" &&this.filters.value!=null){
					tableName=this.filters.value;
				}
				this.$http.get("/biaoyin/findPage/queryColums.do?tableName="+tableName).then(({data}) => {
					this.list1=data;
					//console.log(data)

				})
			},
			//监听类别选择
			runFlash(){
				let obj={};
				obj.tableName=this.filters.value;
				this.showColums();
				let url="biaoyin/findPage/"+obj.tableName+"/findPageByInfo.do?pageNum="+this.page+"&&pageSize=5"
				//alert(obj.tableName)
				this.$http.post(url,obj).then(({data}) =>{
					this.total = data.total;
					this.users = data.users;
					this.listLoading = false;
					this.tableData =data.rows
					this.changestarus();
				})
			},

		},
		created() {
			this.findByPage();
			this.showColums();
		}
	}

</script>

<style scoped>

</style>
