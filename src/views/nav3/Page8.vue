<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.name" placeholder="请输入关键字查询"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getByName()">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleAdd">新增关联</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="tableData" highlight-current-row  style="width: 100%;">
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="keyword" label="关键字" width="250" sortable>
			</el-table-column>
			<el-table-column prop="meshword" label="主题词" width="160" sortable>
			</el-table-column>
			<el-table-column prop="markedtime" label="标引时间" width="120" sortable>
			</el-table-column>
			<el-table-column prop="markedby" label="标引者" width="120" sortable>
			</el-table-column>
			<el-table-column prop="meshcode" label="主题词代码" width="150" sortable>
			</el-table-column>
			<el-table-column prop="numbers" label="引用次数" width="120" sortable>
			</el-table-column>
			<el-table-column prop="treename" label="字典体系" width="120" sortable>
			</el-table-column>
			<el-table-column label="操作" width="200">
				<template scope="scope">
					<el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
					<el-button type="danger" size="small" @click="markText(scope.$index, scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>
		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-pagination layout="prev, pager, next"
						   @current-change="handleCurrentChange"
						   :page-size="10"
						   :total="total"
						   style="float:right;">
			</el-pagination>
		</el-col>

		<!--编辑界面-->
		<el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
			<el-form :model="editForm" label-width="100px"  ref="editForm">
				<el-form-item label="关键字">
					<el-input v-model="editForm.keyword" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="关联词">
					<el-input v-model="editForm.meshword" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="标引时间">
					<el-input v-model="editForm.markedtime" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="标引者">
					<el-input v-model="editForm.markedby" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="主题词代码">
					<el-input v-model="editForm.meshcode" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="引用次数">
					<el-input v-model="editForm.numbers" auto-complete="off"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--新增界面-->
		<el-dialog title="新增关联" v-model="addFormVisible" :close-on-click-modal="false">
			<el-form :model="addForm" label-width="80px"  ref="addForm">
				<el-form-item label="关键字" prop="name">
					<el-input v-model="addForm.keyword" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="字典体系" prop="treename">
					<el-select v-model="addForm.treename" placeholder="请选择字典体系" @change="addTree()">
						<el-option label="MESH树" value="MESH树"></el-option>
						<el-option label="UMLS树" value="UMLS树"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="主题词">
					<el-input
							placeholder="输入关键字进行过滤"
							v-model="filterText">
					</el-input>
					<el-tree
							:data="data2"
							show-checkbox
							node-key="id"
							:default-expanded-keys="[2, 3]"
							:default-checked-keys="[5]"
							:props="defaultProps"
							:filter-node-method="filterNode"
							ref="tree2">
					</el-tree>
				</el-form-item>

			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="addSubmit" :loading="addLoading">新增关联</el-button>
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
			return {
				filterText: '',
				data2: [ ],
				defaultProps: {
					children: 'children',
					label: 'label'
				},
				filters: {
					name: ''
				},
				tableData: [],

				options: [],


				users: [],
				total: 0,
				page: 1,
				listLoading: false,
				sels: [],//列表选中列

				editFormVisible: false,//编辑界面是否显示
				editLoading: false,

				//编辑界面数据
				editForm: {
					/*gjz:'胃部发炎',
					glc:'胃溃疡',
					bysj:'2016-10-23',
					bjz:'张国华',
					cdl:'A',
					cxl:'A1',
					bh:'233-234-343-3',
					bbh:'201601',*/
				},

				addFormVisible: false,//新增界面是否显示
				addLoading: false,
				addFormRules: {
					name: [
						{ required: true, message: '请输入姓名', trigger: 'blur' }
					]
				},
				//新增界面数据
				addForm: {
					keyword : null,
					treename : null
					/*gjz:'胃部发炎',
					glc:'胃溃疡',
					bysj:'2016-10-23',
					bjz:'张国华',
					cdl:'A',
					cxl:'A1',
					bh:'233-234-343-3',
					bbh:'201601',*/
				}

			}
		},
		methods: {
			filterNode(value, data) {
				if (!value) return true;
				return data.label.indexOf(value) !== -1;
			},
			handleCurrentChange(val) {
				this.page = val;
				//this.getUsers();
				let keyword=this.filters.name;
				if (keyword == null || keyword == "") {
				  this.init(this.page);
				}else {
					this.getByName(this.page);
				}
			},

			//删除
			/*handleDel: function (index, row) {
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
						this.getUsers();
					});
				}).catch(() => {

				});
			},*/
			//显示编辑界面弹窗
			handleEdit: function (index, row) {
				//alert(index+"----"+row);
				this.editFormVisible = true;
				this.editForm = Object.assign({}, row);
			},
			//显示新增界面弹窗
			handleAdd: function () {
				this.addFormVisible = true;
				this.addForm = {
					treename : 'MESH树'
					/*name: '',
					sex: -1,
					age: 0,
					birth: '',
					addr: ''*/
				};
				this.addTree();
			},
			//添加树
			addTree(){
				let treeName = this.addForm.treename;
				this.$http.get("biaoyin/tbTree/selectAll.do?treeName=" + treeName)
						.then(({data})=>{
							this.data2 = data;
							console.log(this.data2)
						});
			},
			// 删除
			markText : function(index, row){
				let id = row.id;
				this.$confirm('确认删除吗？', '提示', {}).then(() => {
					this.listLoading = true;
					this.$http.get("biaoyin/tbLable/delTbLableById.do?id="+id).then(({data}) => {
						this.listLoading = false;
						this.init();
					});
				});
	        },
			//编辑
			editSubmit: function () {
				this.$refs.editForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.editLoading = true;
							//NProgress.start();
							let para = Object.assign({}, this.editForm);
							para.markedtime = (!para.markedtime || para.markedtime == '') ? '' : util.formatDate.format(new Date(para.markedtime), 'yyyy-MM-dd');
							this.$http.post("biaoyin/tbLable/updateTbLable.do",para).then(({ data }) =>{
								this.editLoading = false;
								this.$refs['editForm'].resetFields();
								this.editFormVisible = false;
								this.init();
							});
							/*editUser(para).then((res) => {
								alert("111");
								this.editLoading = false;
								//NProgress.done();
								this.$message({
									message: '提交成功',
									type: 'success'
								});
								this.$refs['editForm'].resetFields();
								this.editFormVisible = false;
								//this.getUsers();
								this.init();
							});*/
						});
					}
				});
			},
			//新增
			addSubmit: function () {
				this.$refs.addForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.addLoading = true;
							//NProgress.start();
							let para = Object.assign({}, this.addForm);
							this.$http.post("biaoyin/tbLable/insertTbLable.do",para).then(({ data }) =>{
								this.addLoading = false;
								this.$refs['addForm'].resetFields();
								this.editFormVisible = false;
								this.init();
							});
							/*addUser(para).then((res) => {
								this.addLoading = false;
								//NProgress.done();
								this.$message({
									message: '提交成功',
									type: 'success'
								});
								this.$refs['addForm'].resetFields();
								this.addFormVisible = false;
								this.getUsers();
							});*/
						});
					}
				});
			},
			selsChange: function (sels) {
				this.sels = sels;
			},
			//获取用户列表
			/*getUsers() {
				let para = {
					page: this.page,
					name: this.filters.name
				};
				this.listLoading = true;
				//NProgress.start();
				getUserListPage(para).then((res) => {
					this.total = res.data.total;
					this.users = res.data.users;
					this.listLoading = false;
					//NProgress.done();
				});
			},*/
			//批量删除
			/*batchRemove: function () {
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
						this.getUsers();
					});
				}).catch(() => {

				});
			},*/
			// 初始化方法
			init(pageNum = 1, pageSize = 10) {
				//请求出院小结数据数据列表
				this.$http
						.get(
								"biaoyin/tbLable/findPage.do?pageNum=" +
								pageNum +
								"&&pageSize=" +
								pageSize
						)
						.then(({ data }) => {
							let list = data.rows;
							this.total = data.total;
							this.tableData = list;
						});
			},
			// 查询
			getByName(pageNum = 1, pageSize = 10){
				let keyword=this.filters.name;
				this.$http.get(
						"biaoyin/tbLable/findPage.do?pageNum=" +pageNum+"&&pageSize=" +pageSize+"&keyword="+keyword
				).then(({data}) => {
					let list = data.rows;
					this.total = data.total;
					this.tableData = list;
				})
			}
		},
		mounted() {
			//this.getUsers();
			this.init();
		}
	}

</script>

