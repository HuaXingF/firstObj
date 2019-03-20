<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.name" placeholder="请输入词典名称"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="findByPage(1,5)">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleAdd">新增词典</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<!--creater: "管理员"createrDate: "2018-01-01 08:00:00"id: "1"name: "mesh词典"note: "测试"specification: "树形"version: "2017-26"-->
		<el-table :data="tableData" highlight-current-row  style="width: 100%;">
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="name" label="词典名称" width="250" sortable>
			</el-table-column>
			<el-table-column prop="specification" label="词典规范" width="160" sortable>
			</el-table-column>
			<!--<el-table-column prop="cdbb" label="词典版本号" width="120" sortable>-->
			<!--</el-table-column>-->
			<el-table-column prop="creater" label="创建者" width="120" sortable>
			</el-table-column>
			<el-table-column prop="createrDate" label="创建时间" width="130" sortable>
			</el-table-column>
			<el-table-column prop="note" label="备注" width="130" sortable>
			</el-table-column>

			<el-table-column label="操作" width="200">
				<template scope="scope">
					<el-button @click="handleEdit(scope.$index,tableData)" size="small" >编辑</el-button>
					<el-button type="danger" v-on:click="del(scope.$index,tableData)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="5" :total="total" style="text-align:center;">
			</el-pagination>
		</el-col>

		<!--编辑界面-->
		<!--comment: null
		creatTime: null
		creatUser: null
		id: 1
		meshcode: "456"
		name: "三等份"
		notes: null
		parentId: 2
		treename: "mesh树"-->
		<el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
			<el-form :model="editForm" label-width="100px"  ref="editForm">

				<el-form-item label="词典名称">
					<el-input v-model="editForm.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="词典规范">
					<el-input v-model="editForm.specification" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="创建者">
					<el-input v-model="editForm.creater" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="备注">
					<el-input v-model="editForm.note" auto-complete="off"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--新增界面-->
		<el-dialog title="新增字典" v-model="addFormVisible" :close-on-click-modal="false">
			<el-form :model="addForm" label-width="90px"  ref="addForm">
				<el-form-item label="字典名称" prop="name">
					<el-input v-model="addForm.name" auto-complete="off"></el-input>
				</el-form-item>

				<el-form-item label="根节点名称" prop="name">
					<el-input v-model="addForm.nodeName" auto-complete="off"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addFormVisible = false">取消</el-button>
				<!--<el-button type="primary" @click.native="addDictory":loading="addLoading">新增词典</el-button>-->
				<el-button type="primary" v-on:click="addSubmit">新增词典</el-button>
			</div>
		</el-dialog>

	</section>
</template>

<script>
	import util from '../../common/js/util'
	//import NProgress from 'nprogress'
	//import { getUserListPage, removeUser, batchRemoveUser, editUser, addUser } from '../../api/api';

	export default {
		watch: {
			/*filterText(val) {
				this.$refs.tree2.filter(val);
			}*/

		},

		data() {
			return {
				filters: {
					name:null
				},
				tableData: [],

				options: [{
					value: '选项1',
					label: 'MESH体系'
				}, {
					value: '选项2',
					label: 'UMLS体系'
				}, {
					value: '选项3',
					label: '其他体系'
				}],


				users: [],
				total: 0,
				page: 1,
				listLoading: false,
				sels: [],//列表选中列

				editFormVisible: false,//编辑界面是否显示
				editLoading: false,

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
				addForm:{
					name:null,
					nodeName:null
				}
			}
		},
		methods: {
			filterNode(value, data) {
				if (!value) return true;
				return data.label.indexOf(value) !== -1;
			},
			handleCurrentChange(val) {//改变页码触发的函数
				this.page = val;
				//console.log(val)
				this.findByPage(this.page);
			},

			//删除
			handleDel: function (index, row) {
				this.$confirm('确认删除该记录吗?', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					//NProgress.start();
					let para = { id: row.id };
					removeUser(para).then((res) => {
						this.listLoading = false;
						//NProgress.done();
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.findByPage();
					});
				}).catch(() => {

				});
			},
			del(i,obj){
				let id=obj[i].id
				this.$http.get("biaoyin/tbDictionary/delById.do?id="+id).then(({data}) =>{
					console.log(data)
					this.findByPage();
				})
			},
			//显示编辑界面
			handleEdit(i,obj) {
				this.editForm=obj[i];
				console.log(this.editForm)
				this.editFormVisible = true;
			},


			//显示新增界面
			handleAdd: function () {
				this.addFormVisible = true
			},
			//编辑
			editSubmit() {
				this.$refs.editForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.chenge()
						});
					}
				});
			},
			chenge(){
				this.$http.post("biaoyin/tbDictionary/updateById.do",this.editForm).then(({data}) =>{
					console.log(data)
					this.editFormVisible = false;
					this.findByPage();
				})
			},
			/*addSubmit() {
				//this.$refs.addForm.validate((valid) => {
					//if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.addLoading = true;
							//NProgress.start();
							//let para = Object.assign({}, this.addForm);
							//para.birth = (!para.birth || para.birth == '') ? '' : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd');
							/!*this.addUser(para).then((data) => {
								this.addLoading = false;
								//NProgress.done();
								this.$message({
									message: '提交成功',
									type: 'success'
								});
								this.$refs['addForm'].resetFields();
								this.addFormVisible = false;
								this.getUsers();
							});*!/
							this.addUser()
						});
					//}
				//});
			},*/

			selsChange: function (sels) {
				this.sels = sels;
			},
			//获取用户列表
			//根据词典名称查询
			findByPage(num =1,pageSize = 5){
				let name=this.filters.name;
				if(name==null ||name ==""){
					this.$http.get("biaoyin/tbDictionary/queryPage.do?pageNum="+num+"&&pageSize="+pageSize).then(({data}) => {
						//console.log(data);
						this.total=data.total;
						//alert(this.total)
						//alert(this.page)
						//this.page=pageNum;
						this.tableData=data.rows;
						//console.log(this.tableData)
					})
				}else{
					this.$http.get("biaoyin/tbDictionary/queryPage.do?pageSize="+pageSize+"&&pageNum="+num+"&&name="+name).then(({data}) => {
						//console.log("==================================")
						//console.log(data);
						this.total=data.total;
						this.tableData=data.rows;
						//console.log(this.tableData)
					})
				}
			},
			//新增
			addSubmit:function (){
				this.$confirm('确认提交吗？', '提示', {}).then(() => {
					this.addUser();
				})
			},
			addUser(){
				this.$http.get("biaoyin/tbDictionary/insertTree.do?name=" + this.addForm.name+"&&nodeName="+this.addForm.nodeName).then(({data}) => {
					//console.log(data);
					if (data) {
						this.addLoading = false;
						this.addFormVisible = false;
						this.addDictory();
					}
				})

			},
			addDictory(){
				 this.addFormVisible=false;
				 this.$router.push({ path: '/page6'}) ;// 跳转到主题词典管理
			},
			//批量删除
			batchRemove: function () {
				var ids = this.sels.map(item => item.id).toString();
				this.$confirm('确认删除选中记录吗？', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					//NProgress.start();
					let para = { ids: ids };
					batchRemoveUser(para).then((res) => {
						this.listLoading = false;
						//NProgress.done();
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.findByPage();
					});
				}).catch(() => {

				});
			},
			ReferenceError :function(){

			}
		},
		mounted() {
			this.findByPage()
		}
	}

</script>


